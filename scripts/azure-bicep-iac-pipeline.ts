import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview, resolveShape,
  ProjectManager, ModelStore, VersionManager, ExportManager,
} from '/home/leono/Development/modelling_skill/src/index.js';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '/home/leono/Development/modelling_skill/src/types/index.js';

const PROJECT_ID = 'azure-bicep-iac';
const DIAGRAM_NAME = 'bicep-iac-pipeline';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// --- Resolve Azure shapes ---
const keyVault = resolveShape('azure', 'Key Vault')!;
const azMonitor = resolveShape('azure', 'Azure Monitor')!;

// --- Style constants ---
// Azure DevOps blue
const devOpsStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#0078D4;strokeColor=#005A9E;fontColor=#FFFFFF;fontSize=11;';
// Pipeline stage
const stageStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E8F0FE;strokeColor=#0078D4;fontSize=10;';
// Environment
const envAutoStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontSize=10;fontStyle=1;';
const envApprovalStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontSize=10;fontStyle=1;';
const envSnowStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8CECC;strokeColor=#B85450;fontSize=10;fontStyle=1;';
// ServiceNow (green)
const snowStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#81B64C;strokeColor=#56782D;fontColor=#FFFFFF;fontSize=11;';
// Azure Policy (purple)
const policyStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontSize=11;';
// Developer / actor
const actorStyle = 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontSize=10;';
// Generic Azure service (light blue)
const azureSvcStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=11;';
// Container
const containerStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=11;strokeColor=#999999;';
// Edge styles
const flowEdge = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;';
const servEdge = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;dashed=1;strokeColor=#999999;';
const snowEdge = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#56782D;';
const policyEdge = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;dashed=1;strokeColor=#9673A6;';

// --- Layout ---
const containers: DiagramModel['containers'] = [
  // Source Control & Registry
  { id: 'c1', label: 'Source Control & Registry', style: containerStyle, x: 30, y: 55, width: 365, height: 95 },
  // CI Pipeline
  { id: 'c2', label: 'CI Pipeline (Build Validation)', style: `${containerStyle}strokeColor=#0078D4;`, x: 30, y: 175, width: 500, height: 90 },
  // CD — Environment Promotion
  { id: 'c3', label: 'CD — Environment Promotion (Azure DevOps Environments)', style: `${containerStyle}strokeColor=#0078D4;`, x: 30, y: 290, width: 760, height: 90 },
  // Secrets Management
  { id: 'c4', label: 'Secrets Management (per-environment Key Vaults)', style: `${containerStyle}strokeColor=#6C8EBF;`, x: 30, y: 405, width: 590, height: 85 },
  // Governance & Observability
  { id: 'c5', label: 'Governance & Observability', style: `${containerStyle}strokeColor=#9673A6;`, x: 30, y: 515, width: 400, height: 80 },
];

