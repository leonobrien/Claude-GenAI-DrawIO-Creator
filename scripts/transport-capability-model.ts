import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  getNotation, resolveShape,
} from '/home/leono/Development/modelling_skill/src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '/home/leono/Development/modelling_skill/src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'transport-capability';
const DIAGRAM_NAME = 'transport-l1-capability-model';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'Transportation Business Capability Model');

// --- Notation ---
const notation = getNotation('archimate');
const businessService = resolveShape('archimate', 'Business Service');
if (!businessService) throw new Error('Shape not found: Business Service');

// ArchiMate colours for business layer
const businessFill = '#FFFFB5';
const businessStroke = '#C4B600';

// Capability style — using business service shape with business layer colours
const capStyle = `${businessService.style}fillColor=${businessFill};strokeColor=${businessStroke};`;

// Container style for capability domains
const domainStyle = `rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=13;strokeColor=${businessStroke};`;

// Dimensions
const capW = 140;
const capH = 50;
const gapX = 15;
const gapY = 12;
const domainPadTop = 35;
const domainPadSide = 15;
const domainPadBottom = 15;

// --- Define capability domains and their L1 capabilities ---
const domains = [
  {
    name: 'Fleet & Asset Management',
    capabilities: ['Vehicle Lifecycle Mgmt', 'Fleet Maintenance', 'Asset Tracking', 'Fuel Management'],
  },
  {
    name: 'Transport Operations',
    capabilities: ['Route Planning', 'Scheduling & Dispatch', 'Load Management', 'Real-Time Tracking'],
  },
  {
    name: 'Customer Management',
    capabilities: ['Customer Onboarding', 'Contract Management', 'Customer Service', 'Loyalty & Retention'],
  },
  {
    name: 'Commercial & Revenue',
    capabilities: ['Pricing & Tariffs', 'Sales Management', 'Revenue Management', 'Billing & Invoicing'],
  },
  {
    name: 'Safety & Compliance',
    capabilities: ['Regulatory Compliance', 'Driver Safety', 'Incident Management', 'Risk Management'],
  },
  {
    name: 'Supply Chain & Logistics',
    capabilities: ['Warehouse Management', 'Inventory Management', 'Last-Mile Delivery', 'Cross-Docking'],
  },
  {
    name: 'Finance & Administration',
    capabilities: ['Financial Planning', 'Procurement', 'Human Resources', 'Legal & Governance'],
  },
  {
    name: 'Technology & Data',
    capabilities: ['IT Infrastructure', 'Data & Analytics', 'Integration Platform', 'Cybersecurity'],
  },
];

// Layout: 2 columns of domains, 4 rows
const colCount = 2;
const capsPerRow = 4; // capabilities per domain row (single row per domain)
const startX = 30;
const startY = 60;

// Calculate domain width: capsPerRow caps + gaps + padding
const domainW = capsPerRow * capW + (capsPerRow - 1) * gapX + 2 * domainPadSide;
const domainH = domainPadTop + capH + domainPadBottom;
const domainGapX = 20;
const domainGapY = 18;

const containers: DiagramModel['containers'] = [];
const nodes: DiagramModel['nodes'] = [];

let idCounter = 2;

// Title node
const titleId = String(idCounter++);
nodes.push({
  id: titleId,
  label: 'Transportation Business — Level 1 Capability Model',
  style: 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=16;fontStyle=1;',
  x: startX,
  y: 10,
  width: 2 * domainW + domainGapX,
  height: 35,
});

domains.forEach((domain, di) => {
  const col = di % colCount;
  const row = Math.floor(di / colCount);

  const domainX = startX + col * (domainW + domainGapX);
  const domainY = startY + row * (domainH + domainGapY);

  const containerId = String(idCounter++);
  containers.push({
    id: containerId,
    label: domain.name,
    style: domainStyle,
    x: domainX,
    y: domainY,
    width: domainW,
    height: domainH,
  });

  domain.capabilities.forEach((cap, ci) => {
    const capId = String(idCounter++);
    // Positions relative to container
    const relX = domainPadSide + ci * (capW + gapX);
    const relY = domainPadTop;

    nodes.push({
      id: capId,
      label: cap,
      style: capStyle,
      x: relX,
      y: relY,
      width: capW,
      height: capH,
      parent: containerId,
    });
  });
});

const model: DiagramModel = {
  containers,
  nodes,
  edges: [],
  metadata: {
    title: 'Transportation Business — Level 1 Capability Model',
    diagramType: 'generic',
    notation: 'archimate',
  },
};

// --- Terminal preview ---
console.log(renderPreview(model, { width: 120, height: 50 }));

// --- Generate and validate ---
const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) {
  console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));
}

const allLabels = domains.flatMap(d => d.capabilities);
const semantics = validateSemantics(result.finalXml, allLabels, 'archimate');
if (!semantics.valid) {
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
  tags: ['capability-model', 'transportation', 'archimate', 'level-1'],
  prompt: 'Generate a level 1 business capability model for transportation business using archimate',
  description: 'Transportation Business — Level 1 Capability Model',
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nDiagram stored: ${STORAGE_ROOT}/projects/${PROJECT_ID}/models/${modelId}.json`);
console.log(`Exported to: ${exportPath}`);
