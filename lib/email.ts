import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({
  name,
  // email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) {
  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/activate?token=${token}`;

  await resend.emails.send({
    from: "Nursing Elections<onboarding@resend.dev>",
    to: "clifforddonk@gmail.com",
    subject: "You're invited to vote — Nursing Department Elections",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>You have been registered to vote in the upcoming <strong>Nursing Department Elections</strong>.</p>
        <p>Click the button below to activate your account and set your password.</p>
        <a href="${activationUrl}"
          style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
          Activate My Account
        </a>
        <p style="color:#6b7280;font-size:13px;">This link expires in 7 days. If you did not expect this email, ignore it.</p>
      </div>
    `,
  });
}
