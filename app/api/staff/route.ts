import { NextResponse } from "next/server";
import { listStaff } from "@/lib/features/staff/db";

export async function GET() {
  try {
    const staff = await listStaff();
    return NextResponse.json(staff);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
