import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  name: string,
  courseTitle: string
) {
  try {
    await resend.emails.send({
      from: "Learn with John <noreply@learnwithjohn.com>",
      to: email,
      subject: `Welcome to ${courseTitle}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1D6FF2;">Welcome, ${name}!</h1>
          <p>You've successfully enrolled in <strong>${courseTitle}</strong>.</p>
          <p>Start learning right away by clicking the button below:</p>
          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}/student/courses"
            style="display: inline-block; background: #1D6FF2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;"
          >
            Start Learning
          </a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            Happy learning!<br/>The Learn with John Team
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[SEND_EMAIL]", error);
  }
}

export async function sendAssignmentReviewEmail(
  email: string,
  name: string,
  assignmentTitle: string,
  courseTitle: string,
  score: number | null,
  feedback: string | null,
  status: string
) {
  try {
    const passed = status === "passed";
    await resend.emails.send({
      from: "Learn with John <noreply@learnwithjohn.com>",
      to: email,
      subject: `Assignment ${passed ? "Passed" : "Reviewed"} — ${assignmentTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${passed ? "#12B76A" : "#1D6FF2"};">${passed ? "Congratulations!" : "Assignment Reviewed"}</h1>
          <p>Hi ${name},</p>
          <p>Your assignment <strong>${assignmentTitle}</strong> in <strong>${courseTitle}</strong> has been reviewed.</p>
          ${score !== null ? `<p>Score: <strong>${score}%</strong></p>` : ""}
          ${feedback ? `<p>Feedback: ${feedback}</p>` : ""}
          <p>Status: <strong style="color: ${passed ? "#12B76A" : "#ef4444"};">${status.toUpperCase()}</strong></p>
          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}/student/courses"
            style="display: inline-block; background: #1D6FF2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;"
          >
            View Course
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error("[SEND_EMAIL]", error);
  }
}

export async function sendCertificateEmail(
  email: string,
  name: string,
  courseTitle: string,
  uniqueCode: string
) {
  try {
    await resend.emails.send({
      from: "Learn with John <noreply@learnwithjohn.com>",
      to: email,
      subject: `Certificate Earned — ${courseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1D6FF2;">Congratulations, ${name}!</h1>
          <p>You've completed <strong>${courseTitle}</strong> and earned your certificate!</p>
          <p>Certificate ID: <strong>${uniqueCode}</strong></p>
          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}/verify/${uniqueCode}"
            style="display: inline-block; background: #1D6FF2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;"
          >
            View Certificate
          </a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            Share this link with employers and clients to verify your achievement.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[SEND_EMAIL]", error);
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  courseTitle: string,
  amount: number,
  currency: string
) {
  try {
    await resend.emails.send({
      from: "Learn with John <noreply@learnwithjohn.com>",
      to: email,
      subject: `Payment Confirmed — ${courseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1D6FF2;">Payment Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Your payment of <strong>${currency} ${amount.toFixed(2)}</strong> for <strong>${courseTitle}</strong> has been confirmed.</p>
          <p>You now have full access to the course.</p>
          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}/student/courses"
            style="display: inline-block; background: #1D6FF2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;"
          >
            Go to Course
          </a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            Happy learning!<br/>The Learn with John Team
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[SEND_EMAIL]", error);
  }
}

export async function sendReminderEmail(
  email: string,
  name: string,
  courseTitle: string,
  progressPercent: number
) {
  try {
    await resend.emails.send({
      from: "Learn with John <noreply@learnwithjohn.com>",
      to: email,
      subject: `Don't stop now — continue ${courseTitle}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1D6FF2;">Hey ${name}, we miss you!</h1>
          <p>You're <strong>${progressPercent}%</strong> through <strong>${courseTitle}</strong>.</p>
          <p>Don't lose your momentum — jump back in and finish what you started.</p>
          <a
            href="${process.env.NEXT_PUBLIC_APP_URL}/student/my-courses"
            style="display: inline-block; background: #1D6FF2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;"
          >
            Continue Learning
          </a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            Keep going, you're doing great!<br/>The Learn with John Team
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[SEND_REMINDER_EMAIL]", error);
  }
}
