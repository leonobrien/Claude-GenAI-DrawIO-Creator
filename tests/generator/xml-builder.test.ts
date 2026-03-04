import { describe, it, expect } from 'vitest';
import { buildNodeXml, buildEdgeXml, buildContainerXml, buildDiagramXml } from '../../src/generator/xml-builder.js';
import type { DiagramModel, DiagramNode, DiagramEdge, DiagramContainer } from '../../src/types/index.js';

describe('XmlBuilder', () => {
  describe('buildNodeXml', () => {
    it('generates a vertex mxCell with geometry', () => {
      const node: DiagramNode = {
        id: '2',
        label: 'Web Server',
        style: 'rounded=1;whiteSpace=wrap;html=1;',
        x: 100,
        y: 200,
        width: 120,
        height: 60,
      };

      const xml = buildNodeXml(node);
      expect(xml).toContain('id="2"');
      expect(xml).toContain('value="Web Server"');
      expect(xml).toContain('vertex="1"');
      expect(xml).toContain('parent="1"');
      expect(xml).toContain('x="100"');
      expect(xml).toContain('y="200"');
      expect(xml).toContain('width="120"');
      expect(xml).toContain('height="60"');
    });

    it('uses custom parent when specified', () => {
      const node: DiagramNode = {
        id: '3',
        label: 'Child',
        style: 'rounded=1;',
        x: 10,
        y: 10,
        width: 80,
        height: 40,
        parent: '5',
      };

      const xml = buildNodeXml(node);
      expect(xml).toContain('parent="5"');
    });

    it('escapes special characters in labels', () => {
      const node: DiagramNode = {
        id: '4',
        label: 'A & B <C>',
        style: 'rounded=1;',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };

      const xml = buildNodeXml(node);
      expect(xml).toContain('value="A &amp; B &lt;C&gt;"');
    });
  });

  describe('buildEdgeXml', () => {
    it('generates an edge mxCell with relative geometry', () => {
      const edge: DiagramEdge = {
        id: '10',
        source: '2',
        target: '3',
        style: 'endArrow=classic;html=1;',
      };

      const xml = buildEdgeXml(edge);
      expect(xml).toContain('id="10"');
      expect(xml).toContain('edge="1"');
      expect(xml).toContain('source="2"');
      expect(xml).toContain('target="3"');
      expect(xml).toContain('relative="1"');
    });

    it('includes label when specified', () => {
      const edge: DiagramEdge = {
        id: '11',
        label: 'HTTP',
        source: '2',
        target: '3',
        style: 'endArrow=classic;',
      };

      const xml = buildEdgeXml(edge);
      expect(xml).toContain('value="HTTP"');
    });

    it('generates waypoints when provided', () => {
      const edge: DiagramEdge = {
        id: '12',
        source: '2',
        target: '3',
        style: 'endArrow=classic;',
        waypoints: [
          { x: 200, y: 100 },
          { x: 300, y: 100 },
        ],
      };

      const xml = buildEdgeXml(edge);
      expect(xml).toContain('<Array as="points">');
      expect(xml).toContain('<mxPoint x="200" y="100"/>');
      expect(xml).toContain('<mxPoint x="300" y="100"/>');
    });
  });

  describe('buildContainerXml', () => {
    it('generates a container with connectable="0"', () => {
      const container: DiagramContainer = {
        id: '5',
        label: 'VPC',
        style: 'rounded=1;dashed=1;',
        x: 50,
        y: 50,
        width: 400,
        height: 300,
      };

      const xml = buildContainerXml(container);
      expect(xml).toContain('connectable="0"');
      expect(xml).toContain('vertex="1"');
      expect(xml).toContain('value="VPC"');
    });
  });

  describe('buildDiagramXml', () => {
    it('combines containers, nodes, and edges in order', () => {
      const model: DiagramModel = {
        containers: [{
          id: '5', label: 'Group', style: 's', x: 0, y: 0, width: 400, height: 300,
        }],
        nodes: [{
          id: '2', label: 'A', style: 's', x: 10, y: 10, width: 100, height: 50,
        }],
        edges: [{
          id: '10', source: '2', target: '5', style: 's',
        }],
        metadata: {},
      };

      const xml = buildDiagramXml(model);
      const containerPos = xml.indexOf('id="5"');
      const nodePos = xml.indexOf('id="2"');
      const edgePos = xml.indexOf('id="10"');

      // Containers before nodes before edges
      expect(containerPos).toBeLessThan(nodePos);
      expect(nodePos).toBeLessThan(edgePos);
    });
  });
});
