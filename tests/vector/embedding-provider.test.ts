import { describe, it, expect } from 'vitest';
import { StubEmbeddingProvider } from '../../src/vector/embedding-provider.js';

describe('StubEmbeddingProvider', () => {
  it('produces vectors of the configured dimension', async () => {
    const provider = new StubEmbeddingProvider(512);
    const vector = await provider.embed('test input');
    expect(vector).toHaveLength(512);
  });

  it('produces deterministic vectors for the same input', async () => {
    const provider = new StubEmbeddingProvider(256);
    const v1 = await provider.embed('hello world');
    const v2 = await provider.embed('hello world');
    expect(v1).toEqual(v2);
  });

  it('produces different vectors for different inputs', async () => {
    const provider = new StubEmbeddingProvider(256);
    const v1 = await provider.embed('hello world');
    const v2 = await provider.embed('goodbye world');
    expect(v1).not.toEqual(v2);
  });

  it('produces normalised unit vectors', async () => {
    const provider = new StubEmbeddingProvider(1024);
    const vector = await provider.embed('test normalisation');
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1.0, 4);
  });

  it('handles batch embedding', async () => {
    const provider = new StubEmbeddingProvider(128);
    const vectors = await provider.embedBatch(['text one', 'text two', 'text three']);
    expect(vectors).toHaveLength(3);
    expect(vectors[0]).toHaveLength(128);
  });
});
