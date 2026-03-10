/**
 * Image-to-model generation test: Azure Basic Enterprise Integration
 *
 * Recreates the reference image showing API Management, Logic Apps
 * workflow orchestration, Service Bus/Event Grid messaging, and
 * back-end systems (SaaS, Azure services, message-based services).
 */

import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  buildImageAnalysisPrompt,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  resolveShape,
} from '../src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '../src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'azure-integration';
const DIAGRAM_NAME = 'azure-basic-enterprise-integration';
const STORAGE_ROOT = './storage';
const NOTATION = 'azure' as const;

// --- Log analysis prompt ---
const analysisPrompt = buildImageAnalysisPrompt({
  notation: NOTATION,
  diagramType: 'infrastructure',
  additionalContext: 'Azure basic enterprise integration with API Management, Logic Apps, Service Bus, Event Grid, and back-end systems',
});
console.log('Image analysis prompt generated:', analysisPrompt.length, 'chars');

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'Azure Basic Enterprise Integration - image recreation');

// --- Resolve notation shapes ---
const apiMgmt = resolveShape(NOTATION, 'API Management');
const logicApps = resolveShape(NOTATION, 'Logic Apps');
const serviceBus = resolveShape(NOTATION, 'Service Bus');
const eventGrid = resolveShape(NOTATION, 'Event Grid Topics');

// Azure icon base for shapes not in the catalogue
const AZURE_ICON_BASE = 'aspect=fixed;html=1;points=[];align=center;image;fontSize=12;';
function azureIcon(svgPath: string): string {
  return `${AZURE_ICON_BASE}image=${svgPath};`;
}

// Shapes not in current catalogue
const entraIdStyle = azureIcon('img/lib/azure2/identity/Azure_Active_Directory.svg');
const clientAppsStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;';
const backendCloudStyle = azureIcon('img/lib/azure2/general/Module.svg');
const saasGearStyle = 'aspect=fixed;html=1;points=[];align=center;image;fontSize=11;image=img/lib/azure2/preview/Azure_Managed_Grafana.svg;';

// Container styles
const solidContainer = 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#000000;verticalAlign=top;fontStyle=1;fontSize=11;align=left;spacingLeft=5;';
const dashedContainer = 'rounded=0;whiteSpace=wrap;html=1;dashed=1;fillColor=none;strokeColor=#000000;verticalAlign=top;fontStyle=1;fontSize=11;align=left;spacingLeft=5;';

// Generic gear-cloud icon for back-end services
const gearCloudStyle = 'shape=mxgraph.azure.cloud;fillColor=#0078D4;strokeColor=#0078D4;fontColor=#000000;verticalLabelPosition=bottom;verticalAlign=top;html=1;fontSize=11;';

