import { NextResponse } from "next/server";
import { blogDal } from "@/dal/blog";

export async function GET() {
  try {
    const posts = await blogDal.getAllPosts();
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const post = await blogDal.createPost(data);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
