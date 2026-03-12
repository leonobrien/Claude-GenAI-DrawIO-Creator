/**
 * DiagramRenderer — Renders a DiagramModel as terminal-friendly text.
 *
 * Scales diagram coordinates to terminal dimensions, draws containers,
 * edges, and nodes onto a CharGrid using Unicode box-drawing characters.
 */

import { CharGrid, ARROW } from './char-grid.js';
import type { BoxStyle } from './char-grid.js';
import type { DiagramModel, DiagramEdge, DiagramContainer } from '../types/index.js';

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

interface ResolvedOpts {
  width: number;
  height: number;
  showEdgeLabels: boolean;
  boxStyle: BoxStyle;
}

interface EdgeEndpoint {
  row: number;
  col: number;
}

/**
 * Renders a DiagramModel as a Unicode text preview.
 *
 * @param model - The diagram model to render
 * @param options - Rendering options (terminal size, styles)
 * @returns Multi-line string suitable for terminal display
 */
export function renderPreview(model: DiagramModel, options?: PreviewOptions): string {
  const opts = resolveOptions(options);
  const grid = new CharGrid(opts.height, opts.width);

  const bounds = calculateBounds(model);
  const scaleX = (opts.width - 2) / Math.max(bounds.maxX - bounds.minX, 1);
  const scaleY = (opts.height - 2) / Math.max(bounds.maxY - bounds.minY, 1);

  const scale = (x: number, y: number, w: number, h: number): ScaledRect => ({
    col: Math.round((x - bounds.minX) * scaleX) + 1,
    row: Math.round((y - bounds.minY) * scaleY) + 1,
    width: Math.max(Math.round(w * scaleX), 3),
    height: Math.max(Math.round(h * scaleY), 3),
  });

  // Pre-compute scaled rects and centre positions
  const centreMap = new Map<string, EdgeEndpoint>();
  const containerRects = new Map<string, ScaledRect>();
  const nodeRects = new Map<string, ScaledRect>();

  for (const container of model.containers) {
    const abs = resolveAbsolute(container, model.containers);
    const rect = scale(abs.x, abs.y, container.width, container.height);
    containerRects.set(container.id, rect);
    centreMap.set(container.id, centreOf(rect));
  }

  for (const node of model.nodes) {
    const abs = resolveAbsolute(node, model.containers);
    const rect = scale(abs.x, abs.y, node.width, node.height);
    nodeRects.set(node.id, rect);
    centreMap.set(node.id, centreOf(rect));
  }

  drawContainers(grid, model.containers, containerRects);
  drawNodes(grid, model.nodes, nodeRects, opts.boxStyle);

  const allRects = new Map([...containerRects, ...nodeRects]);
  for (const edge of model.edges) {
    drawEdge(grid, edge, centreMap, allRects, opts.showEdgeLabels);
  }

  if (model.metadata.title) {
    const title = model.metadata.title;
    const titleCol = Math.max(0, Math.round((opts.width - title.length) / 2));
    grid.writeText(0, titleCol, title, opts.width);
  }

  return grid.toString();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolveOptions(options?: PreviewOptions): ResolvedOpts {
  return {
    width: options?.width ?? 100,
    height: options?.height ?? 35,
    showEdgeLabels: options?.showEdgeLabels ?? true,
    boxStyle: (options?.boxStyle ?? 'rounded') as BoxStyle,
  };
}

function centreOf(rect: ScaledRect): EdgeEndpoint {
  return {
    row: rect.row + Math.round(rect.height / 2),
    col: rect.col + Math.round(rect.width / 2),
  };
}

function resolveAbsolute(
  node: { x: number; y: number; parent?: string },
  containers: DiagramContainer[],
): { x: number; y: number } {
  if (!node.parent) return { x: node.x, y: node.y };
  const parent = containers.find(c => c.id === node.parent);
  if (!parent) return { x: node.x, y: node.y };
  return { x: parent.x + node.x, y: parent.y + node.y };
}

function drawContainers(
  grid: CharGrid,
  containers: DiagramContainer[],
  rects: Map<string, ScaledRect>,
): void {
  for (const container of containers) {
    const rect = rects.get(container.id);
    if (!rect) continue;
    grid.drawBox(rect.row, rect.col, rect.width, rect.height, 'double');
    if (container.label) {
      const maxLabelWidth = rect.width - 4;
      if (maxLabelWidth > 0) {
        grid.writeText(rect.row, rect.col + 2, container.label, maxLabelWidth);
      }
    }
  }
}

function drawNodes(
  grid: CharGrid,
  nodes: Array<{ id: string; label: string; x: number; y: number; width: number; height: number; style: string; parent?: string }>,
  rects: Map<string, ScaledRect>,
  boxStyle: BoxStyle,
): void {
  for (const node of nodes) {
    const rect = rects.get(node.id);
    if (!rect) continue;
    grid.drawBox(rect.row, rect.col, rect.width, rect.height, boxStyle);
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
}

/**
 * Resolves arrow direction and target-boundary point for an edge.
 */
function resolveArrow(
  src: EdgeEndpoint,
  tgt: EdgeEndpoint,
  tgtRect: ScaledRect | undefined,
): { row: number; col: number; char: string } {
  const dr = tgt.row - src.row;
  const dc = tgt.col - src.col;

  let arrowRow = tgt.row;
  let arrowCol = tgt.col;
  let arrowChar: string;

  if (Math.abs(dc) >= Math.abs(dr)) {
    arrowChar = dc > 0 ? ARROW.right : ARROW.left;
    if (tgtRect) {
      arrowCol = dc > 0 ? tgtRect.col - 1 : tgtRect.col + tgtRect.width;
    }
  } else {
    arrowChar = dr > 0 ? ARROW.down : ARROW.up;
    if (tgtRect) {
      arrowRow = dr > 0 ? tgtRect.row - 1 : tgtRect.row + tgtRect.height;
    }
  }

  return { row: arrowRow, col: arrowCol, char: arrowChar };
}

/**
 * Draws Manhattan-routed line segments (horizontal-vertical-horizontal)
 * between source centre and arrow endpoint.
 */
function drawManhattanRoute(
  grid: CharGrid,
  src: EdgeEndpoint,
  arrow: { row: number; col: number },
): void {
  const dr = arrow.row - src.row;
  const dc = arrow.col - src.col;
  const midCol = src.col + Math.round(dc / 2);
  const endRow = (Math.abs(dc) >= Math.abs(dr)) ? src.row : arrow.row;

  if (Math.abs(dc) > 1) {
    drawHSegment(grid, src.row, src.col, midCol);
  }

  if (Math.abs(dr) > 0) {
    drawVSegment(grid, midCol, src.row, endRow);
  }

  if (Math.abs(dc) > 1 && midCol !== arrow.col) {
    drawHSegment(grid, endRow, midCol, arrow.col);
  }
}

function drawHSegment(grid: CharGrid, row: number, fromCol: number, toCol: number): void {
  const startC = Math.min(fromCol, toCol);
  const endC = Math.max(fromCol, toCol);
  for (let c = startC; c <= endC; c++) {
    if (grid.getChar(row, c) === ' ') {
      grid.setChar(row, c, '─');
    }
  }
}

function drawVSegment(grid: CharGrid, col: number, fromRow: number, toRow: number): void {
  const startR = Math.min(fromRow, toRow);
  const endR = Math.max(fromRow, toRow);
  for (let r = startR; r <= endR; r++) {
    if (grid.getChar(r, col) === ' ') {
      grid.setChar(r, col, '│');
    }
  }
}

/**
 * Draws a Manhattan-routed edge between source and target nodes.
 */
function drawEdge( // eslint-disable-line max-params
  grid: CharGrid,
  edge: DiagramEdge,
  centreMap: Map<string, EdgeEndpoint>,
  rectMap: Map<string, ScaledRect>,
  showLabels: boolean,
): void {
  const src = centreMap.get(edge.source);
  const tgt = centreMap.get(edge.target);
  if (!src || !tgt) return;

  const tgtRect = rectMap.get(edge.target);
  const arrow = resolveArrow(src, tgt, tgtRect);

  drawManhattanRoute(grid, src, arrow);
  grid.setChar(arrow.row, arrow.col, arrow.char);

  if (showLabels && edge.label) {
    const labelRow = Math.round((src.row + arrow.row) / 2);
    const labelCol = Math.round((src.col + arrow.col) / 2) + 1;
    grid.writeText(labelRow, labelCol, edge.label, 15);
  }
}

/**
 * Calculates the bounding box of all elements in the model.
 */
function calculateBounds(model: DiagramModel): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function expand(x: number, y: number, w: number, h: number, parentId?: string): void { // eslint-disable-line max-params
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

  for (const c of model.containers) expand(c.x, c.y, c.width, c.height, c.parent);
  for (const n of model.nodes) expand(n.x, n.y, n.width, n.height, n.parent);

  if (minX === Infinity) { minX = 0; minY = 0; maxX = 800; maxY = 600; }

  return { minX, minY, maxX, maxY };
}
