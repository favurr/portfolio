import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { contactDal } from "@/dal/contact";
import { checkRateLimit } from "@/lib/rate-limit";

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]/g, "").trim();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               headersList.get("x-real-ip") || 
               "unknown";
    
    const { success } = await checkRateLimit(`contact:${ip}`, "strict");
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait before sending more messages." }, { status: 429 });
    }

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (name.length > 100 || email.length > 254 || message.length > 5000 || (subject && subject.length > 200)) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    const safeName = sanitizeHeaderValue(name);
    const safeEmail = sanitizeHeaderValue(email);
    const safeSubject = subject ? sanitizeHeaderValue(subject) : `New message from ${safeName}`;

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Resend API key is not configured." },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Favurr Contact <onboarding@resend.dev>",
        to: ["emekafavi2019@gmail.com"],
        reply_to: safeEmail,
        subject: safeSubject,
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
            <h2>New Inquiry from ${safeName}</h2>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to send email via Resend." },
        { status: res.status }
      );
    }

    await contactDal.createSubmission({ name: safeName, email: safeEmail, subject: safeSubject, message });

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
