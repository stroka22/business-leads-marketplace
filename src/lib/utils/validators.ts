import { z } from 'zod';

/**
 * Schema for validating CSV lead data
 * Used when uploading and processing new leads
 */
export const LeadCsvSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid zip code is required"),
  industry: z.string().min(1, "Industry is required"),
  timeInBusiness: z.string().min(1, "Time in business is required"),
  monthlyRevenue: z.union([
    z.number(),
    z.string().transform((val, ctx) => {
      // Remove currency symbols and commas
      const cleaned = val.replace(/[$,]/g, '');
      const num = Number(cleaned);
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Monthly revenue must be a valid number",
        });
        return z.NEVER;
      }
      return num;
    })
  ]),
  loanPurpose: z.string().min(1, "Loan purpose is required"),
  loanAmountRequested: z.union([
    z.number(),
    z.string().transform((val, ctx) => {
      // Remove currency symbols and commas
      const cleaned = val.replace(/[$,]/g, '');
      const num = Number(cleaned);
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Loan amount must be a valid number",
        });
        return z.NEVER;
      }
      return num;
    })
  ]),
  leadSource: z.string().min(1, "Lead source is required"),
  dateAcquired: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date acquired must be a valid date string"
  })
});

/**
 * Schema for validating marketplace filters
 * Used when users filter leads in the marketplace
 */
export const FilterSchema = z.object({
  ageTags: z.array(z.string()).optional(),
  state: z.string().optional(),
  industry: z.string().optional(),
  loanPurpose: z.string().optional(),
  timeInBusiness: z.string().optional(),
  monthlyRevenueMin: z.number().optional(),
  monthlyRevenueMax: z.number().optional(),
  loanAmountMin: z.number().optional(),
  loanAmountMax: z.number().optional(),
});

// Export types derived from schemas
export type LeadCsvData = z.infer<typeof LeadCsvSchema>;
export type FilterParams = z.infer<typeof FilterSchema>;

/**
 * Validates a CSV row against the LeadCsvSchema
 * @param row The CSV row data to validate
 * @returns Validation result with success flag and data or error
 */
export function validateLeadCsvRow(row: Record<string, unknown>) {
  try {
    const validData = LeadCsvSchema.parse(row);
    return { success: true, data: validData };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Validation failed" 
    };
  }
}

/**
 * Validates filter parameters against the FilterSchema
 * @param params The filter parameters to validate
 * @returns Validation result with success flag and data or error
 */
export function validateFilterParams(params: Record<string, unknown>) {
  try {
    const validData = FilterSchema.parse(params);
    return { success: true, data: validData };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Filter validation failed" 
    };
  }
}
