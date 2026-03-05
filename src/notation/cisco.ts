/**
 * Cisco notation — Cisco network infrastructure icon shapes.
 *
 * Uses the mxgraph.cisco19 stencil library for official Cisco network icons.
 * Each shape uses shape=mxgraph.cisco19.rect with a prIcon modifier.
 */

import type { NotationDefinition } from '../types/index.js';

/** Standard connection points for Cisco shapes. */
const CISCO_POINTS = 'points=[[0.5,0,0],[0.5,1,0],[0,0.5,0],[1,0.5,0]];';

/** Base style for Cisco 19 shapes (rect + prIcon composite). */
const CISCO_BASE = `sketch=0;${CISCO_POINTS}verticalLabelPosition=bottom;html=1;verticalAlign=top;aspect=fixed;align=center;outlineConnect=0;`;

/** Helper to build a Cisco icon style. */
function ciscoIcon(prIcon: string): string {
  return `${CISCO_BASE}shape=mxgraph.cisco19.rect;prIcon=${prIcon};fillColor=#FAFAFA;strokeColor=#005073;`;
}

/** Style for WAN/cloud shapes that have no cisco19 prIcon equivalent. */
const CLOUD_STYLE = `${CISCO_BASE}ellipse;shape=cloud;fillColor=#FAFAFA;strokeColor=#005073;`;

export const ciscoNotation: NotationDefinition = {
  name: 'cisco',
  displayName: 'Cisco Network',
  stencilPrefix: 'mxgraph.cisco19',
  description: 'Cisco network infrastructure diagrams using official Cisco icons from the mxgraph.cisco19 stencil library.',
  shapes: [
    // Routing & Switching
    {
      name: 'Router',
      style: ciscoIcon('router'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'routing',
    },
    {
      name: 'Switch',
      style: ciscoIcon('l2_switch'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'switching',
    },
    {
      name: 'Multilayer Switch',
      style: ciscoIcon('l3_switch'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'switching',
    },
    {
      name: 'L3 Switch',
      style: ciscoIcon('l3_switch'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'switching',
    },
    {
      name: 'Workgroup Switch',
      style: ciscoIcon('workgroup_switch'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'switching',
    },

    // Security
    {
      name: 'Firewall',
      style: ciscoIcon('firewall'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'security',
    },
    {
      name: 'ASA 5500',
      style: ciscoIcon('asa_5500'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'security',
    },
    {
      name: 'VPN Gateway',
      style: ciscoIcon('virtual_private_network'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'security',
    },
    {
      name: 'IDS/IPS',
      style: ciscoIcon('ips_ids'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'security',
    },

    // Wireless
    {
      name: 'Access Point',
      style: ciscoIcon('dual_mode_access_point'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'wireless',
    },
    {
      name: 'Wireless Controller',
      style: ciscoIcon('wireless_lan_controller'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'wireless',
    },

    // Servers & Endpoints
    {
      name: 'Server',
      style: ciscoIcon('ucs_c_series_server'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'servers',
    },
    {
      name: 'Blade Server',
      style: ciscoIcon('blade_server'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'servers',
    },
    {
      name: 'Desktop',
      style: ciscoIcon('monitor'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'endpoints',
    },
    {
      name: 'IP Phone',
      style: ciscoIcon('h323'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'endpoints',
    },

    // WAN & Connectivity
    {
      name: 'Cloud',
      style: CLOUD_STYLE,
      defaultWidth: 90,
      defaultHeight: 60,
      category: 'wan',
    },
    {
      name: 'Internet',
      style: CLOUD_STYLE,
      defaultWidth: 90,
      defaultHeight: 60,
      category: 'wan',
    },

    // Data Centre
    {
      name: 'Nexus 5000',
      style: ciscoIcon('nexus_5k'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'datacentre',
    },
    {
      name: 'Storage',
      style: ciscoIcon('storage'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'datacentre',
    },
    {
      name: 'UCS Manager',
      style: ciscoIcon('ucs_express'),
      defaultWidth: 50,
      defaultHeight: 50,
      category: 'datacentre',
    },
  ],
  styleTemplates: {
    vertex: ciscoIcon('router'),
    edge: 'endArrow=classic;html=1;strokeColor=#005073;',
    container: 'rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=5 5;fillColor=none;strokeColor=#005073;verticalAlign=top;fontStyle=1;fontSize=12;',
    labelEdge: 'endArrow=classic;html=1;strokeColor=#005073;fontSize=10;',
  },
  colours: {
    routing: { fillColor: '#FAFAFA', strokeColor: '#005073' },
    switching: { fillColor: '#FAFAFA', strokeColor: '#005073' },
    security: { fillColor: '#FAFAFA', strokeColor: '#CC0000' },
    wireless: { fillColor: '#FAFAFA', strokeColor: '#005073' },
    servers: { fillColor: '#FAFAFA', strokeColor: '#005073' },
    endpoints: { fillColor: '#FAFAFA', strokeColor: '#005073' },
    wan: { fillColor: '#FAFAFA', strokeColor: '#005073' },
    datacentre: { fillColor: '#FAFAFA', strokeColor: '#005073' },
  },
  layout: {
    preferredFlow: 'top-down',
    usesContainers: true,
    suggestedGap: 60,
    hints: [
      'Organise network tiers top-down: internet → WAN → core → distribution → access',
      'Use containers to group devices by site, building, or floor',
      'Place security appliances (firewalls, IDS/IPS) at tier boundaries',
      'Use Cisco teal (#005073) as the primary edge and border colour',
      'Label edges with link speeds, VLANs, or protocols',
      'Show redundant paths with parallel connections',
    ],
  },
  fewShotExample: [
    '<mxCell id="2" value="Data Centre" style="rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=5 5;fillColor=none;strokeColor=#005073;verticalAlign=top;fontStyle=1;fontSize=12;" vertex="1" connectable="0" parent="1">',
    '  <mxGeometry x="40" y="40" width="700" height="400" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="3" value="Internet" style="${CLOUD_STYLE}" vertex="1" parent="1">`,
    '  <mxGeometry x="320" y="40" width="90" height="60" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="4" value="Firewall" style="${ciscoIcon('firewall')}" vertex="1" parent="2">`,
    '  <mxGeometry x="305" y="50" width="50" height="50" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="5" value="Core Switch" style="${ciscoIcon('l3_switch')}" vertex="1" parent="2">`,
    '  <mxGeometry x="305" y="170" width="50" height="50" as="geometry"/>',
    '</mxCell>',
    `<mxCell id="6" value="Server" style="${ciscoIcon('ucs_c_series_server')}" vertex="1" parent="2">`,
    '  <mxGeometry x="305" y="290" width="50" height="50" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="7" style="endArrow=classic;html=1;strokeColor=#005073;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="3" target="4">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="8" style="endArrow=classic;html=1;strokeColor=#005073;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="4" target="5">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="9" style="endArrow=classic;html=1;strokeColor=#005073;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="5" target="6">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
  ].join('\n'),
  promptRules: [
    'Use shape=mxgraph.cisco19.rect;prIcon=<icon>; for all Cisco network icons (prIcon uses the bare icon name, NOT the full stencil path)',
    'Apply base style with fillColor=#FAFAFA and strokeColor=#005073',
    'Organise network tiers top-down: internet → firewall → core → distribution → access → endpoints',
    'Group devices by site, building, or network zone using dashed containers',
    'Label edges with link speeds (e.g., 10GbE) or VLAN information',
    'Use Cisco teal (#005073) for edges and container borders',
    'Show redundant links with parallel edges',
  ],
};
