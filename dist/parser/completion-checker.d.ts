/**
 * CompletionChecker -- Detects truncated XML output.
 *
 * AI models may truncate output mid-generation due to token limits.
 * This module detects incomplete XML and signals the need for continuation.
 */
export declare function isMxCellXmlComplete(xml: string): boolean;
/**
 * Extracts only complete mxCell elements from partial XML.
 * Useful for progressive rendering during streaming.
 *
 * @param partialXml - Potentially truncated XML
 * @returns XML containing only complete mxCell elements
 */
export declare function extractCompleteMxCells(partialXml: string): string;
//# sourceMappingURL=completion-checker.d.ts.map