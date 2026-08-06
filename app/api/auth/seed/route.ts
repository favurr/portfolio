import { seedAdminUser } from "@/services/seed";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await seedAdminUser();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
