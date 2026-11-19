/**
 * Style-string parsing and identity normalisation for draw.io cells.
 *
 * draw.io styles are `;`-separated lists of `key=value` pairs and bare tokens
 * (e.g. `ellipse;whiteSpace=wrap;html=1;`). For standard conformance we reduce
 * a style to an *identity*: the subset of keys that determines what the shape
 * or connector *means* in a notation, ignoring layout and label presentation.
 */

import { extractStencilRef } from '../parser/shape-validator.js';

export type ParsedStyle = Map<string, string>;

/** Bare tokens that select a base shape when no `shape=` key is present. */
const BASE_SHAPE_TOKENS = new Set([
  'ellipse', 'rhombus', 'triangle', 'swimlane', 'text', 'line', 'image', 'label',
  'cylinder', 'hexagon', 'cloud', 'actor', 'doubleEllipse', 'process', 'step',
  'parallelogram', 'trapezoid', 'card', 'note', 'document', 'tape', 'callout',
  'edgeLabel', 'group', 'shape',
]);

/** Keys that further discriminate a stencil within a shape family. */
const DISCRIMINATOR_KEYS = [
  'appType', 'archiType', 'resIcon', 'prIcon', 'grIcon', 'symbol', 'outline',
  'type', 'image', 'perimeter',
];

/** Border keys that are part of a vertex's identity. */
const VERTEX_BORDER_KEYS = ['dashed', 'rounded', 'double'];

/** Edge keys that are part of a connector's identity, with draw.io defaults. */
const EDGE_IDENTITY_DEFAULTS: ReadonlyArray<[string, string]> = [
  ['shape', 'connector'],
  ['startArrow', 'none'],
  ['endArrow', 'classic'],
  ['startFill', '1'],
  ['endFill', '1'],
  ['dashed', '0'],
];

/** Presentational keys checked when `lockElementStyle` is enabled. */
export const GOVERNED_PRESENTATION_KEYS = [
  'fillColor', 'strokeColor', 'strokeWidth', 'fontColor', 'fontFamily', 'fontStyle', 'dashPattern',
];

const BOOLEAN_DEFAULTS: Record<string, string> = { dashed: '0', rounded: '0', double: '0' };

export function parseStyle(style: string): ParsedStyle {
  const map: ParsedStyle = new Map();
  for (const raw of style.split(';')) {
    const part = raw.trim();
    if (!part) continue;
    const eq = part.indexOf('=');
    if (eq === -1) {
      map.set(part, '');
    } else {
      map.set(part.slice(0, eq), part.slice(eq + 1));
    }
  }
  return map;
}

export function serializeStyle(parsed: ParsedStyle): string {
  const parts: string[] = [];
  for (const [k, v] of parsed) {
    parts.push(v === '' ? k : `${k}=${v}`);
  }
  return parts.length ? `${parts.join(';')};` : '';
}

/** Returns the base shape token for a vertex style. */
export function baseShape(parsed: ParsedStyle): string {
  const explicit = parsed.get('shape');
  if (explicit) return explicit;
  for (const key of parsed.keys()) {
    if (BASE_SHAPE_TOKENS.has(key) && parsed.get(key) === '') return key;
  }
  return 'rect';
}

/**
 * Normalised identity of a vertex or container style.
 * Example: `shape=mxgraph.archimate3.application|appType=comp|archiType=square|dashed=0|rounded=0`.
 */
export function vertexIdentity(style: string): string {
  const parsed = parseStyle(style);
  const parts = [`shape=${baseShape(parsed)}`];
  for (const key of DISCRIMINATOR_KEYS) {
    const v = parsed.get(key);
    if (v !== undefined && v !== '') parts.push(`${key}=${v}`);
  }
  for (const key of VERTEX_BORDER_KEYS) {
    parts.push(`${key}=${normaliseBool(parsed.get(key), BOOLEAN_DEFAULTS[key])}`);
  }
  return parts.join('|');
}

/**
 * Normalised identity of an edge style: arrowheads, fill and line pattern.
 * Routing (edgeStyle, curved, elbow) is treated as layout, not notation.
 */
export function edgeIdentity(style: string): string {
  const parsed = parseStyle(style);
  return EDGE_IDENTITY_DEFAULTS.map(([key, def]) => {
    const raw = parsed.get(key);
    const value = raw === undefined || raw === '' ? def : raw;
    return `${key}=${key === 'dashed' || key.endsWith('Fill') ? normaliseBool(value, def) : value}`;
  }).join('|');
}

export function identityFor(kind: 'vertex' | 'edge' | 'container', style: string): string {
  return kind === 'edge' ? edgeIdentity(style) : vertexIdentity(style);
}

/** Extracts the governed presentational values from a style. */
export function presentation(style: string): Record<string, string> {
  const parsed = parseStyle(style);
  const out: Record<string, string> = {};
  for (const key of GOVERNED_PRESENTATION_KEYS) {
    const v = parsed.get(key);
    if (v !== undefined) out[key] = normaliseColour(v);
  }
  return out;
}

/** Returns the notation family prefix of a style (e.g. "mxgraph.archimate3"), if any. */
export function stencilFamily(style: string): string | null {
  const ref = extractStencilRef(style);
  if (!ref) {
    const parsed = parseStyle(style);
    const shape = parsed.get('shape');
    if (shape?.startsWith('uml') || shape === 'umlLifeline' || shape === 'umlActor') return 'uml';
    return null;
  }
  const value = ref.slice(ref.indexOf('=') + 1);
  if (ref.startsWith('prIcon=')) return 'mxgraph.cisco19';
  if (value.startsWith('img/lib/')) {
    const segs = value.split('/');
    return segs.slice(0, 3).join('/');
  }
  const segs = value.split('.');
  return segs.slice(0, 2).join('.');
}

export function normaliseColour(value: string): string {
  return /^#[0-9a-f]{3,8}$/i.test(value) ? value.toUpperCase() : value;
}

function normaliseBool(value: string | undefined, def: string): string {
  if (value === undefined || value === '') return def;
  if (value === 'true') return '1';
  if (value === 'false') return '0';
  return value;
}
