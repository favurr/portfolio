import { NextResponse } from "next/server";
import { knowledgeDal } from "@/dal/knowledge";
import { vectorSyncService } from "@/services/vector-sync";

export async function GET() {
  try {
    const entries = await knowledgeDal.getAllEntries();
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const entry = await knowledgeDal.createEntry(data);
    if (entry.enabled) {
      await vectorSyncService.syncKnowledgeToVector(entry);
    }
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

