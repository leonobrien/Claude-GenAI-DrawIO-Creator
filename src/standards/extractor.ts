/**
 * StandardExtractor — Generates a ModellingStandard from one or more source
 * .drawio files. Every vertex, connector and container found in the sources is
 * treated as part of the standard.
 */

/* eslint-disable security/detect-non-literal-fs-filename */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { NotationName } from '../types/index.js';
import { listNotations, resolveNotationFromShapeLibrary } from '../notation/registry.js';
import { readDrawio, classifyCell, parentIdSet, type DrawioCell } from './drawio-reader.js';
import { identityFor, parseStyle, presentation, stencilFamily, baseShape, normaliseColour } from './style.js';
import type { ModellingStandard, StandardElement, StandardElementKind, StandardEnforcement, StandardPalette, StandardRules } from './types.js';

export interface ExtractStandardOptions {
  clientId: string;
  standardId: string;
  name?: string;
  domain: string;
  enforcement?: StandardEnforcement;
  description?: string;
  /** Override inferred base notation. */
  baseNotation?: NotationName;
  rules?: StandardRules;
  /** Treat elements with the same shape but different colours/fonts as distinct elements. Default true. */
  distinguishPresentation?: boolean;
}

export interface ExtractSourceInput {
  /** Path recorded in the standard (relative to the client directory). */
  path: string;
  content: string;
}

export interface ExtractionReport {
  standard: ModellingStandard;
  notationBreakdown: Record<string, number>;
  needsName: StandardElement[];
  pagesScanned: number;
  cellsScanned: number;
}

const MAX_ALIASES = 5;

/** Extracts a standard from files on disk. Paths are recorded as `sources/<basename>`. */
export function extractStandardFromFiles(files: string[], opts: ExtractStandardOptions): ExtractionReport {
  return extractStandard(
    files.map(f => ({ path: `sources/${basename(f)}`, content: readFileSync(f, 'utf-8') })),
    opts,
  );
}

export function extractStandard(sources: ExtractSourceInput[], opts: ExtractStandardOptions): ExtractionReport {
  const distinguish = opts.distinguishPresentation ?? true;
  const byKey = new Map<string, StandardElement>();
  const familyCounts: Record<string, number> = {};
  const palette: StandardPalette = { fills: [], strokes: [], fonts: [], fontColours: [] };
  let pagesScanned = 0;
  let cellsScanned = 0;
  const catalogue = buildCatalogueIndex();

  for (const src of sources) {
    const doc = readDrawio(src.content);
    for (const page of doc.pages) {
      pagesScanned++;
      const parents = parentIdSet(page.cells);
      const edgeIds = new Set(page.cells.filter(c => c.edge).map(c => c.id));
      for (const cell of page.cells) {
        const kind = classifyCell(cell, parents, edgeIds);
        if (!kind) continue;
        cellsScanned++;
        collectPalette(cell.style, palette);
        if (kind !== 'edge') {
          const fam = stencilFamily(cell.style);
          if (fam) familyCounts[fam] = (familyCounts[fam] ?? 0) + 1;
        }
        const identity = identityFor(kind, cell.style);
        const key = distinguish ? `${kind}#${identity}#${JSON.stringify(presentation(cell.style))}` : `${kind}#${identity}`;
        const existing = byKey.get(key);
        if (existing) {
          addAlias(existing, cell);
          continue;
        }
        byKey.set(key, newElement(kind, cell, identity, catalogue));
      }
    }
  }

  const all = [...byKey.values()];
  disambiguateNames(all);
  const now = new Date().toISOString();
  const standard: ModellingStandard = {
    id: opts.standardId,
    clientId: opts.clientId,
    name: opts.name ?? opts.standardId,
    domain: opts.domain,
    ...(opts.description ? { description: opts.description } : {}),
    version: 1,
    baseNotation: opts.baseNotation ?? inferNotation(familyCounts),
    enforcement: opts.enforcement ?? 'strict',
    source: {
      kind: 'generated',
      generatedAt: now,
      files: sources.map(s => ({ path: s.path, sha256: sha256(s.content) })),
    },
    elements: all.filter(e => e.kind === 'vertex'),
    connectors: all.filter(e => e.kind === 'edge'),
    containers: all.filter(e => e.kind === 'container'),
    palette,
    rules: { lockPalette: false, lockElementStyle: false, allowFreeText: false, ...(opts.rules ?? {}) },
    updatedAt: now,
  };

  return {
    standard,
    notationBreakdown: familyCounts,
    needsName: all.filter(e => e.needsName),
    pagesScanned,
    cellsScanned,
  };
}

