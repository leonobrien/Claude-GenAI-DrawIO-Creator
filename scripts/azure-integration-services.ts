import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  getNotation,
} from '../src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '../src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'azure-integration-services';
const DIAGRAM_NAME = 'azure-integration-reference';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const modelStore = new ModelStore(STORAGE_ROOT);
const versionMgr = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versionMgr);

await projects.ensureExists(PROJECT_ID, 'Azure Integration Services reference architecture');

// --- Azure notation (using correct img/lib/azure2 image styles) ---
const azure = getNotation('azure');

// Shape lookups from catalogue
const appGateway = azure.shapes.find(s => s.name === 'Application Gateway')!;
const appService = azure.shapes.find(s => s.name === 'App Service')!;
const functions = azure.shapes.find(s => s.name === 'Azure Functions')!;
const serviceBus = azure.shapes.find(s => s.name === 'Service Bus')!;
const eventHubs = azure.shapes.find(s => s.name === 'Event Hubs')!;
const eventGridTopics = azure.shapes.find(s => s.name === 'Event Grid Topics')!;
const sqlDb = azure.shapes.find(s => s.name === 'SQL Database')!;
const cosmosDb = azure.shapes.find(s => s.name === 'Cosmos DB')!;
const storageAcct = azure.shapes.find(s => s.name === 'Storage Account')!;
const keyVault = azure.shapes.find(s => s.name === 'Key Vault')!;
const azureMonitor = azure.shapes.find(s => s.name === 'Azure Monitor')!;
const cdn = azure.shapes.find(s => s.name === 'CDN')!;
const loadBalancer = azure.shapes.find(s => s.name === 'Load Balancer')!;
const aks = azure.shapes.find(s => s.name === 'AKS')!;
const apiMgmt = azure.shapes.find(s => s.name === 'API Management')!;
const logicApps = azure.shapes.find(s => s.name === 'Logic Apps')!;
const dataFactory = azure.shapes.find(s => s.name === 'Data Factory')!;
const frontDoor = azure.shapes.find(s => s.name === 'Front Door')!;

// Consistent edge styles
const edgeStyle = azure.styleTemplates.edge;
const dashedEdge = `${edgeStyle}dashed=1;`;

// Container style
const containerStyle = azure.styleTemplates.container;

