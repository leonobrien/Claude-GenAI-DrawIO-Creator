import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  getNotation,
} from '../src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '../src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'azure-ais-reference';
const DIAGRAM_NAME = 'azure-integration-services-reference';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const modelStore = new ModelStore(STORAGE_ROOT);
const versionMgr = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versionMgr);

await projects.ensureExists(PROJECT_ID, 'Azure Integration Services reference architecture');

// --- Azure notation (img/lib/azure2 SVG icons) ---
const azure = getNotation('azure');
const S = 50; // standard icon size

// Helper: azure2 image style
const az = (svgPath: string) =>
  `aspect=fixed;html=1;points=[];align=center;image;fontSize=12;image=${svgPath};`;

// --- Shape lookups from catalogue ---
const apiMgmt     = azure.shapes.find(s => s.name === 'API Management')!;
const logicApps   = azure.shapes.find(s => s.name === 'Logic Apps')!;
const serviceBus  = azure.shapes.find(s => s.name === 'Service Bus')!;
const eventGrid   = azure.shapes.find(s => s.name === 'Event Grid Topics')!;
const eventHubs   = azure.shapes.find(s => s.name === 'Event Hubs')!;
const functions   = azure.shapes.find(s => s.name === 'Azure Functions')!;
const appService  = azure.shapes.find(s => s.name === 'App Service')!;
const dataFactory = azure.shapes.find(s => s.name === 'Data Factory')!;
const sqlDb       = azure.shapes.find(s => s.name === 'SQL Database')!;
const cosmosDb    = azure.shapes.find(s => s.name === 'Cosmos DB')!;
const storageAcct = azure.shapes.find(s => s.name === 'Storage Account')!;
const keyVault    = azure.shapes.find(s => s.name === 'Key Vault')!;
const azMonitor   = azure.shapes.find(s => s.name === 'Azure Monitor')!;
const appGateway  = azure.shapes.find(s => s.name === 'Application Gateway')!;
const frontDoor   = azure.shapes.find(s => s.name === 'Front Door')!;
const aks         = azure.shapes.find(s => s.name === 'AKS')!;

// Additional azure2 shapes not in catalogue
const synapse      = az('img/lib/azure2/databases/Azure_Synapse_Analytics.svg');
const redis        = az('img/lib/azure2/databases/Cache_Redis.svg');
const appInsights  = az('img/lib/azure2/management_governance/Application_Insights.svg');
const entraId      = az('img/lib/azure2/identity/Azure_Active_Directory.svg');
const vnet         = az('img/lib/azure2/networking/Virtual_Networks.svg');
const privateEp    = az('img/lib/azure2/networking/Private_Endpoint.svg');

// Edge styles
const edge = azure.styleTemplates.edge;       // solid blue
const dashed = `${edge}dashed=1;`;            // dashed blue
const container = azure.styleTemplates.container;

// ── Layout plan ──
// Left-to-right flow across 5 vertical zones:
//   Consumers (x≈40) → Ingress (x≈170) → Integration Core (x≈310-530) → Data (x≈660) → Security/Ops (bottom)
// Canvas: 800 × 600

