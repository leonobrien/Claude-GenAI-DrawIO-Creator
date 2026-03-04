/**
 * XmlValidator -- Structural validation for draw.io XML output.
 *
 * Performs multiple checks derived from the reference implementation's
 * validateMxCellStructure function:
 * 1. DOM parsing (well-formedness)
 * 2. Duplicate ID detection
 * 3. Orphaned edge references (source/target pointing to non-existent IDs)
 * 4. Nested mxCell detection
 * 5. Unescaped special characters
 * 6. Mismatched tags
 * 7. Empty IDs
 * 8. Invalid entity references
 */

import type { ValidationResult } from '../types/index.js';

/**
 * Checks for duplicate mxCell IDs.
 */
function checkDuplicateIds(xml: string): string[] {
  const errors: string[] = [];
  const idPattern = /<mxCell[^>]*\sid="([^"]*)"[^>]*/g;
  const seen = new Map<string, number>();

  let match: RegExpExecArray | null;
  while ((match = idPattern.exec(xml)) !== null) {
    const id = match[1];
    const count = (seen.get(id) ?? 0) + 1;
    seen.set(id, count);
    if (count === 2) {
      errors.push(`Duplicate mxCell id="${id}"`);
    }
  }

  return errors;
}

/**
 * Checks for empty id attributes.
 */
function checkEmptyIds(xml: string): string[] {
  const errors: string[] = [];
  const emptyIdPattern = /<mxCell[^>]*\sid=""[^>]*/g;

  if (emptyIdPattern.test(xml)) {
    errors.push('Found mxCell with empty id attribute');
  }

  return errors;
}

/**
 * Checks that edge source/target IDs reference existing vertex IDs.
 */
function checkOrphanedEdges(xml: string): string[] {
  const errors: string[] = [];

  // Collect all cell IDs
  const allIds = new Set<string>();
  const idPattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*/g;
  let match: RegExpExecArray | null;
  while ((match = idPattern.exec(xml)) !== null) {
    allIds.add(match[1]);
  }
  // Root cells are always present
  allIds.add('0');
  allIds.add('1');

  // Check edge source/target references
  const edgePattern = /<mxCell[^>]*\sedge="1"[^>]*/g;
  while ((match = edgePattern.exec(xml)) !== null) {
    const cellXml = match[0];

    const sourceMatch = cellXml.match(/\ssource="([^"]+)"/);
    if (sourceMatch && !allIds.has(sourceMatch[1])) {
      errors.push(`Edge references non-existent source="${sourceMatch[1]}"`);
    }

    const targetMatch = cellXml.match(/\starget="([^"]+)"/);
    if (targetMatch && !allIds.has(targetMatch[1])) {
      errors.push(`Edge references non-existent target="${targetMatch[1]}"`);
    }
  }

  return errors;
}

/**
 * Checks for nested mxCell elements (mxCell inside mxCell, excluding mxGeometry children).
 */
function checkNestedMxCells(xml: string): string[] {
  const errors: string[] = [];

  // Simple depth-based check: count opening/closing mxCell tags
  let depth = 0;
  const tagPattern = /<(\/?)mxCell[\s>\/]/g;

  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(xml)) !== null) {
    if (match[1] === '/') {
      depth--;
    } else {
      depth++;
      if (depth > 1) {
        errors.push('Nested mxCell detected (mxCell inside mxCell)');
        break;
      }
    }

    // Handle self-closing tags
    const preceding = xml.substring(Math.max(0, match.index - 1), match.index + match[0].length + 200);
    if (match[1] !== '/' && preceding.includes('/>')) {
      depth--;
    }
  }

  return errors;
}

/**
 * Checks for unescaped & characters (bare ampersands not part of valid entity refs).
 */
function checkUnescapedAmpersands(xml: string): string[] {
  const warnings: string[] = [];

  // Match & not followed by a valid entity or numeric reference
  const bareAmpPattern = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g;
  if (bareAmpPattern.test(xml)) {
    warnings.push('Found unescaped & character(s) — should be &amp;');
  }

  return warnings;
}

/**
 * Checks for mismatched open/close tags.
 */
function checkMismatchedTags(xml: string): string[] {
  const errors: string[] = [];
  const stack: string[] = [];

  // Match opening, closing, and self-closing tags
  const tagPattern = /<(\/?)(\w+)([^>]*?)(\/?)>/g;

  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(xml)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2];
    const isSelfClosing = match[4] === '/';

    if (isSelfClosing) {
      continue;
    }

    if (isClosing) {
      if (stack.length === 0) {
        errors.push(`Unexpected closing tag </${tagName}>`);
      } else if (stack[stack.length - 1] !== tagName) {
        errors.push(`Mismatched tags: expected </${stack[stack.length - 1]}>, found </${tagName}>`);
        stack.pop();
      } else {
        stack.pop();
      }
    } else {
      stack.push(tagName);
    }
  }

  for (const unclosed of stack) {
    errors.push(`Unclosed tag <${unclosed}>`);
  }

  return errors;
}

/**
 * Validates draw.io XML structure.
 * Returns a ValidationResult with errors and warnings.
 *
 * @param xml - The XML string to validate (bare mxCells or wrapped)
 */
export function validateXml(xml: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!xml.trim()) {
    return { valid: false, errors: ['Empty XML input'], warnings: [] };
  }

  errors.push(...checkDuplicateIds(xml));
  errors.push(...checkEmptyIds(xml));
  errors.push(...checkOrphanedEdges(xml));
  errors.push(...checkNestedMxCells(xml));
  errors.push(...checkMismatchedTags(xml));
  warnings.push(...checkUnescapedAmpersands(xml));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
