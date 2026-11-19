/**
 * StandardConformanceValidator — checks a diagram against a client modelling standard.
 *
 * Every vertex, container and connector in the diagram must match an element of
 * the standard by identity (shape/stencil + discriminators + border for vertices;
 * arrowheads + fill + line pattern for connectors). Optionally, presentational
 * keys and colours are locked too.
 *
 * Severity follows the standard's enforcement: `strict` → error, `warn` → warning.
 */

import { matchByName } from '../notation/matcher.js';
import { readDrawio, classifyCell, parentIdSet, type DrawioCell } from './drawio-reader.js';
import { identityFor, presentation, parseStyle, baseShape, normaliseColour, GOVERNED_PRESENTATION_KEYS } from './style.js';
import type { ModellingStandard, StandardElement, StandardElementKind } from './types.js';

export type ConformanceIssueType = 'disallowed-element' | 'disallowed-connector' | 'style-mismatch' | 'palette-violation';

export interface ConformanceIssue {
  cellId: string;
  label: string;
  page: string;
  kind: StandardElementKind;
  type: ConformanceIssueType;
  severity: 'error' | 'warning';
  message: string;
  style: string;
  /** Name of the closest allowed element, when one can be suggested. */
  suggestion?: string;
}

export interface ConformanceResult {
  valid: boolean;
  standard: { clientId: string; standardId: string; version: number; enforcement: 'strict' | 'warn' };
  checkedCount: number;
  issues: ConformanceIssue[];
  /** Per-cell resolution: cell id → matched standard element name. */
  matches: Record<string, string>;
}

const NEUTRAL_COLOURS = new Set(['none', 'default', 'inherit', '']);

export function validateStandardConformance(xml: string, standard: ModellingStandard): ConformanceResult {
  const severity: 'error' | 'warning' = standard.enforcement === 'strict' ? 'error' : 'warning';
  const rules = standard.rules ?? {};
  const shapePool = [...standard.elements, ...standard.containers];
  const byIdentity = indexByIdentity(shapePool);
  const connectorsByIdentity = indexByIdentity(standard.connectors);
  const palette = new Set(
    [...(standard.palette?.fills ?? []), ...(standard.palette?.strokes ?? []), ...(standard.palette?.fontColours ?? [])].map(normaliseColour),
  );

  const issues: ConformanceIssue[] = [];
  const matches: Record<string, string> = {};
  let checkedCount = 0;

  const doc = readDrawio(xml);
  for (const page of doc.pages) {
    const parents = parentIdSet(page.cells);
    const edgeIds = new Set(page.cells.filter(c => c.edge).map(c => c.id));
    for (const cell of page.cells) {
      const kind = classifyCell(cell, parents, edgeIds);
      if (!kind) continue;
      if (kind !== 'edge' && rules.allowFreeText && baseShape(parseStyle(cell.style)) === 'text') continue;
      checkedCount++;

      const identity = identityFor(kind, cell.style);
      const candidates = (kind === 'edge' ? connectorsByIdentity : byIdentity).get(identity) ?? [];
      const base = { cellId: cell.id, label: cell.label, page: page.name, kind, style: cell.style, severity };

      if (candidates.length === 0) {
        const suggestion = suggest(cell, kind === 'edge' ? standard.connectors : shapePool, kind);
        issues.push({
          ...base,
          type: kind === 'edge' ? 'disallowed-connector' : 'disallowed-element',
          message: `${describe(cell, kind)} is not permitted by standard "${standard.clientId}/${standard.id}"${suggestion ? ` — closest allowed: "${suggestion}"` : ''}.`,
          ...(suggestion ? { suggestion } : {}),
        });
        continue;
      }

      let matched = candidates[0];
      if (rules.lockElementStyle) {
        const cellPres = presentation(cell.style);
        const exact = candidates.find(c => samePresentation(cellPres, presentation(c.style)));
        if (exact) {
          matched = exact;
        } else {
          issues.push({
            ...base,
            type: 'style-mismatch',
            message: `${describe(cell, kind)} matches "${candidates[0].name}" but its colours/fonts/stroke differ from the standard. Use the standard style exactly.`,
            suggestion: candidates[0].name,
          });
        }
      }
      matches[cell.id] = matched.name;

      if (rules.lockPalette && palette.size > 0) {
        const parsed = parseStyle(cell.style);
        for (const key of ['fillColor', 'strokeColor', 'fontColor']) {
          const v = parsed.get(key);
          if (v === undefined || NEUTRAL_COLOURS.has(v)) continue;
          if (!palette.has(normaliseColour(v))) {
            issues.push({
              ...base,
              type: 'palette-violation',
              message: `${describe(cell, kind)} uses ${key}=${v}, which is not in the standard palette.`,
            });
          }
        }
      }
    }
  }

  return {
    valid: !issues.some(i => i.severity === 'error'),
    standard: { clientId: standard.clientId, standardId: standard.id, version: standard.version, enforcement: standard.enforcement },
    checkedCount,
    issues,
    matches,
  };
}

/** Formats a conformance result as a short human-readable report. */
export function formatConformanceReport(result: ConformanceResult): string {
  const s = result.standard;
  const head = `Standard ${s.clientId}/${s.standardId} v${s.version} (${s.enforcement}): ${result.checkedCount} cells checked, ${result.issues.length} issue(s)`;
  if (result.issues.length === 0) return `${head} — conformant.`;
  const lines = result.issues.map(i => `  [${i.severity}] ${i.cellId}${i.label ? ` "${i.label}"` : ''}: ${i.message}`);
  return [head, ...lines].join('\n');
}

function indexByIdentity(elements: StandardElement[]): Map<string, StandardElement[]> {
  const map = new Map<string, StandardElement[]>();
  for (const el of elements) {
    const id = el.identity ?? identityFor(el.kind, el.style);
    const list = map.get(id) ?? [];
    list.push(el);
    map.set(id, list);
  }
  return map;
}

function samePresentation(a: Record<string, string>, b: Record<string, string>): boolean {
  return GOVERNED_PRESENTATION_KEYS.every(k => (a[k] ?? '') === (b[k] ?? ''));
}

function describe(cell: DrawioCell, kind: StandardElementKind): string {
  const what = kind === 'edge' ? 'Connector' : kind === 'container' ? 'Container' : 'Element';
  return `${what} "${cell.id}"${cell.label ? ` ("${cell.label}")` : ''}`;
}

function suggest(cell: DrawioCell, pool: StandardElement[], kind: StandardElementKind): string | undefined {
  if (pool.length === 0) return undefined;
  if (cell.label) {
    const byLabel = matchByName(pool, cell.label);
    if (byLabel) return byLabel.name;
  }
  const parsed = parseStyle(cell.style);
  if (kind === 'edge') {
    const end = parsed.get('endArrow') ?? 'classic';
    const dashed = parsed.get('dashed') ?? '0';
    const close = pool.find(p => {
      const pp = parseStyle(p.style);
      return (pp.get('endArrow') ?? 'classic') === end || (pp.get('dashed') ?? '0') === dashed;
    });
    return close?.name;
  }
  const shape = baseShape(parsed);
  const sameShape = pool.find(p => baseShape(parseStyle(p.style)) === shape);
  return sameShape?.name;
}
