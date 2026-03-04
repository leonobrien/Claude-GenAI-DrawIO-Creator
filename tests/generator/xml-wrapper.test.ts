import { describe, it, expect } from 'vitest';
import { wrapWithMxFile, unwrapMxFile } from '../../src/generator/xml-wrapper.js';

describe('XmlWrapper', () => {
  const BARE_CELLS = '<mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="120" height="60" as="geometry"/></mxCell>';

  describe('wrapWithMxFile', () => {
    it('wraps bare cells in full mxfile structure', () => {
      const wrapped = wrapWithMxFile(BARE_CELLS);
      expect(wrapped).toContain('<mxfile>');
      expect(wrapped).toContain('<diagram name="Page-1"');
      expect(wrapped).toContain('<mxGraphModel>');
      expect(wrapped).toContain('<root>');
      expect(wrapped).toContain('<mxCell id="0"/>');
      expect(wrapped).toContain('<mxCell id="1" parent="0"/>');
      expect(wrapped).toContain('id="2"');
      expect(wrapped).toContain('</root>');
      expect(wrapped).toContain('</mxGraphModel>');
      expect(wrapped).toContain('</mxfile>');
    });

    it('strips wrapper tags if AI included them', () => {
      const withWrappers = `<mxfile><diagram><mxGraphModel><root>${BARE_CELLS}</root></mxGraphModel></diagram></mxfile>`;
      const wrapped = wrapWithMxFile(withWrappers);

      // Should not have double wrappers
      const mxfileCount = (wrapped.match(/<mxfile>/g) ?? []).length;
      expect(mxfileCount).toBe(1);
    });

    it('removes duplicate root cells', () => {
      const withRoots = `<mxCell id="0"/><mxCell id="1" parent="0"/>${BARE_CELLS}`;
      const wrapped = wrapWithMxFile(withRoots);

      // Root cells should appear exactly once
      const id0Count = (wrapped.match(/id="0"/g) ?? []).length;
      expect(id0Count).toBe(1);
    });

    it('accepts custom page name', () => {
      const wrapped = wrapWithMxFile(BARE_CELLS, 'My Diagram');
      expect(wrapped).toContain('name="My Diagram"');
    });
  });

  describe('unwrapMxFile', () => {
    it('extracts bare cells from full mxfile structure', () => {
      const wrapped = wrapWithMxFile(BARE_CELLS);
      const unwrapped = unwrapMxFile(wrapped);
      expect(unwrapped).toContain('id="2"');
      expect(unwrapped).not.toContain('<mxfile>');
      expect(unwrapped).not.toContain('<mxGraphModel>');
      expect(unwrapped).not.toContain('id="0"');
      expect(unwrapped).not.toContain('id="1"');
    });
  });
});
