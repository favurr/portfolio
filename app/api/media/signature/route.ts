import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_mB/mEeb+t0K1LgVst6y0oP/aVCo=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_B2TjZ9C/Zlqf+w9vI62kZ7B9s5w=",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/favurr",
});

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json({
      ...authParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_mB/mEeb+t0K1LgVst6y0oP/aVCo=",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
