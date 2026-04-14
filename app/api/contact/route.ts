export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send to admin
    await resend.emails.send({
      from: "Learn with John <noreply@learnwithjohn.com>",
      to: "learnwithjohn17@gmail.com",
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D6FF2;">New Contact Form Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 1px solid #eee; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "Learn with John <noreply@learnwithjohn.com>",
      to: email,
      subject: "We received your message!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D6FF2;">Thanks for reaching out, ${name}!</h2>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            — The Learn with John Team
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONTACT_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
