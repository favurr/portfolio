import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mediaDal } from "@/dal/media";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch item to get the ImageKit key (fileId)
    const mediaItem = await mediaDal.getMediaItemById(id);
    if (!mediaItem) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    // 2. Delete file from ImageKit cloud storage
    try {
      if (mediaItem.key) {
        await imagekit.deleteFile(mediaItem.key);
      }
    } catch (ikError) {
      console.warn("Failed to delete from ImageKit, proceeding to delete database ref", ikError);
    }

    // 3. Delete from database
    await mediaDal.deleteMediaItem(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
