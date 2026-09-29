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

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export function getStoredEmailJsConfig(): EmailJsConfig {
  try {
    const raw = localStorage.getItem("panga_emailjs_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        serviceId: parsed.serviceId || readEnv("VITE_EMAILJS_SERVICE_ID") || "",
        templateId: parsed.templateId || readEnv("VITE_EMAILJS_TEMPLATE_ID") || "",
        publicKey: parsed.publicKey || readEnv("VITE_EMAILJS_PUBLIC_KEY") || "",
      };
    }
  } catch {}
  return {
    serviceId: readEnv("VITE_EMAILJS_SERVICE_ID") || "",
    templateId: readEnv("VITE_EMAILJS_TEMPLATE_ID") || "",
    publicKey: readEnv("VITE_EMAILJS_PUBLIC_KEY") || "",
  };
}

export function saveStoredEmailJsConfig(config: EmailJsConfig) {
  try {
    localStorage.setItem("panga_emailjs_config", JSON.stringify(config));
  } catch {}
}

export interface SendOtpOptions {
  mode?: "dev" | "real";
  customConfig?: EmailJsConfig;
}

/**
 * Sends a 6-digit one-time code to `email`.
 *
 * Supports both:
 * - "dev" mode: returns code directly for instant test login
 * - "real" mode: sends real email via EmailJS (surfacing errors or success)
 */
export async function sendOtp(
  email: string,
  options?: SendOtpOptions
): Promise<{ devCode?: string; error?: string; successMessage?: string }> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const pending: PendingOtp = { email, code, expiresAt: Date.now() + OTP_TTL_MS };
  sessionStorage.setItem(OTP_KEY, JSON.stringify(pending));

  const isRealMode = options?.mode === "real";

  if (!isRealMode) {
    // Pure Dev Mode: instant code return
    return { devCode: code };
  }

  // Real Auth Mode with EmailJS
  const config = options?.customConfig || getStoredEmailJsConfig();
  const serviceId = config.serviceId?.trim();
  const templateId = config.templateId?.trim();
  const publicKey = config.publicKey?.trim();

  if (!serviceId || !templateId || !publicKey) {
    return {
      error:
        "EmailJS configuration missing. Please enter your Service ID, Template ID, and Public Key, or configure them in .env.",
    };
  }

  try {
    const templateParams = {
      to_email: email,
      email: email,
      user_email: email,
      passcode: code,
      otp: code,
      code: code,
      app_name: "Panga",
    };

    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
    });

    return {
      successMessage: `Real OTP email sent to ${email}. Please check your inbox or spam folder.`,
    };
  } catch (err: any) {
    console.error("EmailJS send failed:", err);
    const errText = err?.text || err?.message || (typeof err === "string" ? err : JSON.stringify(err));
    return {
      error: `EmailJS error: ${errText}. Please check your EmailJS Service ID, Template ID, Public Key, and template parameters.`,
    };
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
