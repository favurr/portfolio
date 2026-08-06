import { NextResponse } from "next/server";
import { experienceDal } from "@/dal/experience";

export async function GET() {
  try {
    const experiences = await experienceDal.getAllExperiences();
    return NextResponse.json(experiences);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const experience = await experienceDal.createExperience(data);
    return NextResponse.json(experience, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
