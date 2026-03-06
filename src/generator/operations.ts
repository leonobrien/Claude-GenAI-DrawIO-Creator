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
 * Builds a map of cell ID -> full mxCell XML string from the document.
 *
 * Uses a single regex with alternation to correctly handle both
 * self-closing (<mxCell .../>) and full (<mxCell ...>...</mxCell>) elements
 * without accidentally consuming adjacent cells.
 */
function buildCellIndex(xml: string): Map<string, { fullMatch: string; startIndex: number; endIndex: number }> {
  const index = new Map<string, { fullMatch: string; startIndex: number; endIndex: number }>();

  // Single pattern handles both self-closing and full elements
  const pattern = /<mxCell\b[^>]*?\sid="([^"]+)"[^>]*?(?:\/>|>[\s\S]*?<\/mxCell>)/g;
  let match: RegExpExecArray | null;
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
function findChildren(xml: string, parentId: string): string[] {
  const children: string[] = [];
  const pattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\sparent="([^"]+)"[^>]*/g;

  let match: RegExpExecArray | null;
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
function findReferencingEdges(xml: string, cellId: string): string[] {
  const edgeIds: string[] = [];
  const pattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\sedge="1"[^>]*/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    const cellXml = match[0];
    const sourceMatch = cellXml.match(/\ssource="([^"]+)"/);
    const targetMatch = cellXml.match(/\starget="([^"]+)"/);

    if (
      (sourceMatch && sourceMatch[1] === cellId) ||
      (targetMatch && targetMatch[1] === cellId)
    ) {
      edgeIds.push(match[1]);
    }
  }

  return edgeIds;
}

/**
 * Collects all IDs to delete for a cascade delete operation.
 * Includes the target cell, all its children (recursively), and all edges referencing any of them.
 */
function collectCascadeDeleteIds(xml: string, cellId: string): Set<string> {
  const toDelete = new Set<string>();
  const queue = [cellId];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) break;
    if (toDelete.has(current)) continue;
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

function applyUpdate(
  current: string,
  op: DiagramOperation,
  cellIndex: Map<string, { fullMatch: string; startIndex: number; endIndex: number }>,
): { xml: string; message?: string; error?: string } {
  if (!op.new_xml) {
    return { xml: current, error: `Update operation for "${op.cell_id}" missing new_xml` };
  }
  const existing = cellIndex.get(op.cell_id);
  if (!existing) {
    return { xml: current, error: `Cell "${op.cell_id}" not found for update` };
  }
  return { xml: current.replace(existing.fullMatch, op.new_xml), message: `Updated cell "${op.cell_id}"` };
}

function applyAdd(
  current: string,
  op: DiagramOperation,
): { xml: string; message?: string; error?: string } {
  if (!op.new_xml) {
    return { xml: current, error: `Add operation for "${op.cell_id}" missing new_xml` };
  }
  const rootCloseIndex = current.lastIndexOf('</root>');
  const xml = rootCloseIndex !== -1
    ? current.slice(0, rootCloseIndex) + op.new_xml + '\n' + current.slice(rootCloseIndex)
    : current + '\n' + op.new_xml;
  return { xml, message: `Added cell "${op.cell_id}"` };
}

function applyDelete(
  current: string,
  op: DiagramOperation,
  cellIndex: Map<string, { fullMatch: string; startIndex: number; endIndex: number }>,
): { xml: string; message?: string; error?: string } {
  const toDelete = collectCascadeDeleteIds(current, op.cell_id);
  if (toDelete.size === 0 || !cellIndex.has(op.cell_id)) {
    return { xml: current, error: `Cell "${op.cell_id}" not found for delete` };
  }

  let xml = current;
  const freshIndex = buildCellIndex(xml);
  for (const id of toDelete) {
    const cell = freshIndex.get(id);
    if (cell) {
      xml = xml.replace(cell.fullMatch, '');
    }
  }

  xml = xml.replace(/\n{3,}/g, '\n\n');
  return { xml, message: `Deleted cell "${op.cell_id}" (cascade: ${toDelete.size} elements)` };
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
export function applyOperations(xml: string, operations: DiagramOperation[]): ApplyResult {
  let current = xml;
  const applied: string[] = [];
  const errors: string[] = [];

  for (const op of operations) {
    const cellIndex = buildCellIndex(current);
    let result: { xml: string; message?: string; error?: string };

    switch (op.operation) {
      case 'update':
        result = applyUpdate(current, op, cellIndex);
        break;
      case 'add':
        result = applyAdd(current, op);
        break;
      case 'delete':
        result = applyDelete(current, op, cellIndex);
        break;
      default:
        result = { xml: current, error: `Unknown operation: ${(op as DiagramOperation).operation}` };
    }

    current = result.xml;
    if (result.message) applied.push(result.message);
    if (result.error) errors.push(result.error);
  }

  return { xml: current.trim(), applied, errors };
}
