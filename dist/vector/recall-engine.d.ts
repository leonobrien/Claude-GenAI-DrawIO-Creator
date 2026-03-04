/**
 * RecallEngine -- Semantic search for historical diagrams via Qdrant.
 *
 * Coordinates between the EmbeddingProvider, QdrantClient, and DiagramIndexer
 * to provide the recallModel(query) API.
 */
import type { RecallResult, StoredModel } from '../types/index.js';
import type { EmbeddingProvider } from './embedding-provider.js';
import { QdrantClient } from './qdrant-client.js';
export declare class RecallEngine {
    private readonly qdrant;
    private readonly embeddings;
    constructor(qdrant: QdrantClient, embeddings: EmbeddingProvider);
    /**
     * Initialises the Qdrant collection if needed.
     */
    initialise(): Promise<void>;
    /**
     * Indexes a diagram model for future recall.
     *
     * @param model - The stored model metadata
     * @param xml - The diagram XML content
     */
    index(model: StoredModel, xml: string): Promise<void>;
    /**
     * Searches for diagrams similar to the query.
     *
     * @param query - Natural language search query
     * @param limit - Maximum results (default: 5)
     * @returns Ranked list of matching diagrams with similarity scores
     */
    recall(query: string, limit?: number): Promise<RecallResult[]>;
    /**
     * Removes a diagram from the index.
     */
    remove(modelId: string): Promise<void>;
    /**
     * Checks if the Qdrant backend is available.
     */
    isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=recall-engine.d.ts.map