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
      work_logs: {
        Row: {
          id: number
          user_id: string
          start_time: string
          pause_time: string | null
          end_time: string | null
          total_seconds: number
          description: string | null
          created_at: string
          hourly_rate_at_time: number | null
        }
        Insert: {
          id?: number
          user_id: string
          start_time?: string
          pause_time?: string | null
          end_time?: string | null
          total_seconds?: number
          description?: string | null
          created_at?: string
          hourly_rate_at_time?: number | null
        }
        Update: {
          id?: number
          user_id?: string
          start_time?: string
          pause_time?: string | null
          end_time?: string | null
          total_seconds?: number
          description?: string | null
          created_at?: string
          hourly_rate_at_time?: number | null
        }
      }
      tasks: {
        Row: {
          id: number
          work_log_id: number
          user_id: string
          description: string
          duration: number
          created_at: string
        }
        Insert: {
          id?: number
          work_log_id: number
          user_id: string
          description: string
          duration?: number
          created_at?: string
        }
        Update: {
          id?: number
          work_log_id?: number
          user_id?: string
          description?: string
          duration?: number
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          currency: string
          hourly_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          currency?: string
          hourly_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          currency?: string
          hourly_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

