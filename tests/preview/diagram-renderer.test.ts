import { describe, it, expect } from 'vitest';
import { renderPreview } from '../../src/preview/diagram-renderer.js';
import type { DiagramModel } from '../../src/types/index.js';
import { listTemplates } from '../../src/templates/registry.js';

function simpleModel(): DiagramModel {
  return {
    containers: [],
    nodes: [
      { id: '2', label: 'Start', style: '', x: 40, y: 200, width: 120, height: 60 },
      { id: '3', label: 'Process', style: '', x: 240, y: 200, width: 120, height: 60 },
      { id: '4', label: 'End', style: '', x: 440, y: 200, width: 120, height: 60 },
    ],
    edges: [
      { id: '5', source: '2', target: '3', style: '' },
      { id: '6', source: '3', target: '4', style: '' },
    ],
    metadata: { title: 'Simple Flow', diagramType: 'flowchart' },
  };
}

function containerModel(): DiagramModel {
  return {
    containers: [
      { id: '2', label: 'VPC', style: '', x: 40, y: 40, width: 400, height: 200 },
    ],
    nodes: [
      { id: '10', label: 'Server', style: '', x: 30, y: 60, width: 100, height: 50, parent: '2' },
      { id: '11', label: 'Database', style: '', x: 250, y: 60, width: 100, height: 50, parent: '2' },
    ],
    edges: [
      { id: '20', source: '10', target: '11', style: '' },
    ],
    metadata: { title: 'Container Test', diagramType: 'infrastructure' },
  };
}

describe('renderPreview', () => {
  it('returns a non-empty string', () => {
    const output = renderPreview(simpleModel());
    expect(output.length).toBeGreaterThan(0);
  });

  it('contains the diagram title', () => {
    const output = renderPreview(simpleModel());
    expect(output).toContain('Simple Flow');
  });

  it('contains node labels', () => {
    const output = renderPreview(simpleModel());
    expect(output).toContain('Start');
    expect(output).toContain('Process');
    expect(output).toContain('End');
  });

  it('contains box-drawing characters', () => {
    const output = renderPreview(simpleModel());
    // Should have rounded box corners by default
    expect(output).toMatch(/[╭╮╰╯─│]/);
  });

  it('contains arrow characters for edges', () => {
    const output = renderPreview(simpleModel());
    expect(output).toMatch(/[►◄▼▲]/);
  });

  it('respects custom width and height', () => {
    const output = renderPreview(simpleModel(), { width: 60, height: 20 });
    const lines = output.split('\n');
    expect(lines.length).toBeLessThanOrEqual(20);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(60);
    }
  });

  it('uses single box style when specified', () => {
    const output = renderPreview(simpleModel(), { boxStyle: 'single' });
    expect(output).toMatch(/[┌┐└┘]/);
  });

  it('renders containers as double-line boxes', () => {
    const output = renderPreview(containerModel());
    expect(output).toMatch(/[╔╗╚╝═║]/);
  });

  it('renders container label', () => {
    const output = renderPreview(containerModel());
    expect(output).toContain('VPC');
  });

  it('renders child nodes inside containers', () => {
    const output = renderPreview(containerModel());
    expect(output).toContain('Server');
    expect(output).toContain('Database');
  });

  it('renders edge labels when enabled', () => {
    const model: DiagramModel = {
      containers: [],
      nodes: [
        { id: '2', label: 'A', style: '', x: 40, y: 200, width: 100, height: 50 },
        { id: '3', label: 'B', style: '', x: 300, y: 200, width: 100, height: 50 },
      ],
      edges: [
        { id: '5', source: '2', target: '3', style: '', label: 'HTTPS' },
      ],
      metadata: { title: 'Edge Labels', diagramType: 'infrastructure' },
    };
    const output = renderPreview(model, { showEdgeLabels: true });
    expect(output).toContain('HTTPS');
  });

  it('hides edge labels when disabled', () => {
    const model: DiagramModel = {
      containers: [],
      nodes: [
        { id: '2', label: 'A', style: '', x: 40, y: 200, width: 100, height: 50 },
        { id: '3', label: 'B', style: '', x: 300, y: 200, width: 100, height: 50 },
      ],
      edges: [
        { id: '5', source: '2', target: '3', style: '', label: 'HTTPS' },
      ],
      metadata: { title: 'No Labels', diagramType: 'infrastructure' },
    };
    const output = renderPreview(model, { showEdgeLabels: false });
    expect(output).not.toContain('HTTPS');
  });

  it('handles empty model gracefully', () => {
    const model: DiagramModel = {
      containers: [],
      nodes: [],
      edges: [],
      metadata: { title: 'Empty' },
    };
    const output = renderPreview(model);
    expect(output).toContain('Empty');
  });

  it('handles model with no title', () => {
    const model: DiagramModel = {
      containers: [],
      nodes: [{ id: '2', label: 'Solo', style: '', x: 100, y: 100, width: 100, height: 50 }],
      edges: [],
      metadata: {},
    };
    const output = renderPreview(model);
    expect(output).toContain('Solo');
  });

  describe('renders all templates without errors', () => {
    for (const template of listTemplates()) {
      it(`renders ${template.displayName}`, () => {
        const model = template.build();
        const output = renderPreview(model);
        expect(output.length).toBeGreaterThan(0);
        // Should contain at least one box-drawing character
        expect(output).toMatch(/[╭╮╰╯┌┐└┘╔╗╚╝─│═║]/);
      });
    }
  });
});
