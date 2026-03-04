export { validateXml } from './xml-validator.js';
export { fixXml } from './xml-fixer.js';
export { validateSemantics, validateEdgeReferences, validateExpectedLabels } from './semantic-validator.js';
export type { SemanticValidationResult } from './semantic-validator.js';
export { isMxCellXmlComplete, extractCompleteMxCells } from './completion-checker.js';
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
export declare function validateAndFixXml(xml: string): ValidateAndFixResult;
//# sourceMappingURL=index.d.ts.map