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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          days_since_signup: number
          id: string
          mrr: number
          owner_avatar: string | null
          owner_name: string
          owner_role: string
          plan: string
          quote_channel: string | null
          quote_source: string | null
          quote_text: string | null
          risk_score: number
          seats: number
          team: string
          top_reason: string
          trend: Database["public"]["Enums"]["trend"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_since_signup?: number
          id?: string
          mrr?: number
          owner_avatar?: string | null
          owner_name: string
          owner_role: string
          plan: string
          quote_channel?: string | null
          quote_source?: string | null
          quote_text?: string | null
          risk_score: number
          seats?: number
          team: string
          top_reason: string
          trend?: Database["public"]["Enums"]["trend"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_since_signup?: number
          id?: string
          mrr?: number
          owner_avatar?: string | null
          owner_name?: string
          owner_role?: string
          plan?: string
          quote_channel?: string | null
          quote_source?: string | null
          quote_text?: string | null
          risk_score?: number
          seats?: number
          team?: string
          top_reason?: string
          trend?: Database["public"]["Enums"]["trend"]
          updated_at?: string
        }
        Relationships: []
      }
      actions: {
        Row: {
          account_id: string
          channel: Database["public"]["Enums"]["channel"]
          expected_lift: string
          id: string
          is_recommended: boolean
          position: number
          preview: string
          title: string
        }
        Insert: {
          account_id: string
          channel: Database["public"]["Enums"]["channel"]
          expected_lift: string
          id?: string
          is_recommended?: boolean
          position?: number
          preview: string
          title: string
        }
        Update: {
          account_id?: string
          channel?: Database["public"]["Enums"]["channel"]
          expected_lift?: string
          id?: string
          is_recommended?: boolean
          position?: number
          preview?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      intervention_logs: {
        Row: {
          account_id: string
          action_id: string
          channel: Database["public"]["Enums"]["channel"]
          id: string
          sent_at: string
          sent_by: string
          status: Database["public"]["Enums"]["log_status"]
        }
        Insert: {
          account_id: string
          action_id: string
          channel: Database["public"]["Enums"]["channel"]
          id?: string
          sent_at?: string
          sent_by: string
          status?: Database["public"]["Enums"]["log_status"]
        }
        Update: {
          account_id?: string
          action_id?: string
          channel?: Database["public"]["Enums"]["channel"]
          id?: string
          sent_at?: string
          sent_by?: string
          status?: Database["public"]["Enums"]["log_status"]
        }
        Relationships: [
          {
            foreignKeyName: "intervention_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intervention_logs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          account_id: string
          detail: string
          id: string
          label: string
          position: number
          weight: Database["public"]["Enums"]["signal_weight"]
        }
        Insert: {
          account_id: string
          detail: string
          id?: string
          label: string
          position?: number
          weight: Database["public"]["Enums"]["signal_weight"]
        }
        Update: {
          account_id?: string
          detail?: string
          id?: string
          label?: string
          position?: number
          weight?: Database["public"]["Enums"]["signal_weight"]
        }
        Relationships: [
          {
            foreignKeyName: "signals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      snoozes: {
        Row: {
          account_id: string
          duration_ms: number
          id: string
          snoozed_at: string
          snoozed_by: string
        }
        Insert: {
          account_id: string
          duration_ms: number
          id?: string
          snoozed_at?: string
          snoozed_by: string
        }
        Update: {
          account_id?: string
          duration_ms?: number
          id?: string
          snoozed_at?: string
          snoozed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "snoozes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "csm"
      channel: "in-app nudge" | "email" | "Slack message"
      log_status: "Awaiting response" | "Responded" | "Re-engaged"
      signal_weight: "high" | "med" | "low"
      trend: "up" | "down" | "flat"
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
    Enums: {
      app_role: ["admin", "csm"],
      channel: ["in-app nudge", "email", "Slack message"],
      log_status: ["Awaiting response", "Responded", "Re-engaged"],
      signal_weight: ["high", "med", "low"],
      trend: ["up", "down", "flat"],
    },
  },
} as const
