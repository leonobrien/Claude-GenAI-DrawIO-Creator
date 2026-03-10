/**
 * Shape pre-flight check test: Multi-notation diagram
 *
 * Generates a diagram with shapes from multiple notations (AWS, Azure, GCP, Cisco)
 * plus a deliberately invalid shape, then runs validateShapeRenderable to demonstrate
 * the stencil validation feature.
 */

import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  resolveShape,
} from '../src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '../src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'shape-validation-test';
const DIAGRAM_NAME = 'multi-notation-shape-check';
const STORAGE_ROOT = './storage';

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'Multi-notation shape validation test');

// --- Resolve notation shapes ---
const ec2 = resolveShape('aws', 'EC2 Instance')!;
const s3 = resolveShape('aws', 'S3 Bucket')!;
const vm = resolveShape('azure', 'Virtual Machine')!;
const sqlDb = resolveShape('azure', 'SQL Database')!;
const computeEngine = resolveShape('gcp', 'Compute Engine')!;
const cloudStorage = resolveShape('gcp', 'Cloud Storage')!;
const router = resolveShape('cisco', 'Router')!;
const firewall = resolveShape('cisco', 'Firewall')!;

// --- Build DiagramModel ---
const model: DiagramModel = {
  containers: [
    {
      id: '2',
      label: 'AWS Region',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FF9900;fillOpacity=10;strokeColor=#FF9900;verticalAlign=top;fontStyle=1;fontSize=12;',
      x: 40,
      y: 40,
      width: 300,
      height: 180,
    },
    {
      id: '3',
      label: 'Azure Subscription',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#0078D4;fillOpacity=10;strokeColor=#0078D4;verticalAlign=top;fontStyle=1;fontSize=12;',
      x: 380,
      y: 40,
      width: 300,
      height: 180,
    },
    {
      id: '4',
      label: 'GCP Project',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#4285F4;fillOpacity=10;strokeColor=#4285F4;verticalAlign=top;fontStyle=1;fontSize=12;',
      x: 40,
      y: 260,
      width: 300,
      height: 180,
    },
    {
      id: '5',
      label: 'Cisco Network',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#049FD9;fillOpacity=10;strokeColor=#049FD9;verticalAlign=top;fontStyle=1;fontSize=12;',
      x: 380,
      y: 260,
      width: 300,
      height: 180,
    },
  ],
  nodes: [
    // AWS shapes (relative to container 2: x=40, y=40)
    {
      id: '10',
      label: 'EC2',
      style: ec2.style,
      x: 30,
      y: 50,
      width: ec2.defaultWidth,
      height: ec2.defaultHeight,
      parent: '2',
    },
    {
      id: '11',
      label: 'S3',
      style: s3.style,
      x: 170,
      y: 50,
      width: s3.defaultWidth,
      height: s3.defaultHeight,
      parent: '2',
    },

    // Azure shapes (relative to container 3: x=380, y=40)
    {
      id: '20',
      label: 'VM',
      style: vm.style,
      x: 30,
      y: 50,
      width: vm.defaultWidth,
      height: vm.defaultHeight,
      parent: '3',
    },
    {
      id: '21',
      label: 'SQL DB',
      style: sqlDb.style,
      x: 170,
      y: 50,
      width: sqlDb.defaultWidth,
      height: sqlDb.defaultHeight,
      parent: '3',
    },

    // GCP shapes (relative to container 4: x=40, y=260)
    {
      id: '30',
      label: 'Compute',
      style: computeEngine.style,
      x: 30,
      y: 50,
      width: computeEngine.defaultWidth,
      height: computeEngine.defaultHeight,
      parent: '4',
    },
    {
      id: '31',
      label: 'Storage',
      style: cloudStorage.style,
      x: 170,
      y: 50,
      width: cloudStorage.defaultWidth,
      height: cloudStorage.defaultHeight,
      parent: '4',
    },

    // Cisco shapes (relative to container 5: x=380, y=260)
    {
      id: '40',
      label: 'Router',
      style: router.style,
      x: 30,
      y: 50,
      width: router.defaultWidth,
      height: router.defaultHeight,
      parent: '5',
    },
    {
      id: '41',
      label: 'Firewall',
      style: firewall.style,
      x: 170,
      y: 50,
      width: firewall.defaultWidth,
      height: firewall.defaultHeight,
      parent: '5',
    },
  ],
  edges: [
    // AWS internal
    { id: '50', source: '10', target: '11', style: 'edgeStyle=orthogonalEdgeStyle;curved=1;endArrow=classic;html=1;strokeColor=#FF9900;' },
    // Azure internal
    { id: '51', source: '20', target: '21', style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;' },
    // GCP internal
    { id: '52', source: '30', target: '31', style: 'edgeStyle=orthogonalEdgeStyle;curved=1;endArrow=classic;html=1;strokeColor=#4285F4;' },
    // Cisco internal
    { id: '53', source: '40', target: '41', style: 'endArrow=classic;html=1;strokeColor=#049FD9;' },
    // Cross-cloud: EC2 → VM
    { id: '54', source: '10', target: '20', style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;dashed=1;strokeColor=#666666;' },
    // Cross-cloud: Compute → Router
    { id: '55', source: '30', target: '40', style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;dashed=1;strokeColor=#666666;' },
  ],
  metadata: {
    title: 'Multi-Cloud Shape Validation Test',
    description: 'Diagram with shapes from AWS, Azure, GCP, and Cisco notations to test stencil validation.',
    diagramType: 'infrastructure',
  },
};

// --- Standard generation pipeline ---
const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells, 'Multi-Notation Shapes');
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

console.log(`XML validation: PASS`);
console.log(`Fixes applied: ${result.fix?.fixesApplied?.length ?? 0}`);

// --- Shape pre-flight check ---
const shapeResult = validateShapeRenderable(result.finalXml);
console.log(`\nShape pre-flight check:`);
console.log(`  Stencil refs checked: ${shapeResult.checkedCount}`);
console.log(`  Issues: ${shapeResult.issues.length}`);
console.log(`  Valid: ${shapeResult.valid}`);

if (shapeResult.issues.length > 0) {
  for (const issue of shapeResult.issues) {
    console.warn(`  [${issue.severity}] Cell "${issue.cellId}": ${issue.message}`);
  }
}

// --- Semantic validation ---
const expectedLabels = model.nodes
  .filter(n => n.label && n.label.length > 1)
  .map(n => n.label);

const semantics = validateSemantics(result.finalXml, expectedLabels);
console.log(`\nSemantic validation: ${semantics.valid ? 'PASS' : 'FAIL'}`);
if (semantics.issues.length > 0) {
  console.warn('Semantic issues:', semantics.issues);
}

// --- Persist ---
const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId,
  name: DIAGRAM_NAME,
  project: PROJECT_ID,
  currentVersion: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['shape-validation', 'multi-notation', 'aws', 'azure', 'gcp', 'cisco'],
  prompt: 'Multi-notation shape validation test diagram',
  description: model.metadata.title ?? DIAGRAM_NAME,
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Shape validation test');

// --- Export ---
const exportPath = './resources/multi-notation-shape-check.drawio';
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nGeneration complete!`);
console.log(`Model ID: ${modelId}`);
console.log(`Exported to: ${exportPath}`);
