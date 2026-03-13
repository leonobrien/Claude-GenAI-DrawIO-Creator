/**
 * LayoutEngine -- Applies spatial constraints and adjustments to DiagramModel.
 *
 * Ensures elements fit within the draw.io canvas bounds and maintain
 * minimum spacing. Supports horizontal and vertical flow directions.
 */

import type { DiagramModel, Point } from '../types/index.js';

export interface LayoutConstraints {
  /** Maximum x coordinate (default: 800) */
  maxX: number;
  /** Maximum y coordinate (default: 600) */
  maxY: number;
  /** Left/top margin (default: 40) */
  margin: number;
  /** Minimum gap between elements (default: 50) */
  minGap: number;
  /** Maximum container width (default: 700) */
  maxContainerWidth: number;
  /** Maximum container height (default: 550) */
  maxContainerHeight: number;
}

const DEFAULT_CONSTRAINTS: LayoutConstraints = {
  maxX: 800,
  maxY: 600,
  margin: 40,
  minGap: 50,
  maxContainerWidth: 700,
  maxContainerHeight: 550,
};

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getBoundingBox(element: { x: number; y: number; width: number; height: number }): BoundingBox {
  return { x: element.x, y: element.y, width: element.width, height: element.height };
}

function boxesOverlap(a: BoundingBox, b: BoundingBox, gap: number): boolean {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

/**
 * Clamps a node's position to fit within canvas bounds.
 */
function clampToCanvas<T extends { x: number; y: number; width: number; height: number }>(
  element: T,
  constraints: LayoutConstraints,
): T {
  const maxWidth = element.width > constraints.maxContainerWidth
    ? constraints.maxContainerWidth
    : element.width;
  const maxHeight = element.height > constraints.maxContainerHeight
    ? constraints.maxContainerHeight
    : element.height;

  return {
    ...element,
    width: maxWidth,
    height: maxHeight,
    x: Math.max(constraints.margin, Math.min(element.x, constraints.maxX - maxWidth - constraints.margin)),
    y: Math.max(constraints.margin, Math.min(element.y, constraints.maxY - maxHeight - constraints.margin)),
  };
}

/**
 * Validates that the model satisfies layout constraints.
 * Returns a list of violations found.
 */
export function validateLayout(
  model: DiagramModel,
  constraints: LayoutConstraints = DEFAULT_CONSTRAINTS,
): string[] {
  const violations: string[] = [];
  const allElements = [...model.containers, ...model.nodes];

  for (const element of allElements) {
    if (element.x < 0 || element.y < 0) {
      violations.push(`Element "${element.id}" has negative coordinates (${element.x}, ${element.y})`);
    }
    if (element.x + element.width > constraints.maxX) {
      violations.push(`Element "${element.id}" exceeds maxX (${element.x + element.width} > ${constraints.maxX})`);
    }
    if (element.y + element.height > constraints.maxY) {
      violations.push(`Element "${element.id}" exceeds maxY (${element.y + element.height} > ${constraints.maxY})`);
    }
  }

  // Check for overlapping top-level elements (same parent or no parent)
  const topLevel = allElements.filter((e) => !e.parent || e.parent === '1');
  for (let i = 0; i < topLevel.length; i++) {
    for (let j = i + 1; j < topLevel.length; j++) {
      const elemA = topLevel[i]; // eslint-disable-line security/detect-object-injection
      const elemB = topLevel[j]; // eslint-disable-line security/detect-object-injection
      const a = getBoundingBox(elemA);
      const b = getBoundingBox(elemB);
      if (boxesOverlap(a, b, 0)) {
        violations.push(`Elements "${elemA.id}" and "${elemB.id}" overlap`);
      }
    }
  }

  return violations;
}

/**
 * Applies layout constraints to a DiagramModel, clamping positions
 * and resizing containers that exceed maximums.
 *
 * Returns a new DiagramModel (does not mutate the input).
 */
export function applyConstraints(
  model: DiagramModel,
  constraints: LayoutConstraints = DEFAULT_CONSTRAINTS,
): DiagramModel {
  return {
    ...model,
    containers: model.containers.map((c) => clampToCanvas(c, constraints)),
    nodes: model.nodes.map((n) => clampToCanvas(n, constraints)),
  };
}

/**
 * Calculates the centre point of a node or container.
 */
export function getCentre(element: { x: number; y: number; width: number; height: number }): Point {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  };
}

