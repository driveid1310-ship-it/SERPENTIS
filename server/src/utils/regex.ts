/**
 * Escape special regular expression metacharacters in user-supplied search strings
 * to prevent invalid regex syntax errors (500) and ReDoS attacks in MongoDB queries.
 */
export function escapeRegex(input: string, maxLength = 100): string {
  return input.trim().slice(0, maxLength).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
