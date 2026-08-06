import { NextResponse } from "next/server";
import { contactDal } from "@/dal/contact";

export async function GET() {
  try {
    const submissions = await contactDal.getSubmissions();
    return NextResponse.json(submissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
