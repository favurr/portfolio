import { NextRequest, NextResponse } from "next/server";
import { contactDal } from "@/dal/contact";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // If RESEND_API_KEY is not set yet in environment, return clean error message for user
      return NextResponse.json(
        { error: "Resend API key is not configured in .env (RESEND_API_KEY)." },
        { status: 500 }
      );
    }

    // Send email via Resend REST API endpoint directly
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Favurr Contact <onboarding@resend.dev>",
        to: ["emekafavi2019@gmail.com"],
        reply_to: email,
        subject: subject || `New message from ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
            <h2>New Inquiry from ${name}</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || "N/A"}</p>
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

    // Persist to database
    await contactDal.createSubmission({ name, email, subject, message });

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
