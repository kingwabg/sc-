-- ============================================================
-- prisma/migrations/tenant_rls.sql
--
-- PostgreSQL Row Level Security (RLS) migration
-- officex-care 멀티테넌트 테넌트 격리 정책
--
-- 적용 대상: tenantId 컬럼을 가진 모든 테이블
-- 적용 방식:
--   1. 각 테이블에 RLS 활성화
--   2. tenant_isolation_<table> 정책 생성
--      -> "tenantId = current_setting('app.current_tenant_id', true)"
--   3. Supabase service role / ownerrole 은 BYPASSRLS 유지
--
-- 적용 가이드:
--   psql $DATABASE_URL -f prisma/migrations/tenant_rls.sql
--   또는 Supabase dashboard > SQL Editor 에서 실행
--
-- 주의: tenants 테이블은 RLS 적용 대상이 아님
--       (tenants IS the tenant — 모든 데이터의 근원)
-- ============================================================

-- ============================================================
-- Staff
-- ============================================================
ALTER TABLE "staff" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_staff ON "staff"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Children
-- ============================================================
ALTER TABLE "children" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_children ON "children"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- ChildCardMeta
-- ============================================================
ALTER TABLE "ChildCardMeta" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ChildCardMeta ON "ChildCardMeta"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- ChildPhysical
-- ============================================================
ALTER TABLE "ChildPhysical" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ChildPhysical ON "ChildPhysical"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- ChildObservations
-- ============================================================
ALTER TABLE "ChildObservations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ChildObservations ON "ChildObservations"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Attendance (아동)
-- ============================================================
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Attendance ON "Attendance"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- CareLog
-- ============================================================
ALTER TABLE "CareLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_CareLog ON "CareLog"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- ChildDocument
-- ============================================================
ALTER TABLE "ChildDocument" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ChildDocument ON "ChildDocument"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- StaffAttendance
-- ============================================================
ALTER TABLE "StaffAttendance" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_StaffAttendance ON "StaffAttendance"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Volunteer
-- ============================================================
ALTER TABLE "Volunteer" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Volunteer ON "Volunteer"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- VolunteerAttendance
-- ============================================================
ALTER TABLE "VolunteerAttendance" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_VolunteerAttendance ON "VolunteerAttendance"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Member
-- ============================================================
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Member ON "Member"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- User
-- ============================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_User ON "User"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Doc
-- ============================================================
ALTER TABLE "Doc" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Doc ON "Doc"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- DocumentIndex
-- ============================================================
ALTER TABLE "DocumentIndex" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_DocumentIndex ON "DocumentIndex"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- LeaveRequest
-- ============================================================
ALTER TABLE "LeaveRequest" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_LeaveRequest ON "LeaveRequest"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- ApprovalRequest
-- ============================================================
ALTER TABLE "ApprovalRequest" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ApprovalRequest ON "ApprovalRequest"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- ApprovalStep
-- ============================================================
ALTER TABLE "ApprovalStep" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ApprovalStep ON "ApprovalStep"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Meeting
-- ============================================================
ALTER TABLE "Meeting" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Meeting ON "Meeting"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Inspection
-- ============================================================
ALTER TABLE "Inspection" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Inspection ON "Inspection"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Donation
-- ============================================================
ALTER TABLE "Donation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Donation ON "Donation"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- AnnualPlan
-- ============================================================
ALTER TABLE "AnnualPlan" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_AnnualPlan ON "AnnualPlan"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Program
-- ============================================================
ALTER TABLE "Program" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_Program ON "Program"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- MonthlyPlan
-- ============================================================
ALTER TABLE "MonthlyPlan" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_MonthlyPlan ON "MonthlyPlan"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- WeeklyGoal
-- ============================================================
ALTER TABLE "WeeklyGoal" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_WeeklyGoal ON "WeeklyGoal"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- DailyLog
-- ============================================================
ALTER TABLE "DailyLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_DailyLog ON "DailyLog"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Budget
-- ============================================================
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_budgets ON "budgets"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Expense
-- ============================================================
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_expenses ON "expenses"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- StaffCareer
-- ============================================================
ALTER TABLE "staff_careers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_staff_careers ON "staff_careers"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- StaffCertification
-- ============================================================
ALTER TABLE "staff_certifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_staff_certifications ON "staff_certifications"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));

-- ============================================================
-- StaffTraining
-- ============================================================
ALTER TABLE "staff_trainings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_staff_trainings ON "staff_trainings"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));
