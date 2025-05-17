export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      "Checkout Sessions": {
        Row: {
          attrs: Json | null
          customer: string | null
          id: string | null
          payment_intent: string | null
          subscription: string | null
        }
        Insert: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Update: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          current_reporting: string | null
          id: string
          industry: string
          name: string
          region: string
          size: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_reporting?: string | null
          id?: string
          industry: string
          name: string
          region: string
          size: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_reporting?: string | null
          id?: string
          industry?: string
          name?: string
          region?: string
          size?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_metrics: {
        Row: {
          created_at: string | null
          current: string | null
          id: string
          name: string
          target: string | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current?: string | null
          id?: string
          name: string
          target?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current?: string | null
          id?: string
          name?: string
          target?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      Customers: {
        Row: {
          attrs: Json | null
          created: string | null
          description: string | null
          email: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      esg_analysis_results: {
        Row: {
          created_at: string | null
          forecast: Json | null
          id: string
          insights: Json | null
          metric_id: string
          percent_change: number
          resource_id: string | null
          trend: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          forecast?: Json | null
          id?: string
          insights?: Json | null
          metric_id: string
          percent_change: number
          resource_id?: string | null
          trend: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          forecast?: Json | null
          id?: string
          insights?: Json | null
          metric_id?: string
          percent_change?: number
          resource_id?: string | null
          trend?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_analysis_results_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_data_points: {
        Row: {
          confidence: number | null
          context: string | null
          created_at: string
          disclosure_id: string | null
          framework_id: string | null
          id: string
          is_edited: boolean | null
          metric_id: string
          reporting_year: string | null
          resource_id: string
          source: string | null
          updated_at: string | null
          user_id: string | null
          value: string
        }
        Insert: {
          confidence?: number | null
          context?: string | null
          created_at?: string
          disclosure_id?: string | null
          framework_id?: string | null
          id?: string
          is_edited?: boolean | null
          metric_id: string
          reporting_year?: string | null
          resource_id: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
          value: string
        }
        Update: {
          confidence?: number | null
          context?: string | null
          created_at?: string
          disclosure_id?: string | null
          framework_id?: string | null
          id?: string
          is_edited?: boolean | null
          metric_id?: string
          reporting_year?: string | null
          resource_id?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_data_points_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_framework_mappings: {
        Row: {
          created_at: string
          disclosure_id: string
          framework_id: string
          id: string
          resource_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          disclosure_id: string
          framework_id: string
          id?: string
          resource_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          disclosure_id?: string
          framework_id?: string
          id?: string
          resource_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_framework_mappings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_historical_data: {
        Row: {
          created_at: string | null
          data_point_id: string
          id: string
          source: string | null
          updated_at: string | null
          value: string
          year: string
        }
        Insert: {
          created_at?: string | null
          data_point_id: string
          id?: string
          source?: string | null
          updated_at?: string | null
          value: string
          year: string
        }
        Update: {
          created_at?: string | null
          data_point_id?: string
          id?: string
          source?: string | null
          updated_at?: string | null
          value?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_historical_data_data_point_id_fkey"
            columns: ["data_point_id"]
            isOneToOne: false
            referencedRelation: "esg_data_points"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_plans: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_recommendations: {
        Row: {
          company_id: string | null
          coverage: number
          created_at: string | null
          framework_id: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          coverage: number
          created_at?: string | null
          framework_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          coverage?: number
          created_at?: string | null
          framework_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "framework_recommendations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "framework_recommendations_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      implementation_phases: {
        Row: {
          company_id: string | null
          created_at: string | null
          duration: string
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          duration: string
          id?: string
          name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          duration?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "implementation_phases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      materiality_topics: {
        Row: {
          business_impact: number
          category: string
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          stakeholder_impact: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_impact: number
          category: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          stakeholder_impact: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_impact?: number
          category?: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          stakeholder_impact?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiality_topics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          payment_method_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method_id?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_data: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          question_key: string
          response: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          question_key: string
          response: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          question_key?: string
          response?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_requirements: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string
          estimate: string
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description: string
          estimate: string
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string
          estimate?: string
          id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_requirements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string
          date_added: string | null
          description: string | null
          file_path: string | null
          file_type: string | null
          framework: string | null
          id: string
          source: string | null
          tags: string[] | null
          title: string
          type: string
          url: string
          user_id: string | null
        }
        Insert: {
          category: string
          date_added?: string | null
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          framework?: string | null
          id?: string
          source?: string | null
          tags?: string[] | null
          title: string
          type: string
          url: string
          user_id?: string | null
        }
        Update: {
          category?: string
          date_added?: string | null
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          framework?: string | null
          id?: string
          source?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          features: Json | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          price_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          description?: string | null
          features?: Json | null
          id?: string
          interval: string
          is_active?: boolean | null
          name: string
          price_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          price_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          metadata: Json | null
          plan_id: string
          quantity: number | null
          status: string
          subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          metadata?: Json | null
          plan_id: string
          quantity?: number | null
          status: string
          subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          metadata?: Json | null
          plan_id?: string
          quantity?: number | null
          status?: string
          subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      Subscriptions: {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          image_url: string | null
          is_admin: boolean | null
          last_name: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          is_admin?: boolean | null
          last_name?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          image_url?: string | null
          is_admin?: boolean | null
          last_name?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visualization_settings: {
        Row: {
          chart_type: string
          config: Json
          created_at: string | null
          dashboard_id: string | null
          data_source: string | null
          description: string | null
          filters: Json | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chart_type: string
          config?: Json
          created_at?: string | null
          dashboard_id?: string | null
          data_source?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chart_type?: string
          config?: Json
          created_at?: string | null
          dashboard_id?: string | null
          data_source?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
