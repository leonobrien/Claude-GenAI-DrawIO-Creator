import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  resolveShape,
} from './src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from './src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'uml-diagrams';
const DIAGRAM_NAME = 'sequence-update-auth-v2';
const STORAGE_ROOT = './storage';

mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'UML diagram collection');

// --- Resolve UML shapes ---
const lifelineShape = resolveShape('uml', 'Lifeline');
const activationShape = resolveShape('uml', 'Activation');
const frameShape = resolveShape('uml', 'Interaction Frame');

if (!lifelineShape || !activationShape || !frameShape) {
  throw new Error('Missing required UML shapes');
}

// --- Layout plan ---
// Outer frame: x=30, y=20, w=680, h=620
// Lifelines at y=60 relative to frame, height=540
//   User:          x=80  (centre abs: 30+80+50  = 160)
//   UpdateDetails: x=300 (centre abs: 30+300+50 = 380)
//   Authenticate:  x=540 (centre abs: 30+540+50 = 620)
//
// Message sequence (all Y values are absolute canvas coordinates):
//   1: updateDetails(data)           y≈165  User -> UpdateDetails
//   2: authenticate(credentials)     y≈225  UpdateDetails -> Authenticate
//   alt fragment:                    y=265 to y=575
//     [success] region:              y=283-430
//       3: authResult(ok)            y≈310  Authenticate -> UpdateDetails  (connected)
//       4: applyChanges()            y≈350  UpdateDetails self-call        (connected)
//       5: result(success)           y≈400  UpdateDetails -> User          (connected)
//     --- divider ---                y=430
//     [failure] region:              y=435-575
//       3: authResult(fail)          y=465  Authenticate -> UpdateDetails  (absolute — rule 6)
//       4: error(AuthFailed)         y=520  UpdateDetails -> User          (absolute — rule 6)

const model: DiagramModel = {
  containers: [
    // Interaction frame
    {
      id: '2',
      label: 'sd UpdateDetails Sequence',
      style: frameShape.style,
      x: 30,
      y: 20,
      width: 680,
      height: 620,
    },
  ],
  nodes: [
    // --- Lifelines (children of frame) ---
    {
      id: '3',
      label: 'User',
      style: lifelineShape.style,
      x: 80, y: 60, width: 100, height: 540,
      parent: '2',
    },
    {
      id: '4',
      label: 'UpdateDetails',
      style: lifelineShape.style,
      x: 300, y: 60, width: 100, height: 540,
      parent: '2',
    },
    {
      id: '5',
      label: 'Authenticate',
      style: lifelineShape.style,
      x: 540, y: 60, width: 100, height: 540,
      parent: '2',
    },

    // --- Activation bars (children of their lifeline) ---
    // User activation — spans full interaction
    {
      id: '10',
      label: '',
      style: activationShape.style,
      x: 45, y: 80, width: 10, height: 340,
      parent: '3',
    },
    // UpdateDetails activation
    {
      id: '11',
      label: '',
      style: activationShape.style,
      x: 45, y: 80, width: 10, height: 300,
      parent: '4',
    },
    // Authenticate activation
    {
      id: '12',
      label: '',
      style: activationShape.style,
      x: 45, y: 140, width: 10, height: 80,
      parent: '5',
    },
  ],
  edges: [
    // 1: User -> UpdateDetails: updateDetails(data)
    // Connected to activation bars — precise routing needed
    {
      id: '20',
      source: '10',
      target: '11',
      label: '1: updateDetails(data)',
      style: 'endArrow=block;endFill=1;html=1;exitX=1;exitY=0;exitDx=0;exitDy=5;entryX=0;entryY=0;entryDx=0;entryDy=5;fontSize=11;',
    },
    // 2: UpdateDetails -> Authenticate: authenticate(credentials)
    {
      id: '21',
      source: '11',
      target: '12',
      label: '2: authenticate(credentials)',
      style: 'endArrow=block;endFill=1;html=1;exitX=1;exitY=0;exitDx=0;exitDy=65;entryX=0;entryY=0;entryDx=0;entryDy=5;fontSize=11;',
    },
  ],
  metadata: {
    title: 'Sequence: User calls UpdateDetails with Authentication (alt)',
    diagramType: 'sequence',
    notation: 'uml',
  },
};

// --- Generate base XML ---
const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);

// --- Now add the alt fragment and messages as raw XML via applyOperations ---
// We need applyOperations for the alt frame, divider, guards, and region-specific messages
import { applyOperations } from './src/index.js';

