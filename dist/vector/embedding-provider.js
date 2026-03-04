/**
 * EmbeddingProvider -- Abstraction for text embedding generation.
 *
 * Provides a pluggable interface for different embedding backends.
 * Implementations can use local models, Claude API, or other providers.
 */
/**
 * Stub embedding provider that generates deterministic pseudo-embeddings.
 * Useful for testing and development when no embedding API is available.
 *
 * Produces consistent embeddings for the same input text using a simple hash.
 */
export class StubEmbeddingProvider {
    dimensions;
    constructor(dimensions = 1024) {
        this.dimensions = dimensions;
    }
    async embed(text) {
        return this.hashToVector(text);
    }
    async embedBatch(texts) {
        return Promise.all(texts.map((t) => this.embed(t)));
    }
    hashToVector(text) {
        const vector = new Array(this.dimensions);
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
        }
        for (let i = 0; i < this.dimensions; i++) {
            // Deterministic pseudo-random based on hash + index
            hash = ((hash << 13) ^ hash) | 0;
            hash = (hash * 0x5bd1e995) | 0;
            hash = (hash ^ (hash >> 15)) | 0;
            vector[i] = (hash & 0xffff) / 0xffff;
        }
        // Normalise to unit length
        const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
        if (magnitude > 0) {
            for (let i = 0; i < this.dimensions; i++) {
                vector[i] /= magnitude;
            }
        }
        return vector;
    }
}
//# sourceMappingURL=embedding-provider.js.map