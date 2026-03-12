import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview, resolveShape,
  ProjectManager, ModelStore, VersionManager, ExportManager,
} from '/home/leono/Development/modelling_skill/src/index.js';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '/home/leono/Development/modelling_skill/src/types/index.js';

const PROJECT_ID = 'archimate-tests';
const DIAGRAM_NAME = 'archimate-capability';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

const cap = resolveShape('archimate', 'Capability')!;
const capStyle = `${cap.style}fillColor=#F5DEAA;strokeColor=#C49A00;`;
const domainStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=13;strokeColor=#C49A00;';

const capW = 130, capH = 50, gapX = 12, gapY = 10;
const padTop = 32, padSide = 12, padBottom = 12;

const domains = [
  { name: 'Customer Management', caps: ['Customer Engagement', 'Channel Management', 'Customer Insight', 'Loyalty Management'] },
  { name: 'Product Management', caps: ['Product Development', 'Product Lifecycle', 'Portfolio Management', 'Pricing Strategy'] },
  { name: 'Order to Cash', caps: ['Order Management', 'Billing & Invoicing', 'Revenue Accounting', 'Collections'] },
  { name: 'Supply Chain', caps: ['Procurement', 'Inventory Mgmt', 'Logistics', 'Supplier Mgmt'] },
  { name: 'Human Capital', caps: ['Talent Acquisition', 'Workforce Planning', 'Learning & Dev', 'Compensation'] },
  { name: 'Finance & Risk', caps: ['Financial Planning', 'Risk Management', 'Compliance', 'Treasury'] },
  { name: 'Technology & Data', caps: ['Enterprise Arch', 'Data Management', 'Integration', 'Cybersecurity'] },
  { name: 'Corporate Services', caps: ['Legal', 'Facilities', 'Communications', 'Sustainability'] },
];

const colCount = 2;
const domainW = 4 * capW + 3 * gapX + 2 * padSide;
const domainH = padTop + capH + padBottom;
const startX = 25, startY = 55, domainGapX = 18, domainGapY = 14;

const containers: DiagramModel['containers'] = [];
const nodes: DiagramModel['nodes'] = [];
let id = 2;

nodes.push({
  id: String(id++), label: 'Enterprise Business Capability Model',
  style: 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=16;fontStyle=1;',
  x: startX, y: 8, width: 2 * domainW + domainGapX, height: 35,
});

for (const [di, domain] of domains.entries()) {
  const col = di % colCount, row = Math.floor(di / colCount);
  const dx = startX + col * (domainW + domainGapX);
  const dy = startY + row * (domainH + domainGapY);
  const cid = String(id++);
  containers.push({ id: cid, label: domain.name, style: domainStyle, x: dx, y: dy, width: domainW, height: domainH });
  for (const [ci, cap] of domain.caps.entries()) {
    nodes.push({ id: String(id++), label: cap, style: capStyle, x: padSide + ci * (capW + gapX), y: padTop, width: capW, height: capH, parent: cid });
  }
}

const model: DiagramModel = { containers, nodes, edges: [], metadata: { title: 'Enterprise Business Capability Model', diagramType: 'generic', notation: 'archimate' } };
const preview = renderPreview(model, { width: 120, height: 48 });
console.log(preview);

const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);
if (!result.validation.valid) { console.error('Validation errors:', result.validation.errors); process.exit(1); }
const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));
const labels = domains.flatMap(d => d.caps);
const semantics = validateSemantics(result.finalXml, labels, 'archimate');
if (!semantics.valid) console.warn('Semantic issues:', semantics.issues);

writeFileSync('/home/leono/Development/modelling_skill/resources/preview-archimate-capability.txt', preview);

// --- Persist & Export ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'ArchiMate test models');
const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId, name: DIAGRAM_NAME, project: PROJECT_ID, currentVersion: 1,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  tags: ['archimate', 'capability-model'], prompt: 'Business capability model test',
  description: model.metadata.title ?? DIAGRAM_NAME,
};
await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nPreview: resources/preview-archimate-capability.txt`);
console.log(`Exported: ${exportPath}`);
