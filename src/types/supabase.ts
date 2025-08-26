export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          company_name: string
          date_acquired: string
          date_added: string
          email: string
          id: string
          industry: string
          is_sold: boolean
          lead_source: string
          loan_amount_requested: number
          loan_purpose: string
          monthly_revenue: number
          owner_name: string
          phone: string
          state: string
          tags: string[] | null
          time_in_business: string
          zip_code: string
        }
        Insert: {
          company_name: string
          date_acquired: string
          date_added?: string
          email: string
          id?: string
          industry: string
          is_sold?: boolean
          lead_source: string
          loan_amount_requested: number
          loan_purpose: string
          monthly_revenue: number
          owner_name: string
          phone: string
          state: string
          tags?: string[] | null
          time_in_business: string
          zip_code: string
        }
        Update: {
          company_name?: string
          date_acquired?: string
          date_added?: string
          email?: string
          id?: string
          industry?: string
          is_sold?: boolean
          lead_source?: string
          loan_amount_requested?: number
          loan_purpose?: string
          monthly_revenue?: number
          owner_name?: string
          phone?: string
          state?: string
          tags?: string[] | null
          time_in_business?: string
          zip_code?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          age_tag: string
          created_at: string
          id: string
          lead_id: string
          order_id: string
          unit_price_cents: number
        }
        Insert: {
          age_tag: string
          created_at?: string
          id?: string
          lead_id: string
          order_id: string
          unit_price_cents: number
        }
        Update: {
          age_tag?: string
          created_at?: string
          id?: string
          lead_id?: string
          order_id?: string
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_with_age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          discount_cents: number
          discount_rate: number
          id: string
          provider: string | null
          provider_ref: string | null
          status: string
          subtotal_cents: number
          total_cents: number
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_cents?: number
          discount_rate?: number
          id?: string
          provider?: string | null
          provider_ref?: string | null
          status?: string
          subtotal_cents?: number
          total_cents?: number
          user_id: string
        }
        Update: {
          created_at?: string
          discount_cents?: number
          discount_rate?: number
          id?: string
          provider?: string | null
          provider_ref?: string | null
          status?: string
          subtotal_cents?: number
          total_cents?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leads_with_age: {
        Row: {
          company_name: string | null
          date_acquired: string | null
          date_added: string | null
          email: string | null
          id: string | null
          industry: string | null
          is_sold: boolean | null
          lead_age_tag: string | null
          lead_source: string | null
          loan_amount_requested: number | null
          loan_purpose: string | null
          monthly_revenue: number | null
          owner_name: string | null
          phone: string | null
          state: string | null
          tags: string[] | null
          time_in_business: string | null
          zip_code: string | null
        }
        Insert: {
          company_name?: string | null
          date_acquired?: string | null
          date_added?: string | null
          email?: string | null
          id?: string | null
          industry?: string | null
          is_sold?: boolean | null
          lead_age_tag?: never
          lead_source?: string | null
          loan_amount_requested?: number | null
          loan_purpose?: string | null
          monthly_revenue?: number | null
          owner_name?: string | null
          phone?: string | null
          state?: string | null
          tags?: string[] | null
          time_in_business?: string | null
          zip_code?: string | null
        }
        Update: {
          company_name?: string | null
          date_acquired?: string | null
          date_added?: string | null
          email?: string | null
          id?: string | null
          industry?: string | null
          is_sold?: boolean | null
          lead_age_tag?: never
          lead_source?: string | null
          loan_amount_requested?: number | null
          loan_purpose?: string | null
          monthly_revenue?: number | null
          owner_name?: string | null
          phone?: string | null
          state?: string | null
          tags?: string[] | null
          time_in_business?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
