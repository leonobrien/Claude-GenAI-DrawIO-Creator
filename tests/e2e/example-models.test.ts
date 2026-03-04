/**
 * End-to-end validation tests.
 *
 * These tests exercise the full pipeline: model creation -> XML generation ->
 * validation -> storage -> versioning -> export.
 *
 * Inspired by the examples at:
 * https://github.com/DayuanJiang/next-ai-draw-io?tab=readme-ov-file#examples
 * (using different prompts but covering the same diagram categories)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { buildDiagramXml } from '../../src/generator/xml-builder.js';
import { wrapWithMxFile } from '../../src/generator/xml-wrapper.js';
import { validateLayout, applyConstraints } from '../../src/generator/layout-engine.js';
import { applyOperations } from '../../src/generator/operations.js';
import { validateXml } from '../../src/parser/xml-validator.js';
import { validateAndFixXml } from '../../src/parser/index.js';
import { validateSemantics } from '../../src/parser/semantic-validator.js';
import { isMxCellXmlComplete } from '../../src/parser/completion-checker.js';
import { ModelStore } from '../../src/storage/model-store.js';
import { VersionManager } from '../../src/storage/version-manager.js';
import { ProjectManager } from '../../src/storage/project-manager.js';
import { ExportManager } from '../../src/storage/export-manager.js';
import { StateManager } from '../../src/state/state-manager.js';
import { buildIndexPayload, payloadToEmbeddingText } from '../../src/vector/diagram-indexer.js';
import { StubEmbeddingProvider } from '../../src/vector/embedding-provider.js';
import type { DiagramModel, StoredModel } from '../../src/types/index.js';

describe('E2E: Example Models', () => {
  let storageRoot: string;
  let modelStore: ModelStore;
  let versionManager: VersionManager;
  let projectManager: ProjectManager;
  let exportManager: ExportManager;
  let stateManager: StateManager;

  beforeEach(async () => {
    storageRoot = await mkdtemp(join(tmpdir(), 'drawio-e2e-'));
    modelStore = new ModelStore(storageRoot);
    versionManager = new VersionManager(storageRoot);
    projectManager = new ProjectManager(storageRoot);
    exportManager = new ExportManager(versionManager);
    stateManager = new StateManager(join(storageRoot, 'state.json'));
    await stateManager.load();
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true });
  });

  /**
   * Example 1: Cloud Infrastructure Architecture (inspired by AWS/GCP/Azure examples)
   * Prompt: "Create a three-tier web application architecture with a load balancer,
   *          application servers, and a database cluster"
   */
  it('E2E: three-tier infrastructure architecture', async () => {
    const project = 'infrastructure';
    await projectManager.ensureExists(project, 'Cloud architecture diagrams');

    // 1. Build diagram model
    const model: DiagramModel = {
      containers: [
        {
          id: 'vpc',
          label: 'Virtual Private Cloud',
          style: 'rounded=1;whiteSpace=wrap;html=1;dashed=1;fillColor=#f5f5f5;strokeColor=#666666;',
          x: 40, y: 40, width: 700, height: 500,
        },
      ],
      nodes: [
        {
          id: 'lb',
          label: 'Load Balancer',
          style: 'shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.elb;rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;',
          x: 280, y: 60, width: 120, height: 60, parent: 'vpc',
        },
        {
          id: 'app1',
          label: 'App Server 1',
          style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
          x: 80, y: 200, width: 120, height: 60, parent: 'vpc',
        },
        {
          id: 'app2',
          label: 'App Server 2',
          style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
          x: 280, y: 200, width: 120, height: 60, parent: 'vpc',
        },
        {
          id: 'app3',
          label: 'App Server 3',
          style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
          x: 480, y: 200, width: 120, height: 60, parent: 'vpc',
        },
        {
          id: 'db-primary',
          label: 'Primary DB',
          style: 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#fff2cc;strokeColor=#d6b656;',
          x: 180, y: 360, width: 100, height: 80, parent: 'vpc',
        },
        {
          id: 'db-replica',
          label: 'Replica DB',
          style: 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#fff2cc;strokeColor=#d6b656;',
          x: 380, y: 360, width: 100, height: 80, parent: 'vpc',
        },
      ],
      edges: [
        { id: 'e1', source: 'lb', target: 'app1', style: 'endArrow=classic;html=1;exitX=0;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e2', source: 'lb', target: 'app2', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e3', source: 'lb', target: 'app3', style: 'endArrow=classic;html=1;exitX=1;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e4', source: 'app1', target: 'db-primary', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e5', source: 'app2', target: 'db-primary', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e6', source: 'app3', target: 'db-replica', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e7', label: 'Replication', source: 'db-primary', target: 'db-replica', style: 'endArrow=classic;html=1;dashed=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
      ],
      metadata: {
        title: 'Three-Tier Web Architecture',
        description: 'Load balancer distributing to three app servers with primary/replica database cluster',
        diagramType: 'infrastructure',
      },
    };

    // 2. Generate XML
    const bareCells = buildDiagramXml(model);
    expect(isMxCellXmlComplete(bareCells)).toBe(true);

    // 3. Wrap in mxfile
    const fullXml = wrapWithMxFile(bareCells);

    // 4. Validate XML structure
    const validation = validateXml(fullXml);
    expect(validation.valid).toBe(true);

    // 5. Semantic validation
    const semantics = validateSemantics(fullXml, [
      'Load Balancer', 'App Server', 'Primary DB', 'Replica DB',
    ]);
    expect(semantics.valid).toBe(true);

    // 6. Layout validation
    const violations = validateLayout(model);
    expect(violations).toHaveLength(0);

    // 7. Store model
    const storedModel: StoredModel = {
      id: 'infra-001',
      name: 'Three-Tier Web Architecture',
      project,
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['infrastructure', 'three-tier', 'load-balancer', 'database'],
      prompt: 'Create a three-tier web application architecture',
      description: model.metadata.description!,
    };

    await modelStore.save(storedModel);
    const v = await versionManager.saveVersion(project, 'infra-001', fullXml, 'Initial generation');
    expect(v).toBe(1);

    // 8. Track state
    stateManager.startOperation({ type: 'generate', project, modelId: 'infra-001' });
    stateManager.completeOperation('generate', 'Generated infrastructure diagram');
    await stateManager.save();

    // 9. Export
    const outputPath = join(storageRoot, 'infra.drawio');
    const exported = await exportManager.exportToFile(project, 'infra-001', outputPath);
    expect(exported).not.toBeNull();

    const exportedContent = await readFile(exported!, 'utf-8');
    expect(exportedContent).toContain('Load Balancer');
    expect(exportedContent).toContain('Primary DB');

    // 10. Index for recall
    const payload = buildIndexPayload(storedModel, fullXml);
    expect(payload.labels).toContain('Load Balancer');
    expect(payload.edges.length).toBeGreaterThan(0);

    const embeddingText = payloadToEmbeddingText(payload);
    const embeddings = new StubEmbeddingProvider(256);
    const vector = await embeddings.embed(embeddingText);
    expect(vector).toHaveLength(256);
  });

  /**
   * Example 2: Process Flowchart (inspired by animated connectors example)
   * Prompt: "Draw a CI/CD pipeline flowchart: Code Commit -> Build -> Test -> Deploy -> Monitor"
   */
  it('E2E: CI/CD pipeline flowchart', async () => {
    const project = 'devops';
    await projectManager.ensureExists(project, 'DevOps diagrams');

    const model: DiagramModel = {
      containers: [],
      nodes: [
        { id: '2', label: 'Code Commit', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;', x: 40, y: 200, width: 120, height: 60 },
        { id: '3', label: 'Build', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 210, y: 200, width: 100, height: 60 },
        { id: '4', label: 'Test', style: 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;', x: 360, y: 185, width: 100, height: 90 },
        { id: '5', label: 'Deploy', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 510, y: 200, width: 100, height: 60 },
        { id: '6', label: 'Monitor', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;', x: 660, y: 200, width: 100, height: 60 },
        { id: '7', label: 'Fix &amp; Retry', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;', x: 360, y: 350, width: 100, height: 50 },
      ],
      edges: [
        { id: 'e1', source: '2', target: '3', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
        { id: 'e2', source: '3', target: '4', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
        { id: 'e3', label: 'Pass', source: '4', target: '5', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
        { id: 'e4', source: '5', target: '6', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
        { id: 'e5', label: 'Fail', source: '4', target: '7', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeColor=#b85450;' },
        { id: 'e6', source: '7', target: '2', style: 'endArrow=classic;html=1;exitX=0;exitY=0.5;entryX=0.5;entryY=1;dashed=1;',
          waypoints: [{ x: 100, y: 375 }],
        },
      ],
      metadata: {
        title: 'CI/CD Pipeline',
        description: 'Continuous integration and deployment pipeline with test branching',
        diagramType: 'flowchart',
      },
    };

    const bareCells = buildDiagramXml(model);
    const fullXml = wrapWithMxFile(bareCells);

    // Validate
    const result = validateAndFixXml(fullXml);
    expect(result.validation.valid).toBe(true);

    const semantics = validateSemantics(fullXml, ['Code Commit', 'Build', 'Test', 'Deploy', 'Monitor']);
    expect(semantics.valid).toBe(true);

    // Store and version
    const storedModel: StoredModel = {
      id: 'cicd-001',
      name: 'CI/CD Pipeline',
      project: 'devops',
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['flowchart', 'cicd', 'devops'],
      prompt: 'Draw a CI/CD pipeline flowchart',
      description: model.metadata.description!,
    };

    await modelStore.save(storedModel);
    await versionManager.saveVersion('devops', 'cicd-001', fullXml, 'Initial');

    // Revise: add a "Staging" step between Deploy and Monitor
    const revised = applyOperations(fullXml, [
      {
        operation: 'add',
        cell_id: '8',
        new_xml: '<mxCell id="8" value="Staging" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="585" y="200" width="100" height="60" as="geometry"/></mxCell>',
      },
      {
        operation: 'update',
        cell_id: 'e4',
        new_xml: '<mxCell id="e4" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="5" target="8"><mxGeometry relative="1" as="geometry"/></mxCell>',
      },
      {
        operation: 'add',
        cell_id: 'e7',
        new_xml: '<mxCell id="e7" style="endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="8" target="6"><mxGeometry relative="1" as="geometry"/></mxCell>',
      },
    ]);

    expect(revised.errors).toHaveLength(0);
    expect(revised.applied).toHaveLength(3);
    expect(revised.xml).toContain('Staging');

    // Save revision
    await versionManager.saveVersion('devops', 'cicd-001', revised.xml, 'Added Staging step');

    const versions = await versionManager.listVersions('devops', 'cicd-001');
    expect(versions).toHaveLength(2);
    expect(versions[1].description).toBe('Added Staging step');
  });

  /**
   * Example 3: Organisation Chart (inspired by creative/cat example — non-technical)
   * Prompt: "Draw an org chart for a small tech company"
   */
  it('E2E: organisation chart', async () => {
    const project = 'org';
    await projectManager.ensureExists(project, 'Organisational diagrams');

    const model: DiagramModel = {
      containers: [],
      nodes: [
        { id: '2', label: 'CEO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;', x: 300, y: 40, width: 120, height: 60 },
        { id: '3', label: 'CTO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 100, y: 160, width: 120, height: 60 },
        { id: '4', label: 'CFO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 300, y: 160, width: 120, height: 60 },
        { id: '5', label: 'COO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 500, y: 160, width: 120, height: 60 },
        { id: '6', label: 'Engineering Lead', style: 'rounded=1;whiteSpace=wrap;html=1;', x: 40, y: 280, width: 120, height: 60 },
        { id: '7', label: 'Design Lead', style: 'rounded=1;whiteSpace=wrap;html=1;', x: 180, y: 280, width: 120, height: 60 },
        { id: '8', label: 'Finance Team', style: 'rounded=1;whiteSpace=wrap;html=1;', x: 300, y: 280, width: 120, height: 60 },
        { id: '9', label: 'Operations Team', style: 'rounded=1;whiteSpace=wrap;html=1;', x: 500, y: 280, width: 120, height: 60 },
      ],
      edges: [
        { id: 'e1', source: '2', target: '3', style: 'endArrow=none;html=1;exitX=0.25;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e2', source: '2', target: '4', style: 'endArrow=none;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e3', source: '2', target: '5', style: 'endArrow=none;html=1;exitX=0.75;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e4', source: '3', target: '6', style: 'endArrow=none;html=1;exitX=0.25;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e5', source: '3', target: '7', style: 'endArrow=none;html=1;exitX=0.75;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e6', source: '4', target: '8', style: 'endArrow=none;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
        { id: 'e7', source: '5', target: '9', style: 'endArrow=none;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
      ],
      metadata: {
        title: 'Company Org Chart',
        diagramType: 'org_chart',
      },
    };

    const bareCells = buildDiagramXml(model);
    const fullXml = wrapWithMxFile(bareCells);

    expect(validateXml(fullXml).valid).toBe(true);
    expect(validateSemantics(fullXml, ['CEO', 'CTO', 'CFO', 'COO']).valid).toBe(true);

    // Store, version, and export
    const storedModel: StoredModel = {
      id: 'org-001',
      name: 'Company Org Chart',
      project: 'org',
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['org-chart', 'company'],
      prompt: 'Draw an org chart for a small tech company',
      description: 'Hierarchical organisation chart with C-suite and team leads',
    };

    await modelStore.save(storedModel);
    await versionManager.saveVersion('org', 'org-001', fullXml, 'Initial');

    // Delete a node and verify cascade
    const afterDelete = applyOperations(fullXml, [{
      operation: 'delete',
      cell_id: '5',
    }]);

    expect(afterDelete.xml).not.toContain('value="COO"');
    expect(afterDelete.xml).not.toContain('id="e7"');  // Edge from COO to Operations removed
    expect(afterDelete.xml).toContain('value="CEO"');   // CEO stays
    expect(afterDelete.applied.length).toBeGreaterThan(0);
  });

  /**
   * Example 4: Cross-project recall via vector indexing
   * Validates the full indexing + recall pipeline using stub embeddings.
   */
  it('E2E: cross-project indexing and recall', async () => {
    // Create models in two different projects
    await projectManager.ensureExists('project-alpha');
    await projectManager.ensureExists('project-beta');

    const modelA: StoredModel = {
      id: 'model-a',
      name: 'Kubernetes Cluster',
      project: 'project-alpha',
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['kubernetes', 'k8s', 'infrastructure'],
      prompt: 'Draw a Kubernetes cluster with pods, services, and ingress',
      description: 'K8s cluster diagram with ingress controller routing to services and pods',
    };

    const modelB: StoredModel = {
      id: 'model-b',
      name: 'Microservice Architecture',
      project: 'project-beta',
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['microservices', 'architecture'],
      prompt: 'Draw a microservice architecture with API gateway and message queue',
      description: 'Event-driven microservice architecture with API gateway, queue, and service mesh',
    };

    const xmlA = '<mxCell id="2" value="Ingress" vertex="1" parent="1"/><mxCell id="3" value="Service" vertex="1" parent="1"/><mxCell id="4" value="Pod" vertex="1" parent="1"/><mxCell id="10" edge="1" parent="1" source="2" target="3"/>';
    const xmlB = '<mxCell id="2" value="API Gateway" vertex="1" parent="1"/><mxCell id="3" value="Message Queue" vertex="1" parent="1"/><mxCell id="10" edge="1" parent="1" source="2" target="3"/>';

    await modelStore.save(modelA);
    await modelStore.save(modelB);

    // Build index payloads
    const payloadA = buildIndexPayload(modelA, xmlA);
    const payloadB = buildIndexPayload(modelB, xmlB);

    expect(payloadA.labels).toContain('Ingress');
    expect(payloadB.labels).toContain('API Gateway');

    // Generate embedding texts
    const textA = payloadToEmbeddingText(payloadA);
    const textB = payloadToEmbeddingText(payloadB);

    expect(textA).toContain('Kubernetes');
    expect(textB).toContain('microservice');

    // Verify embeddings are different
    const embeddings = new StubEmbeddingProvider(128);
    const vecA = await embeddings.embed(textA);
    const vecB = await embeddings.embed(textB);
    expect(vecA).not.toEqual(vecB);

    // Verify same model produces same embedding (deterministic)
    const vecA2 = await embeddings.embed(textA);
    expect(vecA).toEqual(vecA2);

    // Verify findById works across projects
    const found = await modelStore.findById('model-b');
    expect(found).not.toBeNull();
    expect(found!.project).toBe('project-beta');

    // Verify project listing
    const projects = await projectManager.list();
    expect(projects).toHaveLength(2);
  });

  /**
   * Example 5: State recovery after simulated interruption
   */
  it('E2E: state recovery after interruption', async () => {
    await projectManager.ensureExists('recovery-test');

    // Simulate: start generation, crash before completion
    stateManager.setContext('recovery-test', 'model-crash');
    stateManager.startOperation({ type: 'generate', project: 'recovery-test', modelId: 'model-crash' });
    await stateManager.save();

    // Simulate: new session, load state
    const recoveredManager = new StateManager(join(storageRoot, 'state.json'));
    const state = await recoveredManager.load();

    expect(state.activeProject).toBe('recovery-test');
    expect(state.activeModelId).toBe('model-crash');

    const interrupted = recoveredManager.getInterruptedOperations();
    expect(interrupted).toHaveLength(1);
    expect(interrupted[0].type).toBe('generate');

    // Resume: complete the operation
    recoveredManager.completeOperation('generate', 'Recovered and completed');
    await recoveredManager.save();

    const finalState = recoveredManager.getState();
    expect(finalState.pendingOperations).toHaveLength(0);
    expect(finalState.completedOperations[0].status).toBe('completed');
  });
});
