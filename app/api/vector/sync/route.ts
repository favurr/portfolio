import { NextResponse } from "next/server";
import { vectorSyncService } from "@/services/vector-sync";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await vectorSyncService.reindexAll();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[VECTOR-SYNC-ROUTE] Failed to seed vector index:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
