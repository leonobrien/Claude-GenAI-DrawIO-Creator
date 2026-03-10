export { validateXml } from './xml-validator.js';
export { fixXml } from './xml-fixer.js';
export { validateSemantics, validateEdgeReferences, validateExpectedLabels } from './semantic-validator.js';
export { isMxCellXmlComplete, extractCompleteMxCells } from './completion-checker.js';
export { validateShapeRenderable, extractStencilRef } from './shape-validator.js';
import { validateXml } from './xml-validator.js';
import { fixXml } from './xml-fixer.js';
/**
 * Combined validation and fix pipeline.
 *
 * 1. Validate the XML
 * 2. If invalid, apply fixes
 * 3. Re-validate
 * 4. Return the final result
 */
export function validateAndFixXml(xml) {
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
//# sourceMappingURL=index.js.map