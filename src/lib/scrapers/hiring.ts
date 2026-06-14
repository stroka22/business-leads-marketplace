import * as cheerio from 'cheerio'
import { BaseScraper, sleep, supabaseAdmin } from './base'
import { EQUIPMENT_JOB_TITLES } from '@/types/financing'

interface JobPosting {
  company_name: string
  company_website?: string
  job_title: string
  job_location?: string
  job_state?: string
  job_description?: string
  job_url?: string
  posted_date?: string
}

// Target job titles that indicate equipment/financing needs
const TARGET_JOB_PATTERNS = EQUIPMENT_JOB_TITLES.map(title => ({
  pattern: new RegExp(title.replace(/\s+/g, '\\s*'), 'i'),
  category: title.toLowerCase().includes('driver') || title.toLowerCase().includes('operator') 
    ? 'driver_operator' 
    : title.toLowerCase().includes('technician') || title.toLowerCase().includes('mechanic')
    ? 'technician'
    : 'field_worker',
  original: title,
}))

export class HiringScraper extends BaseScraper {
  name = 'Hiring Signals Scraper'
  scrapeType = 'hiring'

  protected async execute(params?: Record<string, unknown>): Promise<void> {
    const targetState = params?.state as string
    const states = targetState ? [targetState] : ['TX', 'FL', 'CA', 'NY', 'PA', 'OH', 'IL', 'GA', 'NC', 'AZ']
    
    for (const state of states) {
      for (const jobType of TARGET_JOB_PATTERNS.slice(0, 10)) { // Limit for MVP
        try {
          await this.searchJobs(state, jobType.original)
          await sleep(1500) // Rate limiting
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error)
          this.result.errors.push(`${state}/${jobType.original}: ${errMsg}`)
        }
      }
    }
  }

  private async searchJobs(state: string, jobTitle: string): Promise<void> {
    this.log(`Searching for "${jobTitle}" jobs in ${state}...`)
    
    // Search using Google Jobs API (via SerpAPI or similar)
    // For MVP, we'll use a simplified approach
    
    // Option 1: Google Jobs via SerpAPI (requires API key)
    // Option 2: Indeed RSS feeds (deprecated but some still work)
    // Option 3: Direct Indeed scraping (against ToS but common)
    
    // For this MVP, we'll implement Indeed scraping as a demonstration
    // In production, consider using official APIs or services like:
    // - SerpAPI for Google Jobs
    // - Indeed Publisher Program
    // - ZipRecruiter API
    // - Adzuna API
    
    const jobs = await this.scrapeIndeedJobs(state, jobTitle)
    
    for (const job of jobs) {
      await this.processJobPosting(job)
    }
    
    this.log(`Found ${jobs.length} jobs for "${jobTitle}" in ${state}`)
  }

  private async scrapeIndeedJobs(state: string, query: string): Promise<JobPosting[]> {
    const jobs: JobPosting[] = []
    
    try {
      // Indeed search URL
      const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(state)}&sort=date&limit=25`
      
      const response = await this.fetch(searchUrl)
      
      if (!response.ok) {
        this.log(`Indeed returned ${response.status} for ${query} in ${state}`)
        return jobs
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      // Indeed's HTML structure changes frequently
      // This selector may need updating
      $('[data-jk]').each((_, element) => {
        const $el = $(element)
        
        const jobTitle = $el.find('.jobTitle').text().trim() ||
                        $el.find('[data-testid="jobTitle"]').text().trim() ||
                        $el.find('h2').first().text().trim()
        
        const companyName = $el.find('.companyName').text().trim() ||
                           $el.find('[data-testid="company-name"]').text().trim()
        
        const location = $el.find('.companyLocation').text().trim() ||
                        $el.find('[data-testid="text-location"]').text().trim()
        
        const jobId = $el.attr('data-jk')
        const jobUrl = jobId ? `https://www.indeed.com/viewjob?jk=${jobId}` : undefined
        
        if (jobTitle && companyName) {
          jobs.push({
            company_name: companyName,
            job_title: jobTitle,
            job_location: location,
            job_state: state,
            job_url: jobUrl,
            posted_date: new Date().toISOString().split('T')[0],
          })
        }
      })
      
    } catch (error) {
      this.log(`Error scraping Indeed: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    return jobs
  }

  private async processJobPosting(job: JobPosting): Promise<void> {
    // Determine job category
    const matchedPattern = TARGET_JOB_PATTERNS.find(p => p.pattern.test(job.job_title))
    const jobCategory = matchedPattern?.category || 'other'
    const isEquipmentRelated = !!matchedPattern
    
    // Save to hiring_signals table
    const { error: hiringError } = await supabaseAdmin
      .from('hiring_signals')
      .upsert({
        company_name: job.company_name,
        company_website: job.company_website || null,
        job_title: job.job_title,
        job_location: job.job_location || null,
        job_state: job.job_state || null,
        job_description: job.job_description || null,
        job_url: job.job_url || null,
        job_source: 'indeed',
        job_category: jobCategory,
        equipment_related: isEquipmentRelated,
        posted_date: job.posted_date || null,
        raw_data: job,
      }, {
        onConflict: 'company_name,job_title,job_source',
        ignoreDuplicates: true,
      })

    if (hiringError && hiringError.code !== '23505') {
      this.log(`Failed to save hiring signal: ${hiringError.message}`)
      return
    }

    // Only create/update leads for equipment-related jobs
    if (!isEquipmentRelated) return

    // Detect industry from job title and company name
    const industry = this.detectIndustry(`${job.company_name} ${job.job_title}`)

    // Create or update financing lead
    const leadId = await this.upsertLead({
      company_name: job.company_name,
      industry,
      website: job.company_website,
      city: job.job_location?.split(',')[0]?.trim(),
      state: job.job_state,
      source_url: job.job_url,
      source_type: 'hiring_signal',
    })

    if (!leadId) return

    // Link hiring signal to lead
    await supabaseAdmin
      .from('hiring_signals')
      .update({ lead_id: leadId })
      .eq('company_name', job.company_name)
      .eq('job_title', job.job_title)
      .eq('job_source', 'indeed')

    // Add signals
    await this.addSignal(leadId, {
      signal_type: 'hiring_equipment_roles',
      signal_description: `Hiring: ${job.job_title}`,
      signal_data: {
        job_title: job.job_title,
        job_category: jobCategory,
        job_location: job.job_location,
      },
      source_url: job.job_url,
    })

    // Check for multiple job postings from same company
    await this.checkMultiplePostings(leadId, job.company_name)
  }

  private async checkMultiplePostings(leadId: string, companyName: string): Promise<void> {
    const { data: postings } = await supabaseAdmin
      .from('hiring_signals')
      .select('id')
      .eq('company_name', companyName)

    if (postings && postings.length > 2) {
      // Check if signal already exists
      const { data: existingSignal } = await supabaseAdmin
        .from('lead_signals')
        .select('id')
        .eq('lead_id', leadId)
        .eq('signal_type', 'multiple_job_postings')
        .single()

      if (!existingSignal) {
        await this.addSignal(leadId, {
          signal_type: 'multiple_job_postings',
          signal_description: `${postings.length} active job postings found`,
          signal_data: { posting_count: postings.length },
        })
      }
    }
  }
}

// Alternative job board scraping methods
export class ZipRecruiterScraper extends BaseScraper {
  name = 'ZipRecruiter Scraper'
  scrapeType = 'hiring_ziprecruiter'

  protected async execute(_params?: Record<string, unknown>): Promise<void> {
    // Similar implementation to Indeed scraper
    // ZipRecruiter has a different HTML structure
    this.log('ZipRecruiter scraper not fully implemented in MVP')
  }
}

export class GoogleJobsScraper extends BaseScraper {
  name = 'Google Jobs Scraper'
  scrapeType = 'hiring_google'

  protected async execute(_params?: Record<string, unknown>): Promise<void> {
    // Google Jobs requires SerpAPI or similar service
    // Direct scraping is blocked
    this.log('Google Jobs scraper requires SerpAPI integration')
  }
}
