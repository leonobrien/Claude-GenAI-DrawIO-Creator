import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview, resolveShape,
  ProjectManager, ModelStore, VersionManager, ExportManager,
} from '/home/leono/Development/modelling_skill/src/index.js';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '/home/leono/Development/modelling_skill/src/types/index.js';

const PROJECT_ID = 'archimate-tests';
const DIAGRAM_NAME = 'archimate-motivation';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// Motivation model: Stakeholder → Driver → Goal → Outcome → Principle → Requirement
const stakeholder = resolveShape('archimate', 'Stakeholder')!;
const driver = resolveShape('archimate', 'Driver')!;
const assessment = resolveShape('archimate', 'Assessment')!;
const goal = resolveShape('archimate', 'Goal')!;
const outcome = resolveShape('archimate', 'Outcome')!;
const principle = resolveShape('archimate', 'Principle')!;
const requirement = resolveShape('archimate', 'Requirement')!;
const constraint = resolveShape('archimate', 'Constraint')!;

const motFill = 'fillColor=#CCCCFF;strokeColor=#8888DD;';
const stratFill = 'fillColor=#F5DEAA;strokeColor=#C49A00;';
const w = 140, h = 55;
const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;html=1;';

const containers: DiagramModel['containers'] = [
  { id: '2', label: 'Stakeholders & Drivers', style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;strokeColor=#8888DD;', x: 30, y: 50, width: 740, height: 100 },
  { id: '3', label: 'Goals & Outcomes', style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;strokeColor=#8888DD;', x: 30, y: 175, width: 740, height: 100 },
  { id: '4', label: 'Principles & Requirements', style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;strokeColor=#8888DD;', x: 30, y: 300, width: 740, height: 100 },
];

const nodes: DiagramModel['nodes'] = [
  // Title
  { id: '5', label: 'Business Motivation Model', style: 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=16;fontStyle=1;', x: 30, y: 8, width: 740, height: 35 },
  // Row 1: Stakeholders & Drivers
  { id: '10', label: 'Board of Directors', style: `${stakeholder.style}${motFill}`, x: 15, y: 32, width: w, height: h, parent: '2' },
  { id: '11', label: 'Chief Executive', style: `${stakeholder.style}${motFill}`, x: 170, y: 32, width: w, height: h, parent: '2' },
  { id: '12', label: 'Market Competition', style: `${driver.style}${motFill}`, x: 355, y: 32, width: w, height: h, parent: '2' },
  { id: '13', label: 'Digital Disruption', style: `${driver.style}${motFill}`, x: 510, y: 32, width: w, height: h, parent: '2' },
  { id: '14', label: 'Regulatory Change', style: `${assessment.style}${motFill}`, x: 15, y: 32, width: w, height: h, parent: '3' },
  // Row 2: Goals & Outcomes
  { id: '15', label: 'Increase Revenue 20%', style: `${goal.style}${motFill}`, x: 200, y: 32, width: w, height: h, parent: '3' },
  { id: '16', label: 'Improve CX Score', style: `${goal.style}${motFill}`, x: 355, y: 32, width: w, height: h, parent: '3' },
  { id: '17', label: 'Digital Maturity L3', style: `${outcome.style}${motFill}`, x: 540, y: 32, width: w, height: h, parent: '3' },
  // Row 3: Principles & Requirements
  { id: '20', label: 'Customer First', style: `${principle.style}${motFill}`, x: 15, y: 32, width: w, height: h, parent: '4' },
  { id: '21', label: 'Data-Driven Decisions', style: `${principle.style}${motFill}`, x: 170, y: 32, width: w, height: h, parent: '4' },
  { id: '22', label: 'Omnichannel Access', style: `${requirement.style}${motFill}`, x: 355, y: 32, width: w, height: h, parent: '4' },
  { id: '23', label: 'GDPR Compliance', style: `${constraint.style}${motFill}`, x: 540, y: 32, width: w, height: h, parent: '4' },
];

const edges: DiagramModel['edges'] = [
  // Stakeholders influence drivers
  { id: '30', source: '10', target: '12', style: `${edgeStyle}dashed=1;`, label: 'influences' },
  { id: '31', source: '11', target: '13', style: `${edgeStyle}dashed=1;`, label: 'influences' },
  // Drivers realise goals
  { id: '32', source: '12', target: '15', style: edgeStyle, label: 'motivates' },
  { id: '33', source: '13', target: '16', style: edgeStyle, label: 'motivates' },
  { id: '34', source: '13', target: '17', style: edgeStyle, label: 'motivates' },
  // Goals realise principles/requirements
  { id: '35', source: '15', target: '20', style: edgeStyle, label: 'realises' },
  { id: '36', source: '16', target: '22', style: edgeStyle, label: 'realises' },
  { id: '37', source: '17', target: '21', style: edgeStyle, label: 'realises' },
  { id: '38', source: '14', target: '23', style: edgeStyle, label: 'realises' },
];

const model: DiagramModel = { containers, nodes, edges, metadata: { title: 'Business Motivation Model', diagramType: 'generic', notation: 'archimate' } };
const preview = renderPreview(model, { width: 120, height: 40 });
console.log(preview);

const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);
if (!result.validation.valid) { console.error('Validation errors:', result.validation.errors); process.exit(1); }
const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));

writeFileSync('/home/leono/Development/modelling_skill/resources/preview-archimate-motivation.txt', preview);

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
  tags: ['archimate', 'motivation'], prompt: 'Business motivation model test',
  description: model.metadata.title ?? DIAGRAM_NAME,
};
await modelStore.save(storedModel);
await versionMgr.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nPreview: resources/preview-archimate-motivation.txt`);
console.log(`Exported: ${exportPath}`);
