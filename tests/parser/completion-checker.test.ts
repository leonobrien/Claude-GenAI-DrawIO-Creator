import { describe, it, expect } from 'vitest';
import { isMxCellXmlComplete, extractCompleteMxCells } from '../../src/parser/completion-checker.js';

describe('CompletionChecker', () => {
  describe('isMxCellXmlComplete', () => {
    it('returns true for complete self-closing mxCell', () => {
      const xml = '<mxCell id="2" value="A" vertex="1" parent="1"/>';
      expect(isMxCellXmlComplete(xml)).toBe(true);
    });

    it('returns true for complete mxCell with children', () => {
      const xml = '<mxCell id="2" value="A" vertex="1" parent="1"><mxGeometry x="0" y="0" width="100" height="50" as="geometry"/></mxCell>';
      expect(isMxCellXmlComplete(xml)).toBe(true);
    });

    it('returns false for truncated mxCell', () => {
      const xml = '<mxCell id="2" value="A" vertex="1" parent="1"><mxGeometry x="0" y="0';
      expect(isMxCellXmlComplete(xml)).toBe(false);
    });

    it('returns false for empty input', () => {
      expect(isMxCellXmlComplete('')).toBe(false);
    });

    it('returns false for unclosed mxCell tag', () => {
      const xml = '<mxCell id="2" value="A" vertex="1" parent="1"><mxGeometry x="0" y="0" width="100" height="50" as="geometry"/>';
      expect(isMxCellXmlComplete(xml)).toBe(false);
    });

    it('handles multiple complete cells', () => {
      const xml = [
        '<mxCell id="2" value="A" vertex="1" parent="1"/>',
        '<mxCell id="3" value="B" vertex="1" parent="1"/>',
      ].join('\n');
      expect(isMxCellXmlComplete(xml)).toBe(true);
    });
  });

  describe('extractCompleteMxCells', () => {
    it('extracts only complete cells from partial XML', () => {
      const xml = [
        '<mxCell id="2" value="A" vertex="1" parent="1"/>',
        '<mxCell id="3" value="B" vertex="1" parent="1"><mxGeometry x="0" y="0" width="100" height="50" as="geometry"/></mxCell>',
        '<mxCell id="4" value="C" vertex="1" parent="1"><mxGeometry x="0" y="0',
      ].join('\n');

      const result = extractCompleteMxCells(xml);
      expect(result).toContain('id="2"');
      expect(result).toContain('id="3"');
      expect(result).not.toContain('id="4"');
    });
  });
});
