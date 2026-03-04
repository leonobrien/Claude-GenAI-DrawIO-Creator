import { describe, it, expect } from 'vitest';
import { fixXml } from '../../src/parser/xml-fixer.js';

describe('XmlFixer', () => {
  it('fixes JSON-escaped XML', () => {
    const escaped = '<mxCell id=\\"2\\" value=\\"A\\" vertex=\\"1\\" parent=\\"1\\"/>';
    const result = fixXml(escaped);
    expect(result.xml).toContain('id="2"');
    expect(result.fixesApplied.some((f) => f.includes('JSON escaping'))).toBe(true);
  });

  it('removes CDATA wrappers', () => {
    const xml = '<![CDATA[<mxCell id="2" vertex="1" parent="1"/>]]>';
    const result = fixXml(xml);
    expect(result.xml).not.toContain('CDATA');
    expect(result.xml).toContain('<mxCell');
  });

  it('strips markdown code fences', () => {
    const xml = '```xml\n<mxCell id="2" vertex="1" parent="1"/>\n```';
    const result = fixXml(xml);
    expect(result.xml).not.toContain('```');
    expect(result.xml).toContain('<mxCell');
  });

  it('escapes bare ampersands', () => {
    const xml = '<mxCell id="2" value="A & B" vertex="1" parent="1"/>';
    const result = fixXml(xml);
    expect(result.xml).toContain('&amp;');
  });

  it('fixes <Cell> to <mxCell>', () => {
    const xml = '<Cell id="2" value="A" vertex="1" parent="1"/>';
    const result = fixXml(xml);
    expect(result.xml).toContain('<mxCell');
    expect(result.xml).not.toContain('<Cell');
  });

  it('fixes duplicate IDs', () => {
    const xml = [
      '<mxCell id="2" value="A" vertex="1" parent="1"/>',
      '<mxCell id="2" value="B" vertex="1" parent="1"/>',
    ].join('\n');
    const result = fixXml(xml);
    expect(result.xml).toContain('id="2"');
    expect(result.xml).toContain('id="2_dup1"');
  });

  it('fixes double-escaped entities', () => {
    const xml = '<mxCell id="2" value="A &amp;amp; B" vertex="1" parent="1"/>';
    const result = fixXml(xml);
    expect(result.xml).toContain('&amp;');
    expect(result.xml).not.toContain('&amp;amp;');
  });

  it('removes leading garbage text', () => {
    const xml = 'Here is the XML:\n<mxCell id="2" vertex="1" parent="1"/>';
    const result = fixXml(xml);
    expect(result.xml).toMatch(/^<mxCell/);
  });

  it('returns empty fixesApplied for valid XML', () => {
    const xml = '<mxCell id="2" value="A" vertex="1" parent="1"/>';
    const result = fixXml(xml);
    expect(result.fixesApplied).toHaveLength(0);
  });
});
