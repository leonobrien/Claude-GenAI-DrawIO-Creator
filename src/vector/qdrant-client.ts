/**
 * QdrantClient -- Thin wrapper around the Qdrant REST API.
 *
 * Handles collection management, point upsert, and search.
 * Uses fetch() directly to avoid heavy SDK dependencies in the skill runtime.
 */

export interface QdrantConfig {
  /** Qdrant server URL (default: http://localhost:6333) */
  url: string;
  /** API key for authenticated access (optional) */
  apiKey?: string;
  /** Collection name (default: drawio_diagrams) */
  collectionName: string;
  /** Vector dimensions (must match embedding provider) */
  vectorSize: number;
}

const DEFAULT_CONFIG: QdrantConfig = {
  url: 'http://localhost:6333',
  collectionName: 'drawio_diagrams',
  vectorSize: 1024,
};

interface QdrantPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

interface QdrantSearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export class QdrantClient {
  private readonly config: QdrantConfig;

  constructor(config: Partial<QdrantConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.config.apiKey) {
      h['api-key'] = this.config.apiKey;
    }
    return h;
  }

  private url(path: string): string {
    return `${this.config.url}${path}`;
  }

  /**
   * Creates the collection if it does not exist.
   */
  async ensureCollection(): Promise<void> {
    // Check if collection exists
    const checkRes = await fetch(
      this.url(`/collections/${this.config.collectionName}`),
      { headers: this.headers() },
    );

    if (checkRes.ok) {
      return; // Already exists
    }

    // Create collection
    const createRes = await fetch(
      this.url(`/collections/${this.config.collectionName}`),
      {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify({
          vectors: {
            size: this.config.vectorSize,
            distance: 'Cosine',
          },
        }),
      },
    );

    if (!createRes.ok) {
      const body = await createRes.text();
      throw new Error(`Failed to create Qdrant collection: ${createRes.status} ${body}`);
    }
  }

  /**
   * Upserts a single point into the collection.
   */
  async upsert(point: QdrantPoint): Promise<void> {
    const res = await fetch(
      this.url(`/collections/${this.config.collectionName}/points`),
      {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify({
          points: [
            {
              id: point.id,
              vector: point.vector,
              payload: point.payload,
            },
          ],
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Qdrant upsert failed: ${res.status} ${body}`);
    }
  }

  /**
   * Searches for similar vectors.
   *
   * @param vector - The query vector
   * @param limit - Maximum results to return (default: 5)
   * @returns Ranked search results with scores and payloads
   */
  async search(vector: number[], limit = 5): Promise<QdrantSearchResult[]> {
    const res = await fetch(
      this.url(`/collections/${this.config.collectionName}/points/search`),
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          vector,
          limit,
          with_payload: true,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Qdrant search failed: ${res.status} ${body}`);
    }

    const data = await res.json() as { result: QdrantSearchResult[] };
    return data.result;
  }

  /**
   * Deletes a point by ID.
   */
  async deletePoint(pointId: string): Promise<void> {
    const res = await fetch(
      this.url(`/collections/${this.config.collectionName}/points/delete`),
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          points: [pointId],
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Qdrant delete failed: ${res.status} ${body}`);
    }
  }

  /**
   * Checks connectivity to the Qdrant server.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(this.url('/healthz'), { headers: this.headers() });
      return res.ok;
    } catch {
      return false;
    }
  }
}
