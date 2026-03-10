/**
 * Hub-and-Spoke Network Topology template.
 *
 * Central core router/switch connected to distribution switches,
 * each serving access-layer devices. Uses Cisco notation shapes.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';
import { resolveShape } from '../notation/registry.js';

const DEFAULTS: TemplateParams = {
  title: 'Hub-and-Spoke Network',
  internet: 'Internet',
  firewall: 'Firewall',
  coreRouter: 'Core Router',
  distSwitch1: 'Dist Switch 1',
  distSwitch2: 'Dist Switch 2',
  server1: 'Server 1',
  server2: 'Server 2',
  desktop1: 'Desktop 1',
  desktop2: 'Desktop 2',
  accessPoint: 'Wireless AP',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  const cloud = resolveShape('cisco', 'Cloud')!;
  const fw = resolveShape('cisco', 'Firewall')!;
  const router = resolveShape('cisco', 'Router')!;
  const sw = resolveShape('cisco', 'Switch')!;
  const server = resolveShape('cisco', 'Server')!;
  const desktop = resolveShape('cisco', 'Desktop')!;
  const ap = resolveShape('cisco', 'Access Point')!;

  const edgeStyle = 'endArrow=classic;html=1;strokeColor=#005073;';
  const trunkEdge = `${edgeStyle}strokeWidth=2;`;

  return {
    containers: [],
    nodes: [
      // Top: Internet cloud
      { id: '2', label: p.internet, style: cloud.style, x: 295, y: 20, width: cloud.defaultWidth, height: cloud.defaultHeight },
      // Firewall
      { id: '3', label: p.firewall, style: fw.style, x: 315, y: 120, width: fw.defaultWidth, height: fw.defaultHeight },
      // Core hub
      { id: '4', label: p.coreRouter, style: router.style, x: 315, y: 230, width: router.defaultWidth, height: router.defaultHeight },
      // Distribution switches
      { id: '10', label: p.distSwitch1, style: sw.style, x: 140, y: 340, width: sw.defaultWidth, height: sw.defaultHeight },
      { id: '11', label: p.distSwitch2, style: sw.style, x: 490, y: 340, width: sw.defaultWidth, height: sw.defaultHeight },
      // Access layer — left branch
      { id: '20', label: p.server1, style: server.style, x: 60, y: 450, width: server.defaultWidth, height: server.defaultHeight },
      { id: '21', label: p.server2, style: server.style, x: 180, y: 450, width: server.defaultWidth, height: server.defaultHeight },
      // Access layer — right branch
      { id: '22', label: p.desktop1, style: desktop.style, x: 420, y: 450, width: desktop.defaultWidth, height: desktop.defaultHeight },
      { id: '23', label: p.desktop2, style: desktop.style, x: 540, y: 450, width: desktop.defaultWidth, height: desktop.defaultHeight },
      // Wireless AP on right
      { id: '24', label: p.accessPoint, style: ap.style, x: 490, y: 450, width: ap.defaultWidth, height: ap.defaultHeight },
    ],
    edges: [
      { id: '50', source: '2', target: '3', style: edgeStyle },
      { id: '51', source: '3', target: '4', style: edgeStyle },
      // Core → Distribution (trunk links)
      { id: '52', source: '4', target: '10', style: trunkEdge, label: '10GbE' },
      { id: '53', source: '4', target: '11', style: trunkEdge, label: '10GbE' },
      // Distribution → Access
      { id: '54', source: '10', target: '20', style: edgeStyle },
      { id: '55', source: '10', target: '21', style: edgeStyle },
      { id: '56', source: '11', target: '22', style: edgeStyle },
      { id: '57', source: '11', target: '23', style: edgeStyle },
      { id: '58', source: '11', target: '24', style: edgeStyle },
    ],
    metadata: {
      title: p.title,
      description: 'Hub-and-spoke network topology with core router, distribution switches, and access-layer devices.',
      diagramType: 'infrastructure',
      notation: 'cisco',
    },
  };
}

export const hubSpokeNetwork: DiagramTemplate = {
  name: 'hub-spoke-network',
  displayName: 'Hub-and-Spoke Network',
  description: 'Cisco network topology: Internet → Firewall → Core Router → Distribution Switches → Access devices.',
  category: 'network',
  diagramType: 'infrastructure',
  notations: ['cisco', 'generic'],
  tags: ['network', 'cisco', 'hub-spoke', 'star', 'topology', 'firewall', 'router'],
  defaultParams: DEFAULTS,
  build,
};
