import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview, resolveShape,
  ProjectManager, ModelStore, VersionManager, ExportManager,
} from '/home/leono/Development/modelling_skill/src/index.js';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '/home/leono/Development/modelling_skill/src/types/index.js';

const PROJECT_ID = 'archimate-tests';
const DIAGRAM_NAME = 'archimate-service-design';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// Service Design — cross-layer ArchiMate showing Business → Application → Technology
const bProcess = resolveShape('archimate', 'Business Process')!;
const bService = resolveShape('archimate', 'Business Service')!;
const bActor = resolveShape('archimate', 'Business Actor')!;
const bInterface = resolveShape('archimate', 'Business Interface')!;
const appComp = resolveShape('archimate', 'Application Component')!;
const appSvc = resolveShape('archimate', 'Application Service')!;
const appIntf = resolveShape('archimate', 'Application Interface')!;
const dataObj = resolveShape('archimate', 'Data Object')!;
const node = resolveShape('archimate', 'Node')!;
const techSvc = resolveShape('archimate', 'Technology Service')!;
const sysSw = resolveShape('archimate', 'System Software')!;
const network = resolveShape('archimate', 'Communication Network')!;

const busFill = 'fillColor=#FFFFB5;strokeColor=#C4B600;';
const appFill = 'fillColor=#B5FFFF;strokeColor=#00A8A8;';
const techFill = 'fillColor=#C9E7B7;strokeColor=#6AA329;';
const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;html=1;';
const servingEdge = `${edgeStyle}dashed=1;`;
const w = 130, h = 50;

const containers: DiagramModel['containers'] = [
  { id: '2', label: 'Business Layer', style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;strokeColor=#C4B600;', x: 30, y: 50, width: 740, height: 155 },
  { id: '3', label: 'Application Layer', style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;strokeColor=#00A8A8;', x: 30, y: 230, width: 740, height: 155 },
  { id: '4', label: 'Technology Layer', style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;strokeColor=#6AA329;', x: 30, y: 410, width: 740, height: 100 },
];

const nodes: DiagramModel['nodes'] = [
  { id: '5', label: 'Customer Onboarding — Service Design', style: 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=16;fontStyle=1;', x: 30, y: 8, width: 740, height: 35 },

  // Business Layer — top row: actors & interfaces
  { id: '10', label: 'Customer', style: `${bActor.style}${busFill}`, x: 15, y: 30, width: w, height: h, parent: '2' },
  { id: '11', label: 'Web Portal', style: `${bInterface.style}${busFill}`, x: 170, y: 30, width: w, height: h, parent: '2' },
  { id: '12', label: 'Mobile App', style: `${bInterface.style}${busFill}`, x: 325, y: 30, width: w, height: h, parent: '2' },
  // Business Layer — bottom row: services & processes
  { id: '13', label: 'Identity Verification', style: `${bService.style}${busFill}`, x: 15, y: 90, width: w, height: h, parent: '2' },
  { id: '14', label: 'Account Opening', style: `${bProcess.style}${busFill}`, x: 170, y: 90, width: w, height: h, parent: '2' },
  { id: '15', label: 'Risk Assessment', style: `${bProcess.style}${busFill}`, x: 325, y: 90, width: w, height: h, parent: '2' },
  { id: '16', label: 'Welcome Pack', style: `${bService.style}${busFill}`, x: 480, y: 90, width: w, height: h, parent: '2' },

  // Application Layer — top row: services & interfaces
  { id: '20', label: 'CRM API', style: `${appIntf.style}${appFill}`, x: 15, y: 30, width: w, height: h, parent: '3' },
  { id: '21', label: 'Onboarding Svc', style: `${appSvc.style}${appFill}`, x: 170, y: 30, width: w, height: h, parent: '3' },
  { id: '22', label: 'KYC Service', style: `${appSvc.style}${appFill}`, x: 325, y: 30, width: w, height: h, parent: '3' },
  { id: '23', label: 'Notification Svc', style: `${appSvc.style}${appFill}`, x: 480, y: 30, width: w, height: h, parent: '3' },
  // Application Layer — bottom row: components & data
  { id: '24', label: 'CRM System', style: `${appComp.style}${appFill}`, x: 15, y: 90, width: w, height: h, parent: '3' },
  { id: '25', label: 'Workflow Engine', style: `${appComp.style}${appFill}`, x: 170, y: 90, width: w, height: h, parent: '3' },
  { id: '26', label: 'Customer Record', style: `${dataObj.style}${appFill}`, x: 325, y: 90, width: w, height: h, parent: '3' },
  { id: '27', label: 'Document Store', style: `${dataObj.style}${appFill}`, x: 480, y: 90, width: w, height: h, parent: '3' },

  // Technology Layer
  { id: '30', label: 'App Cluster', style: `${node.style}${techFill}`, x: 15, y: 35, width: w, height: h, parent: '4' },
  { id: '31', label: 'Database Server', style: `${sysSw.style}${techFill}`, x: 170, y: 35, width: w, height: h, parent: '4' },
  { id: '32', label: 'API Network', style: `${network.style}${techFill}`, x: 325, y: 35, width: w, height: h, parent: '4' },
  { id: '33', label: 'Auth Platform', style: `${techSvc.style}${techFill}`, x: 480, y: 35, width: w, height: h, parent: '4' },
];

const edges: DiagramModel['edges'] = [
  // Business: actor → interfaces
  { id: '40', source: '10', target: '11', style: edgeStyle },
  { id: '41', source: '10', target: '12', style: edgeStyle },
  // Business: interfaces → processes
  { id: '42', source: '11', target: '14', style: edgeStyle },
  { id: '43', source: '14', target: '15', style: edgeStyle, label: 'triggers' },
  { id: '44', source: '15', target: '16', style: edgeStyle, label: 'triggers' },
  { id: '45', source: '14', target: '13', style: edgeStyle },
  // Business → Application (serving)
  { id: '50', source: '21', target: '14', style: servingEdge, label: 'serves' },
  { id: '51', source: '22', target: '13', style: servingEdge, label: 'serves' },
  { id: '52', source: '23', target: '16', style: servingEdge, label: 'serves' },
  // Application internal
  { id: '53', source: '20', target: '24', style: edgeStyle },
  { id: '54', source: '21', target: '25', style: edgeStyle },
  { id: '55', source: '25', target: '26', style: edgeStyle, label: 'accesses' },
  { id: '56', source: '23', target: '27', style: edgeStyle, label: 'accesses' },
  // Application → Technology (serving)
  { id: '60', source: '30', target: '24', style: servingEdge, label: 'serves' },
  { id: '61', source: '31', target: '26', style: servingEdge, label: 'serves' },
  { id: '62', source: '32', target: '20', style: servingEdge, label: 'serves' },
  { id: '63', source: '33', target: '22', style: servingEdge, label: 'serves' },
];

const model: DiagramModel = { containers, nodes, edges, metadata: { title: 'Customer Onboarding — Service Design', diagramType: 'generic', notation: 'archimate' } };
const preview = renderPreview(model, { width: 120, height: 50 });
console.log(preview);

const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);
if (!result.validation.valid) { console.error('Validation errors:', result.validation.errors); process.exit(1); }
const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));

writeFileSync('/home/leono/Development/modelling_skill/resources/preview-archimate-service-design.txt', preview);

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
  tags: ['archimate', 'service-design'], prompt: 'Customer onboarding service design test',
  description: model.metadata.title ?? DIAGRAM_NAME,
};
await modelStore.save(storedModel);
await versionMgr.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nPreview: resources/preview-archimate-service-design.txt`);
console.log(`Exported: ${exportPath}`);
