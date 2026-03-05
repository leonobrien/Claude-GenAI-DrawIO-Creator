/**
 * Generate all 5 USAGE.md example .drawio files.
 * Run with: npx tsx scripts/generate-usage-examples.ts
 */
import { writeFileSync } from 'node:fs';
import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml,
  getNotation,
} from '../src/index.js';
import type { DiagramModel } from '../src/types/index.js';

function generate(model: DiagramModel, outputPath: string): void {
  const bareCells = buildDiagramXml(model);
  const fullXml = wrapWithMxFile(bareCells);
  const result = validateAndFixXml(fullXml);
  if (!result.validation.valid) {
    console.error(`Validation errors for ${outputPath}:`, result.validation.errors);
    process.exit(1);
  }
  writeFileSync(outputPath, result.finalXml, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

// ─── 1. AWS Three-Tier Architecture ─────────────────────────────────────────

const aws = getNotation('aws');
const elb = aws.shapes.find(s => s.name === 'ELB')!;
const ec2 = aws.shapes.find(s => s.name === 'EC2 Instance')!;
const rds = aws.shapes.find(s => s.name === 'RDS')!;
const awsEdge = aws.styleTemplates.edge;

const vpcStyle = 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#248814;fillColor=none;verticalAlign=top;align=left;spacingLeft=30;dashed=0;';
const publicSubnet = 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=11;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_security_group;strokeColor=#7AA116;fillColor=#F2F6E8;verticalAlign=top;align=left;spacingLeft=30;dashed=0;';
const privateSubnet = 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=11;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_security_group;strokeColor=#147EBA;fillColor=#E6F2F8;verticalAlign=top;align=left;spacingLeft=30;dashed=0;';
const usersStyle = 'sketch=0;outlineConnect=0;fontColor=#232F3E;fillColor=#232F3E;strokeColor=#ffffff;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.users;';

const awsModel: DiagramModel = {
  containers: [
    { id: '2', label: 'VPC', style: vpcStyle, x: 40, y: 120, width: 720, height: 490 },
    { id: '3', label: 'Public Subnet', style: publicSubnet, x: 20, y: 40, width: 680, height: 120, parent: '2' },
    { id: '4', label: 'Private Subnet - App', style: privateSubnet, x: 20, y: 180, width: 680, height: 120, parent: '2' },
    { id: '5', label: 'Private Subnet - Data', style: privateSubnet, x: 20, y: 320, width: 680, height: 120, parent: '2' },
  ],
  nodes: [
    { id: '10', label: 'Users', style: usersStyle, x: 360, y: 40, width: 60, height: 60 },
    { id: '20', label: 'Application\nLoad Balancer', style: elb.style, x: 300, y: 20, width: 78, height: 78, parent: '3' },
    { id: '30', label: 'EC2\nInstance 1', style: ec2.style, x: 80, y: 20, width: 78, height: 78, parent: '4' },
    { id: '31', label: 'EC2\nInstance 2', style: ec2.style, x: 300, y: 20, width: 78, height: 78, parent: '4' },
    { id: '32', label: 'EC2\nInstance 3', style: ec2.style, x: 520, y: 20, width: 78, height: 78, parent: '4' },
    { id: '40', label: 'RDS\nPrimary', style: rds.style, x: 200, y: 20, width: 78, height: 78, parent: '5' },
    { id: '41', label: 'RDS\nReplica', style: rds.style, x: 400, y: 20, width: 78, height: 78, parent: '5' },
  ],
  edges: [
    { id: '50', source: '10', target: '20', label: 'HTTPS', style: `${awsEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '51', source: '20', target: '30', label: 'forward', style: `${awsEdge}exitX=0.25;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '52', source: '20', target: '31', style: `${awsEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '53', source: '20', target: '32', style: `${awsEdge}exitX=0.75;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '54', source: '30', target: '40', label: 'TCP 3306', style: `${awsEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '55', source: '31', target: '40', style: `${awsEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '56', source: '32', target: '40', style: `${awsEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '57', source: '40', target: '41', label: 'replication', style: `${awsEdge}dashed=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
  ],
  metadata: { title: 'AWS Three-Tier Architecture', diagramType: 'infrastructure', notation: 'aws' },
};

generate(awsModel, 'resources/aws-three-tier.drawio');

// ─── 2. CI/CD Pipeline Flowchart ────────────────────────────────────────────

const generic = getNotation('generic');
const genEdge = generic.styleTemplates.edge;
const roundedRect = 'rounded=1;whiteSpace=wrap;html=1;';

const cicdModel: DiagramModel = {
  containers: [],
  nodes: [
    { id: '2', label: 'Code\nCommit', style: `${roundedRect}fillColor=#d5e8d4;strokeColor=#82b366;`, x: 40, y: 220, width: 120, height: 60 },
    { id: '3', label: 'Build', style: `${roundedRect}fillColor=#dae8fc;strokeColor=#6c8ebf;`, x: 210, y: 220, width: 120, height: 60 },
    { id: '4', label: 'Tests\nPass?', style: 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;', x: 380, y: 210, width: 80, height: 80 },
    { id: '5', label: 'Deploy to\nStaging', style: `${roundedRect}fillColor=#dae8fc;strokeColor=#6c8ebf;`, x: 510, y: 220, width: 120, height: 60 },
    { id: '6', label: 'Approval\nGate?', style: 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;', x: 680, y: 210, width: 80, height: 80 },
    { id: '7', label: 'Deploy to\nProduction', style: `${roundedRect}fillColor=#d5e8d4;strokeColor=#82b366;`, x: 510, y: 80, width: 120, height: 60 },
    { id: '8', label: 'Monitor', style: `${roundedRect}fillColor=#e1d5e7;strokeColor=#9673a6;`, x: 680, y: 80, width: 120, height: 60 },
    { id: '9', label: 'Fix &\nRetry', style: `${roundedRect}fillColor=#f8cecc;strokeColor=#b85450;`, x: 380, y: 380, width: 120, height: 60 },
  ],
  edges: [
    { id: '20', source: '2', target: '3', style: `${genEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '21', source: '3', target: '4', style: `${genEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '22', source: '4', target: '5', label: 'Yes', style: `${genEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '23', source: '4', target: '9', label: 'No', style: `${genEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '24', source: '9', target: '3', label: 'retry', style: `${genEdge}exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;curved=1;` },
    { id: '25', source: '5', target: '6', style: `${genEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '26', source: '6', target: '7', label: 'Approved', style: `${genEdge}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '27', source: '6', target: '9', label: 'Rejected', style: `${genEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '28', source: '7', target: '8', style: `${genEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
  ],
  metadata: { title: 'CI/CD Pipeline Flowchart', diagramType: 'flowchart', notation: 'generic' },
};

generate(cicdModel, 'resources/cicd-pipeline.drawio');

// ─── 3. BPMN Order Processing ───────────────────────────────────────────────

const bpmn = getNotation('bpmn');
const startEvt = bpmn.shapes.find(s => s.name === 'Start Event')!;
const endEvt = bpmn.shapes.find(s => s.name === 'End Event')!;
const userTask = bpmn.shapes.find(s => s.name === 'User Task')!;
const serviceTask = bpmn.shapes.find(s => s.name === 'Service Task')!;
const exclusiveGw = bpmn.shapes.find(s => s.name === 'Exclusive Gateway')!;
const bpmnTask = bpmn.shapes.find(s => s.name === 'Task')!;
const sendTask = bpmn.shapes.find(s => s.name === 'Send Task')!;
const bpmnEdge = bpmn.styleTemplates.edge;
const poolStyle = bpmn.shapes.find(s => s.name === 'Pool')!.style;

const bpmnModel: DiagramModel = {
  containers: [
    { id: '2', label: 'Order Processing', style: poolStyle, x: 40, y: 40, width: 720, height: 250 },
  ],
  nodes: [
    { id: '10', label: '', style: startEvt.style, x: 30, y: 105, width: 40, height: 40, parent: '2' },
    { id: '11', label: 'Receive\nOrder', style: userTask.style, x: 100, y: 85, width: 120, height: 80, parent: '2' },
    { id: '12', label: '', style: exclusiveGw.style, x: 255, y: 100, width: 50, height: 50, parent: '2' },
    { id: '13', label: 'Process\nPayment', style: serviceTask.style, x: 340, y: 40, width: 120, height: 80, parent: '2' },
    { id: '14', label: 'Reject\nOrder', style: sendTask.style, x: 340, y: 160, width: 120, height: 80, parent: '2' },
    { id: '15', label: 'Ship\nOrder', style: bpmnTask.style, x: 500, y: 40, width: 120, height: 80, parent: '2' },
    { id: '16', label: '', style: endEvt.style, x: 660, y: 60, width: 40, height: 40, parent: '2' },
    { id: '17', label: '', style: endEvt.style, x: 660, y: 180, width: 40, height: 40, parent: '2' },
  ],
  edges: [
    { id: '30', source: '10', target: '11', style: `${bpmnEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '31', source: '11', target: '12', style: `${bpmnEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '32', source: '12', target: '13', label: 'Valid', style: `${bpmnEdge}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '33', source: '12', target: '14', label: 'Invalid', style: `${bpmnEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '34', source: '13', target: '15', style: `${bpmnEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '35', source: '15', target: '16', style: `${bpmnEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
    { id: '36', source: '14', target: '17', style: `${bpmnEdge}exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;` },
  ],
  metadata: { title: 'BPMN Order Processing Workflow', diagramType: 'flowchart', notation: 'bpmn' },
};

generate(bpmnModel, 'resources/bpmn-order-processing.drawio');

// ─── 4. Cisco Network Topology ──────────────────────────────────────────────

const cisco = getNotation('cisco');
const internet = cisco.shapes.find(s => s.name === 'Internet')!;
const firewall = cisco.shapes.find(s => s.name === 'Firewall')!;
const router = cisco.shapes.find(s => s.name === 'Router')!;
const coreSwitch = cisco.shapes.find(s => s.name === 'Multilayer Switch')!;
const accessSwitch = cisco.shapes.find(s => s.name === 'Switch')!;
const server = cisco.shapes.find(s => s.name === 'Server')!;
const desktop = cisco.shapes.find(s => s.name === 'Desktop')!;
const ciscoEdge = cisco.styleTemplates.edge;
const ciscoContainer = cisco.styleTemplates.container;

const ciscoModel: DiagramModel = {
  containers: [
    { id: '2', label: 'Data Centre', style: ciscoContainer, x: 150, y: 250, width: 500, height: 350 },
  ],
  nodes: [
    { id: '10', label: 'Internet', style: internet.style, x: 355, y: 40, width: internet.defaultWidth, height: internet.defaultHeight },
    { id: '11', label: 'Firewall', style: firewall.style, x: 375, y: 140, width: 50, height: 50 },
    { id: '20', label: 'Core Router', style: router.style, x: 225, y: 40, width: 50, height: 50, parent: '2' },
    { id: '21', label: 'Switch A', style: coreSwitch.style, x: 100, y: 140, width: 50, height: 50, parent: '2' },
    { id: '22', label: 'Switch B', style: coreSwitch.style, x: 350, y: 140, width: 50, height: 50, parent: '2' },
    { id: '30', label: 'Web Server', style: server.style, x: 50, y: 240, width: 50, height: 50, parent: '2' },
    { id: '31', label: 'App Server', style: server.style, x: 150, y: 240, width: 50, height: 50, parent: '2' },
    { id: '32', label: 'DB Server', style: server.style, x: 300, y: 240, width: 50, height: 50, parent: '2' },
    { id: '33', label: 'Desktop 1', style: desktop.style, x: 400, y: 240, width: 50, height: 50, parent: '2' },
  ],
  edges: [
    { id: '40', source: '10', target: '11', style: `${ciscoEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '41', source: '11', target: '20', style: `${ciscoEdge}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '42', source: '20', target: '21', label: '10GbE', style: `${ciscoEdge}exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '43', source: '20', target: '22', label: '10GbE', style: `${ciscoEdge}exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '44', source: '21', target: '30', label: '1GbE', style: `${ciscoEdge}exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '45', source: '21', target: '31', label: '1GbE', style: `${ciscoEdge}exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '46', source: '22', target: '32', label: '1GbE', style: `${ciscoEdge}exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    { id: '47', source: '22', target: '33', label: '1GbE', style: `${ciscoEdge}exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
  ],
  metadata: { title: 'Cisco Network Topology', diagramType: 'infrastructure', notation: 'cisco' },
};

generate(ciscoModel, 'resources/cisco-network.drawio');

// ─── 5. UML Class Diagram ───────────────────────────────────────────────────

const uml = getNotation('uml');
const classStyle = uml.shapes.find(s => s.name === 'Class')!.style;
const interfaceStyle = uml.shapes.find(s => s.name === 'Interface')!.style;
const fieldStyle = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;html=1;';
const dividerStyle = 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=10;rotatable=0;labelPosition=left;points=[];portConstraint=eastwest;strokeColor=inherit;html=1;';

const umlModel: DiagramModel = {
  containers: [
    // Interface: IRepository
    { id: '2', label: '&lt;&lt;interface&gt;&gt;&#xa;IRepository', style: `${interfaceStyle}fillColor=#dae8fc;strokeColor=#6c8ebf;`, x: 280, y: 40, width: 200, height: 80 },
    // Class: UserRepository
    { id: '5', label: 'UserRepository', style: `${classStyle}fillColor=#dae8fc;strokeColor=#6c8ebf;`, x: 80, y: 240, width: 200, height: 120 },
    // Class: OrderRepository
    { id: '9', label: 'OrderRepository', style: `${classStyle}fillColor=#dae8fc;strokeColor=#6c8ebf;`, x: 480, y: 240, width: 200, height: 120 },
    // Class: User (entity)
    { id: '13', label: 'User', style: `${classStyle}fillColor=#d5e8d4;strokeColor=#82b366;`, x: 80, y: 440, width: 200, height: 130 },
    // Class: Order (entity)
    { id: '18', label: 'Order', style: `${classStyle}fillColor=#d5e8d4;strokeColor=#82b366;`, x: 480, y: 440, width: 200, height: 130 },
  ],
  nodes: [
    // IRepository methods
    { id: '3', label: '+ findById(id: string): T', style: fieldStyle, x: 0, y: 40, width: 200, height: 26, parent: '2' },
    { id: '4', label: '+ save(entity: T): void', style: fieldStyle, x: 0, y: 66, width: 200, height: 26, parent: '2' },
    // UserRepository fields
    { id: '6', label: '- db: Database', style: fieldStyle, x: 0, y: 26, width: 200, height: 26, parent: '5' },
    { id: '7', label: '', style: dividerStyle, x: 0, y: 52, width: 200, height: 8, parent: '5' },
    { id: '8', label: '+ findById(id: string): User', style: fieldStyle, x: 0, y: 60, width: 200, height: 26, parent: '5' },
    // OrderRepository fields
    { id: '10', label: '- db: Database', style: fieldStyle, x: 0, y: 26, width: 200, height: 26, parent: '9' },
    { id: '11', label: '', style: dividerStyle, x: 0, y: 52, width: 200, height: 8, parent: '9' },
    { id: '12', label: '+ findById(id: string): Order', style: fieldStyle, x: 0, y: 60, width: 200, height: 26, parent: '9' },
    // User fields
    { id: '14', label: '- id: string', style: fieldStyle, x: 0, y: 26, width: 200, height: 26, parent: '13' },
    { id: '15', label: '- name: string', style: fieldStyle, x: 0, y: 52, width: 200, height: 26, parent: '13' },
    { id: '16', label: '', style: dividerStyle, x: 0, y: 78, width: 200, height: 8, parent: '13' },
    { id: '17', label: '+ placeOrder(item: string): Order', style: fieldStyle, x: 0, y: 86, width: 200, height: 26, parent: '13' },
    // Order fields
    { id: '19', label: '- id: string', style: fieldStyle, x: 0, y: 26, width: 200, height: 26, parent: '18' },
    { id: '20', label: '- item: string', style: fieldStyle, x: 0, y: 52, width: 200, height: 26, parent: '18' },
    { id: '21', label: '', style: dividerStyle, x: 0, y: 78, width: 200, height: 8, parent: '18' },
    { id: '22', label: '+ getTotal(): number', style: fieldStyle, x: 0, y: 86, width: 200, height: 26, parent: '18' },
  ],
  edges: [
    // UserRepository implements IRepository (dashed block arrow)
    { id: '30', source: '5', target: '2', style: 'endArrow=block;endFill=0;html=1;dashed=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.25;entryY=1;entryDx=0;entryDy=0;' },
    // OrderRepository implements IRepository
    { id: '31', source: '9', target: '2', style: 'endArrow=block;endFill=0;html=1;dashed=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.75;entryY=1;entryDx=0;entryDy=0;' },
    // UserRepository → User (association)
    { id: '32', source: '5', target: '13', label: 'manages', style: 'endArrow=open;endFill=0;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;' },
    // OrderRepository → Order (association)
    { id: '33', source: '9', target: '18', label: 'manages', style: 'endArrow=open;endFill=0;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;' },
    // User → Order (composition: user owns orders)
    { id: '34', source: '13', target: '18', label: '1..*', style: 'endArrow=diamond;endFill=1;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;' },
  ],
  metadata: { title: 'UML Class Diagram', diagramType: 'generic', notation: 'uml' },
};

generate(umlModel, 'resources/uml-class-diagram.drawio');

console.log('\nAll 5 example diagrams generated successfully.');
