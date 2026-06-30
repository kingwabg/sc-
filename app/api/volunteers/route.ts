import { NextResponse } from "next/server";
import { listVolunteers } from "@/lib/features/volunteer/db";

export async function GET() {
  try {
    const volunteers = await listVolunteers();
    return NextResponse.json(volunteers);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
