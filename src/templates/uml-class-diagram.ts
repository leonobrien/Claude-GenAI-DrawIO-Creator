/**
 * UML Class Diagram template.
 *
 * Domain model with an abstract base class, two concrete subclasses,
 * and a service class showing inheritance and composition relationships.
 */

import type { DiagramTemplate, TemplateParams } from './types.js';
import type { DiagramModel } from '../types/index.js';

const DEFAULTS: TemplateParams = {
  title: 'UML Class Diagram',
  baseClass: 'Entity',
  baseAttrs: '# id: string\n# createdAt: Date',
  baseMethods: '+ getId(): string',
  classA: 'User',
  classAAttrs: '- name: string\n- email: string',
  classAMethods: '+ getName(): string\n+ setEmail(email: string): void',
  classB: 'Order',
  classBAttrs: '- total: number\n- status: string',
  classBMethods: '+ getTotal(): number\n+ cancel(): void',
  serviceClass: 'OrderService',
  serviceAttrs: '- repository: Repository',
  serviceMethods: '+ createOrder(user: User): Order\n+ findByUser(user: User): Order[]',
};

function build(params?: TemplateParams): DiagramModel {
  const p = { ...DEFAULTS, ...params };

  // UML class as swimlane container with child text cells
  const classStyle = 'swimlane;fontStyle=1;align=center;startSize=26;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;';
  const abstractStyle = 'swimlane;fontStyle=3;align=center;startSize=26;html=1;fillColor=#f5f5f5;strokeColor=#666666;';
  const serviceStyle = 'swimlane;fontStyle=1;align=center;startSize=26;html=1;fillColor=#d5e8d4;strokeColor=#82b366;';
  const attrStyle = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontStyle=0;html=1;';
  const dividerStyle = 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=10;rotatable=0;labelPosition=left;points=[];portConstraint=eastwest;strokeColor=inherit;';

  const cw = 200; // class width

  return {
    containers: [
      // Abstract base class (top centre)
      { id: '2', label: p.baseClass, style: abstractStyle, x: 260, y: 40, width: cw, height: 100 },
      // Subclass A (bottom left)
      { id: '3', label: p.classA, style: classStyle, x: 60, y: 230, width: cw, height: 120 },
      // Subclass B (bottom right)
      { id: '4', label: p.classB, style: classStyle, x: 460, y: 230, width: cw, height: 120 },
      // Service class (far right)
      { id: '5', label: p.serviceClass, style: serviceStyle, x: 460, y: 440, width: cw, height: 110 },
    ],
    nodes: [
      // Base class members (relative to container 2)
      { id: '10', label: p.baseAttrs, style: attrStyle, x: 0, y: 26, width: cw, height: 40, parent: '2' },
      { id: '11', label: '', style: dividerStyle, x: 0, y: 66, width: cw, height: 8, parent: '2' },
      { id: '12', label: p.baseMethods, style: attrStyle, x: 0, y: 74, width: cw, height: 26, parent: '2' },

      // Class A members (relative to container 3)
      { id: '13', label: p.classAAttrs, style: attrStyle, x: 0, y: 26, width: cw, height: 40, parent: '3' },
      { id: '14', label: '', style: dividerStyle, x: 0, y: 66, width: cw, height: 8, parent: '3' },
      { id: '15', label: p.classAMethods, style: attrStyle, x: 0, y: 74, width: cw, height: 40, parent: '3' },

      // Class B members (relative to container 4)
      { id: '16', label: p.classBAttrs, style: attrStyle, x: 0, y: 26, width: cw, height: 40, parent: '4' },
      { id: '17', label: '', style: dividerStyle, x: 0, y: 66, width: cw, height: 8, parent: '4' },
      { id: '18', label: p.classBMethods, style: attrStyle, x: 0, y: 74, width: cw, height: 40, parent: '4' },

      // Service members (relative to container 5)
      { id: '19', label: p.serviceAttrs, style: attrStyle, x: 0, y: 26, width: cw, height: 26, parent: '5' },
      { id: '25', label: '', style: dividerStyle, x: 0, y: 52, width: cw, height: 8, parent: '5' },
      { id: '26', label: p.serviceMethods, style: attrStyle, x: 0, y: 60, width: cw, height: 40, parent: '5' },
    ],
    edges: [
      // Inheritance: A extends Base
      { id: '50', source: '3', target: '2', style: 'endArrow=block;endFill=0;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0;entryY=1;entryDx=0;entryDy=0;' },
      // Inheritance: B extends Base
      { id: '51', source: '4', target: '2', style: 'endArrow=block;endFill=0;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=1;entryDx=0;entryDy=0;' },
      // Composition: Service has Orders
      { id: '52', label: '1..*', source: '5', target: '4', style: 'endArrow=diamond;endFill=1;html=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;' },
      // Association: Order → User
      { id: '53', label: '1', source: '4', target: '3', style: 'endArrow=open;endFill=0;html=1;dashed=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;' },
    ],
    metadata: {
      title: p.title,
      description: 'UML class diagram with abstract base class, two subclasses (inheritance), and a service class showing composition and association.',
      diagramType: 'generic',
      notation: 'uml',
    },
  };
}

export const umlClassDiagram: DiagramTemplate = {
  name: 'uml-class-diagram',
  displayName: 'UML Class Diagram',
  description: 'Domain model with abstract base, subclasses (inheritance), and service class (composition/association).',
  category: 'software',
  diagramType: 'generic',
  notations: ['uml'],
  tags: ['uml', 'class', 'inheritance', 'composition', 'domain-model'],
  defaultParams: DEFAULTS,
  build,
};