// --- Build DiagramModel ---
// All container children use RELATIVE coordinates.
const model: DiagramModel = {
  containers: [
    // API Management / API Gateway container
    {
      id: '2',
      label: 'API Management',
      style: solidContainer,
      x: 130,
      y: 50,
      width: 180,
      height: 160,
    },
    // Workflow and orchestration container
    {
      id: '3',
      label: 'Workflow and orchestration',
      style: solidContainer,
      x: 310,
      y: 50,
      width: 210,
      height: 160,
    },
    // Queues, topics, subscriptions, and events container
    {
      id: '4',
      label: 'Queues, topics, subscriptions, and events',
      style: dashedContainer,
      x: 200,
      y: 240,
      width: 320,
      height: 120,
    },
  ],
  nodes: [
    // --- Top-level nodes (no parent) ---

    // "Back-end systems" label
    {
      id: '5',
      label: 'Back-end systems',
      style: 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=14;fontStyle=1;fontColor=#0078D4;',
      x: 570,
      y: 20,
      width: 150,
      height: 25,
    },

    // Client apps (top-left)
    {
      id: '6',
      label: 'Client\napps',
      style: clientAppsStyle,
      x: 40,
      y: 70,
      width: 60,
      height: 50,
    },

    // Microsoft Entra ID (bottom-left)
    {
      id: '7',
      label: 'Microsoft\nEntra ID',
      style: entraIdStyle,
      x: 40,
      y: 310,
      width: 50,
      height: 50,
    },

    // SaaS service (right side)
    {
      id: '8',
      label: 'SaaS service',
      style: azureIcon('img/lib/azure2/general/Module.svg'),
      x: 600,
      y: 60,
      width: 50,
      height: 50,
    },

    // Azure services (right side)
    {
      id: '9',
      label: 'Azure services',
      style: azureIcon('img/lib/azure2/compute/Cloud_Services_Classic.svg'),
      x: 600,
      y: 130,
      width: 50,
      height: 50,
    },

    // Message-based service (right side)
    {
      id: '10',
      label: 'Message-based\nservice',
      style: azureIcon('img/lib/azure2/general/Module.svg'),
      x: 600,
      y: 240,
      width: 50,
      height: 50,
    },

    // "REST or SOAP web service" label (bottom-right)
    {
      id: '11',
      label: 'REST or SOAP\nweb service',
      style: 'text;html=1;strokeColor=none;fillColor=none;align=right;verticalAlign=middle;whiteSpace=wrap;fontSize=11;',
      x: 580,
      y: 340,
      width: 100,
      height: 30,
    },

    // Microsoft Azure logo text (bottom-left)
    {
      id: '12',
      label: 'Microsoft\nAzure',
      style: 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=13;fontStyle=1;',
      x: 60,
      y: 410,
      width: 100,
      height: 35,
    },

    // Azure logo icon
    {
      id: '13',
      label: '',
      style: azureIcon('img/lib/azure2/general/10537-icon-service-Microsoft-Azure.svg'),
      x: 20,
      y: 410,
      width: 35,
      height: 35,
    },

    // --- API Management container children (relative to x=130, y=50) ---

    // "API Gateway" sub-label
    {
      id: '20',
      label: 'API Gateway',
      style: 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;fontSize=11;',
      x: 40,
      y: 25,
      width: 100,
      height: 20,
      parent: '2',
    },

    // API Management icon
    {
      id: '21',
      label: '',
      style: apiMgmt!.style,
      x: 65,
      y: 65,
      width: 50,
      height: 50,
      parent: '2',
    },

    // --- Workflow and orchestration container children (relative to x=310, y=50) ---

    // Logic app (top-left in workflow)
    {
      id: '30',
      label: 'Logic app',
      style: logicApps!.style,
      x: 15,
      y: 30,
      width: 50,
      height: 50,
      parent: '3',
    },

    // Logic app (top-right in workflow)
    {
      id: '31',
      label: 'Logic app',
      style: logicApps!.style,
      x: 100,
      y: 30,
      width: 50,
      height: 50,
      parent: '3',
    },

    // Logic app (middle, below and between)
    {
      id: '32',
      label: 'Logic app',
      style: logicApps!.style,
      x: 55,
      y: 90,
      width: 50,
      height: 50,
      parent: '3',
    },

    // --- Queues container children (relative to x=200, y=240) ---

    // Service Bus
    {
      id: '40',
      label: 'Service Bus',
      style: serviceBus!.style,
      x: 30,
      y: 40,
      width: 50,
      height: 50,
      parent: '4',
    },

    // Event Grid
    {
      id: '41',
      label: 'Event Grid',
      style: eventGrid!.style,
      x: 150,
      y: 40,
      width: 50,
      height: 50,
      parent: '4',
    },
  ],
  edges: [
    // Client apps → API Management (HTTPS)
    {
      id: '50',
      label: 'HTTPS',
      source: '6',
      target: '21',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // API Management → Logic app (top-left)
    {
      id: '51',
      source: '21',
      target: '30',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Logic app (top-right) → SaaS service (HTTPS)
    {
      id: '52',
      label: 'HTTPS',
      source: '31',
      target: '8',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Logic app (middle) → Azure services (HTTPS)
    {
      id: '53',
      label: 'HTTPS',
      source: '32',
      target: '9',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Message-based service → Event Grid (Messages)
    {
      id: '54',
      label: 'Messages',
      source: '10',
      target: '41',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Event Grid → Service Bus
    {
      id: '55',
      source: '41',
      target: '40',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Queues area → Message-based service (Events)
    {
      id: '56',
      label: 'Events',
      source: '41',
      target: '10',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;',
    },
    // Service Bus → Logic app (Send or pull messages)
    {
      id: '57',
      label: 'Send or pull messages',
      source: '40',
      target: '32',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;',
    },
    // API Gateway → REST or SOAP web service (HTTPS, bottom path)
    {
      id: '58',
      label: 'HTTPS',
      source: '21',
      target: '11',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Authentication: Entra ID → Client apps
    {
      id: '59',
      label: 'Authentication',
      source: '7',
      target: '6',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;',
    },
    // Workflow → Queues (downward)
    {
      id: '60',
      source: '32',
      target: '41',
      style: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;',
    },
  ],
  metadata: {
    title: 'Azure Basic Enterprise Integration',
    description: 'Basic enterprise integration architecture showing API Management as the gateway, Logic Apps for workflow orchestration, Service Bus and Event Grid for asynchronous messaging, connecting to SaaS services, Azure services, and message-based back-end systems.',
    diagramType: 'infrastructure',
    notation: NOTATION,
    sourceImage: 'reference-image-azure-integration.png',
  },
};

// --- Standard generation pipeline ---
const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells, 'Azure Enterprise Integration');
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

const expectedLabels = model.nodes
  .filter(n => n.label && n.label.length > 2 && !n.style.startsWith('text;'))
  .map(n => n.label);

const semantics = validateSemantics(
  result.finalXml,
  expectedLabels,
  model.metadata.notation,
);
if (!semantics.valid) {
  console.warn('Semantic issues:', semantics.issues);
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
  tags: ['image-recreation', 'azure', 'integration', 'enterprise'],
  prompt: 'Recreated from Azure basic enterprise integration reference image',
  description: model.metadata.title ?? DIAGRAM_NAME,
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Image recreation - initial');

// --- Export to resources folder ---
const exportPath = './resources/azure-basic-enterprise-integration.drawio';
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nGeneration complete!`);
console.log(`Model ID: ${modelId}`);
console.log(`Exported to: ${exportPath}`);
console.log(`Validation: ${result.validation.valid ? 'PASS' : 'FAIL'}`);
console.log(`Fixes applied: ${result.fixesApplied?.length ?? 0}`);
