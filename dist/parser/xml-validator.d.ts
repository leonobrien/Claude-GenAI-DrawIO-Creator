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
 * Validates draw.io XML structure.
 * Returns a ValidationResult with errors and warnings.
 *
 * @param xml - The XML string to validate (bare mxCells or wrapped)
 */
export declare function validateXml(xml: string): ValidationResult;
//# sourceMappingURL=xml-validator.d.ts.map