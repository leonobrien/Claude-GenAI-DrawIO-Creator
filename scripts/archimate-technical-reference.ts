import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview, resolveShape,
  ProjectManager, ModelStore, VersionManager, ExportManager,
} from '/home/leono/Development/modelling_skill/src/index.js';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '/home/leono/Development/modelling_skill/src/types/index.js';

const PROJECT_ID = 'archimate-tests';
const DIAGRAM_NAME = 'archimate-technical-reference';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// Level 1 Technical Reference Model — Technology layer shapes
const node = resolveShape('archimate', 'Node')!;
const device = resolveShape('archimate', 'Device')!;
const sysSw = resolveShape('archimate', 'System Software')!;
const techSvc = resolveShape('archimate', 'Technology Service')!;
const artifact = resolveShape('archimate', 'Artifact')!;
const network = resolveShape('archimate', 'Communication Network')!;
const path = resolveShape('archimate', 'Path')!;
const equipment = resolveShape('archimate', 'Equipment')!;
const facility = resolveShape('archimate', 'Facility')!;

const techFill = 'fillColor=#C9E7B7;strokeColor=#6AA329;';
const containerStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;strokeColor=#6AA329;';
const w = 130, h = 50;

const containers: DiagramModel['containers'] = [
  { id: '2', label: 'Presentation Services', style: containerStyle, x: 30, y: 55, width: 740, height: 95 },
  { id: '3', label: 'Application Platform', style: containerStyle, x: 30, y: 170, width: 740, height: 95 },
  { id: '4', label: 'Integration & Middleware', style: containerStyle, x: 30, y: 285, width: 740, height: 95 },
  { id: '5', label: 'Infrastructure Services', style: containerStyle, x: 30, y: 400, width: 740, height: 95 },
  { id: '6', label: 'Physical Infrastructure', style: containerStyle, x: 30, y: 515, width: 740, height: 95 },
];

const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;html=1;';

