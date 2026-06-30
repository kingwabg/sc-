/**
 * lib/features/children/db.ts — Children repository (server-only)
 *
 * - @prisma/client 쿼리 결과 (camelCase) → Client에서 쓰던 Child 타입으로 매핑
 * - tenantId는 env DEFAULT_TENANT_ID 또는 "t_acme" 기본값
 *
 * Client type (`Child`)은 부모/건강/주소 1:1을 nested object로 가지고 있지만
 * DB는 flat 컬럼이라 매퍼가 필요.
 */
import "server-only";
import { prisma } from "@/lib/db/prisma";
import type {
  Child,
  Guardian,
  Health,
  CapacityGroup,
  ChildObservations,
  ChildCardMeta,
  ChildPhysical,
} from "./types";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

type DbChildFull = {
  id: string;
  tenantId: string;
  name: string;
  nameLast: string;
  nameFirst: string;
  birthDate: string;
  gender: "M" | "F";
  phone: string | null;
  photoUrl: string | null;
  capacityGroup: number;
  grade: string | null;
  school: string | null;
  guardianName: string;
  guardianRelation: "부" | "모" | "조부모" | "기타";
  guardianType: string | null;
  guardianPhone: string;
  guardianJob: string | null;
  guardianNotes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  allergies: string[];
  medications: string[];
  healthNotes: string;
  enrolledAt: string;
  previousEnrolledAt: string | null;
  leftAt: string | null;
  address: string | null;
  serviceType: string | null;
  medianIncomePct: number | null;
  kidsCallId: string | null;
  status: "active" | "leave" | "left";
  cardMeta?: {
    number: string | null;
    identityType: string | null;
    identityVerified: string | null;
    referredBy: string | null;
  } | null;
  physical?: {
    height: number | null;
    weight: number | null;
    buildType: string | null;
    faceShape: string | null;
    hairColor: string | null;
    hairStyle: string | null;
  } | null;
  observations?: {
    personality: string | null;
    family: string | null;
    healthObs: string | null;
    social: string | null;
    interests: string | null;
    learning: string | null;
    behavior: string | null;
  } | null;
};

/** DB row (flat) → Client Child (nested) */
function toChild(row: NonNullable<DbChildFull>): Child {
  const guardian: Guardian = {
    name: row.guardianName,
    relation: row.guardianRelation,
    type: row.guardianType ?? undefined,
    phone: row.guardianPhone,
    job: row.guardianJob ?? undefined,
    notes: row.guardianNotes ?? undefined,
  };
  const health: Health = {
    allergies: row.allergies ?? [],
    medications: row.medications ?? [],
    notes: row.healthNotes ?? "",
  };
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    nameLast: row.nameLast,
    nameFirst: row.nameFirst,
    birthDate: row.birthDate,
    gender: row.gender,
    phone: row.phone ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    capacityGroup: row.capacityGroup as CapacityGroup,
    grade: row.grade ?? undefined,
    school: row.school ?? undefined,
    guardian,
    emergencyContact:
      row.emergencyContactName && row.emergencyContactPhone
        ? { name: row.emergencyContactName, phone: row.emergencyContactPhone }
        : undefined,
    health,
    enrolledAt: row.enrolledAt,
    previousEnrolledAt: row.previousEnrolledAt ?? undefined,
    leftAt: row.leftAt ?? undefined,
    address: row.address ?? undefined,
    serviceType: row.serviceType ?? undefined,
    medianIncomePct: row.medianIncomePct ?? undefined,
    kidsCallId: row.kidsCallId ?? undefined,
    status: row.status as Child["status"],
    card: row.cardMeta
      ? {
          number: row.cardMeta.number ?? undefined,
          identityType: row.cardMeta.identityType ?? undefined,
          identityVerified: row.cardMeta.identityVerified ?? undefined,
          referredBy: row.cardMeta.referredBy ?? undefined,
        }
      : undefined,
    physical: row.physical
      ? {
          height: row.physical.height ?? undefined,
          weight: row.physical.weight ?? undefined,
          buildType: row.physical.buildType ?? undefined,
          faceShape: row.physical.faceShape ?? undefined,
          hairColor: row.physical.hairColor ?? undefined,
          hairStyle: row.physical.hairStyle ?? undefined,
        }
      : undefined,
    // ChildObservations: 현재 application type은 7섹션(actionsTaken 등) / DB는
    // personality/family/... 구조. 일단 raw row 그대로 노출 — UI 쪽에서 분기 처리.
    observations: (row.observations ?? undefined) as unknown as ChildObservations,
  };
}

