/**
 * ArchiMate Layered Viewpoint template.
 *
 * Three-layer enterprise architecture: Business → Application → Technology
 * with serving relationships flowing upward.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';
import { requireShape } from '../notation/registry.js';

const DEFAULTS: TemplateParams = {
  title: 'ArchiMate Layered Viewpoint',
  businessLayer: 'Business Layer',
  applicationLayer: 'Application Layer',
  technologyLayer: 'Technology Layer',
  businessProcess: 'Customer Service',
  businessService: 'Order Management',
  businessActor: 'Customer',
  appComponent: 'CRM System',
  appService: 'Order API',
  dataObject: 'Customer Data',
  node: 'Application Server',
  systemSoftware: 'Linux OS',
  artifact: 'crm-app.war',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  const businessProcess = requireShape('archimate', 'Business Process');
  const businessService = requireShape('archimate', 'Business Service');
  const businessActor = requireShape('archimate', 'Business Actor');
  const appComponent = requireShape('archimate', 'Application Component');
  const appService = requireShape('archimate', 'Application Service');
  const dataObject = requireShape('archimate', 'Data Object');
  const node = requireShape('archimate', 'Node');
  const systemSoftware = requireShape('archimate', 'System Software');
  const artifact = requireShape('archimate', 'Artifact');

  const layerStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;align=left;spacingLeft=5;';
  const servingEdge = 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;html=1;';
  const compositionEdge = 'endArrow=diamond;endFill=1;html=1;';

  const bFill = 'fillColor=#FFFFB5;strokeColor=#C4B600;';
  const aFill = 'fillColor=#B5FFFF;strokeColor=#00A8A8;';
  const tFill = 'fillColor=#C9E7B7;strokeColor=#6AA329;';

  return {
    containers: [
      { id: '2', label: p.businessLayer, style: `${layerStyle}strokeColor=#C4B600;`, x: 40, y: 40, width: 680, height: 120 },
      { id: '3', label: p.applicationLayer, style: `${layerStyle}strokeColor=#00A8A8;`, x: 40, y: 200, width: 680, height: 120 },
      { id: '4', label: p.technologyLayer, style: `${layerStyle}strokeColor=#6AA329;`, x: 40, y: 360, width: 680, height: 120 },
    ],
    nodes: [
      // Business layer (relative to container 2)
      { id: '10', label: p.businessActor, style: `${businessActor.style}${bFill}`, x: 40, y: 30, width: 120, height: 60, parent: '2' },
      { id: '11', label: p.businessProcess, style: `${businessProcess.style}${bFill}`, x: 270, y: 30, width: 120, height: 60, parent: '2' },
      { id: '12', label: p.businessService, style: `${businessService.style}${bFill}`, x: 500, y: 30, width: 120, height: 60, parent: '2' },

      // Application layer (relative to container 3)
      { id: '20', label: p.appComponent, style: `${appComponent.style}${aFill}`, x: 40, y: 30, width: 120, height: 60, parent: '3' },
      { id: '21', label: p.appService, style: `${appService.style}${aFill}`, x: 270, y: 30, width: 120, height: 60, parent: '3' },
      { id: '22', label: p.dataObject, style: `${dataObject.style}${aFill}`, x: 500, y: 30, width: 120, height: 60, parent: '3' },

      // Technology layer (relative to container 4)
      { id: '30', label: p.node, style: `${node.style}${tFill}`, x: 40, y: 30, width: 120, height: 60, parent: '4' },
      { id: '31', label: p.systemSoftware, style: `${systemSoftware.style}${tFill}`, x: 270, y: 30, width: 120, height: 60, parent: '4' },
      { id: '32', label: p.artifact, style: `${artifact.style}${tFill}`, x: 500, y: 30, width: 120, height: 60, parent: '4' },
    ],
    edges: [
      // Within Business layer
      { id: '50', source: '10', target: '11', style: compositionEdge },
      { id: '51', source: '11', target: '12', style: servingEdge },
      // Within Application layer
      { id: '52', source: '20', target: '21', style: compositionEdge },
      { id: '53', source: '21', target: '22', style: servingEdge },
      // Within Technology layer
      { id: '54', source: '30', target: '31', style: compositionEdge },
      { id: '55', source: '31', target: '32', style: servingEdge },
      // Serving upward: Technology → Application
      { id: '56', source: '20', target: '11', style: `${servingEdge}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;` },
      // Serving upward: Application → Business
      { id: '57', source: '30', target: '20', style: `${servingEdge}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;` },
    ],
    metadata: {
      title: p.title,
      description: 'ArchiMate layered viewpoint with Business, Application, and Technology layers and serving relationships.',
      diagramType: 'infrastructure',
      notation: 'archimate',
    },
  };
}

export const archimateLayered: DiagramTemplate = {
  name: 'archimate-layered',
  displayName: 'ArchiMate Layered Viewpoint',
  description: 'Three-layer enterprise architecture: Business → Application → Technology with serving relationships.',
  category: 'infrastructure',
  diagramType: 'infrastructure',
  notations: ['archimate'],
  tags: ['archimate', 'enterprise', 'layered', 'business', 'application', 'technology'],
  defaultParams: DEFAULTS,
  build,
};
