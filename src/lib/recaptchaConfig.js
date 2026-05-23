import {
  RECAPTCHA_DUMMY_SECRET_KEY,
  RECAPTCHA_DUMMY_SITE_KEY,
} from "@/constants/recaptcha";

function trimEnv(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Server-side reCAPTCHA configuration (never import secret into client components).
 */
export function getRecaptchaServerConfig() {
  const siteKey = trimEnv(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
  const secretKey = trimEnv(process.env.RECAPTCHA_SECRET_KEY);

  const hasSiteKey =
    siteKey.length > 0 && siteKey !== RECAPTCHA_DUMMY_SITE_KEY;
  const hasSecretKey =
    secretKey.length > 0 && secretKey !== RECAPTCHA_DUMMY_SECRET_KEY;

  let misconfigured = false;
  let misconfiguredMessage = "";

  if (hasSiteKey && !hasSecretKey) {
    misconfigured = true;
    misconfiguredMessage =
      "Captcha is not configured on the server. Set RECAPTCHA_SECRET_KEY in .env and restart the app.";
  } else if (!hasSiteKey && hasSecretKey) {
    misconfigured = true;
    misconfiguredMessage =
      "Captcha site key is missing. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env and restart the app.";
  }

  return {
    siteKey,
    secretKey,
    isConfigured: hasSiteKey && hasSecretKey,
    skipVerification: !hasSiteKey && !hasSecretKey,
    misconfigured,
    misconfiguredMessage,
  };
}
