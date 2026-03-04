/**
 * Operations -- Applies edit operations to existing draw.io XML.
 *
 * Supports three operation types matching the reference implementation:
 * - update: Replace an mxCell by ID
 * - add: Append a new mxCell to root
 * - delete: Remove an mxCell by ID with cascade delete
 */
import type { DiagramOperation } from '../types/index.js';
interface ApplyResult {
    xml: string;
    applied: string[];
    errors: string[];
}
/**
 * Applies a list of diagram operations to the XML.
 *
 * Operations are applied in order. Each operation modifies the XML
 * in-place (by string replacement).
 *
 * @param xml - The current diagram XML (bare mxCells or wrapped)
 * @param operations - The operations to apply
 * @returns The modified XML with applied/error lists
 */
export declare function applyOperations(xml: string, operations: DiagramOperation[]): ApplyResult;
export {};
//# sourceMappingURL=operations.d.ts.map