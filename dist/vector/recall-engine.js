/**
 * RecallEngine -- Semantic search for historical diagrams via Qdrant.
 *
 * Coordinates between the EmbeddingProvider, QdrantClient, and DiagramIndexer
 * to provide the recallModel(query) API.
 */
import { buildIndexPayload, payloadToEmbeddingText } from './diagram-indexer.js';
export class RecallEngine {
    qdrant;
    embeddings;
    constructor(qdrant, embeddings) {
        this.qdrant = qdrant;
        this.embeddings = embeddings;
    }
    /**
     * Initialises the Qdrant collection if needed.
     */
    async initialise() {
        await this.qdrant.ensureCollection();
    }
    /**
     * Indexes a diagram model for future recall.
     *
     * @param model - The stored model metadata
     * @param xml - The diagram XML content
     */
    async index(model, xml) {
        const payload = buildIndexPayload(model, xml);
        const text = payloadToEmbeddingText(payload);
        const vector = await this.embeddings.embed(text);
        await this.qdrant.upsert({
            id: model.id,
            vector,
            payload: payload,
        });
    }
    /**
     * Searches for diagrams similar to the query.
     *
     * @param query - Natural language search query
     * @param limit - Maximum results (default: 5)
     * @returns Ranked list of matching diagrams with similarity scores
     */
    async recall(query, limit = 5) {
        const vector = await this.embeddings.embed(query);
        const results = await this.qdrant.search(vector, limit);
        return results.map((r) => {
            const payload = r.payload;
            return {
                modelId: payload.model_id,
                project: payload.project,
                name: payload.name,
                description: payload.description,
                score: r.score,
            };
        });
    }
    /**
     * Removes a diagram from the index.
     */
    async remove(modelId) {
        await this.qdrant.deletePoint(modelId);
    }
    /**
     * Checks if the Qdrant backend is available.
     */
    async isAvailable() {
        return this.qdrant.healthCheck();
    }
}
//# sourceMappingURL=recall-engine.js.map