export function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function newElement(kind: StandardElementKind, cell: DrawioCell, identity: string, catalogue: Map<string, string>): StandardElement {
  const explicitName = cell.attributes.standardName ?? cell.attributes.elementType;
  const catalogueName = catalogue.get(identity);
  const label = cell.label;
  let name: string;
  let needsName = false;
  if (explicitName) {
    name = explicitName;
  } else if (catalogueName && kind !== 'edge') {
    name = catalogueName;
  } else if (label) {
    name = label;
  } else {
    name = fallbackName(kind, cell.style);
    needsName = true;
  }
  const el: StandardElement = {
    name,
    kind,
    style: cleanStyle(cell.style),
    identity,
    ...(cell.attributes.category ? { category: cell.attributes.category } : {}),
    ...(cell.attributes.description ? { description: cell.attributes.description } : {}),
    ...(kind !== 'edge' && cell.width ? { defaultWidth: cell.width } : {}),
    ...(kind !== 'edge' && cell.height ? { defaultHeight: cell.height } : {}),
    ...(needsName ? { needsName: true } : {}),
  };
  if (label && label !== name) el.aliases = [label];
  return el;
}

function addAlias(el: StandardElement, cell: DrawioCell): void {
  const label = cell.attributes.standardName ?? cell.label;
  if (!label || label === el.name) return;
  if (el.needsName) {
    el.name = label;
    delete el.needsName;
    return;
  }
  el.aliases ??= [];
  if (el.aliases.length < MAX_ALIASES && !el.aliases.includes(label)) el.aliases.push(label);
}

/** Removes per-instance connection-point keys that are not part of a standard. */
function cleanStyle(style: string): string {
  const parsed = parseStyle(style);
  for (const key of [...parsed.keys()]) {
    if (/^(exit|entry)(X|Y|Dx|Dy|Perimeter)$/.test(key)) parsed.delete(key);
  }
  const parts: string[] = [];
  for (const [k, v] of parsed) parts.push(v === '' ? k : `${k}=${v}`);
  return parts.length ? `${parts.join(';')};` : '';
}

function fallbackName(kind: StandardElementKind, style: string): string {
  const parsed = parseStyle(style);
  if (kind === 'edge') {
    const start = parsed.get('startArrow') ?? 'none';
    const end = parsed.get('endArrow') ?? 'classic';
    const filled = (parsed.get('endFill') ?? '1') !== '0';
    const dashed = parsed.get('dashed') === '1';
    return `${dashed ? 'Dashed' : 'Solid'} connector (${start} → ${end}${end !== 'none' ? (filled ? ', filled' : ', open') : ''})`;
  }
  const shape = baseShape(parsed).split('.').pop() ?? 'shape';
  const sub = parsed.get('archiType') ?? parsed.get('appType') ?? '';
  const base = `${shape}${sub ? ` ${sub}` : ''}`;
  return `${kind === 'container' ? 'Container' : 'Shape'}: ${base}${parsed.get('dashed') === '1' ? ' (dashed)' : ''}`;
}

/** Ensures element names within each kind are unique by appending a qualifier. */
function disambiguateNames(elements: StandardElement[]): void {
  const seen = new Map<string, number>();
  for (const el of elements) {
    const key = `${el.kind}:${el.name.toLowerCase()}`;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count > 0) {
      const p = presentation(el.style);
      const qualifier = p.fillColor && p.fillColor !== 'none' ? p.fillColor : `variant ${count + 1}`;
      el.name = `${el.name} (${qualifier})`;
    }
  }
}

function collectPalette(style: string, palette: StandardPalette): void {
  const parsed = parseStyle(style);
  const push = (list: string[], v: string | undefined) => {
    if (!v || v === 'none' || v === 'default' || v === 'inherit') return;
    const n = normaliseColour(v);
    if (!list.includes(n)) list.push(n);
  };
  push(palette.fills, parsed.get('fillColor'));
  push(palette.strokes, parsed.get('strokeColor'));
  push(palette.fontColours, parsed.get('fontColor'));
  push(palette.fonts, parsed.get('fontFamily'));
}

function inferNotation(familyCounts: Record<string, number>): NotationName {
  const entries = Object.entries(familyCounts);
  if (entries.length === 0) return 'generic';
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const [topFamily, topCount] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  if (topCount / total < 0.6) return 'generic';
  if (topFamily === 'uml') return 'uml';
  return resolveNotationFromShapeLibrary(topFamily);
}

/** identity → catalogue shape name for stencil-bearing built-in shapes. */
function buildCatalogueIndex(): Map<string, string> {
  const index = new Map<string, string>();
  for (const notation of listNotations()) {
    if (notation.name === 'generic') continue;
    for (const shape of notation.shapes) {
      if (!stencilFamily(shape.style)) continue;
      const id = identityFor('vertex', shape.style);
      if (!index.has(id)) index.set(id, shape.name);
    }
  }
  return index;
}

