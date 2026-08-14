import { NextResponse } from "next/server";
import { getAblyRest } from "@/lib/ably";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const ably = getAblyRest();
    const isClientAdmin = sessionId === "admin";

    // 1. If admin socket, verify authorization
    if (isClientAdmin) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Define capabilities: Admin gets wildcard access to all chats and lobby, guest gets restricted access
    const capabilities = isClientAdmin
      ? {
          "conversations:*": ["publish", "subscribe", "presence"],
        }
      : {
          [`conversations:${sessionId}`]: ["publish", "subscribe", "presence"],
        };

    const tokenRequestData = await ably.auth.createTokenRequest({
      clientId: sessionId,
      capability: capabilities as any,
    });

    return NextResponse.json(tokenRequestData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
