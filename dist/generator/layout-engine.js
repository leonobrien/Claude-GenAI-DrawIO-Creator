/**
 * LayoutEngine -- Applies spatial constraints and adjustments to DiagramModel.
 *
 * Ensures elements fit within the draw.io canvas bounds and maintain
 * minimum spacing. Supports horizontal and vertical flow directions.
 */
const DEFAULT_CONSTRAINTS = {
    maxX: 800,
    maxY: 600,
    margin: 40,
    minGap: 50,
    maxContainerWidth: 700,
    maxContainerHeight: 550,
};
function getBoundingBox(element) {
    return { x: element.x, y: element.y, width: element.width, height: element.height };
}
function boxesOverlap(a, b, gap) {
    return !(a.x + a.width + gap <= b.x ||
        b.x + b.width + gap <= a.x ||
        a.y + a.height + gap <= b.y ||
        b.y + b.height + gap <= a.y);
}
/**
 * Clamps a node's position to fit within canvas bounds.
 */
function clampToCanvas(element, constraints) {
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
export function validateLayout(model, constraints = DEFAULT_CONSTRAINTS) {
    const violations = [];
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
            const a = getBoundingBox(topLevel[i]);
            const b = getBoundingBox(topLevel[j]);
            if (boxesOverlap(a, b, 0)) {
                violations.push(`Elements "${topLevel[i].id}" and "${topLevel[j].id}" overlap`);
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
export function applyConstraints(model, constraints = DEFAULT_CONSTRAINTS) {
    return {
        ...model,
        containers: model.containers.map((c) => clampToCanvas(c, constraints)),
        nodes: model.nodes.map((n) => clampToCanvas(n, constraints)),
    };
}
/**
 * Calculates the centre point of a node or container.
 */
export function getCentre(element) {
    return {
        x: element.x + element.width / 2,
        y: element.y + element.height / 2,
    };
}
//# sourceMappingURL=layout-engine.js.map