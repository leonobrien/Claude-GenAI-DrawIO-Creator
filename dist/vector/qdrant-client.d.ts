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
export declare class QdrantClient {
    private readonly config;
    constructor(config?: Partial<QdrantConfig>);
    private headers;
    private url;
    /**
     * Creates the collection if it does not exist.
     */
    ensureCollection(): Promise<void>;
    /**
     * Upserts a single point into the collection.
     */
    upsert(point: QdrantPoint): Promise<void>;
    /**
     * Searches for similar vectors.
     *
     * @param vector - The query vector
     * @param limit - Maximum results to return (default: 5)
     * @returns Ranked search results with scores and payloads
     */
    search(vector: number[], limit?: number): Promise<QdrantSearchResult[]>;
    /**
     * Deletes a point by ID.
     */
    deletePoint(pointId: string): Promise<void>;
    /**
     * Checks connectivity to the Qdrant server.
     */
    healthCheck(): Promise<boolean>;
}
export {};
//# sourceMappingURL=qdrant-client.d.ts.map