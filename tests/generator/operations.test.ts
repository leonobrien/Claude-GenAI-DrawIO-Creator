import { describe, it, expect } from 'vitest';
import { applyOperations } from '../../src/generator/operations.js';
import { wrapWithMxFile } from '../../src/generator/xml-wrapper.js';

describe('Operations', () => {
  const BASE_XML = wrapWithMxFile([
    '<mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="120" height="60" as="geometry"/></mxCell>',
    '<mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="300" y="100" width="120" height="60" as="geometry"/></mxCell>',
    '<mxCell id="10" style="endArrow=classic;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell>',
  ].join('\n'));

  describe('update', () => {
    it('replaces an existing cell by ID', () => {
      const result = applyOperations(BASE_XML, [{
        operation: 'update',
        cell_id: '2',
        new_xml: '<mxCell id="2" value="Updated" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="120" height="60" as="geometry"/></mxCell>',
      }]);

      expect(result.xml).toContain('value="Updated"');
      expect(result.applied).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('reports error for non-existent cell', () => {
      const result = applyOperations(BASE_XML, [{
        operation: 'update',
        cell_id: '99',
        new_xml: '<mxCell id="99" value="X" vertex="1" parent="1"/>',
      }]);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('not found');
    });
  });

  describe('add', () => {
    it('appends a new cell before </root>', () => {
      const result = applyOperations(BASE_XML, [{
        operation: 'add',
        cell_id: '4',
        new_xml: '<mxCell id="4" value="C" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="500" y="100" width="120" height="60" as="geometry"/></mxCell>',
      }]);

      expect(result.xml).toContain('id="4"');
      expect(result.xml).toContain('value="C"');
      expect(result.applied).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('removes a cell by ID', () => {
      const result = applyOperations(BASE_XML, [{
        operation: 'delete',
        cell_id: '3',
      }]);

      expect(result.xml).not.toContain('id="3"');
      expect(result.applied).toHaveLength(1);
    });

    it('cascade deletes edges referencing the deleted cell', () => {
      const result = applyOperations(BASE_XML, [{
        operation: 'delete',
        cell_id: '2',
      }]);

      // Cell 2 and its edge (10) should both be removed
      expect(result.xml).not.toContain('id="2"');
      expect(result.xml).not.toContain('id="10"');
      // Cell 3 should remain
      expect(result.xml).toContain('id="3"');
    });
  });
});
