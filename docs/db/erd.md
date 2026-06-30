# 데이터베이스 ERD — Office Portal

Prisma schema → Postgres (Supabase 호환).

```mermaid
erDiagram
  Tenant ||--o{ User : "has"
  Tenant ||--o{ Child : "enrolls"
  Tenant ||--o{ Staff : "employs"
  Tenant ||--o{ Volunteer : "hosts"
  Tenant ||--o{ Member : "members"
  Tenant ||--o{ Doc : "stores"
  Tenant ||--o{ ApprovalRequest : "approves"
  Tenant ||--o{ AnnualPlan : "plans"
  Tenant ||--o{ DailyLog : "logs"

  User ||--o| Staff : "may be"
  User ||--o| Member : "may be"

  Child ||--|| ChildCardMeta : "1:1"
  Child ||--|| ChildPhysical : "1:1"
  Child ||--|| ChildObservations : "1:1"
  Child ||--o{ Attendance : "daily"
  Child ||--o{ CareLog : "logs"
  Child ||--o{ ChildDocument : "attached"

  Staff ||--o{ StaffAttendance : "daily"
  Volunteer ||--o{ VolunteerAttendance : "daily"

  AnnualPlan ||--o{ Program : "runs"
  AnnualPlan ||--o{ MonthlyPlan : "breaks into"
  MonthlyPlan ||--o{ WeeklyGoal : "has"
  MonthlyPlan ||--o{ DailyLog : "produces"

  ApprovalRequest ||--o{ ApprovalStep : "line"

  Tenant {
    string id PK
    string slug UK
    string name
    string emoji
    string gradient
    string accentBg
    string accentText
    int    memberCount
    date   createdAt
  }

  User {
    string id PK
    string tenantId FK
    string email UK
    string name
    enum   role "owner|admin|member"
    string loginId
    string position
    string department
    string avatarColor
    date   createdAt
  }

  Child {
    string id PK
    string tenantId FK
    string name
    string nameLast
    string nameFirst
    date   birthDate
    enum   gender "M|F"
    string phone
    string photoUrl
    int    capacityGroup "30|40|50"
    string grade
    string school
    string guardianName
    enum   guardianRelation "부|모|조부모|기타"
    string guardianType
    string guardianPhone
    string guardianJob
    string guardianNotes
    string emergencyContactName
    string emergencyContactPhone
    json   allergies "string[]"
    json   medications "string[]"
    string healthNotes
    date   enrolledAt
    date   previousEnrolledAt
    date   leftAt
    string address
    string serviceType
    int    medianIncomePct
    string kidsCallId
    enum   status "active|leave|left"
    string authorId
    string authorName
    date   createdAt
    date   updatedAt
  }

  ChildCardMeta {
    string childId PK,FK
    string number
    string identityType
    string identityVerified
    string referredBy
  }

  ChildPhysical {
    string childId PK,FK
    float  height
    float  weight
    string buildType
    string faceShape
    string hairColor
    string hairStyle
  }

  ChildObservations {
    string childId PK,FK
    string personality
    string family
    string healthObs
    string social
    string interests
    string learning
    string behavior
  }

  Attendance {
    string id PK
    string childId FK
    date   date
    enum   status "등원|결석|조퇴|보건휴식|미등원"
    string note
    string authorId
    date   createdAt
  }

  CareLog {
    string id PK
    string childId FK
    date   date
    enum   category "식사|학습|놀이|관찰|기타"
    string content
    string authorId
    string authorName
    date   createdAt
  }

  ChildDocument {
    string id PK
    string childId FK
    string filename
    string content
    enum   kind "iep|photo|report|other"
    string authorId
    date   createdAt
  }

  Staff {
    string id PK
    string tenantId FK
    string userId FK,UK "nullable"
    string name
    string loginId UK
    enum   gender "M|F"
    string phone
    string position
    date   joinDate
    string email
    enum   status "active|leave|retired"
  }

  StaffAttendance {
    string id PK
    string staffId FK
    date   date
    string clockIn
    string clockOut
    int    workMinutes
    enum   status "출근|결근|휴가|외출|미체크"
    string note
    string authorId
  }

  Volunteer {
    string id PK
    string tenantId FK
    string name
    enum   gender "M|F"
    string phone
    enum   type "공익근무자|자원봉사자|실습생|기타"
    date   startDate
    date   endDate
    string organization
    string note
    enum   status "active|completed|paused"
  }

  VolunteerAttendance {
    string id PK
    string volunteerId FK
    date   date
    bool   present
    string reason
    string authorId
  }

  Member {
    string id PK
    string tenantId FK
    string userId FK,UK "nullable"
    string name
    string type "개인|법인"
    int    contribution
    date   joinDate
    enum   status "active|leave"
  }

  Doc {
    string id PK
    string tenantId FK
    string title
    string content
    enum   kind "html|hwp"
    string authorId
    string authorName
    date   createdAt
    date   updatedAt
  }

  DocumentIndex {
    string id PK
    string tenantId
    enum   kind "html_doc|hwp_doc|child_card|care_log|child_document|approval_doc"
    string title
    string snippet
    string sourceUrl
    string childId
    string authorId
    string authorName
    json   meta
    date   createdAt
    date   updatedAt
  }

  ApprovalRequest {
    string id PK
    string tenantId FK
    string documentId
    string documentUrl
    string documentKind
    string title
    enum   form "education|leave|expense|purchase|report|memo"
    string requesterId
    string requesterName
    enum   status "결재중|완료|반려|회수"
    bool   urgent
    bool   hasFile
    string docNo UK
    string snippet
    date   createdAt
    date   completedAt
  }

  ApprovalStep {
    string id PK
    string requestId FK
    int    step
    string name
    string position
    enum   status "pending|current|approved|rejected"
    date   actedAt
    string comment
  }

  AnnualPlan {
    string id PK
    string tenantId FK
    int    year
    string title
    enum   status "draft|active|done"
    json   goals "string[]"
    int    evaluationScore
    string evaluationSummary
    json   evaluationHighlights "string[]"
    json   evaluationImprovements "string[]"
    string evaluatedBy
    date   evaluatedAt
    string createdBy
    date   createdAt
    string approvedBy
    date   approvedAt
  }

  Program {
    string id PK
    string annualPlanId FK
    string name
    string targetGroup
    int    weeklyFrequency
    string method
    json   monthlyTargets "string[]"
    json   materials "string[]"
  }

  MonthlyPlan {
    string id PK
    string annualPlanId FK
    int    year
    int    month
    enum   status "draft|active|done"
    int    progressPct
    json   kpiAchieved "string[]"
    string notes
    string evaluatedBy
    date   evaluatedAt
  }

  WeeklyGoal {
    string id PK
    string monthlyPlanId FK
    int    weekNumber
    string goal
    json   activities "string[]"
  }

  DailyLog {
    string id PK
    string tenantId FK
    string monthlyPlanId FK "nullable"
    date   date
    string title
    string authorName
    string authorRole
    enum   status "draft|pending|approved"
    string content "raw HTML"
    date   createdAt
    date   updatedAt
  }
```

## 도메인 그룹

| Group | 모델 | 비고 |
|---|---|---|
| **Tenant** | Tenant, User | 멀티테넌트 루트 |
| **Child** | Child, ChildCardMeta, ChildPhysical, ChildObservations, Attendance, CareLog, ChildDocument | 아동 + PDF 카드 |
| **Staff** | Staff, StaffAttendance | 종사자 + 근태 |
| **Volunteer** | Volunteer, VolunteerAttendance | 봉사자 + 등원 |
| **Member** | Member | 조합원 |
| **Documents** | Doc, DocumentIndex | HTML/HWP + 통합 인덱스 (write-through) |
| **Approval** | ApprovalRequest, ApprovalStep | 결재함 |
| **Plan** | AnnualPlan, Program, MonthlyPlan, WeeklyGoal, DailyLog | 운영 계획 (년→월→주→일) |

## 다음 단계

1. Supabase 프로젝트 생성 (https://supabase.com)
2. `.env.local`에 `DATABASE_URL` 설정:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
   ```
3. `npx prisma migrate dev --name init` (DB에 schema 적용)
4. `npx prisma db seed` (mock 데이터 이관)
5. `npx prisma generate` (Prisma Client 재생성)
6. `npx prisma studio` (DB GUI에서 확인)
