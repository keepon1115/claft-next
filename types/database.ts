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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      "claft-quest": {
        Row: {
          created_at: string | null
          id: string
          stage_id: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stage_id?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stage_id?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quest_progress: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          google_form_submitted: boolean | null
          id: string
          rejected_at: string | null
          rejected_by: string | null
          stage_id: number
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          google_form_submitted?: boolean | null
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          stage_id: number
          status: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          google_form_submitted?: boolean | null
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          stage_id?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          id: string
          last_login_date: string | null
          login_count: number | null
          quest_clear_count: number | null
          total_exp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_login_date?: string | null
          login_count?: number | null
          quest_clear_count?: number | null
          total_exp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_login_date?: string | null
          login_count?: number | null
          quest_clear_count?: number | null
          total_exp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nickname: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nickname?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nickname?: string | null
          updated_at?: string | null
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

// =====================================================
// 基本的なテーブル型エクスポート
// =====================================================

/**
 * @deprecated 代わりに types/user.ts の UserProfile を使用してください
 */
export type User = Tables<'users_profile'>

/**
 * @deprecated 代わりに types/user.ts の UserStats を使用してください
 */
export type UserStats = Tables<'user_stats'>

/**
 * @deprecated 代わりに types/quest.ts の QuestProgress を使用してください
 */
export type QuestProgress = Tables<'quest_progress'>

/**
 * @deprecated 代わりに types/quest.ts の ClaftQuest を使用してください
 */
export type ClaftQuest = Tables<'claft-quest'>

/**
 * @deprecated 代わりに types/user.ts の AdminUser を使用してください
 */
export type AdminUser = Tables<'admin_users'>

// Insert/Update型（後方互換性のため残す）
export type UserInsert = TablesInsert<'users_profile'>
export type UserUpdate = TablesUpdate<'users_profile'>
export type UserStatsInsert = TablesInsert<'user_stats'>
export type UserStatsUpdate = TablesUpdate<'user_stats'>
export type QuestProgressInsert = TablesInsert<'quest_progress'>
export type QuestProgressUpdate = TablesUpdate<'quest_progress'> 