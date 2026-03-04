/**
 * Operations -- Applies edit operations to existing draw.io XML.
 *
 * Supports three operation types matching the reference implementation:
 * - update: Replace an mxCell by ID
 * - add: Append a new mxCell to root
 * - delete: Remove an mxCell by ID with cascade delete
 */
/**
 * Builds a map of cell ID -> full mxCell XML string from the document.
 *
 * Uses a single regex with alternation to correctly handle both
 * self-closing (<mxCell .../>) and full (<mxCell ...>...</mxCell>) elements
 * without accidentally consuming adjacent cells.
 */
function buildCellIndex(xml) {
    const index = new Map();
    // Single pattern handles both self-closing and full elements
    const pattern = /<mxCell\b[^>]*?\sid="([^"]+)"[^>]*?(?:\/>|>[\s\S]*?<\/mxCell>)/g;
    let match;
    while ((match = pattern.exec(xml)) !== null) {
        if (!index.has(match[1])) {
            index.set(match[1], {
                fullMatch: match[0],
                startIndex: match.index,
                endIndex: match.index + match[0].length,
            });
        }
    }
    return index;
}
/**
 * Finds all cell IDs that have a given parent ID.
 */
function findChildren(xml, parentId) {
    const children = [];
    const pattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\sparent="([^"]+)"[^>]*/g;
    let match;
    while ((match = pattern.exec(xml)) !== null) {
        if (match[2] === parentId) {
            children.push(match[1]);
        }
    }
    return children;
}
/**
 * Finds all edge IDs that reference a given cell as source or target.
 */
function findReferencingEdges(xml, cellId) {
    const edgeIds = [];
    const pattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\sedge="1"[^>]*/g;
    let match;
    while ((match = pattern.exec(xml)) !== null) {
        const cellXml = match[0];
        const sourceMatch = cellXml.match(/\ssource="([^"]+)"/);
        const targetMatch = cellXml.match(/\starget="([^"]+)"/);
        if ((sourceMatch && sourceMatch[1] === cellId) ||
            (targetMatch && targetMatch[1] === cellId)) {
            edgeIds.push(match[1]);
        }
    }
    return edgeIds;
}
/**
 * Collects all IDs to delete for a cascade delete operation.
 * Includes the target cell, all its children (recursively), and all edges referencing any of them.
 */
function collectCascadeDeleteIds(xml, cellId) {
    const toDelete = new Set();
    const queue = [cellId];
    while (queue.length > 0) {
        const current = queue.pop();
        if (toDelete.has(current))
            continue;
        toDelete.add(current);
        // Find children
        const children = findChildren(xml, current);
        queue.push(...children);
        // Find referencing edges
        const edges = findReferencingEdges(xml, current);
        queue.push(...edges);
    }
    return toDelete;
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
export function applyOperations(xml, operations) {
    let current = xml;
    const applied = [];
    const errors = [];
    for (const op of operations) {
        const cellIndex = buildCellIndex(current);
        switch (op.operation) {
            case 'update': {
                if (!op.new_xml) {
                    errors.push(`Update operation for "${op.cell_id}" missing new_xml`);
                    break;
                }
                const existing = cellIndex.get(op.cell_id);
                if (!existing) {
                    errors.push(`Cell "${op.cell_id}" not found for update`);
                    break;
                }
                current = current.replace(existing.fullMatch, op.new_xml);
                applied.push(`Updated cell "${op.cell_id}"`);
                break;
            }
            case 'add': {
                if (!op.new_xml) {
                    errors.push(`Add operation for "${op.cell_id}" missing new_xml`);
                    break;
                }
                // Insert before the closing </root> tag, or append at end
                const rootCloseIndex = current.lastIndexOf('</root>');
                if (rootCloseIndex !== -1) {
                    current = current.slice(0, rootCloseIndex) + op.new_xml + '\n' + current.slice(rootCloseIndex);
                }
                else {
                    current = current + '\n' + op.new_xml;
                }
                applied.push(`Added cell "${op.cell_id}"`);
                break;
            }
            case 'delete': {
                const toDelete = collectCascadeDeleteIds(current, op.cell_id);
                if (toDelete.size === 0 || !cellIndex.has(op.cell_id)) {
                    errors.push(`Cell "${op.cell_id}" not found for delete`);
                    break;
                }
                // Rebuild cell index for deletion (order matters)
                const freshIndex = buildCellIndex(current);
                for (const id of toDelete) {
                    const cell = freshIndex.get(id);
                    if (cell) {
                        current = current.replace(cell.fullMatch, '');
                    }
                }
                // Clean up empty lines
                current = current.replace(/\n{3,}/g, '\n\n');
                applied.push(`Deleted cell "${op.cell_id}" (cascade: ${toDelete.size} elements)`);
                break;
            }
            default:
                errors.push(`Unknown operation: ${op.operation}`);
        }
    }
    return { xml: current.trim(), applied, errors };
}
//# sourceMappingURL=operations.js.map