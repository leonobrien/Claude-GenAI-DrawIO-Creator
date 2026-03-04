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
export function isMxCellXmlComplete(xml: string): boolean {
  const trimmed = xml.trim();

  if (!trimmed) {
    return false;
  }

  // Check for unclosed mxCell tags
  const openCount = (trimmed.match(/<mxCell\b/g) ?? []).length;
  const selfCloseCount = (trimmed.match(/<mxCell[^>]*\/>/g) ?? []).length;
  const closeCount = (trimmed.match(/<\/mxCell>/g) ?? []).length;

  // Each mxCell should either self-close or have a matching </mxCell>
  if (openCount !== selfCloseCount + closeCount) {
    return false;
  }

  // Check for unclosed mxGeometry tags
  const geoOpen = (trimmed.match(/<mxGeometry\b/g) ?? []).length;
  const geoSelfClose = (trimmed.match(/<mxGeometry[^>]*\/>/g) ?? []).length;
  const geoClose = (trimmed.match(/<\/mxGeometry>/g) ?? []).length;

  if (geoOpen !== geoSelfClose + geoClose) {
    return false;
  }

  // Check for truncation mid-attribute (unclosed quote)
  const lastChar = trimmed[trimmed.length - 1];
  if (lastChar !== '>' && lastChar !== '"' && lastChar !== '/') {
    // Likely truncated mid-tag
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
