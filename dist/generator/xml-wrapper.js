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
const DEFAULT_OPTIONS = {
    dx: 1364,
    dy: 796,
    grid: true,
    gridSize: 10,
    guides: true,
    tooltips: true,
    connect: true,
    arrows: true,
    fold: true,
    page: true,
    pageScale: 1,
    pageWidth: 1169,
    pageHeight: 827,
    math: false,
    shadow: false,
};
function buildMxGraphModelTag(options) {
    const o = { ...DEFAULT_OPTIONS, ...options };
    return [
        '<mxGraphModel',
        ` dx="${o.dx}"`,
        ` dy="${o.dy}"`,
        ` grid="${o.grid ? 1 : 0}"`,
        ` gridSize="${o.gridSize}"`,
        ` guides="${o.guides ? 1 : 0}"`,
        ` tooltips="${o.tooltips ? 1 : 0}"`,
        ` connect="${o.connect ? 1 : 0}"`,
        ` arrows="${o.arrows ? 1 : 0}"`,
        ` fold="${o.fold ? 1 : 0}"`,
        ` page="${o.page ? 1 : 0}"`,
        ` pageScale="${o.pageScale}"`,
        ` pageWidth="${o.pageWidth}"`,
        ` pageHeight="${o.pageHeight}"`,
        ` math="${o.math ? 1 : 0}"`,
        ` shadow="${o.shadow ? 1 : 0}"`,
        '>',
    ].join('');
}
const ROOT_CELLS = '<mxCell id="0"/><mxCell id="1" parent="0"/>';
/**
 * Strips any wrapper tags that the AI may have erroneously included.
 * Returns only the bare <mxCell> content.
 */
function stripWrapperTags(xml) {
    let content = xml.trim();
    // Remove <mxfile> wrapper
    content = content.replace(/<\/?mxfile[^>]*>/gi, '');
    // Remove <diagram> wrapper
    content = content.replace(/<\/?diagram[^>]*>/gi, '');
    // Remove <mxGraphModel> wrapper
    content = content.replace(/<\/?mxGraphModel[^>]*>/gi, '');
    // Remove <root> wrapper
    content = content.replace(/<\/?root>/gi, '');
    return content.trim();
}
/**
 * Removes duplicate root cells (id="0" and id="1") if the AI included them.
 */
function removeDuplicateRootCells(xml) {
    return xml
        .replace(/<mxCell\s+id="0"\s*\/>/g, '')
        .replace(/<mxCell\s+id="1"\s+parent="0"\s*\/>/g, '')
        .trim();
}
/**
 * Wraps bare <mxCell> elements in the full draw.io XML structure.
 *
 * @param bareCells - Raw <mxCell> elements without wrapper tags
 * @param pageName - Name for the diagram page (default: "Page-1")
 * @param graphModelOptions - Optional mxGraphModel attributes (grid, page size, etc.)
 * @returns Complete draw.io XML string
 */
export function wrapWithMxFile(bareCells, pageName = 'Page-1', graphModelOptions) {
    let content = stripWrapperTags(bareCells);
    content = removeDuplicateRootCells(content);
    return [
        '<mxfile>',
        `<diagram name="${pageName}" id="page-1">`,
        buildMxGraphModelTag(graphModelOptions),
        '<root>',
        ROOT_CELLS,
        content,
        '</root>',
        '</mxGraphModel>',
        '</diagram>',
        '</mxfile>',
    ].join('');
}
/**
 * Extracts the bare <mxCell> content from a complete draw.io XML string,
 * excluding the root cells (id="0" and id="1").
 */
export function unwrapMxFile(fullXml) {
    let content = stripWrapperTags(fullXml);
    content = removeDuplicateRootCells(content);
    return content;
}
//# sourceMappingURL=xml-wrapper.js.map