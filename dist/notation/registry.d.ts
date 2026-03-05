/**
 * NotationRegistry — Lookup, listing, and resolution of notation definitions.
 *
 * All notation definitions are registered at import time. The registry is
 * read-only and deterministic.
 */
import type { NotationName, NotationDefinition, NotationShape } from '../types/index.js';
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
export declare function resolveShape(notationName: NotationName, shapeName: string, category?: string): NotationShape | null;
//# sourceMappingURL=registry.d.ts.map