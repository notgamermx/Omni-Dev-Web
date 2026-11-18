// Generated Supabase database types
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

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
      site_content: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'site_content_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['user_id'];
          }
        ];
      };
      releases: {
        Row: {
          id: string;
          version: string;
          tag_name: string | null;
          source: string;
          published_at: string | null;
          body: string | null;
          html_url: string | null;
          assets: Json;
          is_prerelease: boolean;
          is_latest: boolean;
          created_at: string;
          synced_at: string;
        };
        Insert: {
          id?: string;
          version: string;
          tag_name?: string | null;
          source: string;
          published_at?: string | null;
          body?: string | null;
          html_url?: string | null;
          assets?: Json;
          is_prerelease?: boolean;
          is_latest?: boolean;
          created_at?: string;
          synced_at?: string;
        };
        Update: {
          id?: string;
          version?: string;
          tag_name?: string | null;
          source?: string;
          published_at?: string | null;
          body?: string | null;
          html_url?: string | null;
          assets?: Json;
          is_prerelease?: boolean;
          is_latest?: boolean;
          created_at?: string;
          synced_at?: string;
        };
        Relationships: [];
      };
      roadmap_items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          display_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'roadmap_items_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['user_id'];
          }
        ];
      };
      feedback_submissions: {
        Row: {
          id: string;
          type: string;
          title: string;
          body: string;
          user_agent: string | null;
          ip_hash: string | null;
          status: string;
          github_issue_number: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          body: string;
          user_agent?: string | null;
          ip_hash?: string | null;
          status?: string;
          github_issue_number?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          body?: string;
          user_agent?: string | null;
          ip_hash?: string | null;
          status?: string;
          github_issue_number?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      security_reports: {
        Row: {
          id: string;
          component: string;
          severity: string;
          details: string;
          reporter_email: string | null;
          status: string;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          component: string;
          severity: string;
          details: string;
          reporter_email?: string | null;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          component?: string;
          severity?: string;
          details?: string;
          reporter_email?: string | null;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
  ? (Database['public']['Tables'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type Insert<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'])[TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
  ? (Database['public']['Tables'])[PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type Update<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'])[TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
  ? (Database['public']['Tables'])[PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;