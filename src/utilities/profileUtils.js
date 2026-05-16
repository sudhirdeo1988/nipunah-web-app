/**
 * Username is the login id; when API returns null/empty username, email is used.
 */
export function resolveProfileUsername(profile) {
  if (!profile || typeof profile !== "object") return "";
  const username = profile.username;
  if (username != null && String(username).trim() !== "") {
    return String(username).trim();
  }
  const email = profile.email;
  return email != null && String(email).trim() !== "" ? String(email).trim() : "";
}
