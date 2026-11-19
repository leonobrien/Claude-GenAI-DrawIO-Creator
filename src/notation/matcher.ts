/**
 * Shared fuzzy name matcher used by notation catalogues and client standards.
 *
 * Lookup priority:
 * 1. Exact name match
 * 2. Case-insensitive match (name or alias)
 * 3. Partial/substring match (prefer category-scoped, then shortest name)
 */

export interface NamedItem {
  name: string;
  category?: string;
  aliases?: string[];
}

export function matchByName<T extends NamedItem>(
  items: readonly T[],
  query: string,
  category?: string,
): T | null {
  if (!query) return null;

  const exact = items.find(s => s.name === query);
  if (exact) return exact;

  const lower = query.toLowerCase();
  const caseInsensitive = items.find(s => s.name.toLowerCase() === lower);
  if (caseInsensitive) return caseInsensitive;

  const aliasMatch = items.find(s => s.aliases?.some(a => a.toLowerCase() === lower));
  if (aliasMatch) return aliasMatch;

  const partials = items.filter(s => {
    const sLower = s.name.toLowerCase();
    return sLower.includes(lower) || lower.includes(sLower);
  });

  if (partials.length === 0) return null;

  if (category) {
    const categoryLower = category.toLowerCase();
    const categoryMatches = partials.filter(s => s.category?.toLowerCase() === categoryLower);
    if (categoryMatches.length > 0) {
      return categoryMatches.reduce((a, b) => (a.name.length <= b.name.length ? a : b));
    }
  }

  return partials.reduce((a, b) => (a.name.length <= b.name.length ? a : b));
}
