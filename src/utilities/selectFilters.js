/** Flatten Ant Design Select option label/children into searchable text. */
function optionText(raw) {
  if (raw == null || raw === false) return "";
  if (typeof raw === "string" || typeof raw === "number") return String(raw);
  if (Array.isArray(raw)) return raw.map(optionText).join("");
  if (raw?.props?.children != null) return optionText(raw.props.children);
  return "";
}

/**
 * Ant Design Select filter: typed text must match the start of the option label
 * (case-insensitive). Use for country and country-code dropdowns app-wide.
 */
export function startsWithSelectFilter(input, option) {
  const query = String(input ?? "").trim().toLowerCase();
  if (!query) return true;

  const label = option?.label;
  const candidates = [
    option?.searchLabel,
    typeof label === "string" ? label : optionText(label),
    optionText(option?.children),
    option?.value,
  ];

  return candidates.some((raw) => {
    const text = optionText(raw).trim().toLowerCase();
    return text !== "" && text.startsWith(query);
  });
}
