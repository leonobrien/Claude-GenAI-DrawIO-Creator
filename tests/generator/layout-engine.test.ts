import { describe, it, expect } from 'vitest';
import { validateLayout, applyConstraints, getCentre, resolveOverlaps } from '../../src/generator/layout-engine.js';
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

  describe('resolveOverlaps', () => {
    it('returns 0 displacements when no overlaps exist', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [
          { id: '2', label: 'A', style: 's', x: 40, y: 40, width: 100, height: 50 },
          { id: '3', label: 'B', style: 's', x: 200, y: 40, width: 100, height: 50 },
        ],
        edges: [],
        metadata: {},
      };

      const result = resolveOverlaps(model);
      expect(result.displacements).toBe(0);
      expect(result.model.nodes[0].x).toBe(40);
      expect(result.model.nodes[1].x).toBe(200);
    });

    it('separates two overlapping siblings', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [
          { id: '2', label: 'A', style: 's', x: 100, y: 100, width: 120, height: 60 },
          { id: '3', label: 'B', style: 's', x: 150, y: 120, width: 120, height: 60 },
        ],
        edges: [],
        metadata: {},
      };

      const result = resolveOverlaps(model, 10);
      expect(result.displacements).toBeGreaterThan(0);

      // After resolution, boxes should not overlap (with gap=10)
      const a = result.model.nodes[0];
      const b = result.model.nodes[1];
      const noOverlap =
        a.x + a.width + 10 <= b.x ||
        b.x + b.width + 10 <= a.x ||
        a.y + a.height + 10 <= b.y ||
        b.y + b.height + 10 <= a.y;
      expect(noOverlap).toBe(true);
    });

    it('only compares siblings with the same parent', () => {
      const model: DiagramModel = {
        containers: [
          { id: 'c1', label: 'Container 1', style: 's', x: 40, y: 40, width: 300, height: 200 },
          { id: 'c2', label: 'Container 2', style: 's', x: 400, y: 40, width: 300, height: 200 },
        ],
        nodes: [
          { id: '2', label: 'A', style: 's', x: 10, y: 10, width: 100, height: 50, parent: 'c1' },
          { id: '3', label: 'B', style: 's', x: 10, y: 10, width: 100, height: 50, parent: 'c2' },
        ],
        edges: [],
        metadata: {},
      };

      // Same coordinates but different parents — should NOT be displaced
      const result = resolveOverlaps(model);
      expect(result.displacements).toBe(0);
    });

    it('resolves overlaps among children of the same container', () => {
      const model: DiagramModel = {
        containers: [
          { id: 'c1', label: 'Container', style: 's', x: 40, y: 40, width: 400, height: 300 },
        ],
        nodes: [
          { id: '2', label: 'A', style: 's', x: 10, y: 10, width: 100, height: 50, parent: 'c1' },
          { id: '3', label: 'B', style: 's', x: 30, y: 20, width: 100, height: 50, parent: 'c1' },
        ],
        edges: [],
        metadata: {},
      };

      const result = resolveOverlaps(model, 10);
      expect(result.displacements).toBeGreaterThan(0);
    });

    it('does not mutate the input model', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [
          { id: '2', label: 'A', style: 's', x: 100, y: 100, width: 120, height: 60 },
          { id: '3', label: 'B', style: 's', x: 110, y: 110, width: 120, height: 60 },
        ],
        edges: [],
        metadata: {},
      };

      const origX = model.nodes[0].x;
      resolveOverlaps(model);
      expect(model.nodes[0].x).toBe(origX);
    });

    it('handles three overlapping elements', () => {
      const model: DiagramModel = {
        containers: [],
        nodes: [
          { id: '2', label: 'A', style: 's', x: 100, y: 100, width: 100, height: 50 },
          { id: '3', label: 'B', style: 's', x: 120, y: 110, width: 100, height: 50 },
          { id: '4', label: 'C', style: 's', x: 140, y: 120, width: 100, height: 50 },
        ],
        edges: [],
        metadata: {},
      };

      const result = resolveOverlaps(model, 5);
      expect(result.displacements).toBeGreaterThan(0);

      // All three should be non-overlapping after resolution
      const [a, b, c] = result.model.nodes;
      const check = (n1: typeof a, n2: typeof a, gap: number) =>
        n1.x + n1.width + gap <= n2.x ||
        n2.x + n2.width + gap <= n1.x ||
        n1.y + n1.height + gap <= n2.y ||
        n2.y + n2.height + gap <= n1.y;

      expect(check(a, b, 5)).toBe(true);
      expect(check(a, c, 5)).toBe(true);
      expect(check(b, c, 5)).toBe(true);
    });
  });
});
