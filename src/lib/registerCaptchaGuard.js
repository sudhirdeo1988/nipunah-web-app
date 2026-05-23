import { NextResponse } from "next/server";
import { getRecaptchaServerConfig } from "@/lib/recaptchaConfig";
import { verifyRecaptchaResponse } from "@/lib/verifyRecaptcha";

/**
 * Verifies reCAPTCHA (when configured) and returns the JSON body
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

  const config = getRecaptchaServerConfig();

  if (config.misconfigured) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "CaptchaMisconfigured",
          message: config.misconfiguredMessage,
        },
        { status: 503 }
      ),
    };
  }

  if (!config.skipVerification) {
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
      secretKey: config.secretKey,
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
