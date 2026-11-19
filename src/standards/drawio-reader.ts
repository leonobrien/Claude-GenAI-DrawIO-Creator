/**
 * DrawioReader — Parses .drawio files (plain or compressed, single or multi-page)
 * into a flat list of cells per page.
 *
 * Handles:
 * - `<mxfile><diagram>…<mxGraphModel>` (uncompressed)
 * - `<diagram>` whose text content is base64 + raw-deflate + URI-encoded (compressed)
 * - bare `<mxGraphModel>` documents and bare `<mxCell>` fragments
 * - `<object>` / `<UserObject>` wrapped cells (custom attributes are preserved)
 */

/* eslint-disable security/detect-non-literal-fs-filename, security/detect-object-injection */

import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { XMLParser } from 'fast-xml-parser';
import { assertXmlSize } from '../parser/limits.js';

export interface DrawioCell {
  id: string;
  /** Plain-text label (HTML tags stripped). */
  label: string;
  style: string;
  vertex: boolean;
  edge: boolean;
  parent?: string;
  source?: string;
  target?: string;
  width?: number;
  height?: number;
  /** Attributes from an enclosing `<object>`/`<UserObject>` (excluding id/label). */
  attributes: Record<string, string>;
}

export interface DrawioPage {
  name: string;
  cells: DrawioCell[];
}

export interface DrawioDocument {
  pages: DrawioPage[];
}

type OrderedNode = Record<string, unknown> & { ':@'?: Record<string, string> };

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  processEntities: true,
  htmlEntities: true,
  parseAttributeValue: false,
  parseTagValue: false,
  preserveOrder: true,
  trimValues: true,
});

/** Reads a .drawio file from disk. */
export function readDrawioFile(path: string): DrawioDocument {
  return readDrawio(readFileSync(path, 'utf-8'));
}

/** Parses draw.io XML content (any of the supported shapes) into pages and cells. */
export function readDrawio(xml: string): DrawioDocument {
  assertXmlSize(xml, 'draw.io document');
  const trimmed = xml.trim();
  const wrapped = trimmed.startsWith('<mxCell') ? `<mxGraphModel><root>${trimmed}</root></mxGraphModel>` : trimmed;
  const tree = parser.parse(wrapped) as OrderedNode[];

  const pages: DrawioPage[] = [];
  for (const diagram of findAll(tree, 'diagram')) {
    const attrs = diagram[':@'] ?? {};
    const children = childrenOf(diagram, 'diagram');
    let models = children.filter(c => tagOf(c) === 'mxGraphModel');
    if (models.length === 0) {
      const text = children.map(c => c['#text']).filter(t => typeof t === 'string').join('');
      if (text) {
        const inflated = decompressDiagram(text);
        models = findAll(parser.parse(inflated) as OrderedNode[], 'mxGraphModel');
      }
    }
    pages.push({ name: attrs.name ?? `Page-${pages.length + 1}`, cells: models.flatMap(collectCells) });
  }

  if (pages.length === 0) {
    const models = findAll(tree, 'mxGraphModel');
    if (models.length > 0) {
      pages.push({ name: 'Page-1', cells: models.flatMap(collectCells) });
    }
  }

  return { pages };
}

/** Decompresses a draw.io compressed diagram payload. */
export function decompressDiagram(payload: string): string {
  const buf = Buffer.from(payload.trim(), 'base64');
  const inflated = inflateRawSync(buf).toString('utf-8');
  try {
    return decodeURIComponent(inflated);
  } catch {
    return inflated;
  }
}

/** Strips HTML tags and collapses whitespace in a label. */
export function plainLabel(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagOf(node: OrderedNode): string | undefined {
  return Object.keys(node).find(k => k !== ':@');
}

function childrenOf(node: OrderedNode, tag: string): OrderedNode[] {
  const c = node[tag];
  return Array.isArray(c) ? (c as OrderedNode[]) : [];
}

function findAll(nodes: OrderedNode[], tag: string): OrderedNode[] {
  const out: OrderedNode[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift() as OrderedNode;
    const t = tagOf(n);
    if (!t) continue;
    if (t === tag) {
      out.push(n);
      continue;
    }
    stack.push(...childrenOf(n, t));
  }
  return out;
}

/** mxGraphModel child element holding all cells. */
// eslint-disable-next-line secure-coding/no-hardcoded-credentials -- XML tag name, not a credential
const ROOT_TAG = 'root';

function collectCells(model: OrderedNode): DrawioCell[] {
  const roots = childrenOf(model, 'mxGraphModel').filter(c => tagOf(c) === ROOT_TAG);
  const cells: DrawioCell[] = [];
  for (const rootNode of roots) {
    for (const child of childrenOf(rootNode, ROOT_TAG)) {
      const tag = tagOf(child);
      if (tag === 'mxCell') {
        cells.push(toCell(child, child[':@'] ?? {}, {}));
      } else if (tag === 'object' || tag === 'UserObject') {
        const wrapperAttrs = child[':@'] ?? {};
        const inner = childrenOf(child, tag).find(c => tagOf(c) === 'mxCell');
        const { id, label, ...rest } = wrapperAttrs;
        cells.push(toCell(inner ?? {}, { ...(inner?.[':@'] ?? {}), id, value: label ?? '' }, rest));
      }
    }
  }
  return cells;
}

function toCell(node: OrderedNode, attrs: Record<string, string>, extra: Record<string, string>): DrawioCell {
  const geom = childrenOf(node, 'mxCell').find(c => tagOf(c) === 'mxGeometry')?.[':@'] ?? {};
  const width = geom.width !== undefined ? Number(geom.width) : undefined;
  const height = geom.height !== undefined ? Number(geom.height) : undefined;
  return {
    id: attrs.id ?? '',
    label: plainLabel(attrs.value),
    style: attrs.style ?? '',
    vertex: attrs.vertex === '1',
    edge: attrs.edge === '1',
    ...(attrs.parent !== undefined ? { parent: attrs.parent } : {}),
    ...(attrs.source !== undefined ? { source: attrs.source } : {}),
    ...(attrs.target !== undefined ? { target: attrs.target } : {}),
    ...(width !== undefined && !Number.isNaN(width) ? { width } : {}),
    ...(height !== undefined && !Number.isNaN(height) ? { height } : {}),
    attributes: extra,
  };
}

/**
 * Classifies a cell for standard purposes.
 * Returns null for structural cells (root/layer, edge labels, groups).
 */
export function classifyCell(cell: DrawioCell, parentIds: ReadonlySet<string>, edgeIds: ReadonlySet<string>): 'vertex' | 'edge' | 'container' | null {
  if (cell.edge) return 'edge';
  if (!cell.vertex) return null;
  if (cell.parent && edgeIds.has(cell.parent)) return null; // edge label
  const style = cell.style;
  if (/(^|;)edgeLabel(;|$)/.test(style) || /(^|;)group(;|$)/.test(style)) return null;
  if (/(^|;)swimlane(;|=|$)/.test(style) || /(^|;)container=1/.test(style) || parentIds.has(cell.id)) {
    return 'container';
  }
  return 'vertex';
}

/** Returns the set of cell ids that are parents of other vertices/edges (excluding root/layer cells). */
export function parentIdSet(cells: DrawioCell[]): Set<string> {
  const layerIds = new Set(cells.filter(c => !c.vertex && !c.edge).map(c => c.id));
  const set = new Set<string>();
  for (const c of cells) {
    if (c.parent && !layerIds.has(c.parent)) set.add(c.parent);
  }
  return set;
}
