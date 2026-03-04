/**
 * RecallEngine -- Semantic search for historical diagrams via Qdrant.
 *
 * Coordinates between the EmbeddingProvider, QdrantClient, and DiagramIndexer
 * to provide the recallModel(query) API.
 */

import type { RecallResult, StoredModel } from '../types/index.js';
import type { EmbeddingProvider } from './embedding-provider.js';
import type { IndexablePayload } from './diagram-indexer.js';
import { buildIndexPayload, payloadToEmbeddingText } from './diagram-indexer.js';
import { QdrantClient } from './qdrant-client.js';

export class RecallEngine {
  private readonly qdrant: QdrantClient;
  private readonly embeddings: EmbeddingProvider;

  constructor(qdrant: QdrantClient, embeddings: EmbeddingProvider) {
    this.qdrant = qdrant;
    this.embeddings = embeddings;
  }

  /**
   * Initialises the Qdrant collection if needed.
   */
  async initialise(): Promise<void> {
    await this.qdrant.ensureCollection();
  }

  /**
   * Indexes a diagram model for future recall.
   *
   * @param model - The stored model metadata
   * @param xml - The diagram XML content
   */
  async index(model: StoredModel, xml: string): Promise<void> {
    const payload = buildIndexPayload(model, xml);
    const text = payloadToEmbeddingText(payload);
    const vector = await this.embeddings.embed(text);

    await this.qdrant.upsert({
      id: model.id,
      vector,
      payload: payload as unknown as Record<string, unknown>,
    });
  }

  /**
   * Searches for diagrams similar to the query.
   *
   * @param query - Natural language search query
   * @param limit - Maximum results (default: 5)
   * @returns Ranked list of matching diagrams with similarity scores
   */
  async recall(query: string, limit = 5): Promise<RecallResult[]> {
    const vector = await this.embeddings.embed(query);
    const results = await this.qdrant.search(vector, limit);

    return results.map((r) => {
      const payload = r.payload as unknown as IndexablePayload;
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
  async remove(modelId: string): Promise<void> {
    await this.qdrant.deletePoint(modelId);
  }

  /**
   * Checks if the Qdrant backend is available.
   */
  async isAvailable(): Promise<boolean> {
    return this.qdrant.healthCheck();
  }
}
