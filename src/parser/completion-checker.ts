/**
 * CompletionChecker -- Detects truncated XML output.
 *
 * AI models may truncate output mid-generation due to token limits.
 * This module detects incomplete XML and signals the need for continuation.
 */

/**
 * Checks whether the XML contains only complete <mxCell> elements.
 *
 * A complete mxCell is either:
 * - Self-closing: <mxCell ... />
 * - Has a closing tag: <mxCell ...>...</mxCell>
 *
 * @param xml - The XML string to check
 * @returns true if all mxCell elements are complete
 */
function countMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

function hasBalancedTags(text: string, openPattern: RegExp, selfClosePattern: RegExp, closePattern: RegExp): boolean {
  return countMatches(text, openPattern) === countMatches(text, selfClosePattern) + countMatches(text, closePattern);
}

export function isMxCellXmlComplete(xml: string): boolean {
  const trimmed = xml.trim();

  if (!trimmed) {
    return false;
  }

  if (!hasBalancedTags(trimmed, /<mxCell\b/g, /<mxCell[^>]*\/>/g, /<\/mxCell>/g)) {
    return false;
  }

  if (!hasBalancedTags(trimmed, /<mxGeometry\b/g, /<mxGeometry[^>]*\/>/g, /<\/mxGeometry>/g)) {
    return false;
  }

  // Must end with a complete tag
  if (!trimmed.endsWith('>')) {
    return false;
  }

  return true;
}

/**
 * Extracts only complete mxCell elements from partial XML.
 * Useful for progressive rendering during streaming.
 *
 * @param partialXml - Potentially truncated XML
 * @returns XML containing only complete mxCell elements
 */
export function extractCompleteMxCells(partialXml: string): string {
  const completeCells: string[] = [];

  // Match self-closing mxCell elements
  const selfClosingPattern = /<mxCell[^>]*\/>/g;
  let match: RegExpExecArray | null;
  while ((match = selfClosingPattern.exec(partialXml)) !== null) {
    completeCells.push(match[0]);
  }

  // Match mxCell elements with closing tags (including nested mxGeometry)
  const fullPattern = /<mxCell\b[^>]*>[\s\S]*?<\/mxCell>/g;
  while ((match = fullPattern.exec(partialXml)) !== null) {
    completeCells.push(match[0]);
  }

  return completeCells.join('\n');
}
