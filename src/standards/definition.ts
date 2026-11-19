/**
 * Validation and normalisation of ModellingStandard definitions.
 *
 * Hand-written standards may omit `identity` and may reference built-in
 * notation shapes via `ref: "<notation>:<shape name>"` instead of a style.
 * `normaliseStandard` fills these in so downstream code can rely on them.
 */

/* eslint-disable security/detect-object-injection */

import type { NotationName } from '../types/index.js';
import { isValidNotation, resolveShape } from '../notation/registry.js';
import { identityFor } from './style.js';
import type { ModellingStandard, StandardElement, StandardElementKind } from './types.js';

export interface DefinitionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function validateStandardDefinition(input: unknown): DefinitionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Standard must be a JSON object'], warnings };
  }
  const s = input as Record<string, unknown>;

  for (const key of ['id', 'clientId', 'name', 'domain']) {
    if (typeof s[key] !== 'string' || !(s[key] as string).trim()) errors.push(`"${key}" must be a non-empty string`);
  }
  for (const key of ['id', 'clientId']) {
    if (typeof s[key] === 'string' && !ID_PATTERN.test(s[key] as string)) errors.push(`"${key}" must match ${ID_PATTERN.source}`);
  }
  if (s.version !== undefined && (typeof s.version !== 'number' || s.version < 1)) errors.push('"version" must be a positive number');
  if (typeof s.baseNotation !== 'string' || !isValidNotation(s.baseNotation)) {
    errors.push(`"baseNotation" must be one of the built-in notations`);
  }
  if (s.enforcement !== undefined && s.enforcement !== 'strict' && s.enforcement !== 'warn') {
    errors.push('"enforcement" must be "strict" or "warn"');
  }

  const lists: Array<[string, StandardElementKind]> = [['elements', 'vertex'], ['connectors', 'edge'], ['containers', 'container']];
  let total = 0;
  for (const [key, kind] of lists) {
    const list = s[key];
    if (list === undefined) continue;
    if (!Array.isArray(list)) {
      errors.push(`"${key}" must be an array`);
      continue;
    }
    total += list.length;
    const names = new Set<string>();
    list.forEach((raw, i) => {
      const el = raw as Partial<StandardElement>;
      const where = `${key}[${i}]`;
      if (!el || typeof el !== 'object') {
        errors.push(`${where} must be an object`);
        return;
      }
      if (typeof el.name !== 'string' || !el.name.trim()) errors.push(`${where}.name must be a non-empty string`);
      if ((typeof el.style !== 'string' || !el.style) && typeof el.ref !== 'string') {
        errors.push(`${where} must define "style" or "ref"`);
      }
      if (el.kind !== undefined && el.kind !== kind) errors.push(`${where}.kind must be "${kind}" (or omitted)`);
      if (typeof el.ref === 'string' && !el.style) {
        const resolved = resolveRef(el.ref);
        if (!resolved) errors.push(`${where}.ref "${el.ref}" does not resolve to a built-in shape`);
      }
      if (el.needsName) warnings.push(`${where} "${el.name}" is flagged needsName — give it a meaningful name`);
      const lower = (el.name ?? '').toLowerCase();
      if (names.has(lower)) warnings.push(`${where} duplicate name "${el.name}"`);
      names.add(lower);
    });
  }
  if (total === 0) errors.push('Standard must define at least one element, connector or container');

  return { valid: errors.length === 0, errors, warnings };
}

/** Fills in defaults, resolves `ref`s and computes identities. Throws on invalid input. */
export function normaliseStandard(input: unknown): ModellingStandard {
  const result = validateStandardDefinition(input);
  if (!result.valid) {
    throw new Error(`Invalid modelling standard: ${result.errors.join('; ')}`);
  }
  const s = input as ModellingStandard;
  const norm = (list: StandardElement[] | undefined, kind: StandardElementKind): StandardElement[] =>
    (list ?? []).map(el => {
      let style = el.style;
      let defaultWidth = el.defaultWidth;
      let defaultHeight = el.defaultHeight;
      if (!style && el.ref) {
        const shape = resolveRef(el.ref);
        if (shape) {
          style = shape.style;
          defaultWidth ??= shape.defaultWidth;
          defaultHeight ??= shape.defaultHeight;
        }
      }
      return {
        ...el,
        kind,
        style,
        identity: el.identity ?? identityFor(kind, style),
        ...(defaultWidth !== undefined ? { defaultWidth } : {}),
        ...(defaultHeight !== undefined ? { defaultHeight } : {}),
      };
    });

  return {
    ...s,
    version: s.version ?? 1,
    enforcement: s.enforcement ?? 'strict',
    source: s.source ?? { kind: 'manual' },
    elements: norm(s.elements, 'vertex'),
    connectors: norm(s.connectors, 'edge'),
    containers: norm(s.containers, 'container'),
    rules: { lockPalette: false, lockElementStyle: false, allowFreeText: false, ...(s.rules ?? {}) },
  };
}

function resolveRef(ref: string) {
  const idx = ref.indexOf(':');
  if (idx === -1) return null;
  const notation = ref.slice(0, idx);
  const name = ref.slice(idx + 1);
  if (!isValidNotation(notation)) return null;
  return resolveShape(notation as NotationName, name);
}
