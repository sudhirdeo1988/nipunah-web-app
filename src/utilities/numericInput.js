/** Keys allowed while entering digit-only fields (navigation/editing). */
const ALLOWED_CONTROL_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

/**
 * Strip non-digit characters from a string value.
 * @param {unknown} value
 * @param {number} [maxLength]
 */
export function sanitizeDigits(value, maxLength) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (typeof maxLength === "number" && maxLength > 0) {
    return digits.slice(0, maxLength);
  }
  return digits;
}

/** Form.Item `normalize` helper for digit-only fields. */
export function digitsOnlyNormalize(maxLength) {
  return (value) => sanitizeDigits(value, maxLength);
}

/**
 * Block non-digit key presses (still allows shortcuts like Ctrl/Cmd+C/V).
 * @param {React.KeyboardEvent} event
 */
export function blockNonDigitKeyDown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (ALLOWED_CONTROL_KEYS.has(event.key)) return;
  if (/^\d$/.test(event.key)) return;
  event.preventDefault();
}

/**
 * Props to spread on antd `<Input />` for digits-only entry.
 * @param {{ maxLength?: number }} [options]
 */
export function digitsOnlyInputProps(options = {}) {
  const { maxLength } = options;

  return {
    inputMode: "numeric",
    maxLength,
    onKeyDown: blockNonDigitKeyDown,
    onChange: (event) => {
      const sanitized = sanitizeDigits(event.target.value, maxLength);
      if (sanitized !== event.target.value) {
        event.target.value = sanitized;
      }
    },
    onPaste: (event) => {
      event.preventDefault();
      const pasted = sanitizeDigits(
        event.clipboardData?.getData("text") ?? "",
        maxLength
      );
      if (!pasted) return;

      const input = event.target;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const current = String(input.value ?? "");
      const merged = sanitizeDigits(
        current.slice(0, start) + pasted + current.slice(end),
        maxLength
      );
      input.value = merged;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    },
  };
}
