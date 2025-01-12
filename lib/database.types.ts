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
      meals: {
        Row: {
          created_at: string | null
          id: string
          name: string
          protein_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          protein_amount: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          protein_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_levels: {
        Row: {
          created_at: string | null
          emoji: string
          id: number
          name: string
          threshold: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: number
          name: string
          threshold: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: number
          name?: string
          threshold?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          created_at: string | null
          current_streak: number
          id: number
          max_streak: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          id?: number
          max_streak?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          id?: number
          max_streak?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          daily_protein_target: number
          email: string
          exercise_frequency: Database["public"]["Enums"]["exercise_frequency_type"]
          gender: Database["public"]["Enums"]["gender_type"]
          goal: Database["public"]["Enums"]["goal_type"]
          id: string
          target_weight: number
          target_weight_unit: Database["public"]["Enums"]["weight_unit_type"]
        }
        Insert: {
          created_at?: string | null
          daily_protein_target: number
          email: string
          exercise_frequency: Database["public"]["Enums"]["exercise_frequency_type"]
          gender: Database["public"]["Enums"]["gender_type"]
          goal: Database["public"]["Enums"]["goal_type"]
          id?: string
          target_weight: number
          target_weight_unit: Database["public"]["Enums"]["weight_unit_type"]
        }
        Update: {
          created_at?: string | null
          daily_protein_target?: number
          email?: string
          exercise_frequency?: Database["public"]["Enums"]["exercise_frequency_type"]
          gender?: Database["public"]["Enums"]["gender_type"]
          goal?: Database["public"]["Enums"]["goal_type"]
          id?: string
          target_weight?: number
          target_weight_unit?: Database["public"]["Enums"]["weight_unit_type"]
        }
        Relationships: []
      }
    }
    Views: {
      user_streak_view: {
        Row: {
          current_streak: number | null
          max_streak: number | null
          streak_emoji: string | null
          streak_name: string | null
          user_id: string | null
        }
        Insert: {
          current_streak?: number | null
          max_streak?: number | null
          streak_emoji?: never
          streak_name?: never
          user_id?: string | null
        }
        Update: {
          current_streak?: number | null
          max_streak?: number | null
          streak_emoji?: never
          streak_name?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      exercise_frequency_type: "0-2" | "3-4" | "5+"
      gender_type: "male" | "female" | "other"
      goal_type: "lose" | "maintain" | "gain"
      weight_unit_type: "kg" | "lbs"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
