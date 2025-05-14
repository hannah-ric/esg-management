export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      questionnaire_data: {
        Row: {
          id: string
          user_id: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      materiality_topics: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          stakeholderImportance: number
          businessImpact: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          stakeholderImportance: number
          businessImpact: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          stakeholderImportance?: number
          businessImpact?: number
          created_at?: string
        }
      }
      esg_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      implementation_phases: {
        Row: {
          id: string
          esg_plan_id: string
          title: string
          description: string
          duration: string
          created_at: string
        }
        Insert: {
          id?: string
          esg_plan_id: string
          title: string
          description: string
          duration: string
          created_at?: string
        }
        Update: {
          id?: string
          esg_plan_id?: string
          title?: string
          description?: string
          duration?: string
          created_at?: string
        }
      }
      implementation_tasks: {
        Row: {
          id: string
          phase_id: string
          title: string
          description: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          phase_id: string
          title: string
          description: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          phase_id?: string
          title?: string
          description?: string
          status?: string
          created_at?: string
        }
      }
      esg_recommendations: {
        Row: {
          id: string
          esg_plan_id: string
          title: string
          description: string
          framework: string
          indicator: string
          priority: string
          effort: string
          impact: string
          created_at: string
        }
        Insert: {
          id?: string
          esg_plan_id: string
          title: string
          description: string
          framework: string
          indicator: string
          priority: string
          effort: string
          impact: string
          created_at?: string
        }
        Update: {
          id?: string
          esg_plan_id?: string
          title?: string
          description?: string
          framework?: string
          indicator?: string
          priority?: string
          effort?: string
          impact?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: string
          category: string
          url: string
          file_path: string
          file_type: string
          source: string
          date_added: string
          tags: string[]
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: string
          category: string
          url: string
          file_path: string
          file_type: string
          source: string
          date_added?: string
          tags?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: string
          category?: string
          url?: string
          file_path?: string
          file_type?: string
          source?: string
          date_added?: string
          tags?: string[]
        }
      }
      custom_metrics: {
        Row: {
          id: string
          user_id: string
          name: string
          target: string
          current: string
          unit: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target: string
          current: string
          unit: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target?: string
          current?: string
          unit?: string
          created_at?: string
        }
      }
      implementation_phase_data: {
        Row: {
          id: string
          user_id: string
          phases: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phases: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phases?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_esg_plan_transaction: {
        Args: {
          p_user_id: string
          p_plan_id: string
          p_title: string
          p_description: string
          p_recommendations: Json
          p_implementation_phases: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
