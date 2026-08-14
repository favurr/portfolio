import { projectService } from "@/services/project";
import { projectDal } from "@/dal/project";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    // Studio requests all projects (including archived); public gets only non-archived
    if (all === "true") {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const projects = await projectDal.getProjects();
      return NextResponse.json(projects);
    }

    const projects = await projectService.getPublishedProjects();
    return NextResponse.json(projects, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
