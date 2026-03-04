import { describe, it, expect } from 'vitest';
import { validateLayout, applyConstraints, getCentre } from '../../src/generator/layout-engine.js';
import type { DiagramModel } from '../../src/types/index.js';

describe('LayoutEngine', () => {
  describe('validateLayout', () => {
    it('reports no violations for valid layout', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [{
          id: '2', label: 'A', style: 's', x: 40, y: 40, width: 120, height: 60,
        }],
        edges: [],
        metadata: {},
      };

      const violations = validateLayout(model);
      expect(violations).toHaveLength(0);
    });

    it('reports elements exceeding maxX', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [{
          id: '2', label: 'A', style: 's', x: 750, y: 40, width: 120, height: 60,
        }],
        edges: [],
        metadata: {},
      };

      const violations = validateLayout(model);
      expect(violations.some((v) => v.includes('exceeds maxX'))).toBe(true);
    });

    it('reports overlapping elements', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [
          { id: '2', label: 'A', style: 's', x: 100, y: 100, width: 120, height: 60 },
          { id: '3', label: 'B', style: 's', x: 150, y: 120, width: 120, height: 60 },
        ],
        edges: [],
        metadata: {},
      };

      const violations = validateLayout(model);
      expect(violations.some((v) => v.includes('overlap'))).toBe(true);
    });
  });

  describe('applyConstraints', () => {
    it('clamps nodes to canvas bounds', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [{
          id: '2', label: 'A', style: 's', x: 900, y: 700, width: 120, height: 60,
        }],
        edges: [],
        metadata: {},
      };

      const result = applyConstraints(model);
      expect(result.nodes[0].x).toBeLessThanOrEqual(800 - 120 - 40);
      expect(result.nodes[0].y).toBeLessThanOrEqual(600 - 60 - 40);
    });
  });

  describe('getCentre', () => {
    it('calculates centre point', () => {
      const centre = getCentre({ x: 100, y: 200, width: 120, height: 60 });
      expect(centre.x).toBe(160);
      expect(centre.y).toBe(230);
    });
  });
});