const nodes: DiagramModel['nodes'] = [
  { id: '7', label: 'Level 1 Technical Reference Model', style: 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=16;fontStyle=1;', x: 30, y: 10, width: 740, height: 35 },
  // Presentation Services
  { id: '10', label: 'Web Portal', style: `${techSvc.style}${techFill}`, x: 15, y: 32, width: w, height: h, parent: '2' },
  { id: '11', label: 'Mobile Gateway', style: `${techSvc.style}${techFill}`, x: 160, y: 32, width: w, height: h, parent: '2' },
  { id: '12', label: 'API Gateway', style: `${techSvc.style}${techFill}`, x: 305, y: 32, width: w, height: h, parent: '2' },
  { id: '13', label: 'CDN', style: `${techSvc.style}${techFill}`, x: 450, y: 32, width: w, height: h, parent: '2' },
  { id: '14', label: 'Load Balancer', style: `${techSvc.style}${techFill}`, x: 595, y: 32, width: w, height: h, parent: '2' },
  // Application Platform
  { id: '20', label: 'App Server', style: `${sysSw.style}${techFill}`, x: 15, y: 32, width: w, height: h, parent: '3' },
  { id: '21', label: 'Container Runtime', style: `${sysSw.style}${techFill}`, x: 160, y: 32, width: w, height: h, parent: '3' },
  { id: '22', label: 'Serverless Engine', style: `${sysSw.style}${techFill}`, x: 305, y: 32, width: w, height: h, parent: '3' },
  { id: '23', label: 'RDBMS', style: `${sysSw.style}${techFill}`, x: 450, y: 32, width: w, height: h, parent: '3' },
  { id: '24', label: 'NoSQL Store', style: `${sysSw.style}${techFill}`, x: 595, y: 32, width: w, height: h, parent: '3' },
  // Integration & Middleware
  { id: '30', label: 'Message Broker', style: `${node.style}${techFill}`, x: 15, y: 32, width: w, height: h, parent: '4' },
  { id: '31', label: 'ESB', style: `${node.style}${techFill}`, x: 160, y: 32, width: w, height: h, parent: '4' },
  { id: '32', label: 'ETL Platform', style: `${node.style}${techFill}`, x: 305, y: 32, width: w, height: h, parent: '4' },
  { id: '33', label: 'Identity Provider', style: `${node.style}${techFill}`, x: 450, y: 32, width: w, height: h, parent: '4' },
  { id: '34', label: 'Monitoring', style: `${node.style}${techFill}`, x: 595, y: 32, width: w, height: h, parent: '4' },
  // Infrastructure Services
  { id: '40', label: 'Compute', style: `${artifact.style}${techFill}`, x: 15, y: 32, width: w, height: h, parent: '5' },
  { id: '41', label: 'Storage', style: `${artifact.style}${techFill}`, x: 160, y: 32, width: w, height: h, parent: '5' },
  { id: '42', label: 'Network Fabric', style: `${network.style}${techFill}`, x: 305, y: 32, width: w, height: h, parent: '5' },
  { id: '43', label: 'DNS & Routing', style: `${path.style}${techFill}`, x: 450, y: 32, width: w, height: h, parent: '5' },
  { id: '44', label: 'Security Services', style: `${artifact.style}${techFill}`, x: 595, y: 32, width: w, height: h, parent: '5' },
  // Physical Infrastructure
  { id: '50', label: 'Data Centre', style: `${facility.style}${techFill}`, x: 15, y: 32, width: w, height: h, parent: '6' },
  { id: '51', label: 'Server Hardware', style: `${device.style}${techFill}`, x: 160, y: 32, width: w, height: h, parent: '6' },
  { id: '52', label: 'Network Equipment', style: `${equipment.style}${techFill}`, x: 305, y: 32, width: w, height: h, parent: '6' },
  { id: '53', label: 'Storage Arrays', style: `${device.style}${techFill}`, x: 450, y: 32, width: w, height: h, parent: '6' },
  { id: '54', label: 'Power & Cooling', style: `${equipment.style}${techFill}`, x: 595, y: 32, width: w, height: h, parent: '6' },
];

const edges: DiagramModel['edges'] = [
  { id: '60', source: '10', target: '20', style: edgeStyle },
  { id: '61', source: '12', target: '22', style: edgeStyle },
  { id: '62', source: '20', target: '30', style: edgeStyle },
  { id: '63', source: '21', target: '31', style: edgeStyle },
  { id: '64', source: '30', target: '40', style: edgeStyle },
  { id: '65', source: '42', target: '52', style: edgeStyle },
  { id: '66', source: '41', target: '53', style: edgeStyle },
  { id: '67', source: '40', target: '51', style: edgeStyle },
];

const model: DiagramModel = { containers, nodes, edges, metadata: { title: 'Level 1 Technical Reference Model', diagramType: 'infrastructure', notation: 'archimate' } };
const preview = renderPreview(model, { width: 120, height: 55 });
console.log(preview);

const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);
if (!result.validation.valid) { console.error('Validation errors:', result.validation.errors); process.exit(1); }
const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));

writeFileSync('/home/leono/Development/modelling_skill/resources/preview-archimate-technical-reference.txt', preview);

// --- Persist & Export ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const modelStore = new ModelStore(STORAGE_ROOT);
const versionMgr = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versionMgr);

await projects.ensureExists(PROJECT_ID, 'ArchiMate test models');
const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId, name: DIAGRAM_NAME, project: PROJECT_ID, currentVersion: 1,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  tags: ['archimate', 'technical-reference'], prompt: 'Level 1 technical reference model test',
  description: model.metadata.title ?? DIAGRAM_NAME,
};
await modelStore.save(storedModel);
await versionMgr.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nPreview: resources/preview-archimate-technical-reference.txt`);
console.log(`Exported: ${exportPath}`);
