/** Google reCAPTCHA v2 — placeholder pair skips server verification only. */
export const RECAPTCHA_DUMMY_SITE_KEY = "6Lcxxxxxxxx";
export const RECAPTCHA_DUMMY_SECRET_KEY = "6Lcxxxxxxxx";

function trimEnv(value) {
  return typeof value === "string" ? value.trim() : "";
}

/** True when a real site key is set (client-safe; no secret). */
export function isRecaptchaSiteKeyConfigured() {
  const siteKey = trimEnv(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
  return siteKey.length > 0 && siteKey !== RECAPTCHA_DUMMY_SITE_KEY;
}

/** Site key for react-google-recaptcha (falls back to dummy when unset). */
export const RECAPTCHA_SITE_KEY = isRecaptchaSiteKeyConfigured()
  ? trimEnv(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
  : RECAPTCHA_DUMMY_SITE_KEY;
