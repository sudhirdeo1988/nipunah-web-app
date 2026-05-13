import { NextResponse } from "next/server";
import {
  RECAPTCHA_DUMMY_SECRET_KEY,
  RECAPTCHA_DUMMY_SITE_KEY,
} from "@/constants/recaptcha";
import { verifyRecaptchaResponse } from "@/lib/verifyRecaptcha";

/**
 * Verifies reCAPTCHA (when not using placeholder keys) and returns the JSON body
 * without captcha fields for upstream registration APIs.
 *
 * @param {Record<string, unknown>} body
 * @returns {Promise<{ ok: true, payload: Record<string, unknown> } | { ok: false, response: NextResponse }>}
 */
export async function verifyAndStripRegisterCaptcha(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "InvalidRequest",
          message: "Request body must be a JSON object.",
        },
        { status: 400 }
      ),
    };
  }

  const {
    captchaToken,
    recaptcha_token: recaptchaTokenLegacy,
    ...registrationPayload
  } = body;

  const resolvedCaptchaToken =
    typeof captchaToken === "string" && captchaToken.trim()
      ? captchaToken.trim()
      : typeof recaptchaTokenLegacy === "string" && recaptchaTokenLegacy.trim()
        ? recaptchaTokenLegacy.trim()
        : undefined;

  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? RECAPTCHA_DUMMY_SITE_KEY;
  const secretKey =
    process.env.RECAPTCHA_SECRET_KEY ?? RECAPTCHA_DUMMY_SECRET_KEY;
  const skipRecaptchaVerification =
    siteKey === RECAPTCHA_DUMMY_SITE_KEY &&
    secretKey === RECAPTCHA_DUMMY_SECRET_KEY;

  if (!skipRecaptchaVerification) {
    if (!resolvedCaptchaToken) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "CaptchaRequired",
            message:
              "Captcha token is required. Please complete the reCAPTCHA and submit again.",
          },
          { status: 400 }
        ),
      };
    }

    const captchaResult = await verifyRecaptchaResponse(resolvedCaptchaToken, {
      secretKey,
      skipVerification: false,
    });

    if (!captchaResult.valid) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "CaptchaVerificationFailed",
            message: captchaResult.message,
            ...(process.env.NODE_ENV === "development" && captchaResult.errorCodes
              ? { details: captchaResult.errorCodes }
              : {}),
          },
          { status: 400 }
        ),
      };
    }
  }

  return { ok: true, payload: registrationPayload };
}
