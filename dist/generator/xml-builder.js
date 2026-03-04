/**
 * XmlBuilder — Constructs draw.io XML from DiagramModel.
 *
 * Converts the typed intermediate representation into bare <mxCell> elements.
 * The wrapper structure (<mxfile>, <mxGraphModel>, etc.) is added separately
 * by XmlWrapper.
 */
function escapeXmlAttribute(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;');
}
function buildGeometry(x, y, width, height) {
    return `<mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>`;
}
function buildRelativeGeometry() {
    return '<mxGeometry relative="1" as="geometry"/>';
}
function buildWaypointGeometry(waypoints) {
    const points = waypoints
        .map((wp) => `<mxPoint x="${wp.x}" y="${wp.y}"/>`)
        .join('');
    return `<mxGeometry relative="1" as="geometry"><Array as="points">${points}</Array></mxGeometry>`;
}
export function buildNodeXml(node) {
    const parent = node.parent ?? '1';
    const label = escapeXmlAttribute(node.label);
    const style = escapeXmlAttribute(node.style);
    const geometry = buildGeometry(node.x, node.y, node.width, node.height);
    return `<mxCell id="${node.id}" value="${label}" style="${style}" vertex="1" parent="${parent}">${geometry}</mxCell>`;
}
export function buildEdgeXml(edge) {
    const label = edge.label ? ` value="${escapeXmlAttribute(edge.label)}"` : '';
    const style = escapeXmlAttribute(edge.style);
    const geometry = edge.waypoints?.length
        ? buildWaypointGeometry(edge.waypoints)
        : buildRelativeGeometry();
    return `<mxCell id="${edge.id}"${label} style="${style}" edge="1" parent="1" source="${edge.source}" target="${edge.target}">${geometry}</mxCell>`;
}
export function buildContainerXml(container) {
    const parent = container.parent ?? '1';
    const label = escapeXmlAttribute(container.label);
    const style = escapeXmlAttribute(container.style);
    const collapsed = container.collapsed ? ' collapsed="1"' : '';
    const geometry = buildGeometry(container.x, container.y, container.width, container.height);
    return `<mxCell id="${container.id}" value="${label}" style="${style}" vertex="1" connectable="0" parent="${parent}"${collapsed}>${geometry}</mxCell>`;
}
/**
 * Converts a DiagramModel into bare <mxCell> XML elements.
 * Does NOT include wrapper structure — use XmlWrapper for that.
 */
export function buildDiagramXml(model) {
    const parts = [];
    for (const container of model.containers) {
        parts.push(buildContainerXml(container));
    }
    for (const node of model.nodes) {
        parts.push(buildNodeXml(node));
    }
    for (const edge of model.edges) {
        parts.push(buildEdgeXml(edge));
    }
    return parts.join('\n');
}
//# sourceMappingURL=xml-builder.js.map