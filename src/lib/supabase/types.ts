/**
 * Database type bindings for SMARTHIRE.
 *
 * Hand-written stub mirroring `supabase/schema.sql`.
 * Once a Supabase project is provisioned, regenerate it with:
 *   npm run db:types
 */

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "interview"
  | "accepted"
  | "rejected";

export type UserRole = "candidate" | "admin";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          role?: UserRole;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          short_description: string;
          description: string;
          requirements: string;
          location: string | null;
          employment_type: string | null;
          is_open: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          short_description: string;
          description: string;
          requirements: string;
          location?: string | null;
          employment_type?: string | null;
          is_open?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          short_description?: string;
          description?: string;
          requirements?: string;
          location?: string | null;
          employment_type?: string | null;
          is_open?: boolean;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string;
          experience: string;
          skills: string;
          cv_path: string;
          status: ApplicationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          phone: string;
          experience: string;
          skills: string;
          cv_path: string;
          status?: ApplicationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: ApplicationStatus;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          application_id: string;
          author_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          author_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_application_id_fkey";
            columns: ["application_id"];
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      comments_with_author: {
        Row: {
          id: string;
          application_id: string;
          author_id: string;
          author_name: string;
          text: string;
          created_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_application_id_fkey";
            columns: ["application_id"];
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      application_status: ApplicationStatus;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type CommentWithAuthorRow =
  Database["public"]["Views"]["comments_with_author"]["Row"];
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
