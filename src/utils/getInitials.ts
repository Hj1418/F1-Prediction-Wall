/**
 * Generates up to 2 uppercase initials from a person's display name.
 * Examples:
 *   "Harsh Jalnekar" -> "HJ"
 *   "Alex Turner"    -> "AT"
 *   "Max"            -> "M"
 *   ""               -> "U"
 */
export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';

  const cleaned = name.trim();
  if (!cleaned) return 'U';

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  if (parts.length === 1) {
    const single = parts[0];
    return (single.length >= 2 ? single.slice(0, 2) : single).toUpperCase();
  }

  return 'U';
};
