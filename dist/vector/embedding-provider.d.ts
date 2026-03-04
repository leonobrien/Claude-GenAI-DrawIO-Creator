/**
 * EmbeddingProvider -- Abstraction for text embedding generation.
 *
 * Provides a pluggable interface for different embedding backends.
 * Implementations can use local models, Claude API, or other providers.
 */
export interface EmbeddingProvider {
    /** Returns the vector dimension for this provider. */
    readonly dimensions: number;
    /**
     * Generates an embedding vector for the given text.
     *
     * @param text - The text to embed
     * @returns A float array of the configured dimension
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generates embeddings for multiple texts in a batch.
     * Default implementation calls embed() for each text.
     *
     * @param texts - Array of texts to embed
     * @returns Array of float arrays
     */
    embedBatch(texts: string[]): Promise<number[][]>;
}
/**
 * Stub embedding provider that generates deterministic pseudo-embeddings.
 * Useful for testing and development when no embedding API is available.
 *
 * Produces consistent embeddings for the same input text using a simple hash.
 */
export declare class StubEmbeddingProvider implements EmbeddingProvider {
    readonly dimensions: number;
    constructor(dimensions?: number);
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
    private hashToVector;
}
//# sourceMappingURL=embedding-provider.d.ts.map