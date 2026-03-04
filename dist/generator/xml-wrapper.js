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
 * @returns Complete draw.io XML string
 */
export function wrapWithMxFile(bareCells, pageName = 'Page-1') {
    let content = stripWrapperTags(bareCells);
    content = removeDuplicateRootCells(content);
    return [
        '<mxfile>',
        `<diagram name="${pageName}" id="page-1">`,
        '<mxGraphModel>',
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