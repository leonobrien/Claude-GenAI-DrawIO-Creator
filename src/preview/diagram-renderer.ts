/**
 * DiagramRenderer — Renders a DiagramModel as terminal-friendly text.
 *
 * Scales diagram coordinates to terminal dimensions, draws containers,
 * edges, and nodes onto a CharGrid using Unicode box-drawing characters.
 */

import { CharGrid, ARROW } from './char-grid.js';
import type { BoxStyle } from './char-grid.js';
import type { DiagramModel, DiagramNode, DiagramEdge, DiagramContainer } from '../types/index.js';

export interface PreviewOptions {
  /** Terminal width in columns. Default: 100. */
  width?: number;
  /** Terminal height in rows. Default: 35. */
  height?: number;
  /** Show edge labels. Default: true. */
  showEdgeLabels?: boolean;
  /** Box style for nodes. Default: 'rounded'. */
  boxStyle?: BoxStyle;
}

interface ScaledRect {
  row: number;
  col: number;
  width: number;
  height: number;
}

/**
 * Renders a DiagramModel as a Unicode text preview.
 *
 * @param model - The diagram model to render
 * @param options - Rendering options (terminal size, styles)
 * @returns Multi-line string suitable for terminal display
 */
export function renderPreview(model: DiagramModel, options?: PreviewOptions): string {
  const opts = {
    width: options?.width ?? 100,
    height: options?.height ?? 35,
    showEdgeLabels: options?.showEdgeLabels ?? true,
    boxStyle: (options?.boxStyle ?? 'rounded') as BoxStyle,
  };

  const grid = new CharGrid(opts.height, opts.width);

  // Calculate canvas bounds from all elements
  const bounds = calculateBounds(model);
  const scaleX = (opts.width - 2) / Math.max(bounds.maxX - bounds.minX, 1);
  const scaleY = (opts.height - 2) / Math.max(bounds.maxY - bounds.minY, 1);
  const offsetX = bounds.minX;
  const offsetY = bounds.minY;

  function scaleRect(x: number, y: number, w: number, h: number): ScaledRect {
    return {
      col: Math.round((x - offsetX) * scaleX) + 1,
      row: Math.round((y - offsetY) * scaleY) + 1,
      width: Math.max(Math.round(w * scaleX), 3),
      height: Math.max(Math.round(h * scaleY), 3),
    };
  }

  // Resolve absolute position for nodes that have a parent container
  function resolveAbsolute(node: { x: number; y: number; parent?: string }, containers: DiagramContainer[]): { x: number; y: number } {
    if (!node.parent) return { x: node.x, y: node.y };
    const parent = containers.find(c => c.id === node.parent);
    if (!parent) return { x: node.x, y: node.y };
    return { x: parent.x + node.x, y: parent.y + node.y };
  }

  // Build a map of element centres for edge routing (pre-compute all positions)
  const centreMap = new Map<string, { row: number; col: number }>();
  const containerRects = new Map<string, ScaledRect>();
  const nodeRects = new Map<string, ScaledRect>();

  for (const container of model.containers) {
    const abs = resolveAbsolute(container, model.containers);
    const rect = scaleRect(abs.x, abs.y, container.width, container.height);
    containerRects.set(container.id, rect);
    centreMap.set(container.id, {
      row: rect.row + Math.round(rect.height / 2),
      col: rect.col + Math.round(rect.width / 2),
    });
  }

  for (const node of model.nodes) {
    const abs = resolveAbsolute(node, model.containers);
    const rect = scaleRect(abs.x, abs.y, node.width, node.height);
    nodeRects.set(node.id, rect);
    centreMap.set(node.id, {
      row: rect.row + Math.round(rect.height / 2),
      col: rect.col + Math.round(rect.width / 2),
    });
  }

  // 1. Draw containers (back layer — double-line boxes)
  for (const container of model.containers) {
    const rect = containerRects.get(container.id)!;
    grid.drawBox(rect.row, rect.col, rect.width, rect.height, 'double');

    if (container.label) {
      const maxLabelWidth = rect.width - 4;
      if (maxLabelWidth > 0) {
        grid.writeText(rect.row, rect.col + 2, container.label, maxLabelWidth);
      }
    }
  }

  // 2. Draw nodes (before edges so arrowheads overwrite box borders)
  for (const node of model.nodes) {
    const rect = nodeRects.get(node.id)!;
    grid.drawBox(rect.row, rect.col, rect.width, rect.height, opts.boxStyle);

    if (node.label) {
      const maxLabelWidth = rect.width - 2;
      if (maxLabelWidth > 0) {
        const label = node.label.replace(/\n/g, ' ').trim();
        const labelRow = rect.row + Math.round(rect.height / 2);
        const labelCol = rect.col + 1 + Math.max(0, Math.round((maxLabelWidth - label.length) / 2));
        grid.writeText(labelRow, labelCol, label, maxLabelWidth);
      }
    }
  }

  // 3. Draw edges (after nodes so arrowheads overwrite box borders)
  const allRects = new Map([...containerRects, ...nodeRects]);
  for (const edge of model.edges) {
    drawEdge(grid, edge, model, centreMap, allRects, opts);
  }

  // 4. Add title if present
  if (model.metadata.title) {
    const title = model.metadata.title;
    const titleCol = Math.max(0, Math.round((opts.width - title.length) / 2));
    grid.writeText(0, titleCol, title, opts.width);
  }

  return grid.toString();
}

