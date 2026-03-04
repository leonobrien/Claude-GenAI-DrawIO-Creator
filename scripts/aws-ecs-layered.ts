import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  getNotation,
} from '../src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '../src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'aws-ecs-architecture';
const DIAGRAM_NAME = 'aws-ecs-layered';
const STORAGE_ROOT = '/home/leono/Development/modelling_skill/storage';

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const modelStore = new ModelStore(STORAGE_ROOT);
const versionMgr = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versionMgr);

await projects.ensureExists(PROJECT_ID, 'AWS ECS layered architecture with WAF, ALB, ECS, and RDS PostgreSQL');

// --- AWS notation ---
const aws = getNotation('aws');

// Shape lookups from catalogue
const waf = aws.shapes.find(s => s.name === 'WAF')!;
const elb = aws.shapes.find(s => s.name === 'ELB')!;
const ecsCluster = aws.shapes.find(s => s.name === 'ECS')!;
const ecsTask = aws.shapes.find(s => s.name === 'ECS Task')!;
const rds = aws.shapes.find(s => s.name === 'RDS')!;
const iam = aws.shapes.find(s => s.name === 'IAM')!;
const cloudwatch = aws.shapes.find(s => s.name === 'CloudWatch')!;

// Edge styles
const edgeStyle = aws.styleTemplates.edge;
const dashedEdge = `${edgeStyle}dashed=1;`;

// AWS group container styles
const vpcContainer = 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#248814;fillColor=none;verticalAlign=top;align=left;spacingLeft=30;dashed=0;';
const publicSubnet = 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=11;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_security_group;strokeColor=#7AA116;fillColor=#F2F6E8;verticalAlign=top;align=left;spacingLeft=30;dashed=0;';
const privateSubnet = 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=11;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_security_group;strokeColor=#147EBA;fillColor=#E6F2F8;verticalAlign=top;align=left;spacingLeft=30;dashed=0;';
const securityGroup = 'rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 4;fillColor=none;strokeColor=#DD344C;verticalAlign=top;fontStyle=1;fontSize=10;fontColor=#DD344C;';

// Internet / Users style
const usersStyle = 'sketch=0;outlineConnect=0;fontColor=#232F3E;fillColor=#232F3E;strokeColor=#ffffff;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.users;';

