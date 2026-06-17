import OpenAI from 'openai'
import {
  type FinancingCategory,
  type FinancingLead,
  type LeadSignal,
  FINANCING_CATEGORY_LABELS,
} from '@/types/financing'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ClassificationResult {
  financing_category: FinancingCategory
  likely_reason: string
  suggested_outreach: string
  ai_summary: string
  estimated_capital_need: string
}

interface ClassificationInput {
  company_name: string
  industry?: string | null
  state?: string | null
  signals: Array<{
    type: string
    description?: string | null
  }>
  extra_context?: string
}

const SYSTEM_PROMPT = `You are a business financing analyst for BizOps. Your job is to analyze business leads and determine their likely financing needs.

Based on the signals provided, classify the lead into one of these financing categories:
${Object.entries(FINANCING_CATEGORY_LABELS).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Respond in JSON format with these fields:
- financing_category: one of the category IDs above
- likely_reason: 1-2 sentences explaining why they likely need this type of financing
- suggested_outreach: A personalized 1-sentence outreach angle. Be specific to the signals found.
- ai_summary: A brief 2-3 sentence summary of the lead opportunity
- estimated_capital_need: An estimated range like "$50,000-$100,000" or "Unknown" if not enough data

Examples of good suggested_outreach:
- "I noticed your company is hiring multiple HVAC technicians, which often creates a need for service vans, tools, and additional working capital."
- "I saw your company recently had equipment-related UCC activity, which may indicate ongoing equipment growth or future replacement needs."
- "I noticed your company was awarded a public contract, which can create upfront capital needs before payments are received."

Be professional and avoid making false claims. Use phrases like "may indicate" or "could suggest" when appropriate.`

export async function classifyLead(input: ClassificationInput): Promise<ClassificationResult> {
  const signalsSummary = input.signals
    .map(s => `- ${s.type}${s.description ? `: ${s.description}` : ''}`)
    .join('\n')

  const userPrompt = `Analyze this business lead:

Company: ${input.company_name}
Industry: ${input.industry || 'Unknown'}
State: ${input.state || 'Unknown'}

Signals detected:
${signalsSummary || 'No specific signals detected'}

${input.extra_context ? `Additional context: ${input.extra_context}` : ''}

Provide your classification in JSON format.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 500,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  const result = JSON.parse(content) as ClassificationResult
  
  // Validate the category
  if (!FINANCING_CATEGORY_LABELS[result.financing_category]) {
    result.financing_category = 'working_capital' // fallback
  }

  return result
}

export async function classifyLeadWithSignals(
  lead: Partial<FinancingLead>,
  signals: LeadSignal[]
): Promise<ClassificationResult> {
  return classifyLead({
    company_name: lead.company_name || 'Unknown',
    industry: lead.industry,
    state: lead.state,
    signals: signals.map(s => ({
      type: s.signal_type,
      description: s.signal_description,
    })),
  })
}

export async function batchClassifyLeads(
  leads: Array<{ lead: Partial<FinancingLead>; signals: LeadSignal[] }>
): Promise<ClassificationResult[]> {
  const results: ClassificationResult[] = []
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(({ lead, signals }) => 
        classifyLeadWithSignals(lead, signals).catch(err => {
          console.error(`Failed to classify lead ${lead.company_name}:`, err)
          return {
            financing_category: 'working_capital' as FinancingCategory,
            likely_reason: 'Unable to determine specific reason',
            suggested_outreach: `I noticed your company may have financing needs based on recent activity.`,
            ai_summary: 'Lead requires manual review for classification.',
            estimated_capital_need: 'Unknown',
          }
        })
      )
    )
    results.push(...batchResults)
    
    // Small delay between batches
    if (i + batchSize < leads.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return results
}