const model: DiagramModel = {
  containers: [
    // Ingress zone
    {
      id: '2', label: 'Ingress',
      style: containerStyle,
      x: 20, y: 30, width: 140, height: 540,
    },
    // Integration zone (core)
    {
      id: '3', label: 'Integration Services',
      style: containerStyle,
      x: 190, y: 30, width: 380, height: 540,
    },
    // Data zone
    {
      id: '4', label: 'Data & Storage',
      style: containerStyle,
      x: 600, y: 30, width: 180, height: 340,
    },
    // Cross-cutting
    {
      id: '5', label: 'Cross-Cutting Concerns',
      style: containerStyle,
      x: 600, y: 400, width: 180, height: 170,
    },
  ],
  nodes: [
    // ── Ingress ──
    {
      id: '10', label: 'External\nClients',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;',
      x: 20, y: 55, width: 100, height: 45, parent: '2',
    },
    {
      id: '11', label: 'Front Door',
      style: frontDoor.style,
      x: 45, y: 140, width: 50, height: 50, parent: '2',
    },
    {
      id: '12', label: 'App\nGateway',
      style: appGateway.style,
      x: 45, y: 240, width: 50, height: 50, parent: '2',
    },
    {
      id: '13', label: 'Event\nProducers',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;',
      x: 20, y: 360, width: 100, height: 45, parent: '2',
    },
    {
      id: '14', label: 'Partner\nSystems',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;',
      x: 20, y: 455, width: 100, height: 45, parent: '2',
    },

    // ── Integration Services (core) ──
    {
      id: '20', label: 'API\nManagement',
      style: apiMgmt.style,
      x: 30, y: 55, width: 50, height: 50, parent: '3',
    },
    {
      id: '21', label: 'App Service\n(Web APIs)',
      style: appService.style,
      x: 160, y: 55, width: 50, height: 50, parent: '3',
    },
    {
      id: '22', label: 'AKS\nMicroservices',
      style: aks.style,
      x: 290, y: 55, width: 50, height: 50, parent: '3',
    },
    {
      id: '23', label: 'Logic Apps\n(Orchestration)',
      style: logicApps.style,
      x: 30, y: 185, width: 50, height: 50, parent: '3',
    },
    {
      id: '24', label: 'Azure\nFunctions',
      style: functions.style,
      x: 160, y: 185, width: 50, height: 50, parent: '3',
    },
    {
      id: '25', label: 'Service Bus\n(Messaging)',
      style: serviceBus.style,
      x: 290, y: 185, width: 50, height: 50, parent: '3',
    },
    {
      id: '26', label: 'Event Hubs\n(Streaming)',
      style: eventHubs.style,
      x: 30, y: 325, width: 50, height: 50, parent: '3',
    },
    {
      id: '27', label: 'Event Grid\n(Routing)',
      style: eventGridTopics.style,
      x: 160, y: 325, width: 50, height: 50, parent: '3',
    },
    {
      id: '28', label: 'Data Factory\n(ETL)',
      style: dataFactory.style,
      x: 290, y: 325, width: 50, height: 50, parent: '3',
    },
    {
      id: '29', label: 'Internal\nLB',
      style: loadBalancer.style,
      x: 160, y: 455, width: 50, height: 50, parent: '3',
    },

    // ── Data & Storage ──
    {
      id: '30', label: 'Azure SQL',
      style: sqlDb.style,
      x: 65, y: 55, width: 50, height: 50, parent: '4',
    },
    {
      id: '31', label: 'Cosmos DB',
      style: cosmosDb.style,
      x: 65, y: 150, width: 50, height: 50, parent: '4',
    },
    {
      id: '32', label: 'Storage\nAccount',
      style: storageAcct.style,
      x: 65, y: 245, width: 50, height: 50, parent: '4',
    },

    // ── Cross-Cutting ──
    {
      id: '40', label: 'Key Vault',
      style: keyVault.style,
      x: 20, y: 45, width: 50, height: 50, parent: '5',
    },
    {
      id: '41', label: 'Azure\nMonitor',
      style: azureMonitor.style,
      x: 110, y: 45, width: 50, height: 50, parent: '5',
    },
  ],
  edges: [
    // ── Ingress flows ──
    { id: '50', source: '10', target: '11',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '51', source: '11', target: '12',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '52', source: '12', target: '20',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '53', source: '13', target: '26',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '54', source: '14', target: '23',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;` },

    // ── Integration flows ──
    { id: '55', source: '20', target: '21',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '56', source: '21', target: '22',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '57', source: '20', target: '23',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '58', source: '23', target: '24',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '59', source: '24', target: '25',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '60', source: '25', target: '24', label: 'consumes',
      style: `${dashedEdge}exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=1;entryY=1;entryDx=0;entryDy=0;` },
    { id: '61', source: '26', target: '27',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '62', source: '27', target: '24', label: 'triggers',
      style: `${edgeStyle}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;` },
    { id: '63', source: '27', target: '28',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '64', source: '29', target: '21', label: 'internal',
      style: `${dashedEdge}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;` },

    // ── Data flows ──
    { id: '70', source: '21', target: '30',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '71', source: '22', target: '31',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '72', source: '24', target: '32',
      style: `${edgeStyle}exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '73', source: '28', target: '30',
      style: `${edgeStyle}exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;` },
    { id: '74', source: '28', target: '32',
      style: `${edgeStyle}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;` },

    // ── Cross-cutting (dashed to indicate governance) ──
    { id: '80', source: '40', target: '20', label: 'secrets',
      style: `${dashedEdge}exitX=0;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=1;entryDx=0;entryDy=0;` },
    { id: '81', source: '41', target: '25', label: 'observability',
      style: `${dashedEdge}exitX=0;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=1;entryDx=0;entryDy=0;` },
  ],
  metadata: {
    title: 'Azure Integration Services Reference Architecture',
    diagramType: 'infrastructure',
    notation: 'azure',
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
  [
    'API', 'App Service', 'AKS', 'Logic Apps', 'Functions',
    'Service Bus', 'Event Hub', 'SQL', 'Cosmos', 'Storage',
    'Key Vault', 'Monitor',
  ],
  model.metadata.notation,
);
if (!semantics.valid) {
  console.error('Semantic errors:', semantics.issues.filter(i => i.severity === 'error'));
  process.exit(1);
}
if (semantics.issues.length > 0) {
  console.warn('Semantic warnings:', semantics.issues.filter(i => i.severity === 'warning'));
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
  tags: ['azure', 'integration-services', 'reference-architecture'],
  prompt: 'draw a reference architecture of Azure Integration Services using Azure notation types',
  description: 'Azure Integration Services reference architecture with ingress, integration core, data, and cross-cutting concerns',
};

await modelStore.save(storedModel);
await versionMgr.saveVersion(PROJECT_ID, modelId, result.finalXml, 'v2 - correct azure2 image notation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`Diagram stored: ${STORAGE_ROOT}/projects/${PROJECT_ID}/models/${modelId}.json`);
console.log(`Exported to: ${exportPath}`);
