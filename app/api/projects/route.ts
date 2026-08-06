import { projectDal } from "@/dal/project";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await projectDal.getProjects();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
