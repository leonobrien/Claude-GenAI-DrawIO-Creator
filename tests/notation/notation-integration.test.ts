import { describe, it, expect } from 'vitest';
import { buildDiagramXml } from '../../src/generator/xml-builder.js';
import { wrapWithMxFile } from '../../src/generator/xml-wrapper.js';
import { buildSystemPrompt } from '../../src/generator/prompt-builder.js';
import { validateSemantics, validateNotationConformance } from '../../src/parser/semantic-validator.js';
import { getNotation } from '../../src/notation/registry.js';
import type { DiagramModel } from '../../src/types/index.js';

describe('Notation Integration', () => {
  describe('buildSystemPrompt with notation', () => {
    it('returns generic few-shot example when no notation specified', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('## Example');
      expect(prompt).toContain('Draw a simple flowchart');
      expect(prompt).not.toContain('## Notation:');
    });

    it('returns same output for explicit generic notation', () => {
      const defaultPrompt = buildSystemPrompt();
      const genericPrompt = buildSystemPrompt('generic');
      expect(defaultPrompt).toBe(genericPrompt);
    });

    it('injects AWS notation section when aws specified', () => {
      const prompt = buildSystemPrompt('aws');
      expect(prompt).toContain('## Notation: AWS Architecture');
      expect(prompt).toContain('### Available Shapes');
      expect(prompt).toContain('EC2 Instance');
      expect(prompt).toContain('mxgraph.aws4');
      expect(prompt).toContain('### Notation Rules');
      expect(prompt).toContain('### Notation Example');
      // Should not contain the generic few-shot
      expect(prompt).not.toContain('## Example');
    });

    it('injects Azure notation section when azure specified', () => {
      const prompt = buildSystemPrompt('azure');
      expect(prompt).toContain('## Notation: Azure Architecture');
      expect(prompt).toContain('Virtual Machine');
      expect(prompt).toContain('img/lib/azure2');
    });

    it('injects ArchiMate notation section when archimate specified', () => {
      const prompt = buildSystemPrompt('archimate');
      expect(prompt).toContain('## Notation: ArchiMate 3.x');
      expect(prompt).toContain('Business Process');
      expect(prompt).toContain('Application Component');
      expect(prompt).toContain('mxgraph.archimate3');
    });

    it('injects GCP notation section when gcp specified', () => {
      const prompt = buildSystemPrompt('gcp');
      expect(prompt).toContain('## Notation: Google Cloud Platform');
      expect(prompt).toContain('Compute Engine');
      expect(prompt).toContain('mxgraph.gcp2');
    });

    it('injects Cisco notation section when cisco specified', () => {
      const prompt = buildSystemPrompt('cisco');
      expect(prompt).toContain('## Notation: Cisco Network');
      expect(prompt).toContain('Router');
      expect(prompt).toContain('mxgraph.cisco19');
    });

    it('injects UML notation section when uml specified', () => {
      const prompt = buildSystemPrompt('uml');
      expect(prompt).toContain('## Notation: UML 2.x');
      expect(prompt).toContain('Class');
      expect(prompt).toContain('Actor');
    });

    it('injects BPMN notation section when bpmn specified', () => {
      const prompt = buildSystemPrompt('bpmn');
      expect(prompt).toContain('## Notation: BPMN 2.0');
      expect(prompt).toContain('Start Event');
      expect(prompt).toContain('mxgraph.bpmn');
    });

    it('still contains base sections when notation specified', () => {
      const prompt = buildSystemPrompt('aws');
      expect(prompt).toContain('## Output Format');
      expect(prompt).toContain('## Edge Routing Rules');
      expect(prompt).toContain('## Layout Constraints');
    });
  });

  describe('DiagramModel with notation shapes', () => {
    it('builds valid XML using AWS notation shapes from catalogue', () => {
      const awsNotation = getNotation('aws');
      const ec2 = awsNotation.shapes.find((s) => s.name === 'EC2 Instance')!;
      const rds = awsNotation.shapes.find((s) => s.name === 'RDS')!;

      const model: DiagramModel = {
        containers: [],
        nodes: [
          { id: '2', label: 'Web Server', style: ec2.style, x: 100, y: 100, width: ec2.defaultWidth, height: ec2.defaultHeight },
          { id: '3', label: 'Database', style: rds.style, x: 300, y: 100, width: rds.defaultWidth, height: rds.defaultHeight },
        ],
        edges: [
          { id: '4', source: '2', target: '3', style: awsNotation.styleTemplates.edge },
        ],
        metadata: { title: 'AWS Test', diagramType: 'infrastructure', notation: 'aws' },
      };

      const bareCells = buildDiagramXml(model);
      const fullXml = wrapWithMxFile(bareCells);

      expect(fullXml).toContain('mxgraph.aws4');
      expect(fullXml).toContain('Web Server');
      expect(fullXml).toContain('Database');

      const semantics = validateSemantics(fullXml, ['Web Server', 'Database']);
      expect(semantics.valid).toBe(true);
    });
  });

  describe('validateNotationConformance', () => {
    it('passes for generic notation (no stencil check)', () => {
      const xml = '<mxCell id="2" value="A" style="rounded=1;html=1;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(xml, 'generic');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('passes for vertices using matching stencil prefix', () => {
      const xml = '<mxCell id="2" value="EC2" style="shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(xml, 'aws');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('warns for vertices not using expected stencil prefix', () => {
      const xml = '<mxCell id="2" value="Server" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(xml, 'aws');
      expect(result.valid).toBe(true); // warnings don't fail
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('warning');
      expect(result.issues[0].message).toContain('mxgraph.aws4');
    });

    it('skips container-like styles (dashed)', () => {
      const xml = [
        '<mxCell id="2" value="VPC" style="dashed=1;fillColor=none;" vertex="1" parent="1"/>',
        '<mxCell id="3" value="EC2" style="shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2;" vertex="1" parent="2"/>',
      ].join('\n');
      const result = validateNotationConformance(xml, 'aws');
      expect(result.issues).toHaveLength(0);
    });

    it('passes for GCP stencil prefix', () => {
      const xml = '<mxCell id="2" value="GKE" style="shape=mxgraph.gcp2.google_kubernetes_engine;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(xml, 'gcp');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('passes for Cisco stencil prefix', () => {
      const xml = '<mxCell id="2" value="Router" style="shape=mxgraph.cisco19.rect;prIcon=mxgraph.cisco19.router;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(xml, 'cisco');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('passes for BPMN stencil prefix', () => {
      const xml = '<mxCell id="2" value="" style="shape=mxgraph.bpmn.shape;perimeter=ellipsePerimeter;outline=standard;symbol=general;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(xml, 'bpmn');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('passes for UML native shapes', () => {
      const xml = '<mxCell id="2" value="MyActor" style="shape=umlActor;verticalLabelPosition=bottom;" vertex="1" parent="1"/>';
      const result = validateNotationConformance(xml, 'uml');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('validateSemantics with notation', () => {
    it('works without notation (backwards compatible)', () => {
      const xml = [
        '<mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1"/>',
        '<mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1"/>',
        '<mxCell id="4" style="endArrow=classic;" edge="1" parent="1" source="2" target="3"/>',
      ].join('\n');

      const result = validateSemantics(xml, ['A', 'B']);
      expect(result.valid).toBe(true);
    });

    it('includes notation conformance issues when notation provided', () => {
      const xml = [
        '<mxCell id="2" value="Server" style="rounded=1;html=1;" vertex="1" parent="1"/>',
        '<mxCell id="3" value="DB" style="rounded=1;html=1;" vertex="1" parent="1"/>',
        '<mxCell id="4" style="endArrow=classic;" edge="1" parent="1" source="2" target="3"/>',
      ].join('\n');

      const result = validateSemantics(xml, ['Server', 'DB'], 'aws');
      expect(result.valid).toBe(true); // warnings don't fail
      expect(result.issues.some((i) => i.message.includes('mxgraph.aws4'))).toBe(true);
    });
  });
});
