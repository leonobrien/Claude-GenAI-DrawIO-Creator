/**
 * QdrantClient -- Thin wrapper around the Qdrant REST API.
 *
 * Handles collection management, point upsert, and search.
 * Uses fetch() directly to avoid heavy SDK dependencies in the skill runtime.
 */
const DEFAULT_CONFIG = {
    url: 'http://localhost:6333',
    collectionName: 'drawio_diagrams',
    vectorSize: 1024,
};
export class QdrantClient {
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    headers() {
        const h = { 'Content-Type': 'application/json' };
        if (this.config.apiKey) {
            h['api-key'] = this.config.apiKey;
        }
        return h;
    }
    url(path) {
        return `${this.config.url}${path}`;
    }
    /**
     * Creates the collection if it does not exist.
     */
    async ensureCollection() {
        // Check if collection exists
        const checkRes = await fetch(this.url(`/collections/${this.config.collectionName}`), { headers: this.headers() });
        if (checkRes.ok) {
            return; // Already exists
        }
        // Create collection
        const createRes = await fetch(this.url(`/collections/${this.config.collectionName}`), {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify({
                vectors: {
                    size: this.config.vectorSize,
                    distance: 'Cosine',
                },
            }),
        });
        if (!createRes.ok) {
            const body = await createRes.text();
            throw new Error(`Failed to create Qdrant collection: ${createRes.status} ${body}`);
        }
    }
    /**
     * Upserts a single point into the collection.
     */
    async upsert(point) {
        const res = await fetch(this.url(`/collections/${this.config.collectionName}/points`), {
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
        });
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
    async search(vector, limit = 5) {
        const res = await fetch(this.url(`/collections/${this.config.collectionName}/points/search`), {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({
                vector,
                limit,
                with_payload: true,
            }),
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Qdrant search failed: ${res.status} ${body}`);
        }
        const data = await res.json();
        return data.result;
    }
    /**
     * Deletes a point by ID.
     */
    async deletePoint(pointId) {
        const res = await fetch(this.url(`/collections/${this.config.collectionName}/points/delete`), {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({
                points: [pointId],
            }),
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Qdrant delete failed: ${res.status} ${body}`);
        }
    }
    /**
     * Checks connectivity to the Qdrant server.
     */
    async healthCheck() {
        try {
            const res = await fetch(this.url('/healthz'), { headers: this.headers() });
            return res.ok;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=qdrant-client.js.map