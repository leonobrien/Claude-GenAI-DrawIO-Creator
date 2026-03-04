import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  getNotation,
} from '../src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '../src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'archimate-three-tier';
const DIAGRAM_NAME = 'three-tier-architecture';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'Three-tiered application architecture in ArchiMate notation');

// --- ArchiMate notation ---
const archimate = getNotation('archimate');

const businessProcess = archimate.shapes.find(s => s.name === 'Business Process')!;
const businessService = archimate.shapes.find(s => s.name === 'Business Service')!;
const businessActor = archimate.shapes.find(s => s.name === 'Business Actor')!;
const businessRole = archimate.shapes.find(s => s.name === 'Business Role')!;
const appComponent = archimate.shapes.find(s => s.name === 'Application Component')!;
const appService = archimate.shapes.find(s => s.name === 'Application Service')!;
const appInterface = archimate.shapes.find(s => s.name === 'Application Interface')!;
const dataObject = archimate.shapes.find(s => s.name === 'Data Object')!;
const node = archimate.shapes.find(s => s.name === 'Node')!;
const device = archimate.shapes.find(s => s.name === 'Device')!;
const systemSoftware = archimate.shapes.find(s => s.name === 'System Software')!;
const techService = archimate.shapes.find(s => s.name === 'Technology Service')!;
const artifact = archimate.shapes.find(s => s.name === 'Artifact')!;
const network = archimate.shapes.find(s => s.name === 'Communication Network')!;

// --- Colours per layer ---
const biz = archimate.colours.business;
const app = archimate.colours.application;
const tech = archimate.colours.technology;