const ops = [
  // alt combined fragment
  {
    operation: 'add' as const,
    cell_id: '30',
    new_xml: '<mxCell id="30" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;width=40;height=18;boundedLbl=1;verticalAlign=top;align=left;spacingLeft=5;fillColor=none;dashed=1;dashPattern=8 4;strokeColor=#666666;" vertex="1" parent="1"><mxGeometry x="155" y="265" width="530" height="310" as="geometry"/></mxCell>',
  },
  // [success] guard
  {
    operation: 'add' as const,
    cell_id: '31',
    new_xml: '<mxCell id="31" value="[success]" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontStyle=2;fontSize=11;" vertex="1" parent="1"><mxGeometry x="165" y="283" width="70" height="20" as="geometry"/></mxCell>',
  },
  // Dashed divider
  {
    operation: 'add' as const,
    cell_id: '32',
    new_xml: [
      '<mxCell id="32" value="" style="endArrow=none;html=1;dashed=1;dashPattern=8 4;strokeColor=#666666;" edge="1" parent="1">',
      '  <mxGeometry relative="1" as="geometry">',
      '    <mxPoint x="155" y="430" as="sourcePoint"/>',
      '    <mxPoint x="685" y="430" as="targetPoint"/>',
      '  </mxGeometry>',
      '</mxCell>',
    ].join('\n'),
  },
  // [failure] guard
  {
    operation: 'add' as const,
    cell_id: '33',
    new_xml: '<mxCell id="33" value="[failure]" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontStyle=2;fontSize=11;fontColor=#b85450;" vertex="1" parent="1"><mxGeometry x="165" y="435" width="70" height="20" as="geometry"/></mxCell>',
  },

  // --- SUCCESS PATH (connected to activation bars — both endpoints within region) ---
  // 3: authResult(ok)
  {
    operation: 'add' as const,
    cell_id: '40',
    new_xml: '<mxCell id="40" value="3: authResult(ok)" style="endArrow=open;endFill=0;html=1;dashed=1;exitX=0;exitY=1;exitDx=0;exitDy=-5;entryX=1;entryY=0;entryDx=0;entryDy=130;fontSize=11;" edge="1" parent="1" source="12" target="11"><mxGeometry relative="1" as="geometry"/></mxCell>',
  },
  // 4: applyChanges() — self-call
  {
    operation: 'add' as const,
    cell_id: '41',
    new_xml: '<mxCell id="41" value="4: applyChanges()" style="endArrow=block;endFill=1;html=1;rounded=1;exitX=1;exitY=0;exitDx=0;exitDy=160;entryX=1;entryY=0;entryDx=0;entryDy=185;fontSize=11;" edge="1" parent="1" source="11" target="11"><mxGeometry relative="1" as="geometry"/></mxCell>',
  },
  // 5: result(success)
  {
    operation: 'add' as const,
    cell_id: '42',
    new_xml: '<mxCell id="42" value="5: result(success)" style="endArrow=open;endFill=0;html=1;dashed=1;exitX=0;exitY=0;exitDx=0;exitDy=220;entryX=1;entryY=0;entryDx=0;entryDy=230;fontSize=11;" edge="1" parent="1" source="11" target="10"><mxGeometry relative="1" as="geometry"/></mxCell>',
  },

  // --- FAILURE PATH (absolute coordinates — rule 6: endpoints outside region) ---
  // 3: authResult(fail) at y=465 (within failure band y=430-575)
  {
    operation: 'add' as const,
    cell_id: '50',
    new_xml: [
      '<mxCell id="50" value="3: authResult(fail)" style="endArrow=open;endFill=0;html=1;dashed=1;fontSize=11;fontColor=#b85450;strokeColor=#b85450;" edge="1" parent="1">',
      '  <mxGeometry relative="1" as="geometry">',
      '    <mxPoint x="620" y="465" as="sourcePoint"/>',
      '    <mxPoint x="385" y="465" as="targetPoint"/>',
      '  </mxGeometry>',
      '</mxCell>',
    ].join('\n'),
  },
  // 4: error(AuthenticationFailed) at y=520
  {
    operation: 'add' as const,
    cell_id: '51',
    new_xml: [
      '<mxCell id="51" value="4: error(AuthenticationFailed)" style="endArrow=open;endFill=0;html=1;dashed=1;fontSize=11;fontColor=#b85450;strokeColor=#b85450;" edge="1" parent="1">',
      '  <mxGeometry relative="1" as="geometry">',
      '    <mxPoint x="380" y="520" as="sourcePoint"/>',
      '    <mxPoint x="165" y="520" as="targetPoint"/>',
      '  </mxGeometry>',
      '</mxCell>',
    ].join('\n'),
  },
];

const revised = applyOperations(fullXml, ops);
if (revised.errors.length > 0) {
  console.error('Operation errors:', revised.errors);
  process.exit(1);
}

const result = validateAndFixXml(revised.xml);
if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

const semantics = validateSemantics(
  result.finalXml,
  ['User', 'UpdateDetails', 'Authenticate'],
  'uml',
);
if (!semantics.valid) {
  console.error('Semantic errors:', semantics.issues);
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
  tags: ['uml', 'sequence', 'alt'],
  prompt: 'Sequence diagram from use-case-auth: User calls UpdateDetails with <<include>> Authenticate, alt fragment for auth failure',
  description: 'Sequence: User calls UpdateDetails with Authentication (alt fragment)',
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation with alt fragment');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`Diagram stored: ${STORAGE_ROOT}/projects/${PROJECT_ID}/models/${modelId}.json`);
console.log(`Exported to: ${exportPath}`);
