/**
 * NotationRegistry — Lookup, listing, and resolution of notation definitions.
 *
 * All notation definitions are registered at import time. The registry is
 * read-only and deterministic.
 */
import type { NotationName, NotationDefinition } from '../types/index.js';
/**
 * Returns the notation definition for the given name.
 * Defaults to 'generic' if the name is not recognised.
 */
export declare function getNotation(name?: NotationName): NotationDefinition;
/**
 * Returns the notation definition if found, or null if not recognised.
 */
export declare function findNotation(name: string): NotationDefinition | null;
/**
 * Lists all available notation definitions.
 */
export declare function listNotations(): NotationDefinition[];
/**
 * Checks whether a string is a valid notation name.
 */
export declare function isValidNotation(name: string): name is NotationName;
/**
 * Resolves a shapeLibrary string (from DiagramMetadata) to a NotationName.
 * Returns 'generic' if the shape library is not recognised.
 */
export declare function resolveNotationFromShapeLibrary(shapeLibrary?: string): NotationName;
//# sourceMappingURL=registry.d.ts.map