const model: DiagramModel = {
  containers: [
    // Business Layer container
    {
      id: '2',
      label: 'Business Layer',
      style: `rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=13;strokeColor=${biz.strokeColor};`,
      x: 40, y: 30, width: 720, height: 150,
    },
    // Application Layer container
    {
      id: '10',
      label: 'Application Layer',
      style: `rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=13;strokeColor=${app.strokeColor};`,
      x: 40, y: 210, width: 720, height: 170,
    },
    // Technology Layer container
    {
      id: '20',
      label: 'Technology Layer',
      style: `rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=13;strokeColor=${tech.strokeColor};`,
      x: 40, y: 410, width: 720, height: 170,
    },
  ],
  nodes: [
    // ── Business Layer ──
    {
      id: '3', label: 'Customer', parent: '2',
      style: `${businessActor.style}fillColor=${biz.fillColor};strokeColor=${biz.strokeColor};`,
      x: 30, y: 45, width: businessActor.defaultWidth, height: businessActor.defaultHeight,
    },
    {
      id: '4', label: 'Sales Manager', parent: '2',
      style: `${businessRole.style}fillColor=${biz.fillColor};strokeColor=${biz.strokeColor};`,
      x: 200, y: 45, width: businessRole.defaultWidth, height: businessRole.defaultHeight,
    },
    {
      id: '5', label: 'Order Processing', parent: '2',
      style: `${businessProcess.style}fillColor=${biz.fillColor};strokeColor=${biz.strokeColor};`,
      x: 380, y: 45, width: businessProcess.defaultWidth, height: businessProcess.defaultHeight,
    },
    {
      id: '6', label: 'Order Fulfilment\nService', parent: '2',
      style: `${businessService.style}fillColor=${biz.fillColor};strokeColor=${biz.strokeColor};`,
      x: 560, y: 45, width: businessService.defaultWidth, height: businessService.defaultHeight,
    },

    // ── Application Layer ──
    {
      id: '11', label: 'Web Portal\nUI', parent: '10',
      style: `${appInterface.style}fillColor=${app.fillColor};strokeColor=${app.strokeColor};`,
      x: 30, y: 50, width: appInterface.defaultWidth, height: appInterface.defaultHeight,
    },
    {
      id: '12', label: 'Order\nManagement', parent: '10',
      style: `${appComponent.style}fillColor=${app.fillColor};strokeColor=${app.strokeColor};`,
      x: 200, y: 50, width: appComponent.defaultWidth, height: appComponent.defaultHeight,
    },
    {
      id: '13', label: 'Inventory\nService', parent: '10',
      style: `${appService.style}fillColor=${app.fillColor};strokeColor=${app.strokeColor};`,
      x: 380, y: 50, width: appService.defaultWidth, height: appService.defaultHeight,
    },
    {
      id: '14', label: 'Customer\nData', parent: '10',
      style: `${dataObject.style}fillColor=${app.fillColor};strokeColor=${app.strokeColor};`,
      x: 560, y: 50, width: dataObject.defaultWidth, height: dataObject.defaultHeight,
    },

    // ── Technology Layer ──
    {
      id: '21', label: 'Web Server', parent: '20',
      style: `${node.style}fillColor=${tech.fillColor};strokeColor=${tech.strokeColor};`,
      x: 30, y: 55, width: node.defaultWidth, height: node.defaultHeight,
    },
    {
      id: '22', label: 'App Server', parent: '20',
      style: `${device.style}fillColor=${tech.fillColor};strokeColor=${tech.strokeColor};`,
      x: 200, y: 55, width: device.defaultWidth, height: device.defaultHeight,
    },
    {
      id: '23', label: 'DBMS', parent: '20',
      style: `${systemSoftware.style}fillColor=${tech.fillColor};strokeColor=${tech.strokeColor};`,
      x: 380, y: 55, width: systemSoftware.defaultWidth, height: systemSoftware.defaultHeight,
    },
    {
      id: '24', label: 'Database\nServer', parent: '20',
      style: `${device.style}fillColor=${tech.fillColor};strokeColor=${tech.strokeColor};`,
      x: 560, y: 55, width: device.defaultWidth, height: device.defaultHeight,
    },
  ],
  edges: [
    // ── Business Layer flows ──
    // Customer → Sales Manager (triggering)
    {
      id: '30', label: 'triggers', source: '3', target: '4',
      style: 'endArrow=block;endFill=1;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=10;',
    },
    // Sales Manager → Order Processing (triggering)
    {
      id: '31', source: '4', target: '5',
      style: 'endArrow=block;endFill=1;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Order Processing → Order Fulfilment Service (realisation)
    {
      id: '32', source: '5', target: '6',
      style: 'endArrow=block;endFill=1;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },

    // ── Application Layer flows ──
    // Web Portal → Order Management (flow)
    {
      id: '33', source: '11', target: '12',
      style: 'endArrow=block;endFill=1;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Order Management → Inventory Service (flow)
    {
      id: '34', source: '12', target: '13',
      style: 'endArrow=block;endFill=1;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Inventory Service → Customer Data (access)
    {
      id: '35', label: 'accesses', source: '13', target: '14',
      style: 'endArrow=open;endFill=0;html=1;dashed=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=10;',
    },

    // ── Cross-layer: Business → Application (serving upward) ──
    // Web Portal serves Customer
    {
      id: '36', label: 'serves', source: '11', target: '3',
      style: 'endArrow=block;endFill=1;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;fontSize=10;',
    },
    // Order Management serves Order Processing
    {
      id: '37', source: '12', target: '5',
      style: 'endArrow=block;endFill=1;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;',
    },

    // ── Cross-layer: Technology → Application (serving upward) ──
    // Web Server serves Web Portal
    {
      id: '38', label: 'serves', source: '21', target: '11',
      style: 'endArrow=block;endFill=1;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;fontSize=10;',
    },
    // App Server serves Order Management
    {
      id: '39', source: '22', target: '12',
      style: 'endArrow=block;endFill=1;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;',
    },
    // DBMS serves Inventory Service
    {
      id: '40', source: '23', target: '13',
      style: 'endArrow=block;endFill=1;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;',
    },
    // Database Server → DBMS (composition)
    {
      id: '41', source: '24', target: '23',
      style: 'endArrow=diamondThin;endFill=1;html=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;',
    },
  ],
  metadata: {
    title: 'Three-Tiered Application Architecture',
    diagramType: 'infrastructure',
    notation: 'archimate',
  },
};

const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

const semantics = validateSemantics(
  result.finalXml,
  ['Customer', 'Order Processing', 'Order Management', 'Inventory', 'Web Server', 'App Server', 'DBMS'],
  model.metadata.notation,
);
if (!semantics.valid) {
  console.error('Semantic errors:', semantics.issues.filter(i => i.severity === 'error'));
  process.exit(1);
}
if (semantics.issues.length > 0) {
  console.warn('Semantic warnings:', semantics.issues.filter(i => i.severity === 'warning'));
}

// --- Persist to storage ---
const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId,
  name: DIAGRAM_NAME,
  project: PROJECT_ID,
  currentVersion: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['archimate', 'three-tier', 'enterprise-architecture'],
  prompt: 'draw a three tiered application architecture using archimate notation',
  description: 'Three-tiered application architecture with Business, Application, and Technology layers in ArchiMate 3.x notation',
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

// --- Export .drawio file ---
const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`Diagram stored: ${STORAGE_ROOT}/projects/${PROJECT_ID}/models/${modelId}.json`);
console.log(`Exported to: ${exportPath}`);
