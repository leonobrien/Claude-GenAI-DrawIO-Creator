/**
 * NotationRegistry — Lookup, listing, and resolution of notation definitions.
 *
 * All notation definitions are registered at import time. The registry is
 * read-only and deterministic.
 */
import { genericNotation } from './generic.js';
import { awsNotation } from './aws.js';
import { azureNotation } from './azure.js';
import { gcpNotation } from './gcp.js';
import { ciscoNotation } from './cisco.js';
import { archimateNotation } from './archimate.js';
import { umlNotation } from './uml.js';
import { bpmnNotation } from './bpmn.js';
const NOTATIONS = new Map([
    ['generic', genericNotation],
    ['aws', awsNotation],
    ['azure', azureNotation],
    ['gcp', gcpNotation],
    ['cisco', ciscoNotation],
    ['archimate', archimateNotation],
    ['uml', umlNotation],
    ['bpmn', bpmnNotation],
]);
/**
 * Maps common shapeLibrary strings to notation names.
 */
const SHAPE_LIBRARY_MAP = new Map([
    ['aws', 'aws'],
    ['aws4', 'aws'],
    ['mxgraph.aws4', 'aws'],
    ['azure', 'azure'],
    ['mxgraph.azure', 'azure'],
    ['img/lib/azure2', 'azure'],
    ['gcp', 'gcp'],
    ['gcp2', 'gcp'],
    ['mxgraph.gcp2', 'gcp'],
    ['google cloud', 'gcp'],
    ['cisco', 'cisco'],
    ['cisco19', 'cisco'],
    ['mxgraph.cisco19', 'cisco'],
    ['archimate', 'archimate'],
    ['archimate3', 'archimate'],
    ['mxgraph.archimate3', 'archimate'],
    ['uml', 'uml'],
    ['bpmn', 'bpmn'],
    ['mxgraph.bpmn', 'bpmn'],
    ['generic', 'generic'],
    ['default', 'generic'],
]);
/**
 * Returns the notation definition for the given name.
 * Defaults to 'generic' if the name is not recognised.
 */
// Safe fallback — generic is always registered in the NOTATIONS map above.
const GENERIC_NOTATION = NOTATIONS.get('generic');
export function getNotation(name) {
    if (!name) {
        return GENERIC_NOTATION;
    }
    return NOTATIONS.get(name) ?? GENERIC_NOTATION;
}
/**
 * Returns the notation definition if found, or null if not recognised.
 */
export function findNotation(name) {
    return NOTATIONS.get(name) ?? null;
}
/**
 * Lists all available notation definitions.
 */
export function listNotations() {
    return [...NOTATIONS.values()];
}
/**
 * Checks whether a string is a valid notation name.
 */
export function isValidNotation(name) {
    return NOTATIONS.has(name);
}
/**
 * Resolves a shapeLibrary string (from DiagramMetadata) to a NotationName.
 * Returns 'generic' if the shape library is not recognised.
 */
export function resolveNotationFromShapeLibrary(shapeLibrary) {
    if (!shapeLibrary) {
        return 'generic';
    }
    return SHAPE_LIBRARY_MAP.get(shapeLibrary.toLowerCase()) ?? 'generic';
}
/**
 * Safely resolves a shape from a notation catalogue with fuzzy matching.
 *
 * Lookup priority:
 * 1. Exact name match
 * 2. Case-insensitive match
 * 3. Partial/substring match (prefer category-scoped, then shortest name)
 *
 * Returns `null` if no match is found or inputs are invalid.
 */
export function resolveShape(notationName, shapeName, category) {
    if (!shapeName)
        return null;
    const notation = NOTATIONS.get(notationName);
    if (!notation)
        return null;
    const { shapes } = notation;
    // 1. Exact name match
    const exact = shapes.find(s => s.name === shapeName);
    if (exact)
        return exact;
    // 2. Case-insensitive match
    const lower = shapeName.toLowerCase();
    const caseInsensitive = shapes.find(s => s.name.toLowerCase() === lower);
    if (caseInsensitive)
        return caseInsensitive;
    // 3. Partial/substring match
    const partials = shapes.filter(s => {
        const sLower = s.name.toLowerCase();
        return sLower.includes(lower) || lower.includes(sLower);
    });
    if (partials.length === 0)
        return null;
    // Prefer category-scoped match
    if (category) {
        const categoryLower = category.toLowerCase();
        const categoryMatches = partials.filter(s => s.category?.toLowerCase() === categoryLower);
        if (categoryMatches.length > 0) {
            return categoryMatches.reduce((a, b) => a.name.length <= b.name.length ? a : b);
        }
    }
    // Shortest name wins (most specific match)
    return partials.reduce((a, b) => a.name.length <= b.name.length ? a : b);
}
//# sourceMappingURL=registry.js.map