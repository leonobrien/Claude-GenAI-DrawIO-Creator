/**
 * Serverless Architecture template.
 *
 * Event-driven serverless pattern: API Gateway → Functions → managed services.
 * Generic notation with parameterisable service names.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';

const DEFAULTS: TemplateParams = {
  title: 'Serverless Architecture',
  client: 'Client',
  apiGateway: 'API Gateway',
  authService: 'Auth Service',
  functionA: 'Function A',
  functionB: 'Function B',
  functionC: 'Function C',
  database: 'NoSQL DB',
  objectStorage: 'Object Storage',
  messageQueue: 'Message Queue',
  monitoring: 'Monitoring',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  const clientStyle = 'ellipse;shape=cloud;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;';
  const gwStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;';
  const authStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;';
  const funcStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;';
  const dbStyle = 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#fff2cc;strokeColor=#d6b656;';
  const storageStyle = 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#e1d5e7;strokeColor=#9673a6;';
  const queueStyle = 'shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;';
  const monitorStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;dashed=1;';
  const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;';
  const dashedEdge = `${edgeStyle}dashed=1;strokeColor=#999999;`;

  return {
    containers: [],
    nodes: [
      // Left: Client
      { id: '2', label: p.client, style: clientStyle, x: 40, y: 170, width: 100, height: 70 },
      // Gateway
      { id: '3', label: p.apiGateway, style: gwStyle, x: 200, y: 185, width: 120, height: 40 },
      // Auth above gateway
      { id: '4', label: p.authService, style: authStyle, x: 210, y: 100, width: 100, height: 40 },
      // Functions column
      { id: '10', label: p.functionA, style: funcStyle, x: 400, y: 60, width: 110, height: 40 },
      { id: '11', label: p.functionB, style: funcStyle, x: 400, y: 185, width: 110, height: 40 },
      { id: '12', label: p.functionC, style: funcStyle, x: 400, y: 310, width: 110, height: 40 },
      // Backend services
      { id: '20', label: p.database, style: dbStyle, x: 590, y: 45, width: 60, height: 70 },
      { id: '21', label: p.objectStorage, style: storageStyle, x: 590, y: 170, width: 60, height: 70 },
      { id: '22', label: p.messageQueue, style: queueStyle, x: 580, y: 300, width: 80, height: 60 },
      // Monitoring
      { id: '30', label: p.monitoring, style: monitorStyle, x: 400, y: 420, width: 110, height: 40 },
    ],
    edges: [
      { id: '50', source: '2', target: '3', style: edgeStyle },
      { id: '51', source: '3', target: '4', style: `${edgeStyle}exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;`, label: 'Auth' },
      // Gateway → Functions
      { id: '52', source: '3', target: '10', style: edgeStyle },
      { id: '53', source: '3', target: '11', style: edgeStyle },
      { id: '54', source: '3', target: '12', style: edgeStyle },
      // Functions → Backend
      { id: '55', source: '10', target: '20', style: edgeStyle },
      { id: '56', source: '11', target: '21', style: edgeStyle },
      { id: '57', source: '12', target: '22', style: edgeStyle },
      // Monitoring (dashed)
      { id: '58', source: '10', target: '30', style: dashedEdge },
      { id: '59', source: '11', target: '30', style: dashedEdge },
      { id: '60', source: '12', target: '30', style: dashedEdge },
    ],
    metadata: {
      title: p.title,
      description: 'Serverless architecture: API Gateway → Functions → managed backend services with monitoring.',
      diagramType: 'infrastructure',
      notation: 'generic',
    },
  };
}

export const serverless: DiagramTemplate = {
  name: 'serverless',
  displayName: 'Serverless Architecture',
  description: 'Event-driven serverless: API Gateway → Functions → NoSQL DB, object storage, and message queue with monitoring.',
  category: 'infrastructure',
  diagramType: 'infrastructure',
  notations: ['generic', 'aws', 'azure', 'gcp'],
  tags: ['serverless', 'functions', 'api-gateway', 'event-driven', 'faas'],
  defaultParams: DEFAULTS,
  build,
};