const model: DiagramModel = {
  containers: [
    // VPC
    {
      id: '2', label: 'VPC (10.0.0.0/16)',
      style: vpcContainer,
      x: 40, y: 170, width: 720, height: 440,
    },
    // Public Subnet (ALB)
    {
      id: '3', label: 'Public Subnet (10.0.1.0/24)',
      style: publicSubnet,
      x: 20, y: 40, width: 680, height: 120,
      parent: '2',
    },
    // SG: ALB Security Group
    {
      id: '4', label: 'SG: alb-sg (inbound 80/443)',
      style: securityGroup,
      x: 180, y: 25, width: 320, height: 90,
      parent: '3',
    },
    // Private Subnet - Application (ECS)
    {
      id: '5', label: 'Private Subnet - App (10.0.2.0/24)',
      style: privateSubnet,
      x: 20, y: 180, width: 680, height: 140,
      parent: '2',
    },
    // SG: ECS Security Group
    {
      id: '6', label: 'SG: ecs-sg (inbound from alb-sg)',
      style: securityGroup,
      x: 80, y: 25, width: 520, height: 105,
      parent: '5',
    },
    // Private Subnet - Data (RDS)
    {
      id: '7', label: 'Private Subnet - Data (10.0.3.0/24)',
      style: privateSubnet,
      x: 20, y: 340, width: 680, height: 90,
      parent: '2',
    },
    // SG: RDS Security Group
    {
      id: '8', label: 'SG: rds-sg (inbound 5432 from ecs-sg)',
      style: securityGroup,
      x: 180, y: 22, width: 320, height: 62,
      parent: '7',
    },
  ],
  nodes: [
    // ── External ──
    {
      id: '10', label: 'Users',
      style: usersStyle,
      x: 370, y: 20, width: 60, height: 60,
    },
    // WAF (from catalogue)
    {
      id: '11', label: 'AWS WAF',
      style: waf.style,
      x: 360, y: 95, width: 78, height: 78,
    },

    // ── Public Subnet: ALB ──
    {
      id: '20', label: 'Application\nLoad Balancer\n(Port 80)',
      style: elb.style,
      x: 121, y: 6, width: 78, height: 78,
      parent: '4',
    },

    // ── Private Subnet - App: ECS Cluster + Tasks ──
    {
      id: '30', label: 'ECS\nCluster',
      style: ecsCluster.style,
      x: 10, y: 12, width: 78, height: 78,
      parent: '6',
    },
    {
      id: '31', label: 'Task 1',
      style: ecsTask.style,
      x: 150, y: 28, width: ecsTask.defaultWidth, height: ecsTask.defaultHeight,
      parent: '6',
    },
    {
      id: '32', label: 'Task 2',
      style: ecsTask.style,
      x: 250, y: 28, width: ecsTask.defaultWidth, height: ecsTask.defaultHeight,
      parent: '6',
    },
    {
      id: '33', label: 'Task 3',
      style: ecsTask.style,
      x: 350, y: 28, width: ecsTask.defaultWidth, height: ecsTask.defaultHeight,
      parent: '6',
    },

    // ── Private Subnet - Data: RDS ──
    {
      id: '40', label: 'RDS\nPostgreSQL',
      style: rds.style,
      x: 121, y: -8, width: 78, height: 78,
      parent: '8',
    },

    // ── Cross-cutting (outside VPC) ──
    {
      id: '50', label: 'IAM\nRoles',
      style: iam.style,
      x: 40, y: 20, width: 60, height: 60,
    },
    {
      id: '51', label: 'CloudWatch\nMonitoring',
      style: cloudwatch.style,
      x: 700, y: 20, width: 60, height: 60,
    },
  ],
  edges: [
    // Users → WAF
    { id: '60', source: '10', target: '11', label: 'HTTPS',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    // WAF → ALB
    { id: '61', source: '11', target: '20', label: 'Port 80',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    // ALB → ECS Tasks (load balanced)
    { id: '62', source: '20', target: '31', label: 'forward',
      style: `${edgeStyle}exitX=0.25;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '63', source: '20', target: '32',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '64', source: '20', target: '33',
      style: `${edgeStyle}exitX=0.75;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    // ECS manages tasks
    { id: '65', source: '30', target: '31', label: 'manages',
      style: `${dashedEdge}exitX=1;exitY=0.25;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '66', source: '30', target: '32',
      style: `${dashedEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '67', source: '30', target: '33',
      style: `${dashedEdge}exitX=1;exitY=0.75;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    // Tasks → RDS
    { id: '68', source: '31', target: '40', label: 'TCP 5432',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.25;entryY=0;entryDx=0;entryDy=0;` },
    { id: '69', source: '32', target: '40',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '70', source: '33', target: '40',
      style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.75;entryY=0;entryDx=0;entryDy=0;` },
    // IAM → ECS (dashed, governance)
    { id: '71', source: '50', target: '30', label: 'task role',
      style: `${dashedEdge}exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=0;` },
    // CloudWatch ← ALB (dashed, monitoring)
    { id: '72', source: '20', target: '51', label: 'metrics',
      style: `${dashedEdge}exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;` },
    // CloudWatch ← ECS
    { id: '73', source: '30', target: '51', label: 'logs',
      style: `${dashedEdge}exitX=1;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
  ],
  metadata: {
    title: 'AWS ECS Layered Architecture with WAF, ALB, ECS & RDS PostgreSQL',
    diagramType: 'infrastructure',
    notation: 'aws',
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
  ['WAF', 'Load Balancer', 'ECS', 'Task', 'PostgreSQL', 'IAM', 'CloudWatch'],
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
  tags: ['aws', 'ecs', 'waf', 'alb', 'rds', 'postgresql', 'security-groups'],
  prompt: 'draw a aws architecture layered diagram that includes ecs for a container cluster, application load balancer on port 80, web application firewall, and a PostgreSQL managed relational db with each service in its own network and security groups controlling access',
  description: 'AWS ECS layered architecture with WAF, ALB, ECS cluster, and RDS PostgreSQL — each in its own subnet with security groups',
};

await modelStore.save(storedModel);
await versionMgr.saveVersion(PROJECT_ID, modelId, result.finalXml, 'v2 - using proper ECS Task and WAF shapes from catalogue');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`Diagram stored: ${STORAGE_ROOT}/projects/${PROJECT_ID}/models/${modelId}.json`);
console.log(`Exported to: ${exportPath}`);
