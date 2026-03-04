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
/**
 * Validates that the model satisfies layout constraints.
 * Returns a list of violations found.
 */
export declare function validateLayout(model: DiagramModel, constraints?: LayoutConstraints): string[];
/**
 * Applies layout constraints to a DiagramModel, clamping positions
 * and resizing containers that exceed maximums.
 *
 * Returns a new DiagramModel (does not mutate the input).
 */
export declare function applyConstraints(model: DiagramModel, constraints?: LayoutConstraints): DiagramModel;
/**
 * Calculates the centre point of a node or container.
 */
export declare function getCentre(element: {
    x: number;
    y: number;
    width: number;
    height: number;
}): Point;
//# sourceMappingURL=layout-engine.d.ts.map