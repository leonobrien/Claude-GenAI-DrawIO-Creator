/**
 * XmlBuilder — Constructs draw.io XML from DiagramModel.
 *
 * Converts the typed intermediate representation into bare <mxCell> elements.
 * The wrapper structure (<mxfile>, <mxGraphModel>, etc.) is added separately
 * by XmlWrapper.
 */
import type { DiagramModel, DiagramNode, DiagramEdge, DiagramContainer } from '../types/index.js';
export declare function buildNodeXml(node: DiagramNode): string;
export declare function buildEdgeXml(edge: DiagramEdge): string;
export declare function buildContainerXml(container: DiagramContainer): string;
/**
 * Converts a DiagramModel into bare <mxCell> XML elements.
 * Does NOT include wrapper structure — use XmlWrapper for that.
 */
export declare function buildDiagramXml(model: DiagramModel): string;
//# sourceMappingURL=xml-builder.d.ts.map