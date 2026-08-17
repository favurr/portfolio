import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mediaService } from "@/services/project";
import ImageKit from "imagekit";
import { checkRateLimit } from "@/lib/rate-limit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;

    const mediaItems = await mediaService.getMediaItems(projectId);
    return NextResponse.json(mediaItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               headersList.get("x-real-ip") || 
               "unknown";
    
    const { success } = await checkRateLimit(`media:${session.user.id}:${ip}`, "upload");
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded for uploads" }, { status: 429 });
    }

    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { url, key, mimeType, fileSize, projectId } = body;
      
      if (!url || !key) {
        return NextResponse.json({ error: "Missing required registration parameters" }, { status: 400 });
      }

      if (!url.startsWith("https://ik.imagekit.io/")) {
        return NextResponse.json({ error: "Invalid URL domain" }, { status: 400 });
      }

      const mediaItem = await mediaService.registerMediaItem({
        url,
        key,
        mimeType: mimeType || "image/jpeg",
        fileSize: fileSize || 0,
        projectId: projectId || undefined,
      });

      return NextResponse.json(mediaItem);
    }

    // Fallback to traditional multipart upload
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string | undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean special characters from file name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const filename = `${uniqueSuffix}-${originalName}`;

    // Upload to ImageKit folder favurr/portfolio/projects
    const uploadResult = await imagekit.upload({
      file: buffer,
      fileName: filename,
      folder: "favurr/portfolio/projects",
      useUniqueFileName: false,
    });

    // Save metadata reference in Postgres
    const mediaItem = await mediaService.registerMediaItem({
      url: uploadResult.url,
      key: uploadResult.fileId,
      mimeType: file.type,
      fileSize: file.size,
      projectId: projectId || undefined,
    });

    return NextResponse.json(mediaItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
