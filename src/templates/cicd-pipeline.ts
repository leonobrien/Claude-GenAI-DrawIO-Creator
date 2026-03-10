/**
 * CI/CD Pipeline template.
 *
 * Linear left-to-right flow from source control through build,
 * test, and deployment stages.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';

const DEFAULTS: TemplateParams = {
  title: 'CI/CD Pipeline',
  sourceRepo: 'Source Repo',
  build: 'Build',
  unitTests: 'Unit Tests',
  integrationTests: 'Integration Tests',
  stagingDeploy: 'Staging Deploy',
  productionDeploy: 'Production Deploy',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  const stageStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;';
  const testStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;';
  const deployStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;';
  const repoStyle = 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#f5f5f5;strokeColor=#666666;';
  const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;';

  const y = 170;
  const w = 110;
  const h = 50;
  const gap = 30;

  return {
    containers: [],
    nodes: [
      { id: '2', label: p.sourceRepo, style: repoStyle, x: 40, y: y - 5, width: 70, height: 60 },
      { id: '3', label: p.build, style: stageStyle, x: 40 + 70 + gap, y, width: w, height: h },
      { id: '4', label: p.unitTests, style: testStyle, x: 40 + 70 + gap + (w + gap), y, width: w, height: h },
      { id: '5', label: p.integrationTests, style: testStyle, x: 40 + 70 + gap + 2 * (w + gap), y, width: w, height: h },
      { id: '6', label: p.stagingDeploy, style: deployStyle, x: 40 + 70 + gap + 3 * (w + gap), y, width: w, height: h },
      { id: '7', label: p.productionDeploy, style: deployStyle, x: 40 + 70 + gap + 4 * (w + gap), y, width: w, height: h },
    ],
    edges: [
      { id: '50', source: '2', target: '3', style: edgeStyle },
      { id: '51', source: '3', target: '4', style: edgeStyle },
      { id: '52', source: '4', target: '5', style: edgeStyle },
      { id: '53', source: '5', target: '6', style: edgeStyle },
      { id: '54', source: '6', target: '7', style: edgeStyle },
      // Feedback loop from tests back to source
      { id: '55', label: 'Fail', source: '4', target: '2', style: `${edgeStyle}dashed=1;strokeColor=#b85450;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    ],
    metadata: {
      title: p.title,
      description: 'Continuous integration and deployment pipeline from source through build, test, and deploy stages.',
      diagramType: 'flowchart',
      notation: 'generic',
    },
  };
}

export const cicdPipeline: DiagramTemplate = {
  name: 'cicd-pipeline',
  displayName: 'CI/CD Pipeline',
  description: 'Linear pipeline from source repo through build, test, staging, and production deployment stages.',
  category: 'infrastructure',
  diagramType: 'flowchart',
  notations: ['generic', 'aws', 'azure', 'gcp'],
  tags: ['cicd', 'pipeline', 'devops', 'deployment', 'continuous-integration'],
  defaultParams: DEFAULTS,
  build,
};
