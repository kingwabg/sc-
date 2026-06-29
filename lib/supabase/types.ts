// lib/supabase/types.ts — Database 타입 (Supabase CLI로 자동 생성 가능)
// $ supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// 수동 버전 — 스키마와 동기화 유지 필요
export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_color: string;
          plan: "free" | "starter" | "business" | "enterprise";
          member_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tenants"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
      users: {
        Row: {
          id: string;
          tenant_id: string;
          email: string;
          name: string;
          role: "owner" | "admin" | "member";
          department: string;
          position: string;
          avatar_color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      mails: {
        Row: {
          id: string;
          tenant_id: string;
          from_user_id: string | null;
          from_name: string;
          from_email: string;
          subject: string;
          preview: string | null;
          body: string | null;
          received_at: string;
          unread: boolean;
          has_attachment: boolean;
          important: boolean;
          to_user_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["mails"]["Row"], "id" | "received_at"> & {
          id?: string;
          received_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mails"]["Insert"]>;
      };
      schedules: {
        Row: {
          id: string;
          tenant_id: string;
          owner_id: string | null;
          title: string;
          start_at: string;
          end_at: string;
          location: string | null;
          attendees: string[];
          type: "meeting" | "event" | "todo" | "personal";
        };
        Insert: Omit<Database["public"]["Tables"]["schedules"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schedules"]["Insert"]>;
      };
      approvals: {
        Row: {
          id: string;
          tenant_id: string;
          applicant_id: string | null;
          type: "휴가신청" | "지출결의" | "일반결재" | "출장신청";
          title: string;
          body: string | null;
          form_data: Record<string, unknown>;
          status: "대기" | "진행중" | "완료" | "반려";
          urgent: boolean;
          submitted_at: string;
          approver_ids: string[];
          current_step: number;
        };
        Insert: Omit<Database["public"]["Tables"]["approvals"]["Row"], "id" | "submitted_at" | "current_step"> & {
          id?: string;
          submitted_at?: string;
          current_step?: number;
        };
        Update: Partial<Database["public"]["Tables"]["approvals"]["Insert"]>;
      };
      files: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: "doc" | "sheet" | "slide" | "pdf" | "image" | "other";
          size: number;
          storage_path: string | null;
          updated_by: string | null;
          updated_at: string;
          shared: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["files"]["Row"], "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["files"]["Insert"]>;
      };
      todos: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          title: string;
          done: boolean;
          due_date: string | null;
          priority: "low" | "medium" | "high";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["todos"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["todos"]["Insert"]>;
      };
      notices: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          body: string | null;
          author_id: string | null;
          pinned: boolean;
          posted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notices"]["Row"], "id" | "posted_at"> & {
          id?: string;
          posted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notices"]["Insert"]>;
      };
    };
  };
};