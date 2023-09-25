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
      chats: {
        Row: {
          folder_id: string | null
          id: string
          messages: Json
          name: string
          user_id: string
        }
        Insert: {
          folder_id?: string | null
          id?: string
          messages?: Json
          name: string
          user_id: string
        }
        Update: {
          folder_id?: string | null
          id?: string
          messages?: Json
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string
          id: string
          name: string | null
          openai_key: string
          openai_org: string
          pinecone_env: string
          pinecone_index: string
          pinecone_key: string
          user_name: string
        }
        Insert: {
          avatar_url: string
          id: string
          name?: string | null
          openai_key?: string
          openai_org?: string
          pinecone_env?: string
          pinecone_index?: string
          pinecone_key?: string
          user_name: string
        }
        Update: {
          avatar_url?: string
          id?: string
          name?: string | null
          openai_key?: string
          openai_org?: string
          pinecone_env?: string
          pinecone_index?: string
          pinecone_key?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
