/**
 * Microservices Architecture template.
 *
 * API Gateway fronting multiple independent services,
 * each with its own data store, connected via a message broker.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';

const DEFAULTS: TemplateParams = {
  title: 'Microservices Architecture',
  client: 'Client',
  apiGateway: 'API Gateway',
  serviceA: 'Service A',
  serviceB: 'Service B',
  serviceC: 'Service C',
  dbA: 'DB A',
  dbB: 'DB B',
  dbC: 'DB C',
  messageBroker: 'Message Broker',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  const nodeStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;';
  const gwStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;';
  const dbStyle = 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#fff2cc;strokeColor=#d6b656;';
  const brokerStyle = 'shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontStyle=1;';
  const clientStyle = 'ellipse;shape=cloud;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;';
  const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;';
  const dashedEdge = `${edgeStyle}dashed=1;strokeColor=#9673a6;`;

  return {
    containers: [],
    nodes: [
      { id: '2', label: p.client, style: clientStyle, x: 40, y: 190, width: 100, height: 70 },
      { id: '3', label: p.apiGateway, style: gwStyle, x: 200, y: 200, width: 120, height: 50 },
      // Services row
      { id: '10', label: p.serviceA, style: nodeStyle, x: 400, y: 60, width: 120, height: 50 },
      { id: '11', label: p.serviceB, style: nodeStyle, x: 400, y: 200, width: 120, height: 50 },
      { id: '12', label: p.serviceC, style: nodeStyle, x: 400, y: 340, width: 120, height: 50 },
      // Databases
      { id: '20', label: p.dbA, style: dbStyle, x: 600, y: 45, width: 60, height: 80 },
      { id: '21', label: p.dbB, style: dbStyle, x: 600, y: 185, width: 60, height: 80 },
      { id: '22', label: p.dbC, style: dbStyle, x: 600, y: 325, width: 60, height: 80 },
      // Message broker
      { id: '30', label: p.messageBroker, style: brokerStyle, x: 220, y: 370, width: 120, height: 60 },
    ],
    edges: [
      // Client → Gateway
      { id: '50', source: '2', target: '3', style: edgeStyle },
      // Gateway → Services (fan-out)
      { id: '51', source: '3', target: '10', style: edgeStyle },
      { id: '52', source: '3', target: '11', style: edgeStyle },
      { id: '53', source: '3', target: '12', style: edgeStyle },
      // Services → DBs
      { id: '54', source: '10', target: '20', style: edgeStyle },
      { id: '55', source: '11', target: '21', style: edgeStyle },
      { id: '56', source: '12', target: '22', style: edgeStyle },
      // Services ↔ Broker (async)
      { id: '57', source: '10', target: '30', style: dashedEdge },
      { id: '58', source: '11', target: '30', style: dashedEdge },
      { id: '59', source: '12', target: '30', style: dashedEdge },
    ],
    metadata: {
      title: p.title,
      description: 'Microservices with API gateway, independent services with dedicated databases, and asynchronous messaging via broker.',
      diagramType: 'infrastructure',
      notation: 'generic',
    },
  };
}

export const microservices: DiagramTemplate = {
  name: 'microservices',
  displayName: 'Microservices Architecture',
  description: 'API Gateway fronting independent services, each with its own database, connected via message broker.',
  category: 'infrastructure',
  diagramType: 'infrastructure',
  notations: ['generic', 'aws', 'azure', 'gcp'],
  tags: ['microservices', 'api-gateway', 'message-broker', 'distributed'],
  defaultParams: DEFAULTS,
  build,
};
