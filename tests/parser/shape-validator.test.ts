import { describe, it, expect } from 'vitest';
import { validateShapeRenderable, extractStencilRef } from '../../src/parser/shape-validator.js';
import { wrapWithMxFile } from '../../src/generator/xml-wrapper.js';
import { getNotation } from '../../src/notation/registry.js';

describe('ShapeValidator', () => {
  describe('extractStencilRef', () => {
    it('extracts prIcon from Cisco styles', () => {
      const style = 'shape=mxgraph.cisco19.rect;prIcon=router;html=1;';
      expect(extractStencilRef(style)).toBe('prIcon=router');
    });

    it('extracts resIcon from AWS styles', () => {
      const style = 'shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2;html=1;';
      expect(extractStencilRef(style)).toBe('resIcon=mxgraph.aws4.ec2');
    });

    it('extracts shape=mxgraph.* from GCP styles', () => {
      const style = 'html=1;shape=mxgraph.gcp2.compute_engine;fillColor=#4285F4;';
      expect(extractStencilRef(style)).toBe('shape=mxgraph.gcp2.compute_engine');
    });

    it('extracts image=img/lib/ from Azure styles', () => {
      const style = 'aspect=fixed;html=1;image=img/lib/azure2/compute/Virtual_Machine.svg;';
      expect(extractStencilRef(style)).toBe('image=img/lib/azure2/compute/Virtual_Machine.svg');
    });

    it('returns null for generic styles without stencil refs', () => {
      expect(extractStencilRef('rounded=1;whiteSpace=wrap;html=1;')).toBeNull();
      expect(extractStencilRef('rhombus;whiteSpace=wrap;html=1;')).toBeNull();
      expect(extractStencilRef('ellipse;whiteSpace=wrap;html=1;')).toBeNull();
    });

    it('returns null for text styles', () => {
      expect(extractStencilRef('text;html=1;strokeColor=none;fillColor=none;')).toBeNull();
    });
  });

  describe('validateShapeRenderable', () => {
    it('passes for XML with known AWS shapes', () => {
      const aws = getNotation('aws');
      const ec2 = aws.shapes.find(s => s.name === 'EC2 Instance')!;
      const cells = `<mxCell id="2" value="Server" style="${ec2.style}" vertex="1" parent="1"><mxGeometry x="100" y="100" width="78" height="78" as="geometry"/></mxCell>`;
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.checkedCount).toBeGreaterThan(0);
    });

    it('passes for XML with known Azure shapes', () => {
      const azure = getNotation('azure');
      const vm = azure.shapes.find(s => s.name === 'Virtual Machine')!;
      const cells = `<mxCell id="2" value="VM" style="${vm.style}" vertex="1" parent="1"><mxGeometry x="100" y="100" width="50" height="50" as="geometry"/></mxCell>`;
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('passes for XML with known Cisco shapes', () => {
      const cisco = getNotation('cisco');
      const router = cisco.shapes.find(s => s.name === 'Router')!;
      const cells = `<mxCell id="2" value="Core" style="${router.style}" vertex="1" parent="1"><mxGeometry x="100" y="100" width="50" height="50" as="geometry"/></mxCell>`;
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('passes for generic styles (no stencil to validate)', () => {
      const cells = '<mxCell id="2" value="Box" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="120" height="60" as="geometry"/></mxCell>';
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.checkedCount).toBe(0); // No stencil refs to check
    });

    it('warns for invalid stencil references', () => {
      const cells = '<mxCell id="2" value="Bad" style="shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.totally_fake_service;html=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="78" height="78" as="geometry"/></mxCell>';
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].cellId).toBe('2');
      expect(result.issues[0].stencilRef).toContain('totally_fake_service');
      expect(result.issues[0].severity).toBe('warning');
    });

    it('warns for invalid Cisco prIcon', () => {
      const cells = '<mxCell id="2" value="Bad" style="shape=mxgraph.cisco19.rect;prIcon=nonexistent_device;html=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="50" height="50" as="geometry"/></mxCell>';
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].stencilRef).toBe('prIcon=nonexistent_device');
    });

    it('handles mixed valid and invalid shapes', () => {
      const aws = getNotation('aws');
      const ec2 = aws.shapes.find(s => s.name === 'EC2 Instance')!;
      const cells = [
        `<mxCell id="2" value="Good" style="${ec2.style}" vertex="1" parent="1"><mxGeometry x="100" y="100" width="78" height="78" as="geometry"/></mxCell>`,
        '<mxCell id="3" value="Bad" style="shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.fake_thing;html=1;" vertex="1" parent="1"><mxGeometry x="300" y="100" width="78" height="78" as="geometry"/></mxCell>',
        '<mxCell id="4" value="Generic" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="500" y="100" width="120" height="60" as="geometry"/></mxCell>',
      ].join('');
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.valid).toBe(true); // Warnings don't fail validation
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].cellId).toBe('3');
      expect(result.checkedCount).toBe(2); // 2 stencil refs checked (ec2 + fake), generic skipped
    });

    it('skips edge cells (not vertices)', () => {
      const cells = '<mxCell id="2" style="endArrow=classic;html=1;" edge="1" parent="1" source="3" target="4"><mxGeometry relative="1" as="geometry"/></mxCell>';
      const xml = wrapWithMxFile(cells);

      const result = validateShapeRenderable(xml);
      expect(result.checkedCount).toBe(0);
      expect(result.issues).toHaveLength(0);
    });

    it('validates shapes from all notations without false positives', () => {
      const notations = ['aws', 'azure', 'gcp', 'cisco', 'archimate', 'uml', 'bpmn'] as const;
      for (const name of notations) {
        const notation = getNotation(name);
        // Pick the first shape from each notation
        const shape = notation.shapes[0];
        const cells = `<mxCell id="2" value="Test" style="${shape.style}" vertex="1" parent="1"><mxGeometry x="100" y="100" width="${shape.defaultWidth}" height="${shape.defaultHeight}" as="geometry"/></mxCell>`;
        const xml = wrapWithMxFile(cells);

        const result = validateShapeRenderable(xml);
        expect(result.issues).toHaveLength(0);
      }
    });
  });
});
