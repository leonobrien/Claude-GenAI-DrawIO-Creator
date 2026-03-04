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
export function getNotation(name) {
    if (!name) {
        return NOTATIONS.get('generic');
    }
    return NOTATIONS.get(name) ?? NOTATIONS.get('generic');
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
//# sourceMappingURL=registry.js.map