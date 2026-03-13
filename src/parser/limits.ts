/**
 * Limits — Shared constants for input validation and resource bounding.
 *
 * Centralises size limits to prevent memory exhaustion from
 * pathological or malicious inputs.
 */

/** Maximum XML document size (10 MB). */
export const MAX_XML_SIZE = 10 * 1024 * 1024;

/** Maximum number of mxCell elements in a single document. */
export const MAX_CELLS = 10_000;

/** Maximum length of a single style attribute value. */
export const MAX_STYLE_LENGTH = 2_000;

/** Maximum length of a label/value attribute. */
export const MAX_LABEL_LENGTH = 1_000;

/** Maximum state file size (1 MB). */
export const MAX_STATE_FILE_SIZE = 1 * 1024 * 1024;

/**
 * Asserts that an XML string is within acceptable size limits.
 * Throws if the input exceeds MAX_XML_SIZE.
 */
export function assertXmlSize(xml: string, context = 'XML input'): void {
  if (xml.length > MAX_XML_SIZE) {
    throw new Error(`${context} exceeds maximum size (${xml.length} > ${MAX_XML_SIZE} bytes)`);
  }
}
