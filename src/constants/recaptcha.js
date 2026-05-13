/** Google reCAPTCHA v2 — placeholder pair skips server verification only. */
export const RECAPTCHA_DUMMY_SITE_KEY = "6Lcxxxxxxxx";
export const RECAPTCHA_DUMMY_SECRET_KEY = "6Lcxxxxxxxx";

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? RECAPTCHA_DUMMY_SITE_KEY;
