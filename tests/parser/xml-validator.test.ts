import { describe, it, expect } from 'vitest';
import { validateXml } from '../../src/parser/xml-validator.js';

describe('XmlValidator', () => {
  const VALID_XML = [
    '<mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1">',
    '  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1">',
    '  <mxGeometry x="300" y="100" width="120" height="60" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="4" style="endArrow=classic;" edge="1" parent="1" source="2" target="3">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
  ].join('\n');

  it('accepts valid XML', () => {
    const result = validateXml(VALID_XML);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects empty input', () => {
    const result = validateXml('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Empty XML input');
  });

  it('detects duplicate IDs', () => {
    const xml = [
      '<mxCell id="2" value="A" vertex="1" parent="1"/>',
      '<mxCell id="2" value="B" vertex="1" parent="1"/>',
    ].join('\n');

    const result = validateXml(xml);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  it('detects orphaned edge references', () => {
    const xml = [
      '<mxCell id="2" value="A" vertex="1" parent="1"/>',
      '<mxCell id="10" edge="1" parent="1" source="2" target="99"/>',
    ].join('\n');

    const result = validateXml(xml);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('non-existent target="99"'))).toBe(true);
  });

  it('warns on unescaped ampersands', () => {
    const xml = '<mxCell id="2" value="A & B" vertex="1" parent="1"/>';
    const result = validateXml(xml);
    expect(result.warnings.some((w) => w.includes('unescaped &'))).toBe(true);
  });

  it('detects mismatched tags', () => {
    const xml = '<mxCell id="2" value="A" vertex="1" parent="1"><mxGeometry x="0" y="0" width="100" height="50" as="geometry"/></mxGeometry>';
    const result = validateXml(xml);
    // The extra </mxGeometry> is mismatched since the inner one was self-closing
    expect(result.valid).toBe(false);
  });
});
