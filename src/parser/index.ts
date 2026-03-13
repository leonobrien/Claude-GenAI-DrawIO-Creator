export { assertXmlSize, MAX_XML_SIZE, MAX_STYLE_LENGTH, MAX_LABEL_LENGTH, MAX_CELLS, MAX_STATE_FILE_SIZE } from './limits.js';
export { validateXml } from './xml-validator.js';
export { fixXml } from './xml-fixer.js';
export { validateSemantics, validateEdgeReferences, validateExpectedLabels } from './semantic-validator.js';
export type { SemanticValidationResult } from './semantic-validator.js';
export { isMxCellXmlComplete, extractCompleteMxCells } from './completion-checker.js';
export { validateShapeRenderable, extractStencilRef } from './shape-validator.js';
export type { ShapeValidationResult, ShapeValidationIssue } from './shape-validator.js';

import { validateXml } from './xml-validator.js';
import { fixXml } from './xml-fixer.js';
import type { ValidationResult, FixResult } from '../types/index.js';

export interface ValidateAndFixResult {
  validation: ValidationResult;
  fix?: FixResult;
  finalXml: string;
}

/**
 * Combined validation and fix pipeline.
 *
 * 1. Validate the XML
 * 2. If invalid, apply fixes
 * 3. Re-validate
 * 4. Return the final result
 */
export function validateAndFixXml(xml: string): ValidateAndFixResult {
  const initialValidation = validateXml(xml);

  if (initialValidation.valid) {
    return {
      validation: initialValidation,
      finalXml: xml,
    };
  }

  // Attempt fixes
  const fixResult = fixXml(xml);

  // Re-validate
  const finalValidation = validateXml(fixResult.xml);
  fixResult.remainingErrors = finalValidation.errors;

  return {
    validation: finalValidation,
    fix: fixResult,
    finalXml: fixResult.xml,
  };
}
