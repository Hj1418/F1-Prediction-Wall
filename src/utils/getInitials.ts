/**
 * Generates dynamic 1-character uppercase avatar initial from a person's display name.
 * Rules:
 * - Trim whitespace.
 * - Use the first meaningful character of the display name.
 * - Return exactly ONE character.
 * - Convert to uppercase.
 * - Safe fallback "U" if missing or empty.
 * - Does NOT modify stored displayName or persist to database.
 *
 * Examples:
 *   "Harsh Jalnekar"   -> "H"
 *   "Alex Thorne"      -> "A"
 *   "max verstappen"   -> "M"
 *   " Lewis Hamilton " -> "L"
 *   ""                 -> "U"
 */
export const getAvatarInitial = (displayName?: string | null): string => {
  if (!displayName) return 'U';

  const cleaned = displayName.trim();
  if (!cleaned) return 'U';

  // Find first alphanumeric character; fall back to the first non-whitespace char
  const match = cleaned.match(/[a-zA-Z0-9]/);
  const char = match ? match[0] : cleaned.charAt(0);

  return (char || 'U').toUpperCase();
};

/**
 * Backward-compatible alias for getAvatarInitial.
 * Strictly guarantees a single uppercase initial is returned.
 */
export const getInitials = (name?: string | null): string => {
  return getAvatarInitial(name);
};