export async function listChildren(): Promise<Child[]> {
  try {
    const rows = (await prisma.child.findMany({
      where: { tenantId: DEFAULT_TENANT },
      include: { cardMeta: true, physical: true, observations: true },
      orderBy: { name: "asc" },
    })) as unknown as DbChildFull[];
    return rows.map(toChild);
  } catch (err) {
    console.error("[children.db] listChildren failed:", err);
    return [];
  }
}

export async function getChild(id: string): Promise<Child | null> {
  try {
    const row = (await prisma.child.findFirst({
      where: { id, tenantId: DEFAULT_TENANT },
      include: { cardMeta: true, physical: true, observations: true },
    })) as unknown as DbChildFull | null;
    return row ? toChild(row) : null;
  } catch (err) {
    console.error("[children.db] getChild failed:", err);
    return null;
  }
}

/** 추가 아동 (localStorage와 기존 동작 호환) */
export async function addChild(input: Omit<Child, "id">): Promise<Child> {
  const id = `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const row = await prisma.child.create({
    data: {
      id,
      tenantId: input.tenantId,
      name: input.name,
      nameLast: input.nameLast,
      nameFirst: input.nameFirst,
      birthDate: input.birthDate,
      gender: input.gender,
      phone: input.phone,
      photoUrl: input.photoUrl,
      capacityGroup: input.capacityGroup,
      grade: input.grade,
      school: input.school,
      guardianName: input.guardian.name,
      guardianRelation: input.guardian.relation,
      guardianType: input.guardian.type,
      guardianPhone: input.guardian.phone,
      guardianJob: input.guardian.job,
      guardianNotes: input.guardian.notes,
      emergencyContactName: input.emergencyContact?.name,
      emergencyContactPhone: input.emergencyContact?.phone,
      allergies: input.health.allergies,
      medications: input.health.medications,
      healthNotes: input.health.notes,
      enrolledAt: input.enrolledAt,
      previousEnrolledAt: input.previousEnrolledAt,
      leftAt: input.leftAt,
      address: input.address,
      serviceType: input.serviceType,
      medianIncomePct: input.medianIncomePct,
      kidsCallId: input.kidsCallId,
      status: input.status,
    },
    include: { cardMeta: true, physical: true, observations: true },
  });
  return toChild(row);
}

/** 정보수정 (현재 lib/store/children.ts 의 updateExtraChild와 동일 인터페이스) */
export async function updateChild(
  id: string,
  patch: Partial<Omit<Child, "id" | "tenantId">>,
): Promise<Child | null> {
  const data: Record<string, unknown> = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.nameLast !== undefined) data.nameLast = patch.nameLast;
  if (patch.nameFirst !== undefined) data.nameFirst = patch.nameFirst;
  if (patch.birthDate !== undefined) data.birthDate = patch.birthDate;
  if (patch.gender !== undefined) data.gender = patch.gender;
  if (patch.phone !== undefined) data.phone = patch.phone;
  if (patch.capacityGroup !== undefined) data.capacityGroup = patch.capacityGroup;
  if (patch.grade !== undefined) data.grade = patch.grade;
  if (patch.school !== undefined) data.school = patch.school;
  if (patch.enrolledAt !== undefined) data.enrolledAt = patch.enrolledAt;
  if (patch.previousEnrolledAt !== undefined) data.previousEnrolledAt = patch.previousEnrolledAt;
  if (patch.leftAt !== undefined) data.leftAt = patch.leftAt;
  if (patch.address !== undefined) data.address = patch.address;
  if (patch.serviceType !== undefined) data.serviceType = patch.serviceType;
  if (patch.medianIncomePct !== undefined) data.medianIncomePct = patch.medianIncomePct;
  if (patch.kidsCallId !== undefined) data.kidsCallId = patch.kidsCallId;
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.guardian) {
    if (patch.guardian.name !== undefined) data.guardianName = patch.guardian.name;
    if (patch.guardian.relation !== undefined) data.guardianRelation = patch.guardian.relation;
    if (patch.guardian.type !== undefined) data.guardianType = patch.guardian.type;
    if (patch.guardian.phone !== undefined) data.guardianPhone = patch.guardian.phone;
    if (patch.guardian.job !== undefined) data.guardianJob = patch.guardian.job;
    if (patch.guardian.notes !== undefined) data.guardianNotes = patch.guardian.notes;
  }
  if (patch.emergencyContact) {
    data.emergencyContactName = patch.emergencyContact.name;
    data.emergencyContactPhone = patch.emergencyContact.phone;
  }
  if (patch.health) {
    if (patch.health.allergies !== undefined) data.allergies = patch.health.allergies;
    if (patch.health.medications !== undefined) data.medications = patch.health.medications;
    if (patch.health.notes !== undefined) data.healthNotes = patch.health.notes;
  }

  const row = await prisma.child.update({
    where: { id },
    data,
    include: { cardMeta: true, physical: true, observations: true },
  });
  return toChild(row);
}
