/**
 * NotationRegistry — Lookup, listing, and resolution of notation definitions.
 *
 * All notation definitions are registered at import time. The registry is
 * read-only and deterministic.
 */

import type { NotationName, NotationDefinition } from '../types/index.js';
import { genericNotation } from './generic.js';
import { awsNotation } from './aws.js';
import { azureNotation } from './azure.js';
import { gcpNotation } from './gcp.js';
import { ciscoNotation } from './cisco.js';
import { archimateNotation } from './archimate.js';
import { umlNotation } from './uml.js';
import { bpmnNotation } from './bpmn.js';

const NOTATIONS: ReadonlyMap<NotationName, NotationDefinition> = new Map([
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
const SHAPE_LIBRARY_MAP: ReadonlyMap<string, NotationName> = new Map([
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
export function getNotation(name?: NotationName): NotationDefinition {
  if (!name) {
    return NOTATIONS.get('generic')!;
  }
  return NOTATIONS.get(name) ?? NOTATIONS.get('generic')!;
}

/**
 * Returns the notation definition if found, or null if not recognised.
 */
export function findNotation(name: string): NotationDefinition | null {
  return NOTATIONS.get(name as NotationName) ?? null;
}

/**
 * Lists all available notation definitions.
 */
export function listNotations(): NotationDefinition[] {
  return [...NOTATIONS.values()];
}

/**
 * Checks whether a string is a valid notation name.
 */
export function isValidNotation(name: string): name is NotationName {
  return NOTATIONS.has(name as NotationName);
}

/**
 * Resolves a shapeLibrary string (from DiagramMetadata) to a NotationName.
 * Returns 'generic' if the shape library is not recognised.
 */
export function resolveNotationFromShapeLibrary(shapeLibrary?: string): NotationName {
  if (!shapeLibrary) {
    return 'generic';
  }
  return SHAPE_LIBRARY_MAP.get(shapeLibrary.toLowerCase()) ?? 'generic';
}
