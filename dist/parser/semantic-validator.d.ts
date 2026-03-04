/**
 * SemanticValidator -- Verifies diagram content against user intent.
 *
 * Goes beyond structural XML validation to check:
 * 1. All user-requested components appear in the output
 * 2. All edge source/target IDs reference existing vertices
 * 3. No orphaned elements (nodes with no edges, unless intentional)
 * 4. Notation conformance (styles match expected stencil prefix)
 */
import type { NotationName } from '../types/index.js';
interface SemanticIssue {
    severity: 'error' | 'warning';
    message: string;
}
export interface SemanticValidationResult {
    valid: boolean;
    issues: SemanticIssue[];
}
/**
 * Validates that all edge references point to existing vertices.
 */
export declare function validateEdgeReferences(xml: string): SemanticValidationResult;
/**
 * Checks that user-requested labels appear in the diagram.
 *
 * @param xml - The generated diagram XML
 * @param expectedLabels - Labels the user expects to see in the diagram
 */
export declare function validateExpectedLabels(xml: string, expectedLabels: string[]): SemanticValidationResult;
/**
 * Validates that vertex styles conform to the expected notation stencil prefix.
 *
 * Uses warnings (not errors) because containers and generic grouping elements
 * legitimately use standard draw.io styles even in notation-specific diagrams.
 *
 * @param xml - The diagram XML to validate
 * @param notationName - The expected notation
 */
export declare function validateNotationConformance(xml: string, notationName: NotationName): SemanticValidationResult;
/**
 * Runs full semantic validation on the XML.
 *
 * @param xml - The diagram XML to validate
 * @param expectedLabels - Optional labels the user expects to find
 * @param notation - Optional notation for conformance checking
 */
export declare function validateSemantics(xml: string, expectedLabels?: string[], notation?: NotationName): SemanticValidationResult;
export {};
//# sourceMappingURL=semantic-validator.d.ts.map