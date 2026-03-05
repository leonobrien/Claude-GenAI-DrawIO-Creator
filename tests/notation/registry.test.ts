import { describe, it, expect } from 'vitest';
import {
  getNotation,
  findNotation,
  listNotations,
  isValidNotation,
  resolveNotationFromShapeLibrary,
  resolveShape,
} from '../../src/notation/registry.js';

describe('NotationRegistry', () => {
  describe('getNotation', () => {
    it('returns generic notation by default', () => {
      const notation = getNotation();
      expect(notation.name).toBe('generic');
    });

    it('returns generic notation for undefined', () => {
      const notation = getNotation(undefined);
      expect(notation.name).toBe('generic');
    });

    it('returns aws notation', () => {
      const notation = getNotation('aws');
      expect(notation.name).toBe('aws');
      expect(notation.displayName).toBe('AWS Architecture');
    });

    it('returns azure notation', () => {
      const notation = getNotation('azure');
      expect(notation.name).toBe('azure');
      expect(notation.displayName).toBe('Azure Architecture');
    });

    it('returns archimate notation', () => {
      const notation = getNotation('archimate');
      expect(notation.name).toBe('archimate');
      expect(notation.displayName).toBe('ArchiMate 3.x');
    });

    it('returns gcp notation', () => {
      const notation = getNotation('gcp');
      expect(notation.name).toBe('gcp');
      expect(notation.displayName).toBe('Google Cloud Platform');
    });

    it('returns cisco notation', () => {
      const notation = getNotation('cisco');
      expect(notation.name).toBe('cisco');
      expect(notation.displayName).toBe('Cisco Network');
    });

    it('returns uml notation', () => {
      const notation = getNotation('uml');
      expect(notation.name).toBe('uml');
      expect(notation.displayName).toBe('UML 2.x');
    });

    it('returns bpmn notation', () => {
      const notation = getNotation('bpmn');
      expect(notation.name).toBe('bpmn');
      expect(notation.displayName).toBe('BPMN 2.0');
    });
  });

  describe('findNotation', () => {
    it('returns notation for valid name', () => {
      const notation = findNotation('aws');
      expect(notation).not.toBeNull();
      expect(notation!.name).toBe('aws');
    });

    it('returns null for invalid name', () => {
      const notation = findNotation('nonexistent');
      expect(notation).toBeNull();
    });
  });

  describe('listNotations', () => {
    it('returns all eight notations', () => {
      const notations = listNotations();
      expect(notations).toHaveLength(8);
      const names = notations.map((n) => n.name);
      expect(names).toContain('generic');
      expect(names).toContain('aws');
      expect(names).toContain('azure');
      expect(names).toContain('gcp');
      expect(names).toContain('cisco');
      expect(names).toContain('archimate');
      expect(names).toContain('uml');
      expect(names).toContain('bpmn');
    });
  });

  describe('isValidNotation', () => {
    it('returns true for valid notation names', () => {
      expect(isValidNotation('aws')).toBe(true);
      expect(isValidNotation('azure')).toBe(true);
      expect(isValidNotation('gcp')).toBe(true);
      expect(isValidNotation('cisco')).toBe(true);
      expect(isValidNotation('archimate')).toBe(true);
      expect(isValidNotation('uml')).toBe(true);
      expect(isValidNotation('bpmn')).toBe(true);
      expect(isValidNotation('generic')).toBe(true);
    });

    it('returns false for invalid notation names', () => {
      expect(isValidNotation('terraform')).toBe(false);
      expect(isValidNotation('')).toBe(false);
      expect(isValidNotation('AWS')).toBe(false);
    });
  });

  describe('resolveNotationFromShapeLibrary', () => {
    it('maps AWS-related strings to aws', () => {
      expect(resolveNotationFromShapeLibrary('aws')).toBe('aws');
      expect(resolveNotationFromShapeLibrary('aws4')).toBe('aws');
      expect(resolveNotationFromShapeLibrary('mxgraph.aws4')).toBe('aws');
    });

    it('maps Azure-related strings to azure', () => {
      expect(resolveNotationFromShapeLibrary('azure')).toBe('azure');
      expect(resolveNotationFromShapeLibrary('mxgraph.azure')).toBe('azure');
    });

    it('maps ArchiMate-related strings to archimate', () => {
      expect(resolveNotationFromShapeLibrary('archimate')).toBe('archimate');
      expect(resolveNotationFromShapeLibrary('archimate3')).toBe('archimate');
      expect(resolveNotationFromShapeLibrary('mxgraph.archimate3')).toBe('archimate');
    });

    it('maps GCP-related strings to gcp', () => {
      expect(resolveNotationFromShapeLibrary('gcp')).toBe('gcp');
      expect(resolveNotationFromShapeLibrary('gcp2')).toBe('gcp');
      expect(resolveNotationFromShapeLibrary('mxgraph.gcp2')).toBe('gcp');
      expect(resolveNotationFromShapeLibrary('google cloud')).toBe('gcp');
    });

    it('maps Cisco-related strings to cisco', () => {
      expect(resolveNotationFromShapeLibrary('cisco')).toBe('cisco');
      expect(resolveNotationFromShapeLibrary('cisco19')).toBe('cisco');
      expect(resolveNotationFromShapeLibrary('mxgraph.cisco19')).toBe('cisco');
    });

    it('maps UML to uml', () => {
      expect(resolveNotationFromShapeLibrary('uml')).toBe('uml');
    });

    it('maps BPMN-related strings to bpmn', () => {
      expect(resolveNotationFromShapeLibrary('bpmn')).toBe('bpmn');
      expect(resolveNotationFromShapeLibrary('mxgraph.bpmn')).toBe('bpmn');
    });

    it('maps generic/default to generic', () => {
      expect(resolveNotationFromShapeLibrary('generic')).toBe('generic');
      expect(resolveNotationFromShapeLibrary('default')).toBe('generic');
    });

    it('returns generic for unrecognised strings', () => {
      expect(resolveNotationFromShapeLibrary('unknown')).toBe('generic');
    });

    it('returns generic for undefined', () => {
      expect(resolveNotationFromShapeLibrary(undefined)).toBe('generic');
    });

    it('handles case-insensitively', () => {
      expect(resolveNotationFromShapeLibrary('AWS')).toBe('aws');
      expect(resolveNotationFromShapeLibrary('Azure')).toBe('azure');
    });
  });

  describe('resolveShape', () => {
    it('returns exact match', () => {
      const shape = resolveShape('aws', 'Lambda');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Lambda');
    });

    it('returns case-insensitive match', () => {
      const shape = resolveShape('aws', 'lambda');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Lambda');
    });

    it('returns partial match when query is substring of name', () => {
      const shape = resolveShape('aws', 'Beanstalk');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Elastic Beanstalk');
    });

    it('returns partial match when name is substring of query', () => {
      const shape = resolveShape('aws', 'Lambda Function');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Lambda');
    });

    it('prefers shortest match on partial', () => {
      const shape = resolveShape('aws', 'ecs');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('ECS');
    });

    it('prefers category-scoped match', () => {
      const shape = resolveShape('aws', 'Service', 'containers');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('ECS Service');
    });

    it('returns null for non-existent shape', () => {
      expect(resolveShape('aws', 'ZZZNoSuchShapeZZZ')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(resolveShape('aws', '')).toBeNull();
    });

    it('returns null for invalid notation', () => {
      expect(resolveShape('terraform' as any, 'Lambda')).toBeNull();
    });

    it('resolves generic shapes', () => {
      const shape = resolveShape('generic', 'Rectangle');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Rectangle');
    });

    it('resolves azure shapes', () => {
      const shape = resolveShape('azure', 'Virtual Machine');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Virtual Machine');
    });

    it('resolves archimate shapes', () => {
      const shape = resolveShape('archimate', 'Business Actor');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Business Actor');
    });

    it('resolves cisco shapes', () => {
      const shape = resolveShape('cisco', 'Router');
      expect(shape).not.toBeNull();
      expect(shape!.name).toBe('Router');
    });

    it('returned shape has all required fields', () => {
      const shape = resolveShape('aws', 'Lambda');
      expect(shape).not.toBeNull();
      expect(shape!.style).toBeTruthy();
      expect(shape!.defaultWidth).toBeGreaterThan(0);
      expect(shape!.defaultHeight).toBeGreaterThan(0);
    });
  });

  describe('all notations have required fields', () => {
    const notations = listNotations();

    for (const notation of notations) {
      it(`${notation.name} has all required fields`, () => {
        expect(notation.name).toBeTruthy();
        expect(notation.displayName).toBeTruthy();
        expect(notation.description).toBeTruthy();
        expect(notation.shapes.length).toBeGreaterThan(0);
        expect(notation.styleTemplates.vertex).toBeTruthy();
        expect(notation.styleTemplates.edge).toBeTruthy();
        expect(notation.styleTemplates.container).toBeTruthy();
        expect(Object.keys(notation.colours).length).toBeGreaterThan(0);
        expect(notation.layout.preferredFlow).toBeTruthy();
        expect(notation.layout.hints.length).toBeGreaterThan(0);
        expect(notation.fewShotExample).toBeTruthy();
        expect(notation.promptRules.length).toBeGreaterThan(0);
      });

      it(`${notation.name} shapes have valid dimensions`, () => {
        for (const shape of notation.shapes) {
          expect(shape.name).toBeTruthy();
          expect(shape.style).toBeTruthy();
          expect(shape.defaultWidth).toBeGreaterThan(0);
          expect(shape.defaultHeight).toBeGreaterThan(0);
        }
      });
    }
  });
});
