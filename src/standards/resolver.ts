/**
 * Standard-scoped shape resolution. Mirrors `resolveShape()` but only returns
 * elements permitted by a client's modelling standard.
 */

import type { NotationShape } from '../types/index.js';
import { matchByName } from '../notation/matcher.js';
import type { ModellingStandard, StandardElement, StandardElementKind } from './types.js';

export interface StandardShape extends NotationShape {
  kind: StandardElementKind;
}

const DEFAULT_SIZE: Record<StandardElementKind, [number, number]> = {
  vertex: [120, 60],
  container: [320, 200],
  edge: [0, 0],
};

function toShape(el: StandardElement): StandardShape {
  const [w, h] = DEFAULT_SIZE[el.kind];
  return {
    name: el.name,
    style: el.style,
    defaultWidth: el.defaultWidth ?? w,
    defaultHeight: el.defaultHeight ?? h,
    kind: el.kind,
    ...(el.category ? { category: el.category } : {}),
  };
}

/**
 * Resolves an element or container by name (or alias) from a standard.
 * @param kind restrict to 'vertex' or 'container'; searches both when omitted
 */
export function resolveStandardShape(
  standard: ModellingStandard,
  name: string,
  kind?: 'vertex' | 'container',
  category?: string,
): StandardShape | null {
  const pool = kind === 'vertex' ? standard.elements : kind === 'container' ? standard.containers : [...standard.elements, ...standard.containers];
  const el = matchByName(pool, name, category);
  return el ? toShape(el) : null;
}

/** Resolves a connector by name (or alias) from a standard. */
export function resolveStandardConnector(standard: ModellingStandard, name: string): StandardShape | null {
  const el = matchByName(standard.connectors, name);
  return el ? toShape(el) : null;
}

/** Like resolveStandardShape but throws when the element is not part of the standard. */
export function requireStandardShape(standard: ModellingStandard, name: string, kind?: 'vertex' | 'container'): StandardShape {
  const s = resolveStandardShape(standard, name, kind);
  if (!s) throw new Error(`"${name}" is not an allowed element in standard "${standard.clientId}/${standard.id}"`);
  return s;
}

export function requireStandardConnector(standard: ModellingStandard, name: string): StandardShape {
  const s = resolveStandardConnector(standard, name);
  if (!s) throw new Error(`"${name}" is not an allowed connector in standard "${standard.clientId}/${standard.id}"`);
  return s;
}

export interface CoverageResult {
  matched: Array<{ requested: string; kind: StandardElementKind; resolved: string }>;
  gaps: Array<{ requested: string; kind: StandardElementKind }>;
}

/**
 * Checks which planned element/connector types are covered by a standard.
 * Used to populate the "Mapping" and "Gaps" lines in the standard confirmation block.
 */
export function checkStandardCoverage(
  standard: ModellingStandard,
  planned: { elements?: string[]; containers?: string[]; connectors?: string[] },
): CoverageResult {
  const result: CoverageResult = { matched: [], gaps: [] };
  const check = (names: string[] | undefined, kind: StandardElementKind, fn: (n: string) => StandardShape | null) => {
    for (const requested of names ?? []) {
      const r = fn(requested);
      if (r) result.matched.push({ requested, kind, resolved: r.name });
      else result.gaps.push({ requested, kind });
    }
  };
  check(planned.elements, 'vertex', n => resolveStandardShape(standard, n, 'vertex'));
  check(planned.containers, 'container', n => resolveStandardShape(standard, n, 'container'));
  check(planned.connectors, 'edge', n => resolveStandardConnector(standard, n));
  return result;
}
