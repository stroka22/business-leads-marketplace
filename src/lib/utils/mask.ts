/**
 * Utility functions for masking sensitive contact information
 * Used to hide full contact details until leads are purchased
 */

/**
 * Masks an email address showing only first character and domain
 * Example: "john.doe@example.com" becomes "j*******@example.com"
 * 
 * @param email The email address to mask
 * @returns Masked email with first character visible and domain intact
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email; // Return original if invalid
  }

  const [localPart, domain] = email.split('@');
  
  if (localPart.length === 0) {
    return email; // Return original if local part is empty
  }
  
  // Keep first character, mask the rest with asterisks
  const firstChar = localPart.charAt(0);
  const maskedLocalPart = firstChar + '*'.repeat(Math.max(localPart.length - 1, 1));
  
  return `${maskedLocalPart}@${domain}`;
}

/**
 * Masks a phone number keeping only last 4 digits visible
 * For 10-digit numbers, formats as (XXX) XXX-1234
 * For other lengths, replaces all but last 4 digits with asterisks
 * 
 * @param phone The phone number to mask
 * @returns Masked phone number with formatted pattern
 */
export function maskPhone(phone: string): string {
  if (!phone) {
    return phone; // Return original if empty
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Get last 4 digits
  const last4 = digitsOnly.slice(-4);
  
  // If not enough digits, return with whatever is available
  if (digitsOnly.length < 4) {
    return '*'.repeat(digitsOnly.length);
  }
  
  // For 10-digit US numbers, use (XXX) XXX-1234 format
  if (digitsOnly.length === 10) {
    return `(XXX) XXX-${last4}`;
  }
  
  // For other lengths, mask all but last 4 digits
  return '*'.repeat(digitsOnly.length - 4) + last4;
}
