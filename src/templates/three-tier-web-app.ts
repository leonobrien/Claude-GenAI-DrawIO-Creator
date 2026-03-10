/**
 * Three-Tier Web Application template.
 *
 * Presentation → Application → Data tiers with load balancing
 * and redundant application servers.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';

const DEFAULTS: TemplateParams = {
  title: 'Three-Tier Web Application',
  tier1Label: 'Presentation Tier',
  tier2Label: 'Application Tier',
  tier3Label: 'Data Tier',
  internet: 'Internet',
  loadBalancer: 'Load Balancer',
  webServer1: 'Web Server 1',
  webServer2: 'Web Server 2',
  appServer: 'App Server',
  database: 'Database',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  const tierStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;fontSize=12;align=left;spacingLeft=5;';
  const nodeStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;';
  const dbStyle = 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#d5e8d4;strokeColor=#82b366;';
  const cloudStyle = 'ellipse;shape=cloud;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;';
  const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;';

  return {
    containers: [
      { id: '2', label: p.tier1Label, style: tierStyle, x: 40, y: 40, width: 680, height: 130 },
      { id: '3', label: p.tier2Label, style: tierStyle, x: 40, y: 200, width: 680, height: 130 },
      { id: '4', label: p.tier3Label, style: tierStyle, x: 40, y: 360, width: 680, height: 130 },
    ],
    nodes: [
      // Tier 1 — Presentation (relative to container 2)
      { id: '10', label: p.internet, style: cloudStyle, x: 20, y: 25, width: 120, height: 80, parent: '2' },
      { id: '11', label: p.loadBalancer, style: nodeStyle, x: 280, y: 35, width: 120, height: 60, parent: '2' },
      // Tier 2 — Application (relative to container 3)
      { id: '20', label: p.webServer1, style: nodeStyle, x: 120, y: 35, width: 120, height: 60, parent: '3' },
      { id: '21', label: p.webServer2, style: nodeStyle, x: 440, y: 35, width: 120, height: 60, parent: '3' },
      { id: '22', label: p.appServer, style: nodeStyle, x: 280, y: 35, width: 120, height: 60, parent: '3' },
      // Tier 3 — Data (relative to container 4)
      { id: '30', label: p.database, style: dbStyle, x: 310, y: 25, width: 60, height: 80, parent: '4' },
    ],
    edges: [
      { id: '50', source: '10', target: '11', style: edgeStyle },
      { id: '51', source: '11', target: '20', style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
      { id: '52', source: '11', target: '21', style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
      { id: '53', source: '20', target: '22', style: edgeStyle },
      { id: '54', source: '21', target: '22', style: edgeStyle },
      { id: '55', source: '22', target: '30', style: `${edgeStyle}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    ],
    metadata: {
      title: p.title,
      description: 'Three-tier architecture with presentation, application, and data layers.',
      diagramType: 'infrastructure',
      notation: 'generic',
    },
  };
}

export const threeTierWebApp: DiagramTemplate = {
  name: 'three-tier-web-app',
  displayName: 'Three-Tier Web Application',
  description: 'Classic three-tier architecture: presentation (load balancer), application (web/app servers), and data (database) tiers.',
  category: 'infrastructure',
  diagramType: 'infrastructure',
  notations: ['generic', 'aws', 'azure', 'gcp'],
  tags: ['web', 'three-tier', 'layered', 'load-balancer', 'database'],
  defaultParams: DEFAULTS,
  build,
};
