/**
 * BPMN Order Fulfilment Process template.
 *
 * Standard order processing flow: receive order, check inventory,
 * process payment, pack and ship, notify customer.
 * Uses BPMN 2.0 notation with pools and gateways.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';
import { resolveShape } from '../notation/registry.js';

const DEFAULTS: TemplateParams = {
  title: 'Order Fulfilment Process',
  poolSales: 'Sales',
  poolWarehouse: 'Warehouse',
  receiveOrder: 'Receive\nOrder',
  checkInventory: 'Check\nInventory',
  gatewayInStock: 'In Stock?',
  processPayment: 'Process\nPayment',
  backOrder: 'Back-Order\nItems',
  packShip: 'Pack &\nShip',
  notifyCustomer: 'Notify\nCustomer',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  const startEvent = resolveShape('bpmn', 'Start Event')!;
  const endEvent = resolveShape('bpmn', 'End Event')!;
  const task = resolveShape('bpmn', 'User Task')!;
  const serviceTask = resolveShape('bpmn', 'Service Task')!;
  const gateway = resolveShape('bpmn', 'Exclusive Gateway')!;
  const pool = resolveShape('bpmn', 'Pool')!;

  const seqFlow = 'edgeStyle=orthogonalEdgeStyle;endArrow=classic;html=1;strokeColor=#000000;';

  return {
    containers: [
      // Sales pool
      { id: '2', label: p.poolSales, style: pool.style, x: 40, y: 40, width: 720, height: 160 },
      // Warehouse pool
      { id: '3', label: p.poolWarehouse, style: pool.style, x: 40, y: 230, width: 720, height: 160 },
    ],
    nodes: [
      // Sales lane (relative to pool 2)
      { id: '10', label: '', style: startEvent.style, x: 40, y: 60, width: 40, height: 40, parent: '2' },
      { id: '11', label: p.receiveOrder, style: task.style, x: 120, y: 40, width: 120, height: 80, parent: '2' },
      { id: '12', label: p.processPayment, style: serviceTask.style, x: 400, y: 40, width: 120, height: 80, parent: '2' },
      { id: '13', label: p.notifyCustomer, style: serviceTask.style, x: 560, y: 40, width: 120, height: 80, parent: '2' },

      // Warehouse lane (relative to pool 3)
      { id: '20', label: p.checkInventory, style: task.style, x: 120, y: 40, width: 120, height: 80, parent: '3' },
      { id: '21', label: '', style: gateway.style, x: 290, y: 55, width: 50, height: 50, parent: '3' },
      { id: '22', label: p.packShip, style: task.style, x: 400, y: 40, width: 120, height: 80, parent: '3' },
      { id: '23', label: p.backOrder, style: task.style, x: 280, y: 120, width: 100, height: 40, parent: '3' },
      { id: '24', label: '', style: endEvent.style, x: 560, y: 60, width: 40, height: 40, parent: '3' },
    ],
    edges: [
      // Sales flow
      { id: '50', source: '10', target: '11', style: seqFlow },
      // Cross-pool: Order received → Check inventory (message flow)
      { id: '51', source: '11', target: '20', style: `${seqFlow}dashed=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
      // Warehouse flow
      { id: '52', source: '20', target: '21', style: seqFlow },
      { id: '53', label: 'Yes', source: '21', target: '22', style: seqFlow },
      { id: '54', label: 'No', source: '21', target: '23', style: `${seqFlow}exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
      // Back-order loops back to check
      { id: '55', source: '23', target: '20', style: `${seqFlow}dashed=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;` },
      // Pack & Ship → Payment (cross-pool)
      { id: '56', source: '22', target: '12', style: `${seqFlow}dashed=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;` },
      // Payment → Notify
      { id: '57', source: '12', target: '13', style: seqFlow },
      // Notify → End (cross-pool)
      { id: '58', source: '13', target: '24', style: `${seqFlow}dashed=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;` },
    ],
    metadata: {
      title: p.title,
      description: 'BPMN order fulfilment process with Sales and Warehouse pools, inventory check gateway, and back-order loop.',
      diagramType: 'flowchart',
      notation: 'bpmn',
    },
  };
}

export const bpmnOrderFulfilment: DiagramTemplate = {
  name: 'bpmn-order-fulfilment',
  displayName: 'BPMN Order Fulfilment',
  description: 'Order processing flow: receive order, check inventory, process payment, pack/ship, notify customer. Two swim lanes.',
  category: 'process',
  diagramType: 'flowchart',
  notations: ['bpmn'],
  tags: ['bpmn', 'order', 'fulfilment', 'process', 'swimlane', 'gateway'],
  defaultParams: DEFAULTS,
  build,
};
