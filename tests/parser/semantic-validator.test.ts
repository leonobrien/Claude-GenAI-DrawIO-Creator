import { describe, it, expect } from 'vitest';
import { validateEdgeReferences, validateExpectedLabels, validateSemantics, validateNotationConformance } from '../../src/parser/semantic-validator.js';

describe('SemanticValidator', () => {
  const VALID_DIAGRAM = [
    '<mxCell id="2" value="Server" style="rounded=1;" vertex="1" parent="1"/>',
    '<mxCell id="3" value="Database" style="rounded=1;" vertex="1" parent="1"/>',
    '<mxCell id="10" style="endArrow=classic;" edge="1" parent="1" source="2" target="3"/>',
  ].join('\n');

  describe('validateEdgeReferences', () => {
    it('passes when all edges reference valid vertices', () => {
      const result = validateEdgeReferences(VALID_DIAGRAM);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('fails when edge references non-existent source', () => {
      const xml = [
        '<mxCell id="2" value="A" vertex="1" parent="1"/>',
        '<mxCell id="10" edge="1" parent="1" source="99" target="2"/>',
      ].join('\n');

      const result = validateEdgeReferences(xml);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('source "99"'))).toBe(true);
    });
  });

  describe('validateExpectedLabels', () => {
    it('finds expected labels in diagram', () => {
      const result = validateExpectedLabels(VALID_DIAGRAM, ['Server', 'Database']);
      expect(result.valid).toBe(true);
    });

    it('reports missing labels as warnings', () => {
      const result = validateExpectedLabels(VALID_DIAGRAM, ['Server', 'Cache']);
      expect(result.issues.some((i) => i.message.includes('Cache'))).toBe(true);
    });

    it('matches case-insensitively', () => {
      const result = validateExpectedLabels(VALID_DIAGRAM, ['server']);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('validateSemantics', () => {
    it('combines edge and label validation', () => {
      const result = validateSemantics(VALID_DIAGRAM, ['Server']);
      expect(result.valid).toBe(true);
    });

    it('works without notation parameter (backwards compatible)', () => {
      const result = validateSemantics(VALID_DIAGRAM);
      expect(result.valid).toBe(true);
    });

    it('includes notation conformance when notation provided', () => {
      const result = validateSemantics(VALID_DIAGRAM, ['Server'], 'aws');
      expect(result.valid).toBe(true);
      expect(result.issues.some((i) => i.message.includes('mxgraph.aws4'))).toBe(true);
    });
  });

  describe('validateNotationConformance', () => {
    it('passes for generic notation', () => {
      const result = validateNotationConformance(VALID_DIAGRAM, 'generic');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('warns for non-conforming styles', () => {
      const result = validateNotationConformance(VALID_DIAGRAM, 'azure');
      expect(result.valid).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe('warning');
    });

    it('passes for matching stencil prefix', () => {
      const azureXml = '<mxCell id="2" value="VM" style="aspect=fixed;html=1;points=[];align=center;image;fontSize=12;image=img/lib/azure2/compute/Virtual_Machine.svg;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(azureXml, 'azure');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });
});
