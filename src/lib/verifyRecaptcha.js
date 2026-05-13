/**
 * @typedef {{ valid: true } | { valid: false; message: string; errorCodes?: string[] }} RecaptchaVerifyResult
 */

/**
 * Verifies a reCAPTCHA v2 token with Google.
 * @param {string | undefined} token
 * @param {{ secretKey: string; skipVerification?: boolean }} options
 * @returns {Promise<RecaptchaVerifyResult>}
 */
export async function verifyRecaptchaResponse(token, options) {
  const { secretKey, skipVerification } = options;

  if (skipVerification) {
    return { valid: true };
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      valid: false,
      message: "Captcha token is missing. Please complete the reCAPTCHA and try again.",
    };
  }

  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", token.trim());

  try {
    const res = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      return {
        valid: false,
        message: `Captcha verification service returned an error (${res.status}). Please try again in a moment.`,
      };
    }

    const data = await res.json();
    if (data.success === true) {
      return { valid: true };
    }

    const errorCodes = Array.isArray(data["error-codes"])
      ? data["error-codes"]
      : [];
    const message = humanizeRecaptchaErrorCodes(errorCodes);

    return {
      valid: false,
      message,
      errorCodes,
    };
  } catch {
    return {
      valid: false,
      message:
        "Could not verify the captcha right now. Check your connection and try again.",
    };
  }
}

/**
 * @param {string[]} codes
 * @returns {string}
 */
function humanizeRecaptchaErrorCodes(codes) {
  if (!codes.length) {
    return "Captcha verification failed. Please complete the reCAPTCHA again.";
  }
  const hints = {
    "missing-input-secret": "Captcha is not configured correctly on the server.",
    "invalid-input-secret": "Captcha is not configured correctly on the server.",
    "missing-input-response": "Captcha token was not sent. Please complete the reCAPTCHA.",
    "invalid-input-response":
      "Captcha token is invalid or expired. Please complete the reCAPTCHA again.",
    "timeout-or-duplicate":
      "Captcha token was already used or timed out. Please complete the reCAPTCHA again.",
    "bad-request": "Captcha verification request was invalid. Please try again.",
  };
  const first = codes[0];
  return hints[first] || "Captcha verification failed. Please try again.";
}

/**
 * @param {string | undefined} token
 * @param {{ secretKey: string; skipVerification?: boolean }} options
 * @returns {Promise<boolean>}
 */
export async function verifyRecaptchaToken(token, options) {
  const result = await verifyRecaptchaResponse(token, options);
  return result.valid === true;
}
