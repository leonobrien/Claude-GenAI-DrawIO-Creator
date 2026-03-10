/**
 * Image-to-model generation test: Azure API Management - Secure Baseline
 *
 * Recreates the reference image showing Azure APIM secure baseline architecture
 * with Application Gateway, WAF, API Management, Private Endpoints, and
 * supporting services (Log Analytics, Application Insights, DNS, Key Vaults).
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
const PROJECT_ID = 'azure-apim-baseline';
const DIAGRAM_NAME = 'azure-apim-secure-baseline';
const STORAGE_ROOT = './storage';
const NOTATION = 'azure' as const;

// --- Log analysis prompt for reference ---
const analysisPrompt = buildImageAnalysisPrompt({
  notation: NOTATION,
  diagramType: 'infrastructure',
  additionalContext: 'Azure API Management secure baseline architecture with subnets, gateways, and supporting services',
});
console.log('Image analysis prompt generated:', analysisPrompt.length, 'chars');

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'Azure API Management Secure Baseline - image recreation');

// --- Resolve notation shapes ---
const appGw = resolveShape(NOTATION, 'Application Gateway');
const apiMgmt = resolveShape(NOTATION, 'API Management');
const keyVault = resolveShape(NOTATION, 'Key Vault');
const vnet = resolveShape(NOTATION, 'Virtual Network');

// Azure icon base for shapes not in the catalogue
const AZURE_ICON_BASE = 'aspect=fixed;html=1;points=[];align=center;image;fontSize=12;';
function azureIcon(svgPath: string): string {
  return `${AZURE_ICON_BASE}image=${svgPath};`;
}

// Shapes not in current catalogue — use direct SVG references
const subscriptionStyle = azureIcon('img/lib/azure2/general/Subscriptions.svg');
const wafStyle = azureIcon('img/lib/azure2/networking/Web_Application_Firewall_Policies_WAF.svg');
const privateEndpointStyle = azureIcon('img/lib/azure2/networking/Private_Endpoint.svg');
const logAnalyticsStyle = azureIcon('img/lib/azure2/analytics/Log_Analytics_Workspaces.svg');
const appInsightsStyle = azureIcon('img/lib/azure2/devops/Application_Insights.svg');
const dnsStyle = azureIcon('img/lib/azure2/networking/DNS_Zones.svg');
const publicIpStyle = azureIcon('img/lib/azure2/networking/Public_IP_Addresses.svg');
const nsgStyle = azureIcon('img/lib/azure2/networking/Network_Security_Groups.svg');

// Container style (dashed boundary with VNet icon label)
const subnetContainer = 'rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=5 5;fillColor=none;strokeColor=#0078D4;verticalAlign=bottom;fontStyle=0;fontSize=11;align=center;';

// --- Build DiagramModel from image analysis ---
// NOTE: Container children use coordinates RELATIVE to the container origin.
const model: DiagramModel = {
  containers: [
    // Application Gateway subnet
    {
      id: '2',
      label: 'Application Gateway\nsubnet',
      style: subnetContainer,
      x: 150,
      y: 80,
      width: 190,
      height: 230,
    },
    // API Management subnet
    {
      id: '3',
      label: 'API Management\nsubnet',
      style: subnetContainer,
      x: 360,
      y: 80,
      width: 170,
      height: 230,
    },
    // Private endpoint subnet (left)
    {
      id: '4',
      label: 'Private endpoint\nsubnet',
      style: subnetContainer,
      x: 550,
      y: 80,
      width: 160,
      height: 230,
    },
    // Private endpoint subnet (right — second instance near Key vaults)
    {
      id: '23',
      label: 'Private endpoint\nsubnet',
      style: subnetContainer,
      x: 730,
      y: 80,
      width: 160,
      height: 230,
    },
  ],
  nodes: [
    // Title (text label)
    {
      id: '5',
      label: 'Azure API Management – Secure baseline',
      style: 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;fontSize=14;fontStyle=1;',
      x: 220,
      y: 10,
      width: 400,
      height: 30,
    },

    // Subscription (top-left)
    {
      id: '6',
      label: 'Subscription',
      style: subscriptionStyle,
      x: 40,
      y: 55,
      width: 40,
      height: 40,
    },

    // Public IP addresses (left)
    {
      id: '7',
      label: 'Public IP\naddresses',
      style: publicIpStyle,
      x: 40,
      y: 170,
      width: 40,
      height: 40,
    },

    // --- App Gateway subnet children (relative to container x=150, y=80) ---
    // VNet icon (top-left of container)
    {
      id: '8',
      label: '',
      style: vnet!.style,
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      parent: '2',
    },
    // NSG / Shield icon (top-right of container)
    {
      id: '9',
      label: '',
      style: nsgStyle,
      x: 50,
      y: 10,
      width: 30,
      height: 30,
      parent: '2',
    },
    // Application Gateway (centred in container)
    {
      id: '10',
      label: 'Application\nGateway',
      style: appGw!.style,
      x: 70,
      y: 70,
      width: 50,
      height: 50,
      parent: '2',
    },
    // WAF (below App Gateway)
    {
      id: '11',
      label: 'Web Application\nFirewall polices\n(WAF)',
      style: wafStyle,
      x: 75,
      y: 140,
      width: 40,
      height: 40,
      parent: '2',
    },

    // --- APIM subnet children (relative to container x=360, y=80) ---
    // VNet icon
    {
      id: '12',
      label: '',
      style: vnet!.style,
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      parent: '3',
    },
    // NSG / Shield icon
    {
      id: '13',
      label: '',
      style: nsgStyle,
      x: 50,
      y: 10,
      width: 30,
      height: 30,
      parent: '3',
    },
    // API Management (Premium)
    {
      id: '14',
      label: 'API Management\n(Premium)',
      style: apiMgmt!.style,
      x: 60,
      y: 80,
      width: 50,
      height: 50,
      parent: '3',
    },

    // --- Private endpoint subnet children (relative to container x=550, y=80) ---
    // VNet icon
    {
      id: '15',
      label: '',
      style: vnet!.style,
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      parent: '4',
    },
    // NSG / Shield icon
    {
      id: '16',
      label: '',
      style: nsgStyle,
      x: 50,
      y: 10,
      width: 30,
      height: 30,
      parent: '4',
    },
    // Private endpoint
    {
      id: '17',
      label: 'Private\nendpoint',
      style: privateEndpointStyle,
      x: 55,
      y: 80,
      width: 50,
      height: 50,
      parent: '4',
    },

    // --- Second private endpoint subnet children (relative to container x=730, y=80) ---
    // VNet icon
    {
      id: '24',
      label: '',
      style: vnet!.style,
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      parent: '23',
    },
    // NSG / Shield icon
    {
      id: '25',
      label: '',
      style: nsgStyle,
      x: 50,
      y: 10,
      width: 30,
      height: 30,
      parent: '23',
    },

    // --- Bottom row services (top-level, no parent) ---
    // Log Analytics workspaces
    {
      id: '18',
      label: 'Log Analytics\nworkspaces',
      style: logAnalyticsStyle,
      x: 270,
      y: 380,
      width: 50,
      height: 50,
    },
    // Application Insights
    {
      id: '19',
      label: 'Application Insights\nazure-api.net',
      style: appInsightsStyle,
      x: 390,
      y: 380,
      width: 50,
      height: 50,
    },
    // DNS
    {
      id: '20',
      label: 'DNS',
      style: dnsStyle,
      x: 510,
      y: 380,
      width: 50,
      height: 50,
    },
    // Key vaults
    {
      id: '21',
      label: 'Key vaults',
      style: keyVault!.style,
      x: 640,
      y: 380,
      width: 50,
      height: 50,
    },
  ],
  edges: [
    // Public IP → Application Gateway
    {
      id: '30',
      source: '7',
      target: '10',
      style: 'endArrow=classic;html=1;strokeColor=#0078D4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Application Gateway → API Management
    {
      id: '31',
      source: '10',
      target: '14',
      style: 'endArrow=classic;html=1;strokeColor=#0078D4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // API Management → Private endpoint
    {
      id: '32',
      source: '14',
      target: '17',
      style: 'endArrow=classic;html=1;strokeColor=#0078D4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;',
    },
    // Private endpoint → Key vaults
    {
      id: '33',
      source: '17',
      target: '21',
      style: 'endArrow=classic;html=1;strokeColor=#0078D4;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;',
    },
  ],
  metadata: {
    title: 'Azure API Management – Secure baseline',
    description: 'Azure API Management secure baseline architecture showing Application Gateway with WAF, API Management in a dedicated subnet, and private endpoints for backend connectivity. Supporting services include Log Analytics, Application Insights, DNS, and Key Vaults.',
    diagramType: 'infrastructure',
    notation: NOTATION,
    sourceImage: 'reference-image-azure-apim.png',
  },
};

// --- Standard generation pipeline ---
const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells, 'Azure APIM Secure Baseline');
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

const expectedLabels = model.nodes
  .filter(n => n.label && !n.label.startsWith('Azure API Management'))
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
  tags: ['image-recreation', 'azure', 'apim', 'secure-baseline'],
  prompt: 'Recreated from Azure API Management secure baseline reference image',
  description: model.metadata.title ?? DIAGRAM_NAME,
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Image recreation - initial');

// --- Export to resources folder ---
const exportPath = './resources/azure-apim-secure-baseline.drawio';
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nGeneration complete!`);
console.log(`Model ID: ${modelId}`);
console.log(`Exported to: ${exportPath}`);
console.log(`Validation: ${result.validation.valid ? 'PASS' : 'FAIL'}`);
console.log(`Fixes applied: ${result.fixesApplied?.length ?? 0}`);
