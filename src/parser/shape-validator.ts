/**
 * ShapeValidator — Runtime pre-flight check for stencil renderability.
 *
 * Parses style strings from draw.io XML to extract stencil identifiers
 * (prIcon, resIcon, shape=mxgraph.*, image=img/lib/) and validates them
 * against the notation registry's known shape catalogues.
 *
 * This catches invalid stencil references that would render as plain
 * rectangles in draw.io, before the user ever opens the file.
 */

import { listNotations } from '../notation/registry.js';

export interface ShapeValidationIssue {
  cellId: string;
  style: string;
  stencilRef: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ShapeValidationResult {
  valid: boolean;
  issues: ShapeValidationIssue[];
  checkedCount: number;
}

/**
 * Builds a set of all known style strings from all notation shape catalogues.
 * Used for fast lookup when validating shapes.
 */
function buildKnownStyleIndex(): Set<string> {
  const known = new Set<string>();
  for (const notation of listNotations()) {
    for (const shape of notation.shapes) {
      known.add(shape.style);
    }
  }
  return known;
}

/**
 * Extracts the stencil reference from a style string, if any.
 *
 * Looks for these patterns (in priority order):
 * - `prIcon=<value>` (Cisco composite pattern)
 * - `resIcon=mxgraph.aws4.<value>` (AWS resource icons)
 * - `shape=mxgraph.<family>.<value>` (GCP, BPMN, ArchiMate, etc.)
 * - `image=img/lib/<path>` (Azure SVG references)
 *
 * Returns null for generic styles that don't use notation stencils.
 */
export function extractStencilRef(style: string): string | null {
  // prIcon= (Cisco)
  const prIconMatch = style.match(/prIcon=([^;]+)/);
  if (prIconMatch) return `prIcon=${prIconMatch[1]}`;

  // resIcon= (AWS)
  const resIconMatch = style.match(/resIcon=([^;]+)/);
  if (resIconMatch) return `resIcon=${resIconMatch[1]}`;

  // shape=mxgraph.* (GCP, BPMN, ArchiMate, etc.)
  const shapeMatch = style.match(/shape=(mxgraph\.[^;]+)/);
  if (shapeMatch) return `shape=${shapeMatch[1]}`;

  // image=img/lib/* (Azure SVGs)
  const imageMatch = style.match(/image=(img\/lib\/[^;]+)/);
  if (imageMatch) return `image=${imageMatch[1]}`;

  // No notation stencil reference — generic style
  return null;
}

/**
 * Extracts all mxCell vertex elements with their id and style from XML.
 */
function extractVertexStyles(xml: string): Array<{ id: string; style: string }> {
  const results: Array<{ id: string; style: string }> = [];

  // Match vertex cells with id and style in either order
  const pattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\sstyle="([^"]*)"[^>]*\svertex="1"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    results.push({ id: match[1], style: match[2] });
  }

  // Also match when vertex appears before id/style
  const pattern2 = /<mxCell[^>]*\svertex="1"[^>]*\sid="([^"]+)"[^>]*\sstyle="([^"]*)"/g;
  while ((match = pattern2.exec(xml)) !== null) {
    const id = match[1];
    const style = match[2];
    if (!results.some(r => r.id === id)) {
      results.push({ id, style });
    }
  }

  // Match style before id
  const pattern3 = /<mxCell[^>]*\sstyle="([^"]*)"[^>]*\sid="([^"]+)"[^>]*\svertex="1"/g;
  while ((match = pattern3.exec(xml)) !== null) {
    const id = match[2];
    const style = match[1];
    if (!results.some(r => r.id === id)) {
      results.push({ id, style });
    }
  }

  return results;
}

/**
 * Validates that all stencil references in the diagram's vertex styles
 * correspond to known shapes in the notation registry.
 *
 * Generic styles (rectangles, ellipses, etc.) without notation stencil
 * references are always considered valid.
 *
 * @param xml - Full draw.io XML string
 * @returns Validation result with issues for unrecognised stencil references
 */
export function validateShapeRenderable(xml: string): ShapeValidationResult {
  const knownStyles = buildKnownStyleIndex();
  const vertices = extractVertexStyles(xml);
  const issues: ShapeValidationIssue[] = [];
  let checkedCount = 0;

  for (const { id, style } of vertices) {
    // Skip root cells
    if (id === '0' || id === '1') continue;

    const stencilRef = extractStencilRef(style);
    if (!stencilRef) {
      // Generic style — no stencil to validate
      continue;
    }

    checkedCount++;

    // Check if the full style matches any known notation shape
    const isKnown = knownStyles.has(style);
    if (isKnown) continue;

    // Style doesn't match exactly — check if the stencil ref appears in any known style
    let refFoundInCatalogue = false;
    for (const knownStyle of knownStyles) {
      if (knownStyle.includes(stencilRef.split('=')[1])) {
        refFoundInCatalogue = true;
        break;
      }
    }

    if (!refFoundInCatalogue) {
      issues.push({
        cellId: id,
        style,
        stencilRef,
        severity: 'warning',
        message: `Cell "${id}" uses stencil reference "${stencilRef}" not found in any notation catalogue. It may render as a plain rectangle in draw.io.`,
      });
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    checkedCount,
  };
}