const model: DiagramModel = {
  containers: [
    // --- Zone: Consumers ---
    { id: '2', label: 'Consumers & Sources',
      style: container, x: 15, y: 20, width: 120, height: 560 },

    // --- Zone: Ingress ---
    { id: '3', label: 'Ingress & Gateway',
      style: container, x: 155, y: 20, width: 120, height: 370 },

    // --- Zone: Integration Core ---
    { id: '4', label: 'Integration Services',
      style: container, x: 295, y: 20, width: 280, height: 370 },

    // --- Zone: Data Platform ---
    { id: '5', label: 'Data Platform',
      style: container, x: 595, y: 20, width: 190, height: 370 },

    // --- Zone: Operations & Security (bottom strip) ---
    { id: '6', label: 'Security, Identity & Operations',
      style: container, x: 155, y: 415, width: 630, height: 165 },
  ],
  nodes: [
    // ═══ CONSUMERS & SOURCES ═══
    { id: '10', label: 'Web & Mobile\nClients',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;fontSize=10;',
      x: 10, y: 40, width: 100, height: 40, parent: '2' },
    { id: '11', label: 'Partner\nAPIs',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;fontSize=10;',
      x: 10, y: 110, width: 100, height: 40, parent: '2' },
    { id: '12', label: 'IoT Devices\n& Telemetry',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;fontSize=10;',
      x: 10, y: 180, width: 100, height: 40, parent: '2' },
    { id: '13', label: 'On-Premises\nSystems',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;fontSize=10;',
      x: 10, y: 250, width: 100, height: 40, parent: '2' },
    { id: '14', label: 'SaaS\nApplications',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;fontSize=10;',
      x: 10, y: 320, width: 100, height: 40, parent: '2' },
    { id: '15', label: 'External\nData Sources',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E6E6;strokeColor=#999999;fontStyle=1;fontSize=10;',
      x: 10, y: 430, width: 100, height: 40, parent: '2' },

    // ═══ INGRESS & GATEWAY ═══
    { id: '20', label: 'Front Door',
      style: frontDoor.style,
      x: 35, y: 40, width: S, height: S, parent: '3' },
    { id: '21', label: 'API\nManagement',
      style: apiMgmt.style,
      x: 35, y: 130, width: S, height: S, parent: '3' },
    { id: '22', label: 'App\nGateway',
      style: appGateway.style,
      x: 35, y: 220, width: S, height: S, parent: '3' },

    // ═══ INTEGRATION SERVICES (core) ═══
    // Row 1: Synchronous processing
    { id: '30', label: 'App Service\n(APIs)',
      style: appService.style,
      x: 20, y: 40, width: S, height: S, parent: '4' },
    { id: '31', label: 'Azure\nFunctions',
      style: functions.style,
      x: 115, y: 40, width: S, height: S, parent: '4' },
    { id: '32', label: 'AKS',
      style: aks.style,
      x: 210, y: 40, width: S, height: S, parent: '4' },

    // Row 2: Orchestration & Messaging
    { id: '33', label: 'Logic Apps',
      style: logicApps.style,
      x: 20, y: 150, width: S, height: S, parent: '4' },
    { id: '34', label: 'Service Bus',
      style: serviceBus.style,
      x: 115, y: 150, width: S, height: S, parent: '4' },
    { id: '35', label: 'Event Grid',
      style: eventGrid.style,
      x: 210, y: 150, width: S, height: S, parent: '4' },

    // Row 3: Streaming & Data Movement
    { id: '36', label: 'Event Hubs',
      style: eventHubs.style,
      x: 20, y: 260, width: S, height: S, parent: '4' },
    { id: '37', label: 'Data Factory',
      style: dataFactory.style,
      x: 115, y: 260, width: S, height: S, parent: '4' },

    // ═══ DATA PLATFORM ═══
    { id: '40', label: 'Azure SQL',
      style: sqlDb.style,
      x: 70, y: 35, width: S, height: S, parent: '5' },
    { id: '41', label: 'Cosmos DB',
      style: cosmosDb.style,
      x: 70, y: 115, width: S, height: S, parent: '5' },
    { id: '42', label: 'Storage\nAccount',
      style: storageAcct.style,
      x: 70, y: 195, width: S, height: S, parent: '5' },
    { id: '43', label: 'Synapse\nAnalytics',
      style: synapse,
      x: 70, y: 280, width: S, height: S, parent: '5' },

    // ═══ SECURITY, IDENTITY & OPERATIONS ═══
    { id: '50', label: 'Entra ID',
      style: entraId,
      x: 30, y: 45, width: S, height: S, parent: '6' },
    { id: '51', label: 'Key Vault',
      style: keyVault.style,
      x: 130, y: 45, width: S, height: S, parent: '6' },
    { id: '52', label: 'VNet &\nPrivate EP',
      style: vnet,
      x: 230, y: 45, width: S, height: S, parent: '6' },
    { id: '53', label: 'App\nInsights',
      style: appInsights,
      x: 330, y: 45, width: S, height: S, parent: '6' },
    { id: '54', label: 'Azure\nMonitor',
      style: azMonitor.style,
      x: 430, y: 45, width: S, height: S, parent: '6' },
    { id: '55', label: 'Redis\nCache',
      style: redis,
      x: 530, y: 45, width: S, height: S, parent: '6' },
  ],
  edges: [
    // ═══ CONSUMER → INGRESS ═══
    { id: '60', source: '10', target: '20',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '61', source: '11', target: '21',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '62', source: '12', target: '36', label: 'stream',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },
    { id: '63', source: '13', target: '22',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '64', source: '14', target: '33', label: 'B2B',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },
    { id: '65', source: '15', target: '37', label: 'ETL',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },

    // ═══ INGRESS → INTEGRATION ═══
    // Front Door → App Service
    { id: '66', source: '20', target: '30',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.3;entryDx=0;entryDy=0;` },
    // API Management → App Service (managed APIs)
    { id: '67', source: '21', target: '30', label: 'REST',
      style: `${edge}exitX=1;exitY=0.3;exitDx=0;exitDy=0;entryX=0;entryY=0.7;entryDx=0;entryDy=0;fontSize=9;` },
    // API Management → Functions (serverless APIs)
    { id: '68', source: '21', target: '31', label: 'serverless',
      style: `${edge}exitX=1;exitY=0.7;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },
    // App Gateway → AKS
    { id: '69', source: '22', target: '32',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },

    // ═══ INTEGRATION internal flows ═══
    // App Service → Service Bus (publish)
    { id: '70', source: '30', target: '34', label: 'publish',
      style: `${edge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },
    // Functions → Service Bus (publish)
    { id: '71', source: '31', target: '34',
      style: `${edge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    // Service Bus → Functions (consume)
    { id: '72', source: '34', target: '31', label: 'trigger',
      style: `${dashed}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },
    // Logic Apps → Service Bus (orchestrate)
    { id: '73', source: '33', target: '34',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.7;entryDx=0;entryDy=0;` },
    // Event Grid → Functions (react)
    { id: '74', source: '35', target: '31', label: 'react',
      style: `${edge}exitX=0;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },
    // Service Bus → Event Grid (forward)
    { id: '75', source: '34', target: '35',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    // Event Hubs → Event Grid
    { id: '76', source: '36', target: '35',
      style: `${edge}exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;` },
    // Logic Apps → Data Factory (trigger pipeline)
    { id: '77', source: '33', target: '37', label: 'trigger\npipeline',
      style: `${edge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },

    // ═══ INTEGRATION → DATA ═══
    // App Service → SQL
    { id: '80', source: '30', target: '40',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    // AKS → Cosmos DB
    { id: '81', source: '32', target: '41',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    // Functions → Storage Account
    { id: '82', source: '31', target: '42',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=0;` },
    // Data Factory → SQL (load)
    { id: '83', source: '37', target: '40', label: 'load',
      style: `${edge}exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },
    // Data Factory → Storage Account (stage)
    { id: '84', source: '37', target: '42', label: 'stage',
      style: `${edge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },
    // Data Factory → Synapse (analytics)
    { id: '85', source: '37', target: '43', label: 'analytics',
      style: `${edge}exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;` },
    // Event Hubs → Synapse (stream ingest)
    { id: '86', source: '36', target: '43', label: 'stream\ningest',
      style: `${edge}exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },

    // ═══ CROSS-CUTTING (dashed governance lines) ═══
    // Entra ID → API Management (auth)
    { id: '90', source: '50', target: '21', label: 'OAuth',
      style: `${dashed}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },
    // Key Vault → Logic Apps (secrets)
    { id: '91', source: '51', target: '33', label: 'secrets',
      style: `${dashed}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },
    // App Insights → Functions (telemetry)
    { id: '92', source: '53', target: '31', label: 'telemetry',
      style: `${dashed}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },
    // Monitor → Event Hubs (diagnostics)
    { id: '93', source: '54', target: '36', label: 'diagnostics',
      style: `${dashed}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },
    // Redis → App Service (caching)
    { id: '94', source: '55', target: '32', label: 'cache',
      style: `${dashed}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;fontSize=9;` },
  ],
  metadata: {
    title: 'Azure Integration Services — Reference Architecture',
    diagramType: 'infrastructure',
    notation: 'azure',
  },
};

// --- Generate, validate, store ---
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
    'API Management', 'Data Factory', 'Logic Apps', 'Service Bus',
    'Event Grid', 'Event Hubs', 'Functions', 'App Service',
    'SQL', 'Cosmos', 'Synapse', 'Key Vault', 'Monitor',
  ],
  model.metadata.notation,
);
if (!semantics.valid) {
  console.error('Semantic errors:', semantics.issues.filter(i => i.severity === 'error'));
  process.exit(1);
}
const warnings = semantics.issues.filter(i => i.severity === 'warning');
if (warnings.length > 0) console.warn('Semantic warnings:', warnings);

const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId,
  name: DIAGRAM_NAME,
  project: PROJECT_ID,
  currentVersion: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['azure', 'integration-services', 'data-factory', 'api-management', 'reference-architecture'],
  prompt: 'generate a reference architecture model for Azure Integration Services, including Azure Data Factory, Azure API Management',
  description: 'Azure Integration Services reference architecture with Data Factory, API Management, Logic Apps, Service Bus, Event Grid, Event Hubs, and full data platform',
};

await modelStore.save(storedModel);
await versionMgr.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`Model: ${STORAGE_ROOT}/projects/${PROJECT_ID}/models/${modelId}.json`);
console.log(`Export: ${exportPath}`);
