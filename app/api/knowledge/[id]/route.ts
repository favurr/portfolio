import { NextResponse } from "next/server";
import { knowledgeDal } from "@/dal/knowledge";
import { vectorSyncService } from "@/services/vector-sync";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updated = await knowledgeDal.updateEntry(id, data);
    if (updated.enabled) {
      await vectorSyncService.syncKnowledgeToVector(updated);
    } else {
      await vectorSyncService.deleteKnowledgeFromVector(id);
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await knowledgeDal.deleteEntry(id);
    await vectorSyncService.deleteKnowledgeFromVector(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

