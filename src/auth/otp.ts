import emailjs from "@emailjs/browser";

const OTP_KEY = "panga_otp_pending";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface PendingOtp {
  email: string;
  code: string;
  expiresAt: number;
}

function readEnv(name: string): string | undefined {
  return (import.meta as unknown as { env: Record<string, string | undefined> }).env[name];
}

/**
 * Sends a 6-digit one-time code to `email`.
 *
 * Uses EmailJS (https://www.emailjs.com — free tier, 200 emails/month, no
 * backend required) when `VITE_EMAILJS_SERVICE_ID` / `VITE_EMAILJS_TEMPLATE_ID`
 * / `VITE_EMAILJS_PUBLIC_KEY` are set in `.env.local` (see `.env.example`).
 *
 * If EmailJS isn't configured yet, falls back to a "dev mode" that never
 * fails: the code is returned to the caller so it can be shown inline,
 * meaning the login flow is fully testable before you wire up email.
 */
export async function sendOtp(email: string): Promise<{ devCode?: string }> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const pending: PendingOtp = { email, code, expiresAt: Date.now() + OTP_TTL_MS };
  sessionStorage.setItem(OTP_KEY, JSON.stringify(pending));

  const serviceId = readEnv("VITE_EMAILJS_SERVICE_ID");
  const templateId = readEnv("VITE_EMAILJS_TEMPLATE_ID");
  const publicKey = readEnv("VITE_EMAILJS_PUBLIC_KEY");

  if (!serviceId || !templateId || !publicKey) {
    // Dev mode — no email service configured yet.
    return { devCode: code };
  }

  try {
    await emailjs.send(
      serviceId,
      templateId,
      { to_email: email, passcode: code, app_name: "Panga" },
      { publicKey }
    );
    return {};
  } catch (err) {
    console.error("EmailJS send failed, falling back to dev mode:", err);
    return { devCode: code };
  }
}

export function verifyOtp(email: string, code: string): boolean {
  const raw = sessionStorage.getItem(OTP_KEY);
  if (!raw) return false;
  const pending: PendingOtp = JSON.parse(raw);
  const ok =
    pending.email === email && pending.code === code.trim() && Date.now() < pending.expiresAt;
  if (ok) sessionStorage.removeItem(OTP_KEY);
  return ok;
}