const nodes: DiagramModel['nodes'] = [
  // Title
  { id: 't1', label: 'Bicep IaC Provisioning — Azure DevOps with Key Vault & ServiceNow', style: 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=14;fontStyle=1;', x: 30, y: 10, width: 760, height: 30 },

  // --- Row 1: Source Control ---
  // Developer (outside container)
  { id: 'n1', label: 'Developer', style: actorStyle, x: 440, y: 60, width: 30, height: 50 },
  // PR + Branch Policy (outside container)
  { id: 'n2', label: 'PR + Branch\nPolicy', style: `${devOpsStyle}fontSize=9;`, x: 500, y: 65, width: 90, height: 45 },

  // Inside Source Control container (relative coords)
  { id: 'n3', label: 'Azure DevOps\nRepos (Bicep)', style: devOpsStyle, x: 15, y: 30, width: 130, height: 50, parent: 'c1' },
  { id: 'n4', label: 'ACR\nBicep Module Registry', style: azureSvcStyle, x: 205, y: 30, width: 140, height: 50, parent: 'c1' },

  // --- Row 2: CI Pipeline stages ---
  { id: 'n10', label: 'Build\n& Lint', style: stageStyle, x: 15, y: 30, width: 90, height: 45, parent: 'c2' },
  { id: 'n11', label: 'Preflight\nValidate', style: stageStyle, x: 125, y: 30, width: 90, height: 45, parent: 'c2' },
  { id: 'n12', label: 'What-If\nPreview', style: stageStyle, x: 235, y: 30, width: 90, height: 45, parent: 'c2' },
  { id: 'n13', label: 'Manual\nReview', style: `${stageStyle}fillColor=#FFF2CC;strokeColor=#D6B656;`, x: 345, y: 30, width: 90, height: 45, parent: 'c2' },

  // --- Row 3: Environment promotion ---
  { id: 'n20', label: 'Dev\n(auto-deploy)', style: envAutoStyle, x: 15, y: 30, width: 120, height: 45, parent: 'c3' },
  { id: 'n21', label: 'Test\n(approval gate)', style: envApprovalStyle, x: 195, y: 30, width: 120, height: 45, parent: 'c3' },
  { id: 'n22', label: 'Staging\n(approval gate)', style: envApprovalStyle, x: 375, y: 30, width: 120, height: 45, parent: 'c3' },
  { id: 'n23', label: 'Production\n(ServiceNow gate)', style: envSnowStyle, x: 555, y: 30, width: 140, height: 45, parent: 'c3' },

  // ServiceNow (outside containers, right side)
  { id: 'n24', label: 'ServiceNow\nChange Mgmt', style: snowStyle, x: 660, y: 170, width: 130, height: 50 },
  { id: 'n24a', label: 'Pre-deploy: Create CR → Poll → Approve\nPost-deploy: Update CR → Close', style: 'text;html=1;align=left;verticalAlign=top;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=8;fontColor=#56782D;', x: 650, y: 222, width: 190, height: 30 },

  // --- Row 4: Key Vaults ---
  { id: 'n30', label: 'Key Vault\n(Dev)', style: `${keyVault.style}fontSize=9;`, x: 15, y: 25, width: keyVault.defaultWidth, height: keyVault.defaultHeight, parent: 'c4' },
  { id: 'n31', label: 'Key Vault\n(Test)', style: `${keyVault.style}fontSize=9;`, x: 150, y: 25, width: keyVault.defaultWidth, height: keyVault.defaultHeight, parent: 'c4' },
  { id: 'n32', label: 'Key Vault\n(Staging)', style: `${keyVault.style}fontSize=9;`, x: 285, y: 25, width: keyVault.defaultWidth, height: keyVault.defaultHeight, parent: 'c4' },
  { id: 'n33', label: 'Key Vault\n(Prod)', style: `${keyVault.style}fontSize=9;`, x: 420, y: 25, width: keyVault.defaultWidth, height: keyVault.defaultHeight, parent: 'c4' },

  // Per-environment Workload Identities (scoped RBAC)
  { id: 'n35', label: 'Workload Identity\nFederation (OIDC)\nper-env scoped RBAC', style: `${azureSvcStyle}fontSize=8;`, x: 640, y: 410, width: 150, height: 55 },

  // --- Row 5: Governance ---
  { id: 'n40', label: 'Azure Policy\n(Policy-as-Code)', style: policyStyle, x: 15, y: 25, width: 140, height: 40, parent: 'c5' },
  { id: 'n41', label: 'Azure Monitor\n(all environments)', style: `${azMonitor.style}fontSize=9;`, x: 230, y: 20, width: azMonitor.defaultWidth, height: azMonitor.defaultHeight, parent: 'c5' },

  // Smoke tests (post-deployment validation)
  { id: 'n43', label: 'Post-Deploy\nSmoke Tests', style: `${stageStyle}fillColor=#D5E8D4;strokeColor=#82B366;fontSize=9;`, x: 640, y: 300, width: 120, height: 40 },

  // Branch control
  { id: 'n44', label: 'Branch Control\n(main only → Prod)', style: `${policyStyle}fontSize=8;`, x: 640, y: 350, width: 140, height: 40 },

  // ARM target label
  { id: 'n42', label: 'Azure Resource\nManager (ARM)', style: `${azureSvcStyle}fontSize=9;`, x: 640, y: 490, width: 150, height: 45 },
];

const edges: DiagramModel['edges'] = [
  // Developer → PR → Repos (commit flow)
  { id: 'e1', source: 'n1', target: 'n2', style: flowEdge },
  { id: 'e1a', source: 'n2', target: 'n3', style: flowEdge, label: 'merge' },

  // Repos → Pipeline (trigger)
  { id: 'e2', source: 'n3', target: 'n10', style: flowEdge, label: 'triggers' },

  // ACR ← Pipeline (pull modules)
  { id: 'e3', source: 'n4', target: 'n10', style: servEdge, label: 'pull modules' },

  // Pipeline stages flow
  { id: 'e4', source: 'n10', target: 'n11', style: flowEdge },
  { id: 'e5', source: 'n11', target: 'n12', style: flowEdge },
  { id: 'e6', source: 'n12', target: 'n13', style: flowEdge },

  // Pipeline → Environments
  { id: 'e7', source: 'n13', target: 'n20', style: flowEdge, label: 'deploy' },

  // Environment promotion
  { id: 'e8', source: 'n20', target: 'n21', style: flowEdge, label: 'promote' },
  { id: 'e9', source: 'n21', target: 'n22', style: flowEdge, label: 'promote' },
  { id: 'e10', source: 'n22', target: 'n23', style: flowEdge, label: 'promote' },

  // ServiceNow ↔ Prod gate
  { id: 'e11', source: 'n23', target: 'n24', style: snowEdge, label: 'gate check' },

  // Environments → Key Vaults (secrets retrieval)
  { id: 'e20', source: 'n20', target: 'n30', style: servEdge, label: 'get secrets' },
  { id: 'e21', source: 'n21', target: 'n31', style: servEdge, label: 'get secrets' },
  { id: 'e22', source: 'n22', target: 'n32', style: servEdge, label: 'get secrets' },
  { id: 'e23', source: 'n23', target: 'n33', style: servEdge, label: 'get secrets' },

  // Workload Identity → Key Vaults & ARM
  { id: 'e30', source: 'n35', target: 'n33', style: servEdge, label: 'authenticates' },
  { id: 'e31', source: 'n35', target: 'n42', style: servEdge, label: 'deploys via' },

  // Azure Policy → ALL Environments (governance)
  { id: 'e40', source: 'n40', target: 'n20', style: policyEdge, label: 'governs' },
  { id: 'e40b', source: 'n40', target: 'n21', style: policyEdge },
  { id: 'e40c', source: 'n40', target: 'n22', style: policyEdge },
  { id: 'e41', source: 'n40', target: 'n23', style: policyEdge },

  // Azure Monitor → ALL Environments (observability)
  { id: 'e42', source: 'n41', target: 'n20', style: servEdge, label: 'monitors' },
  { id: 'e42b', source: 'n41', target: 'n21', style: servEdge },
  { id: 'e42c', source: 'n41', target: 'n22', style: servEdge },
  { id: 'e42d', source: 'n41', target: 'n23', style: servEdge },

  // Post-deploy smoke tests after each environment
  { id: 'e43', source: 'n23', target: 'n43', style: flowEdge, label: 'validates' },

  // Branch control on Production
  { id: 'e44', source: 'n44', target: 'n23', style: policyEdge, label: 'restricts' },

  // ServiceNow post-deploy closure
  { id: 'e45', source: 'n43', target: 'n24', style: snowEdge, label: 'close CR' },

  // Environments → ARM (deployment target)
  { id: 'e50', source: 'n23', target: 'n42', style: flowEdge, label: 'az deployment' },
];

const model: DiagramModel = {
  containers,
  nodes,
  edges,
  metadata: {
    title: 'Bicep IaC Provisioning — Azure DevOps with Key Vault & ServiceNow',
    diagramType: 'infrastructure',
    notation: 'azure',
  },
};

// --- Preview (complex diagram, but still under threshold) ---
const preview = renderPreview(model, { width: 130, height: 55 });
console.log(preview);

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

const expectedLabels = [
  'Azure DevOps', 'Key Vault', 'ServiceNow', 'ACR', 'Build', 'Validate',
  'What-If', 'Dev', 'Test', 'Staging', 'Production', 'Azure Policy', 'Azure Monitor',
];
const semantics = validateSemantics(result.finalXml, expectedLabels, 'azure');
if (!semantics.valid) {
  console.warn('Semantic issues:', semantics.issues);
}

// --- Write preview ---
writeFileSync('/home/leono/Development/modelling_skill/resources/preview-azure-bicep-iac.txt', preview);

// --- Persist & Export ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const modelStore = new ModelStore(STORAGE_ROOT);
const versionMgr = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versionMgr);

await projects.ensureExists(PROJECT_ID, 'Azure Bicep IaC Pipeline Architecture');
const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId, name: DIAGRAM_NAME, project: PROJECT_ID, currentVersion: 1,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  tags: ['azure', 'bicep', 'iac', 'devops', 'servicenow', 'key-vault'],
  prompt: 'Bicep IaC provisioning with Azure DevOps, Key Vault, and ServiceNow integration',
  description: model.metadata.title ?? DIAGRAM_NAME,
};
await modelStore.save(storedModel);
await versionMgr.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`\nPreview: resources/preview-azure-bicep-iac.txt`);
console.log(`Exported: ${exportPath}`);
