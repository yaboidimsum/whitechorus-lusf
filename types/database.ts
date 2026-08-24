export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      outfits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          scene_id: string;
          looks: Json;
          custom_scene: Json | null;
          custom_kaos: Json | null;
          rating_avg: number;
          ratings_count: number;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          scene_id: string;
          looks?: Json;
          custom_scene?: Json | null;
          custom_kaos?: Json | null;
          rating_avg?: number;
          ratings_count?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          scene_id?: string;
          looks?: Json;
          custom_scene?: Json | null;
          custom_kaos?: Json | null;
          rating_avg?: number;
          ratings_count?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      outfit_ratings: {
        Row: {
          id: string;
          outfit_id: string;
          user_id: string;
          stars: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          outfit_id: string;
          user_id: string;
          stars: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          outfit_id?: string;
          user_id?: string;
          stars?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
