/**
 * DiagramIndexer -- Extracts indexable metadata from diagram models.
 *
 * Produces a text representation suitable for embedding, combining
 * the prompt, description, node labels, and edge relationships.
 */
import type { StoredModel } from '../types/index.js';
export interface IndexablePayload {
    model_id: string;
    project: string;
    name: string;
    prompt: string;
    description: string;
    labels: string[];
    edges: string[];
    tags: string[];
    created_at: string;
    version: number;
}
/**
 * Builds an indexable payload from a stored model and its XML.
 */
export declare function buildIndexPayload(model: StoredModel, xml: string): IndexablePayload;
/**
 * Converts an indexable payload into a single text string for embedding.
 * Combines all searchable fields into a coherent text representation.
 */
export declare function payloadToEmbeddingText(payload: IndexablePayload): string;
//# sourceMappingURL=diagram-indexer.d.ts.map