/** Maximum iterations for overlap resolution to prevent infinite loops. */
const MAX_RESOLVE_ITERATIONS = 50;

interface Positionable {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;
}

/**
 * Computes the minimum displacement to separate two overlapping boxes.
 * Pushes the second box (b) away from the first (a) along the axis
 * with the smallest overlap, preserving the required gap.
 */
function computeDisplacement(
  a: BoundingBox,
  b: BoundingBox,
  gap: number,
): { dx: number; dy: number } {
  const overlapX = Math.min(a.x + a.width + gap, b.x + b.width + gap) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.height + gap, b.y + b.height + gap) - Math.max(a.y, b.y);

  if (overlapX <= 0 || overlapY <= 0) return { dx: 0, dy: 0 };

  // Push along the axis with smaller overlap (less disruption)
  if (overlapX < overlapY) {
    const sign = getCentre(b).x >= getCentre(a).x ? 1 : -1;
    return { dx: sign * overlapX, dy: 0 };
  }
  const sign = getCentre(b).y >= getCentre(a).y ? 1 : -1;
  return { dx: 0, dy: sign * overlapY };
}

/**
 * Groups elements by their parent ID.
 * Elements with no parent or parent="1" are grouped under '1' (root).
 */
function groupByParent<T extends Positionable>(elements: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const el of elements) {
    const key = el.parent ?? '1';
    const group = groups.get(key);
    if (group) {
      group.push(el);
    } else {
      groups.set(key, [el]);
    }
  }
  return groups;
}

/**
 * Resolves overlapping elements within a sibling group by iteratively
 * displacing them apart. Only compares elements that share the same parent.
 *
 * Returns the number of displacements applied (0 = no overlaps found).
 */
function resolveGroupOverlaps<T extends Positionable>(elements: T[], gap: number): number {
  let totalDisplacements = 0;

  for (let iteration = 0; iteration < MAX_RESOLVE_ITERATIONS; iteration++) {
    let anyOverlap = false;

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const a = elements[i]; // eslint-disable-line security/detect-object-injection
        const b = elements[j]; // eslint-disable-line security/detect-object-injection
        const boxA = getBoundingBox(a);
        const boxB = getBoundingBox(b);

        if (boxesOverlap(boxA, boxB, gap)) {
          const { dx, dy } = computeDisplacement(boxA, boxB, gap);
          b.x += dx;
          b.y += dy;
          anyOverlap = true;
          totalDisplacements++;
        }
      }
    }

    if (!anyOverlap) break;
  }

  return totalDisplacements;
}

/**
 * Resolves overlapping elements in a DiagramModel by displacing siblings apart.
 *
 * Elements are grouped by parent — only siblings (same parent) are compared.
 * Each group is processed independently, so children within different
 * containers don't interfere with each other.
 *
 * Returns a new DiagramModel with adjusted coordinates (input is not mutated).
 *
 * @param model - The diagram model to process
 * @param gap - Minimum gap between sibling elements (default: 10)
 */
export function resolveOverlaps(
  model: DiagramModel,
  gap = 10,
): { model: DiagramModel; displacements: number } {
  // Deep-copy mutable position data
  const containers = model.containers.map(c => ({ ...c }));
  const nodes = model.nodes.map(n => ({ ...n }));

  // Combine all positionable elements for grouping
  const all: Positionable[] = [...containers, ...nodes];
  const groups = groupByParent(all);

  let totalDisplacements = 0;
  for (const siblings of groups.values()) {
    if (siblings.length < 2) continue;
    totalDisplacements += resolveGroupOverlaps(siblings, gap);
  }

  // Map updated coordinates back to containers and nodes by id
  const posMap = new Map(all.map(el => [el.id, { x: el.x, y: el.y }]));

  return {
    model: {
      ...model,
      containers: model.containers.map(c => {
        const pos = posMap.get(c.id);
        return pos ? { ...c, x: pos.x, y: pos.y } : c;
      }),
      nodes: model.nodes.map(n => {
        const pos = posMap.get(n.id);
        return pos ? { ...n, x: pos.x, y: pos.y } : n;
      }),
    },
    displacements: totalDisplacements,
  };
}
