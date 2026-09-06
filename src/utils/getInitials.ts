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

  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase() || 'U';
};
