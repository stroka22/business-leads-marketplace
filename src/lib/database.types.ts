export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Placeholder; replace with generated types from Supabase when available
export type Database = Record<string, unknown>
