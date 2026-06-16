/**
 * Pricing utility functions for lead marketplace
 * Handles age-based pricing and bulk discounts
 */

// Age tier pricing constants
export const AGE_TIERS = {
  '0-24h': 12, // $12 per lead
  '2-3d': 9,   // $9 per lead
  '4-7d': 7,   // $7 per lead
  '8-14d': 5,  // $5 per lead
  '15+d': 3,   // $3 per lead
} as const;

// Bulk discount tiers
export const BULK_DISCOUNT_TIERS = [
  { min: 100, rate: 0.20 }, // 20% off for 100+ leads
  { min: 50, rate: 0.15 },  // 15% off for 50-99 leads
  { min: 25, rate: 0.10 },  // 10% off for 25-49 leads
  { min: 10, rate: 0.05 },  // 5% off for 10-24 leads
  { min: 0, rate: 0.00 },   // No discount for <10 leads
] as const;

// Type for age tiers
export type LeadAgeTier = keyof typeof AGE_TIERS;

// Type for cart items
export interface CartItem {
  ageTag: LeadAgeTier;
  quantity: number;
}

// Type for cart totals
export interface CartTotals {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
}

/**
 * Get the unit price for a lead based on its age tier
 * @param ageTag The age tier of the lead
 * @returns The price per lead in USD
 */
export function getUnitPrice(ageTag: LeadAgeTier): number {
  return AGE_TIERS[ageTag];
}

/**
 * Get the bulk discount rate based on total quantity
 * @param totalQty The total number of leads in the cart
 * @returns The discount rate as a decimal (e.g., 0.05 for 5%)
 */
export function getBulkDiscountRate(totalQty: number): number {
  // Find the first tier where the quantity is >= the minimum
  const tier = BULK_DISCOUNT_TIERS.find(tier => totalQty >= tier.min);
  return tier ? tier.rate : 0;
}

/**
 * Compute cart totals including subtotal, discount, and final price
 * @param items Array of cart items with age tier and quantity
 * @returns Object with subtotal, discount rate, discount amount, and total
 */
export function computeCartTotals(items: CartItem[]): CartTotals {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = getUnitPrice(item.ageTag);
    return sum + (unitPrice * item.quantity);
  }, 0);

  // Calculate total quantity for bulk discount
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Get discount rate based on total quantity
  const discountRate = getBulkDiscountRate(totalQuantity);
  
  // Calculate discount amount
  const discountAmount = subtotal * discountRate;
  
  // Calculate final total
  const total = subtotal - discountAmount;

  return {
    subtotal,
    discountRate,
    discountAmount,
    total
  };
}

/**
 * Format a price as USD currency string
 * @param amount The amount to format
 * @returns Formatted price string (e.g., "$12.00")
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
