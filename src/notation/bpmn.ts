/**
 * BPMN notation — Business Process Model and Notation 2.0 shapes.
 *
 * Uses the mxgraph.bpmn stencil library for events, tasks, gateways, and
 * flow connectors as defined in the BPMN 2.0 specification.
 */

import type { NotationDefinition } from '../types/index.js';

/** Standard connection points for BPMN shapes. */
const BPMN_POINTS = 'points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];';

/** Base style shared by most BPMN shapes. */
const BPMN_BASE = `html=1;whiteSpace=wrap;${BPMN_POINTS}`;

/** Helper to build BPMN event styles. */
function bpmnEvent(outline: string, symbol: string): string {
  return `${BPMN_BASE}shape=mxgraph.bpmn.shape;perimeter=ellipsePerimeter;outline=${outline};symbol=${symbol};`;
}

/** Helper to build BPMN task styles. */
function bpmnTask(taskMarker: string): string {
  return `${BPMN_BASE}shape=mxgraph.bpmn.task;taskMarker=${taskMarker};`;
}

/** Helper to build BPMN gateway styles. */
function bpmnGateway(gwType: string): string {
  return `${BPMN_BASE}shape=mxgraph.bpmn.shape;perimeter=rhombusPerimeter;outline=gateway;symbol=${gwType};`;
}

