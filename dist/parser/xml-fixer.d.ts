/**
 * XmlFixer -- Auto-correction pipeline for AI-generated draw.io XML.
 *
 * Applies fixes iteratively (up to MAX_ROUNDS) to repair common
 * AI generation errors. Derived from the reference implementation's
 * autoFixXml pipeline.
 */
import type { FixResult } from '../types/index.js';
/**
 * Applies the full fix pipeline to the XML string.
 * Runs iteratively up to MAX_ROUNDS until no more fixes are applied.
 *
 * @param xml - The XML string to fix
 * @returns FixResult with the corrected XML, list of fixes applied, and remaining errors
 */
export declare function fixXml(xml: string): FixResult;
//# sourceMappingURL=xml-fixer.d.ts.map