/**
 * Draws a Manhattan-routed edge between source and target nodes.
 * Places arrowheads at the target box boundary, not the centre.
 */
function drawEdge(
  grid: CharGrid,
  edge: DiagramEdge,
  _model: DiagramModel,
  centreMap: Map<string, { row: number; col: number }>,
  rectMap: Map<string, ScaledRect>,
  opts: { showEdgeLabels: boolean },
): void {
  const src = centreMap.get(edge.source);
  const tgt = centreMap.get(edge.target);
  if (!src || !tgt) return;

  const tgtRect = rectMap.get(edge.target);

  const dr = tgt.row - src.row;
  const dc = tgt.col - src.col;

  // Determine arrow direction and target edge point
  let arrowRow = tgt.row;
  let arrowCol = tgt.col;
  let arrowChar: string;

  if (Math.abs(dc) >= Math.abs(dr)) {
    // Predominantly horizontal
    arrowChar = dc > 0 ? ARROW.right : ARROW.left;
    if (tgtRect) {
      arrowCol = dc > 0 ? tgtRect.col - 1 : tgtRect.col + tgtRect.width;
    }
  } else {
    // Predominantly vertical
    arrowChar = dr > 0 ? ARROW.down : ARROW.up;
    if (tgtRect) {
      arrowRow = dr > 0 ? tgtRect.row - 1 : tgtRect.row + tgtRect.height;
    }
  }

  // Manhattan routing: horizontal then vertical
  const midCol = src.col + Math.round(dc / 2);
  const endRow = (Math.abs(dc) >= Math.abs(dr)) ? src.row : arrowRow;

  if (Math.abs(dc) > 1) {
    // Horizontal segment from source
    const startC = Math.min(src.col, midCol);
    const endC = Math.max(src.col, midCol);
    for (let c = startC; c <= endC; c++) {
      if (grid.getChar(src.row, c) === ' ') {
        grid.setChar(src.row, c, '─');
      }
    }
  }

  if (Math.abs(dr) > 0) {
    // Vertical segment
    const startR = Math.min(src.row, endRow);
    const endR = Math.max(src.row, endRow);
    for (let r = startR; r <= endR; r++) {
      if (grid.getChar(r, midCol) === ' ') {
        grid.setChar(r, midCol, '│');
      }
    }
  }

  if (Math.abs(dc) > 1 && midCol !== arrowCol) {
    // Horizontal segment to target
    const startC = Math.min(midCol, arrowCol);
    const endC = Math.max(midCol, arrowCol);
    for (let c = startC; c <= endC; c++) {
      if (grid.getChar(endRow, c) === ' ') {
        grid.setChar(endRow, c, '─');
      }
    }
  }

  // Arrowhead at target boundary (always overwrite)
  grid.setChar(arrowRow, arrowCol, arrowChar);

  // Edge label at midpoint
  if (opts.showEdgeLabels && edge.label) {
    const labelRow = Math.round((src.row + arrowRow) / 2);
    const labelCol = Math.round((src.col + arrowCol) / 2) + 1;
    grid.writeText(labelRow, labelCol, edge.label, 15);
  }
}

/**
 * Calculates the bounding box of all elements in the model.
 */
function calculateBounds(model: DiagramModel): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function expandAbs(x: number, y: number, w: number, h: number, parentId?: string): void {
    let absX = x, absY = y;
    if (parentId) {
      const parent = model.containers.find(c => c.id === parentId);
      if (parent) { absX += parent.x; absY += parent.y; }
    }
    minX = Math.min(minX, absX);
    minY = Math.min(minY, absY);
    maxX = Math.max(maxX, absX + w);
    maxY = Math.max(maxY, absY + h);
  }

  for (const c of model.containers) expandAbs(c.x, c.y, c.width, c.height, c.parent);
  for (const n of model.nodes) expandAbs(n.x, n.y, n.width, n.height, n.parent);

  // Fallback if no elements
  if (minX === Infinity) { minX = 0; minY = 0; maxX = 800; maxY = 600; }

  return { minX, minY, maxX, maxY };
}
