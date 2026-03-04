import { describe, it, expect } from 'vitest';
import { buildIndexPayload, payloadToEmbeddingText } from '../../src/vector/diagram-indexer.js';
import type { StoredModel } from '../../src/types/index.js';

describe('DiagramIndexer', () => {
  const testModel: StoredModel = {
    id: 'uuid-1',
    name: 'AWS Architecture',
    project: 'infra',
    currentVersion: 2,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T12:00:00Z',
    tags: ['aws', 'infrastructure'],
    prompt: 'Draw an AWS architecture with EC2, RDS, and S3',
    description: 'Three-tier AWS architecture diagram',
  };

  const testXml = [
    '<mxCell id="2" value="EC2 Instance" style="rounded=1;" vertex="1" parent="1"/>',
    '<mxCell id="3" value="RDS Database" style="rounded=1;" vertex="1" parent="1"/>',
    '<mxCell id="4" value="S3 Bucket" style="rounded=1;" vertex="1" parent="1"/>',
    '<mxCell id="10" style="endArrow=classic;" edge="1" parent="1" source="2" target="3"/>',
    '<mxCell id="11" style="endArrow=classic;" edge="1" parent="1" source="2" target="4"/>',
  ].join('\n');

  describe('buildIndexPayload', () => {
    it('extracts labels from XML', () => {
      const payload = buildIndexPayload(testModel, testXml);
      expect(payload.labels).toContain('EC2 Instance');
      expect(payload.labels).toContain('RDS Database');
      expect(payload.labels).toContain('S3 Bucket');
    });

    it('extracts edge relationships', () => {
      const payload = buildIndexPayload(testModel, testXml);
      expect(payload.edges).toContain('EC2 Instance -> RDS Database');
      expect(payload.edges).toContain('EC2 Instance -> S3 Bucket');
    });

    it('preserves model metadata', () => {
      const payload = buildIndexPayload(testModel, testXml);
      expect(payload.model_id).toBe('uuid-1');
      expect(payload.project).toBe('infra');
      expect(payload.tags).toEqual(['aws', 'infrastructure']);
    });
  });

  describe('payloadToEmbeddingText', () => {
    it('produces combined text representation', () => {
      const payload = buildIndexPayload(testModel, testXml);
      const text = payloadToEmbeddingText(payload);

      expect(text).toContain('Diagram: AWS Architecture');
      expect(text).toContain('Draw an AWS architecture');
      expect(text).toContain('EC2 Instance');
      expect(text).toContain('RDS Database');
      expect(text).toContain('EC2 Instance -> RDS Database');
      expect(text).toContain('Tags: aws, infrastructure');
    });
  });
});
