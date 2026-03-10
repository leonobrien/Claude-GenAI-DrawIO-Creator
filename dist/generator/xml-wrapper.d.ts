/**
 * XmlWrapper — Wraps bare <mxCell> elements in the full draw.io XML structure.
 *
 * The draw.io format requires:
 *   <mxfile>
 *     <diagram name="Page-1" id="page-1">
 *       <mxGraphModel dx="..." dy="..." grid="1" ...>
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
 * The mxGraphModel element carries standard attributes for grid, page size,
 * and editor behaviour that improve compatibility with draw.io desktop/web.
 */
/** Default mxGraphModel attributes matching draw.io's standard output. */
export interface MxGraphModelOptions {
    /** Horizontal canvas offset. Default 1364. */
    dx?: number;
    /** Vertical canvas offset. Default 796. */
    dy?: number;
    /** Show grid. Default true. */
    grid?: boolean;
    /** Grid spacing in pixels. Default 10. */
    gridSize?: number;
    /** Show alignment guides. Default true. */
    guides?: boolean;
    /** Show tooltips. Default true. */
    tooltips?: boolean;
    /** Enable connector mode. Default true. */
    connect?: boolean;
    /** Show arrows. Default true. */
    arrows?: boolean;
    /** Enable folding (collapse containers). Default true. */
    fold?: boolean;
    /** Enable page view. Default true. */
    page?: boolean;
    /** Page scale factor. Default 1. */
    pageScale?: number;
    /** Page width in pixels. Default 1169 (A4 landscape). */
    pageWidth?: number;
    /** Page height in pixels. Default 827 (A4 landscape). */
    pageHeight?: number;
    /** Enable LaTeX math rendering. Default false. */
    math?: boolean;
    /** Enable drop shadows. Default false. */
    shadow?: boolean;
}
/**
 * Wraps bare <mxCell> elements in the full draw.io XML structure.
 *
 * @param bareCells - Raw <mxCell> elements without wrapper tags
 * @param pageName - Name for the diagram page (default: "Page-1")
 * @param graphModelOptions - Optional mxGraphModel attributes (grid, page size, etc.)
 * @returns Complete draw.io XML string
 */
export declare function wrapWithMxFile(bareCells: string, pageName?: string, graphModelOptions?: MxGraphModelOptions): string;
/**
 * Extracts the bare <mxCell> content from a complete draw.io XML string,
 * excluding the root cells (id="0" and id="1").
 */
export declare function unwrapMxFile(fullXml: string): string;
//# sourceMappingURL=xml-wrapper.d.ts.map