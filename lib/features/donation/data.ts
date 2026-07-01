/**
 * lib/features/donation/db.ts — Donation repository (server-only)
 *
 * - @prisma/client 쿼리 → Donation view-model로 매핑
 * - DATABASE_URL 없으면 MOCK_DONATIONS로 자동 fallback (페이지 부수지 않음)
 * - 통계 + 채번까지 한 번에
 *
 * 멀티테넌트: 모든 쿼리에서 tenantId 필터링 필수
 */

import "server-only";
import { prisma } from "@/lib/db/prisma";
import { Prisma, type DonationType } from "@prisma/client";
import { MOCK_DONATIONS } from "./mock";
import {
  computeStats,
  generateReceiptNumber,
  currentYear,
} from "./utils";
import type {
  Donation,
  DonationInput,
  DonationListResult,
  IssuedReceipt,
} from "./types";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

type DbDonationRow = {
  id: string;
  tenantId: string;
  donorName: string;
  donorContact: string | null;
  type: DonationType;
  amount: Prisma.Decimal | null;
  itemName: string | null;
  itemQty: number | null;
  receivedAt: Date;
  receiptIssued: boolean;
  receiptNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** DB row (Decimal 등) → view-model Donation 변환 */
function toDonation(row: DbDonationRow): Donation {
  return {
    id: row.id,
    tenantId: row.tenantId,
    donorName: row.donorName,
    donorContact: row.donorContact,
    type: row.type,
    amount: row.amount != null ? Number(row.amount.toString()) : null,
    itemName: row.itemName,
    itemQty: row.itemQty,
    receivedAt: row.receivedAt,
    receiptIssued: row.receiptIssued,
    receiptNumber: row.receiptNumber,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * DB 사용 가능 여부 — try/catch로 체크 (mock fallback 결정)
 * - DATABASE_URL 미설정/연결 실패 시 fallback 함수 호출
 * - fallback도 비동기 가능 (mock mutation 등)
 */
async function tryPrisma<T>(
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") || err.message.includes("Environment variable"))
    ) {
      return await fallback();
    }
    // 다른 에러는 그대로 위로 — 호출부에서 로그 확인 가능
    console.error("[donation.db] query failed:", err);
    return await fallback();
  }
}

/** 단일 후원 조회 */
export async function getDonation(id: string): Promise<Donation | null> {
  return tryPrisma(
    async () => {
      const row = (await prisma.donation.findFirst({
        where: { id, tenantId: DEFAULT_TENANT },
      })) as DbDonationRow | null;
      return row ? toDonation(row) : null;
    },
    () => {
      const m = MOCK_DONATIONS.find((d) => d.id === id);
      return m ?? null;
    },
  );
}

/** 테넌트 후원 목록 + 통계 */
export async function listDonations(
  tenantId: string = DEFAULT_TENANT,
): Promise<DonationListResult> {
  return tryPrisma(
    async () => {
      const rows = (await prisma.donation.findMany({
        where: { tenantId },
        orderBy: { receivedAt: "desc" },
      })) as DbDonationRow[];
      const donations = rows.map(toDonation);
      return { donations, stats: computeStats(donations) };
    },
    () => {
      const donations = MOCK_DONATIONS.filter((d) => d.tenantId === tenantId)
        .slice()
        .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
      return { donations, stats: computeStats(donations) };
    },
  );
}

/** 새 후원 등록 */
export async function createDonation(
  input: DonationInput,
): Promise<Donation> {
  return tryPrisma(
    async () => {
      const id = `don-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const row = (await prisma.donation.create({
        data: {
          id,
          tenantId: DEFAULT_TENANT,
          donorName: input.donorName.trim(),
          donorContact: input.donorContact ?? null,
          type: input.type,
          amount:
            input.type === "CASH" && input.amount != null
              ? new Prisma.Decimal(input.amount)
              : null,
          itemName: input.type === "GOODS" ? (input.itemName ?? null) : null,
          itemQty: input.type === "GOODS" ? (input.itemQty ?? null) : null,
          receivedAt: input.receivedAt ?? new Date(),
          notes: input.notes ?? null,
        },
      })) as DbDonationRow;
      return toDonation(row);
    },
    () => {
      // mock fallback — 메모리에만 추가 (서버 재시작 시 사라짐)
      const id = `don-mock-${Date.now().toString(36)}`;
      const mock: Donation = {
        id,
        tenantId: DEFAULT_TENANT,
        donorName: input.donorName.trim(),
        donorContact: input.donorContact ?? null,
        type: input.type,
        amount: input.type === "CASH" ? (input.amount ?? null) : null,
        itemName: input.type === "GOODS" ? (input.itemName ?? null) : null,
        itemQty: input.type === "GOODS" ? (input.itemQty ?? null) : null,
        receivedAt: input.receivedAt ?? new Date(),
        receiptIssued: false,
        receiptNumber: null,
        notes: input.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_DONATIONS.unshift(mock);
      return mock;
    },
  );
}

/**
 * 영수증 발급 — 같은 연도 내 마지막 번호 + 1로 채번
 * 멱등: 이미 발급된 경우 기존 번호 그대로 반환
 */
export async function issueReceipt(
  donationId: string,
): Promise<IssuedReceipt> {
  return tryPrisma(
    async () => {
      const existing = (await prisma.donation.findFirst({
        where: { id: donationId, tenantId: DEFAULT_TENANT },
      })) as DbDonationRow | null;
      if (!existing) throw new Error("후원을 찾을 수 없습니다");

      if (existing.receiptIssued && existing.receiptNumber) {
        return {
          id: existing.id,
          receiptNumber: existing.receiptNumber,
          issuedAt: existing.updatedAt,
        };
      }

      const year = currentYear();
      // 같은 연도 발급된 모든 번호 조회
      const issued = (await prisma.donation.findMany({
        where: {
          tenantId: DEFAULT_TENANT,
          receiptIssued: true,
          receiptNumber: { startsWith: `RC-${year}-` },
        },
        select: { receiptNumber: true },
      })) as { receiptNumber: string | null }[];
      const issuedNumbers = issued
        .map((r) => r.receiptNumber)
        .filter((n): n is string => !!n);
      const receiptNumber = generateReceiptNumber(year, issuedNumbers);

      const updated = (await prisma.donation.update({
        where: { id: donationId },
        data: { receiptIssued: true, receiptNumber },
      })) as DbDonationRow;
      return {
        id: updated.id,
        receiptNumber: updated.receiptNumber!,
        issuedAt: updated.updatedAt,
      };
    },
    () => {
      // mock fallback
      const d = MOCK_DONATIONS.find((x) => x.id === donationId);
      if (!d) throw new Error("후원을 찾을 수 없습니다");
      if (d.receiptIssued && d.receiptNumber) {
        return {
          id: d.id,
          receiptNumber: d.receiptNumber,
          issuedAt: d.updatedAt,
        };
      }
      const issued = MOCK_DONATIONS
        .filter((x) => x.receiptIssued && x.receiptNumber)
        .map((x) => x.receiptNumber!);
      d.receiptNumber = generateReceiptNumber(currentYear(), issued);
      d.receiptIssued = true;
      d.updatedAt = new Date();
      return {
        id: d.id,
        receiptNumber: d.receiptNumber,
        issuedAt: d.updatedAt,
      };
    },
  );
}
