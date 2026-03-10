import { describe, it, expect } from 'vitest';
import {
  getTemplate,
  listTemplates,
  listTemplatesByNotation,
  listTemplatesByCategory,
  searchTemplates,
} from '../../src/templates/registry.js';
import { buildDiagramXml } from '../../src/generator/xml-builder.js';
import { wrapWithMxFile } from '../../src/generator/xml-wrapper.js';
import { validateAndFixXml } from '../../src/parser/index.js';
import { validateShapeRenderable } from '../../src/parser/shape-validator.js';

describe('TemplateRegistry', () => {
  describe('getTemplate', () => {
    it('returns a template by exact name', () => {
      const t = getTemplate('three-tier-web-app');
      expect(t).toBeDefined();
      expect(t!.displayName).toBe('Three-Tier Web Application');
    });

    it('returns undefined for unknown name', () => {
      expect(getTemplate('nonexistent')).toBeUndefined();
    });
  });

  describe('listTemplates', () => {
    it('returns all 8 templates', () => {
      expect(listTemplates()).toHaveLength(8);
    });

    it('each template has required fields', () => {
      for (const t of listTemplates()) {
        expect(t.name).toBeTruthy();
        expect(t.displayName).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(t.diagramType).toBeTruthy();
        expect(t.notations.length).toBeGreaterThan(0);
        expect(t.tags.length).toBeGreaterThan(0);
        expect(typeof t.build).toBe('function');
        expect(Object.keys(t.defaultParams).length).toBeGreaterThan(0);
      }
    });
  });

  describe('listTemplatesByNotation', () => {
    it('returns generic templates', () => {
      const templates = listTemplatesByNotation('generic');
      expect(templates.length).toBeGreaterThanOrEqual(4);
      expect(templates.every(t => t.notations.includes('generic'))).toBe(true);
    });

    it('returns cisco templates', () => {
      const templates = listTemplatesByNotation('cisco');
      expect(templates.length).toBeGreaterThanOrEqual(1);
      expect(templates.some(t => t.name === 'hub-spoke-network')).toBe(true);
    });

    it('returns bpmn templates', () => {
      const templates = listTemplatesByNotation('bpmn');
      expect(templates.length).toBeGreaterThanOrEqual(1);
    });

    it('returns uml templates', () => {
      const templates = listTemplatesByNotation('uml');
      expect(templates.length).toBeGreaterThanOrEqual(1);
    });

    it('returns archimate templates', () => {
      const templates = listTemplatesByNotation('archimate');
      expect(templates.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('listTemplatesByCategory', () => {
    it('returns infrastructure templates', () => {
      const templates = listTemplatesByCategory('infrastructure');
      expect(templates.length).toBeGreaterThanOrEqual(4);
    });

    it('returns process templates', () => {
      const templates = listTemplatesByCategory('process');
      expect(templates.length).toBeGreaterThanOrEqual(1);
    });

    it('returns software templates', () => {
      const templates = listTemplatesByCategory('software');
      expect(templates.length).toBeGreaterThanOrEqual(1);
    });

    it('returns network templates', () => {
      const templates = listTemplatesByCategory('network');
      expect(templates.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('searchTemplates', () => {
    it('finds templates by tag', () => {
      const results = searchTemplates('microservices');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].name).toBe('microservices');
    });

    it('finds templates by description keyword', () => {
      const results = searchTemplates('pipeline');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('finds templates by notation tag', () => {
      const results = searchTemplates('cisco');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty for no match', () => {
      expect(searchTemplates('xyznonexistent')).toHaveLength(0);
    });
  });
});

describe('Template builds', () => {
  const templates = listTemplates();

  for (const template of templates) {
    describe(template.displayName, () => {
      it('builds a valid DiagramModel with defaults', () => {
        const model = template.build();
        expect(model.metadata).toBeDefined();
        expect(model.nodes.length + model.containers.length).toBeGreaterThan(0);
      });

      it('generates valid XML', () => {
        const model = template.build();
        const bareCells = buildDiagramXml(model);
        const xml = wrapWithMxFile(bareCells, template.displayName);
        const result = validateAndFixXml(xml);
        expect(result.validation.valid).toBe(true);
      });

      it('passes shape pre-flight check', () => {
        const model = template.build();
        const bareCells = buildDiagramXml(model);
        const xml = wrapWithMxFile(bareCells, template.displayName);
        const shapeResult = validateShapeRenderable(xml);
        // No errors (warnings acceptable for generic shapes)
        expect(shapeResult.valid).toBe(true);
      });

      it('accepts custom params', () => {
        const customParams = { title: 'Custom Title' };
        const model = template.build(customParams);
        expect(model.metadata.title).toBe('Custom Title');
      });

      it('has unique node/container IDs', () => {
        const model = template.build();
        const ids = [
          ...model.nodes.map(n => n.id),
          ...model.containers.map(c => c.id),
          ...model.edges.map(e => e.id),
        ];
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      it('edges reference valid source/target IDs', () => {
        const model = template.build();
        const nodeIds = new Set([
          ...model.nodes.map(n => n.id),
          ...model.containers.map(c => c.id),
        ]);
        for (const edge of model.edges) {
          expect(nodeIds.has(edge.source)).toBe(true);
          expect(nodeIds.has(edge.target)).toBe(true);
        }
      });

      it('parent references are valid container IDs', () => {
        const model = template.build();
        const containerIds = new Set(model.containers.map(c => c.id));
        for (const node of model.nodes) {
          if (node.parent) {
            expect(containerIds.has(node.parent)).toBe(true);
          }
        }
      });
    });
  }
});
