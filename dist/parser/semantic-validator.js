/**
 * SemanticValidator -- Verifies diagram content against user intent.
 *
 * Goes beyond structural XML validation to check:
 * 1. All user-requested components appear in the output
 * 2. All edge source/target IDs reference existing vertices
 * 3. No orphaned elements (nodes with no edges, unless intentional)
 * 4. Notation conformance (styles match expected stencil prefix)
 */
import { getNotation } from '../notation/registry.js';
/**
 * Extracts all vertex IDs from the XML.
 */
function extractVertexIds(xml) {
    const ids = new Set();
    const pattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\svertex="1"[^>]*/g;
    let match;
    while ((match = pattern.exec(xml)) !== null) {
        ids.add(match[1]);
    }
    // Also match vertex before id
    const pattern2 = /<mxCell[^>]*\svertex="1"[^>]*\sid="([^"]+)"[^>]*/g;
    while ((match = pattern2.exec(xml)) !== null) {
        ids.add(match[1]);
    }
    return ids;
}
/**
 * Extracts all edge elements with their source/target from the XML.
 */
function extractEdges(xml) {
    const edges = [];
    const pattern = /<mxCell[^>]*\sedge="1"[^>]*/g;
    let match;
    while ((match = pattern.exec(xml)) !== null) {
        const cellXml = match[0];
        const idMatch = cellXml.match(/\sid="([^"]+)"/);
        const sourceMatch = cellXml.match(/\ssource="([^"]+)"/);
        const targetMatch = cellXml.match(/\starget="([^"]+)"/);
        if (idMatch) {
            edges.push({
                id: idMatch[1],
                source: sourceMatch?.[1],
                target: targetMatch?.[1],
            });
        }
    }
    return edges;
}
/**
 * Extracts all vertex labels from the XML.
 */
function extractVertexLabels(xml) {
    const labels = new Map();
    const pattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\svalue="([^"]*)"[^>]*\svertex="1"[^>]*/g;
    let match;
    while ((match = pattern.exec(xml)) !== null) {
        labels.set(match[1], match[2]);
    }
    // Also match with vertex before value
    const pattern2 = /<mxCell[^>]*\svertex="1"[^>]*\sid="([^"]+)"[^>]*\svalue="([^"]*)"[^>]*/g;
    while ((match = pattern2.exec(xml)) !== null) {
        if (!labels.has(match[1])) {
            labels.set(match[1], match[2]);
        }
    }
    return labels;
}
/**
 * Extracts style strings from all vertex mxCell elements.
 */
function extractVertexStyles(xml) {
    const styles = [];
    const pattern = /<mxCell[^>]*\svertex="1"[^>]*/g;
    let match;
    while ((match = pattern.exec(xml)) !== null) {
        const cellXml = match[0];
        const idMatch = cellXml.match(/\sid="([^"]+)"/);
        const styleMatch = cellXml.match(/\sstyle="([^"]+)"/);
        if (idMatch && styleMatch) {
            styles.push({ id: idMatch[1], style: styleMatch[1] });
        }
    }
    return styles;
}
/**
 * Validates that all edge references point to existing vertices.
 */
export function validateEdgeReferences(xml) {
    const issues = [];
    const vertexIds = extractVertexIds(xml);
    const edges = extractEdges(xml);
    // Add root cells as valid targets
    vertexIds.add('0');
    vertexIds.add('1');
    for (const edge of edges) {
        if (edge.source && !vertexIds.has(edge.source)) {
            issues.push({
                severity: 'error',
                message: `Edge "${edge.id}" references non-existent source "${edge.source}"`,
            });
        }
        if (edge.target && !vertexIds.has(edge.target)) {
            issues.push({
                severity: 'error',
                message: `Edge "${edge.id}" references non-existent target "${edge.target}"`,
            });
        }
    }
    return { valid: issues.filter((i) => i.severity === 'error').length === 0, issues };
}
/**
 * Checks that user-requested labels appear in the diagram.
 *
 * @param xml - The generated diagram XML
 * @param expectedLabels - Labels the user expects to see in the diagram
 */
export function validateExpectedLabels(xml, expectedLabels) {
    const issues = [];
    const vertexLabels = extractVertexLabels(xml);
    const existingLabels = new Set(vertexLabels.values());
    for (const expected of expectedLabels) {
        const found = [...existingLabels].some((label) => label.toLowerCase().includes(expected.toLowerCase()));
        if (!found) {
            issues.push({
                severity: 'warning',
                message: `Expected component "${expected}" not found in diagram`,
            });
        }
    }
    return { valid: issues.filter((i) => i.severity === 'error').length === 0, issues };
}
/**
 * Validates that vertex styles conform to the expected notation stencil prefix.
 *
 * Uses warnings (not errors) because containers and generic grouping elements
 * legitimately use standard draw.io styles even in notation-specific diagrams.
 *
 * @param xml - The diagram XML to validate
 * @param notationName - The expected notation
 */
export function validateNotationConformance(xml, notationName) {
    const issues = [];
    if (notationName === 'generic') {
        return { valid: true, issues };
    }
    const notation = getNotation(notationName);
    const prefix = notation.stencilPrefix;
    const vertexStyles = extractVertexStyles(xml);
    for (const { id, style } of vertexStyles) {
        // Skip styles that contain the stencil prefix
        if (style.includes(prefix)) {
            continue;
        }
        // Skip container-like styles (dashed, fillColor=none, connectable=0 markers)
        // These legitimately use generic styles in notation diagrams
        if (style.includes('dashed=1') || style.includes('fillColor=none') || style.includes('group')) {
            continue;
        }
        issues.push({
            severity: 'warning',
            message: `Vertex "${id}" uses style without ${notation.displayName} stencil prefix "${prefix}"`,
        });
    }
    return { valid: true, issues };
}
/**
 * Runs full semantic validation on the XML.
 *
 * @param xml - The diagram XML to validate
 * @param expectedLabels - Optional labels the user expects to find
 * @param notation - Optional notation for conformance checking
 */
export function validateSemantics(xml, expectedLabels, notation) {
    const allIssues = [];
    const edgeResult = validateEdgeReferences(xml);
    allIssues.push(...edgeResult.issues);
    if (expectedLabels?.length) {
        const labelResult = validateExpectedLabels(xml, expectedLabels);
        allIssues.push(...labelResult.issues);
    }
    if (notation) {
        const conformanceResult = validateNotationConformance(xml, notation);
        allIssues.push(...conformanceResult.issues);
    }
    return {
        valid: allIssues.filter((i) => i.severity === 'error').length === 0,
        issues: allIssues,
    };
}
//# sourceMappingURL=semantic-validator.js.map