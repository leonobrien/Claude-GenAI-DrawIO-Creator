/**
 * ArchiMate notation — ArchiMate 3.x enterprise architecture shapes.
 *
 * Full coverage of the ArchiMate 3.x specification across all six layers:
 * Strategy, Business, Application, Technology, Motivation, and
 * Implementation & Migration. Uses the mxgraph.archimate3 stencil library
 * with archiType modifiers for layer-specific rendering.
 *
 * Stencil identifiers validated against draw.io's mxArchiMate3.js and
 * Sidebar-ArchiMate3.js source files.
 */

import type { NotationDefinition } from '../types/index.js';

export const archimateNotation: NotationDefinition = {
  name: 'archimate',
  displayName: 'ArchiMate 3.x',
  stencilPrefix: 'mxgraph.archimate3',
  description: 'ArchiMate 3.x enterprise architecture diagrams with layered elements (Strategy, Business, Application, Technology, Motivation, Implementation & Migration) from the mxgraph.archimate3 stencil library.',
  shapes: [
    // -----------------------------------------------------------------------
    // Strategy Layer
    // -----------------------------------------------------------------------
    {
      name: 'Resource',
      style: 'shape=mxgraph.archimate3.resource;archiType=strategy;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'strategy',
    },
    {
      name: 'Capability',
      style: 'shape=mxgraph.archimate3.capability;archiType=strategy;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'strategy',
    },
    {
      name: 'Value Stream',
      style: 'shape=mxgraph.archimate3.valueStream;archiType=strategy;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'strategy',
    },
    {
      name: 'Course of Action',
      style: 'shape=mxgraph.archimate3.course;archiType=strategy;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'strategy',
    },

    // -----------------------------------------------------------------------
    // Business Layer
    // -----------------------------------------------------------------------
    {
      name: 'Business Actor',
      style: 'shape=mxgraph.archimate3.actor;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Role',
      style: 'shape=mxgraph.archimate3.role;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Collaboration',
      style: 'shape=mxgraph.archimate3.collaboration;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Interface',
      style: 'shape=mxgraph.archimate3.interface;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Process',
      style: 'shape=mxgraph.archimate3.process;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Function',
      style: 'shape=mxgraph.archimate3.function;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Interaction',
      style: 'shape=mxgraph.archimate3.interaction;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Event',
      style: 'shape=mxgraph.archimate3.event;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Service',
      style: 'shape=mxgraph.archimate3.service;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Business Object',
      style: 'shape=mxgraph.archimate3.businessObject;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Contract',
      style: 'shape=mxgraph.archimate3.contract;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Representation',
      style: 'shape=mxgraph.archimate3.representation;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },
    {
      name: 'Product',
      style: 'shape=mxgraph.archimate3.product;archiType=business;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'business',
    },

    // -----------------------------------------------------------------------
    // Application Layer
    // -----------------------------------------------------------------------
    {
      name: 'Application Component',
      style: 'shape=mxgraph.archimate3.component;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Application Collaboration',
      style: 'shape=mxgraph.archimate3.collaboration;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Application Interface',
      style: 'shape=mxgraph.archimate3.interface;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Application Function',
      style: 'shape=mxgraph.archimate3.function;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Application Interaction',
      style: 'shape=mxgraph.archimate3.interaction;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Application Process',
      style: 'shape=mxgraph.archimate3.process;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Application Event',
      style: 'shape=mxgraph.archimate3.event;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Application Service',
      style: 'shape=mxgraph.archimate3.service;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },
    {
      name: 'Data Object',
      style: 'shape=mxgraph.archimate3.businessObject;archiType=application;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'application',
    },

    // -----------------------------------------------------------------------
    // Technology Layer
    // -----------------------------------------------------------------------
    {
      name: 'Node',
      style: 'shape=mxgraph.archimate3.node;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Device',
      style: 'shape=mxgraph.archimate3.device;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'System Software',
      style: 'shape=mxgraph.archimate3.sysSw;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Technology Collaboration',
      style: 'shape=mxgraph.archimate3.collaboration;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Technology Interface',
      style: 'shape=mxgraph.archimate3.interface;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Technology Function',
      style: 'shape=mxgraph.archimate3.function;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Technology Interaction',
      style: 'shape=mxgraph.archimate3.interaction;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Technology Process',
      style: 'shape=mxgraph.archimate3.process;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Technology Event',
      style: 'shape=mxgraph.archimate3.event;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Technology Service',
      style: 'shape=mxgraph.archimate3.service;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Artifact',
      style: 'shape=mxgraph.archimate3.artifact;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Communication Network',
      style: 'shape=mxgraph.archimate3.network;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Path',
      style: 'shape=mxgraph.archimate3.path;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Distribution Network',
      style: 'shape=mxgraph.archimate3.distribution;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Equipment',
      style: 'shape=mxgraph.archimate3.equipment;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Facility',
      style: 'shape=mxgraph.archimate3.facility;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },
    {
      name: 'Material',
      style: 'shape=mxgraph.archimate3.material;archiType=technology;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'technology',
    },

    // -----------------------------------------------------------------------
    // Motivation Layer
    // -----------------------------------------------------------------------
    {
      name: 'Stakeholder',
      style: 'shape=mxgraph.archimate3.actor;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Driver',
      style: 'shape=mxgraph.archimate3.driver;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Assessment',
      style: 'shape=mxgraph.archimate3.assess;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Goal',
      style: 'shape=mxgraph.archimate3.goal;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Outcome',
      style: 'shape=mxgraph.archimate3.outcome;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Principle',
      style: 'shape=mxgraph.archimate3.principle;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Requirement',
      style: 'shape=mxgraph.archimate3.requirement;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Constraint',
      style: 'shape=mxgraph.archimate3.constraint;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Meaning',
      style: 'shape=mxgraph.archimate3.passive;archiType=motivation;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },
    {
      name: 'Value',
      style: 'shape=mxgraph.archimate3.passive;archiType=motivation;whiteSpace=wrap;html=1;fontStyle=2;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'motivation',
    },

    // -----------------------------------------------------------------------
    // Implementation & Migration Layer
    // -----------------------------------------------------------------------
    {
      name: 'Work Package',
      style: 'shape=mxgraph.archimate3.workPackage;archiType=impl;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'implementation',
    },
    {
      name: 'Deliverable',
      style: 'shape=mxgraph.archimate3.deliverable;archiType=impl;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'implementation',
    },
    {
      name: 'Implementation Event',
      style: 'shape=mxgraph.archimate3.event;archiType=impl;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'implementation',
    },
    {
      name: 'Plateau',
      style: 'shape=mxgraph.archimate3.plateau;archiType=impl;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'implementation',
    },
    {
      name: 'Gap',
      style: 'shape=mxgraph.archimate3.gap;archiType=impl;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'implementation',
    },

    // -----------------------------------------------------------------------
    // Composite & Other
    // -----------------------------------------------------------------------
    {
      name: 'Location',
      style: 'shape=mxgraph.archimate3.location;whiteSpace=wrap;html=1;',
      defaultWidth: 120,
      defaultHeight: 60,
      category: 'other',
    },
    {
      name: 'Grouping',
      style: 'shape=mxgraph.archimate3.grouping;whiteSpace=wrap;html=1;',
      defaultWidth: 200,
      defaultHeight: 150,
      category: 'other',
    },
  ],
  styleTemplates: {
    vertex: 'shape=mxgraph.archimate3.component;archiType=application;whiteSpace=wrap;html=1;',
    edge: 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;html=1;',
    container: 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;',
    labelEdge: 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;html=1;fontSize=10;',
  },
  colours: {
    business: { fillColor: '#FFFFB5', strokeColor: '#C4B600' },
    application: { fillColor: '#B5FFFF', strokeColor: '#00A8A8' },
    technology: { fillColor: '#C9E7B7', strokeColor: '#6AA329' },
    motivation: { fillColor: '#CCCCFF', strokeColor: '#8888DD' },
    strategy: { fillColor: '#F5DEAA', strokeColor: '#C49A00' },
    implementation: { fillColor: '#FFE0E0', strokeColor: '#CC6666' },
  },
  layout: {
    preferredFlow: 'layered',
    usesContainers: true,
    suggestedGap: 50,
    hints: [
      'Arrange in horizontal layers: Strategy/Motivation (top) → Business → Application → Technology → Implementation (bottom)',
      'Use consistent colours per layer: tan for Strategy, yellow for Business, cyan for Application, green for Technology, purple for Motivation, pink for Implementation',
      'Show serving relationships flowing upward (Technology serves Application serves Business)',
      'Use containers to group elements within each layer',
      'Place motivation and strategy elements above the Business layer when included',
      'Use composition relationships (filled diamond) for whole-part structures',
      'Use aggregation relationships (open diamond) for grouping within layers',
    ],
  },
  fewShotExample: [
    '<mxCell id="2" value="Business Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;" vertex="1" connectable="0" parent="1">',
    '  <mxGeometry x="40" y="40" width="700" height="120" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="3" value="Customer Service" style="shape=mxgraph.archimate3.process;archiType=business;whiteSpace=wrap;html=1;fillColor=#FFFFB5;strokeColor=#C4B600;" vertex="1" parent="2">',
    '  <mxGeometry x="280" y="30" width="120" height="60" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="4" value="Application Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;" vertex="1" connectable="0" parent="1">',
    '  <mxGeometry x="40" y="200" width="700" height="120" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="5" value="CRM System" style="shape=mxgraph.archimate3.component;archiType=application;whiteSpace=wrap;html=1;fillColor=#B5FFFF;strokeColor=#00A8A8;" vertex="1" parent="4">',
    '  <mxGeometry x="280" y="30" width="120" height="60" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="6" value="Technology Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;" vertex="1" connectable="0" parent="1">',
    '  <mxGeometry x="40" y="360" width="700" height="120" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="7" value="Database Server" style="shape=mxgraph.archimate3.node;archiType=technology;whiteSpace=wrap;html=1;fillColor=#C9E7B7;strokeColor=#6AA329;" vertex="1" parent="6">',
    '  <mxGeometry x="280" y="30" width="120" height="60" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="8" style="endArrow=block;endFill=1;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="5" target="3">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="9" style="endArrow=block;endFill=1;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" edge="1" parent="1" source="7" target="5">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
  ].join('\n'),
  promptRules: [
    'Use shape=mxgraph.archimate3.<element>;archiType=<layer>; for all ArchiMate elements',
    'Valid archiType values: business, application, technology, strategy, motivation, impl',
    'Arrange elements in horizontal layers: Strategy/Motivation (top) → Business → Application → Technology → Implementation (bottom)',
    'Apply layer-specific colours: tan (#F5DEAA) for Strategy, yellow (#FFFFB5) for Business, cyan (#B5FFFF) for Application, green (#C9E7B7) for Technology, purple (#CCCCFF) for Motivation, pink (#FFE0E0) for Implementation',
    'Use block arrows (endArrow=block;endFill=1) for serving and composition relationships',
    'Show serving relationships flowing upward through the layers',
    'Group elements within layer containers for visual clarity',
    'For capability models, use the Capability shape (strategy layer) with composition relationships',
  ],
};