export const bpmnNotation: NotationDefinition = {
  name: 'bpmn',
  displayName: 'BPMN 2.0',
  stencilPrefix: 'mxgraph.bpmn',
  description: 'Business Process Model and Notation (BPMN 2.0) diagrams using official BPMN shapes from the mxgraph.bpmn stencil library.',
  shapes: [
    // Start Events
    {
      name: 'Start Event',
      style: bpmnEvent('standard', 'general'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'Start Message Event',
      style: bpmnEvent('standard', 'message'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'Start Timer Event',
      style: bpmnEvent('standard', 'timer'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'Start Signal Event',
      style: bpmnEvent('standard', 'signal'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },

    // Intermediate Events
    {
      name: 'Intermediate Catch Event',
      style: bpmnEvent('catching', 'general'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'Intermediate Throw Event',
      style: bpmnEvent('throwing', 'general'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'Intermediate Timer Event',
      style: bpmnEvent('catching', 'timer'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'Intermediate Message Catch',
      style: bpmnEvent('catching', 'message'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },

    // End Events
    {
      name: 'End Event',
      style: bpmnEvent('end', 'general'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'End Error Event',
      style: bpmnEvent('end', 'error'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },
    {
      name: 'End Terminate Event',
      style: bpmnEvent('end', 'terminate'),
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'events',
    },

    // Tasks
    {
      name: 'Task',
      style: bpmnTask('abstract'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },
    {
      name: 'User Task',
      style: bpmnTask('user'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },
    {
      name: 'Service Task',
      style: bpmnTask('service'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },
    {
      name: 'Script Task',
      style: bpmnTask('script'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },
    {
      name: 'Send Task',
      style: bpmnTask('send'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },
    {
      name: 'Receive Task',
      style: bpmnTask('receive'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },
    {
      name: 'Manual Task',
      style: bpmnTask('manual'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },
    {
      name: 'Business Rule Task',
      style: bpmnTask('business_rule'),
      defaultWidth: 120,
      defaultHeight: 80,
      category: 'tasks',
    },

    // Gateways
    {
      name: 'Exclusive Gateway',
      style: bpmnGateway('exclusiveGw'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'gateways',
    },
    {
      name: 'Parallel Gateway',
      style: bpmnGateway('parallelGw'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'gateways',
    },
    {
      name: 'Inclusive Gateway',
      style: bpmnGateway('inclusiveGw'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'gateways',
    },
    {
      name: 'Event-Based Gateway',
      style: bpmnGateway('eventGw'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'gateways',
    },

    // Sub-Process / Container
    {
      name: 'Sub-Process',
      style: `${BPMN_BASE}shape=mxgraph.bpmn.task;taskMarker=abstract;isCollapsed=0;verticalAlign=top;fontStyle=1;`,
      defaultWidth: 300,
      defaultHeight: 200,
      category: 'subprocess',
    },

    // Data Objects
    {
      name: 'Data Object',
      style: `${BPMN_BASE}shape=mxgraph.bpmn.data;isCollection=0;`,
      defaultWidth: 40,
      defaultHeight: 55,
      category: 'data',
    },
    {
      name: 'Data Store',
      style: `${BPMN_BASE}shape=mxgraph.bpmn.data_store;`,
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'data',
    },

    // Pool & Lane
    {
      name: 'Pool',
      style: 'swimlane;startSize=20;html=1;childLayout=stackLayout;horizontal=1;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=0;marginBottom=0;swimlaneLine=1;fontStyle=1;fillColor=none;',
      defaultWidth: 600,
      defaultHeight: 300,
      category: 'organisation',
    },
    {
      name: 'Lane',
      style: 'swimlane;startSize=20;html=1;collapsible=0;fontStyle=0;fillColor=none;swimlaneLine=1;',
      defaultWidth: 580,
      defaultHeight: 150,
      category: 'organisation',
    },

    // Annotations
    {
      name: 'Text Annotation',
      style: 'shape=mxgraph.bpmn.annotation;align=left;spacingLeft=5;html=1;whiteSpace=wrap;',
      defaultWidth: 150,
      defaultHeight: 30,
      category: 'artifacts',
    },
    {
      name: 'Group',
      style: 'rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 4;fillColor=none;strokeColor=#666666;verticalAlign=top;fontStyle=1;fontSize=12;',
      defaultWidth: 250,
      defaultHeight: 200,
      category: 'artifacts',
    },
  ],
  styleTemplates: {
    vertex: bpmnTask('abstract'),
    edge: 'edgeStyle=orthogonalEdgeStyle;endArrow=classic;html=1;strokeColor=#000000;',
    container: 'swimlane;startSize=20;html=1;childLayout=stackLayout;horizontal=1;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=0;marginBottom=0;swimlaneLine=1;fontStyle=1;fillColor=none;',
    labelEdge: 'edgeStyle=orthogonalEdgeStyle;endArrow=classic;html=1;strokeColor=#000000;fontSize=10;',
  },
  colours: {
    events: { fillColor: '#FFFFFF', strokeColor: '#000000' },
    tasks: { fillColor: '#FFFFFF', strokeColor: '#000000' },
    gateways: { fillColor: '#FFFFFF', strokeColor: '#000000' },
    subprocess: { fillColor: '#FFFFFF', strokeColor: '#000000' },
    data: { fillColor: '#FFFFFF', strokeColor: '#000000' },
    organisation: { fillColor: '#FFFFFF', strokeColor: '#000000' },
    artifacts: { fillColor: 'none', strokeColor: '#666666' },
  },
  layout: {
    preferredFlow: 'left-right',
    usesContainers: true,
    suggestedGap: 50,
    hints: [
      'Organise process flow left-to-right within swimlane pools',
      'Use pools for different participants/organisations',
      'Use lanes within pools for different roles',
      'Place start events on the left and end events on the right',
      'Gateways should have clearly labelled outgoing sequence flows for conditions',
      'Use message flows (dashed lines) between pools for inter-organisation communication',
      'Keep the happy path as a straight horizontal line',
    ],
  },
  fewShotExample: [
    '<mxCell id="2" value="Process" style="swimlane;startSize=20;html=1;childLayout=stackLayout;horizontal=1;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=0;marginBottom=0;swimlaneLine=1;fontStyle=1;fillColor=none;" vertex="1" connectable="0" parent="1">',
    '  <mxGeometry x="40" y="40" width="700" height="200" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="3" value="" style="${bpmnEvent('standard', 'general')}" vertex="1" parent="2">`,
    '  <mxGeometry x="30" y="80" width="40" height="40" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="4" value="Review\\nRequest" style="${bpmnTask('user')}" vertex="1" parent="2">`,
    '  <mxGeometry x="120" y="60" width="120" height="80" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="5" value="" style="${bpmnGateway('exclusiveGw')}" vertex="1" parent="2">`,
    '  <mxGeometry x="300" y="75" width="50" height="50" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="6" value="Process\\nOrder" style="${bpmnTask('service')}" vertex="1" parent="2">`,
    '  <mxGeometry x="410" y="60" width="120" height="80" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="7" value="" style="${bpmnEvent('end', 'general')}" vertex="1" parent="2">`,
    '  <mxGeometry x="600" y="80" width="40" height="40" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="8" style="endArrow=classic;html=1;strokeColor=#000000;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="3" target="4">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="9" style="endArrow=classic;html=1;strokeColor=#000000;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="4" target="5">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="10" value="Approved" style="endArrow=classic;html=1;strokeColor=#000000;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="5" target="6">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="11" style="endArrow=classic;html=1;strokeColor=#000000;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="6" target="7">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
  ].join('\n'),
  promptRules: [
    'Use shape=mxgraph.bpmn.shape;perimeter=ellipsePerimeter;outline=<type>;symbol=<symbol>; for BPMN events',
    'Use shape=mxgraph.bpmn.task;taskMarker=<type>; for BPMN tasks (user, service, script, send, receive, manual, business_rule)',
    'Use shape=mxgraph.bpmn.shape;perimeter=rhombusPerimeter;outline=gateway;symbol=<type>; for BPMN gateways',
    'Use swimlane containers for pools and lanes',
    'Sequence flows use solid arrows (endArrow=classic), message flows use dashed arrows',
    'Label gateway outgoing flows with conditions',
    'Place start events at left, end events at right of each pool',
    'Use data objects and data stores for information flow',
  ],
};
