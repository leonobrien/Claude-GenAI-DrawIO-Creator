/**
 * XmlWrapper — Wraps bare <mxCell> elements in the full draw.io XML structure.
 *
 * The draw.io format requires:
 *   <mxfile>
 *     <diagram name="Page-1" id="page-1">
 *       <mxGraphModel>
 *         <root>
 *           <mxCell id="0"/>
 *           <mxCell id="1" parent="0"/>
 *           <!-- AI-generated cells -->
 *         </root>
 *       </mxGraphModel>
 *     </diagram>
 *   </mxfile>
 *
 * Cells id="0" and id="1" are mandatory root cells that must always be present.
 */
/**
 * Wraps bare <mxCell> elements in the full draw.io XML structure.
 *
 * @param bareCells - Raw <mxCell> elements without wrapper tags
 * @param pageName - Name for the diagram page (default: "Page-1")
 * @returns Complete draw.io XML string
 */
export declare function wrapWithMxFile(bareCells: string, pageName?: string): string;
/**
 * Extracts the bare <mxCell> content from a complete draw.io XML string,
 * excluding the root cells (id="0" and id="1").
 */
export declare function unwrapMxFile(fullXml: string): string;
//# sourceMappingURL=xml-wrapper.d.ts.map