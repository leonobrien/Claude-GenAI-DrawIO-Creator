/**
 * PromptBuilder -- Constructs the system prompt for draw.io XML generation.
 *
 * Implements the prompt engineering strategy from the research paper:
 * 1. Role definition
 * 2. Output format rules (bare mxCell only)
 * 3. Edge routing constraints (7 rules)
 * 4. Layout guidelines
 * 5. Few-shot example
 * 6. Notation-specific section (shapes, rules, layout hints)
 * 7. Current diagram context (for revision)
 */

import type { NotationName, NotationDefinition } from '../types/index.js';
import { getNotation } from '../notation/registry.js';

const ROLE_DEFINITION = [
  'You are an expert diagramming assistant that outputs diagrams in draw.io XML format.',
  'You generate ONLY bare <mxCell> elements -- no wrapper tags (<mxfile>, <mxGraphModel>, <diagram>, <root>).',
  'The wrapper structure is added automatically.',
  '',
  'Before generating XML, briefly describe your layout plan in 2-3 sentences.',
].join('\n');

const FORMAT_RULES = [
  '## Output Format',
  '',
  'Generate only <mxCell> elements. Each shape is a vertex, each connector is an edge.',
  '',
  'Vertex example:',
  '<mxCell id="2" value="Web Server" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">',
  '  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>',
  '</mxCell>',
  '',
  'Edge example:',
  '<mxCell id="3" style="endArrow=classic;html=1;" edge="1" parent="1" source="2" target="4">',
  '  <mxGeometry relative="1" as="geometry"/>',
  '</mxCell>',
  '',
  'Container example (for grouping):',
  '<mxCell id="5" value="VPC" style="rounded=1;whiteSpace=wrap;html=1;dashed=1;" vertex="1" connectable="0" parent="1">',
  '  <mxGeometry x="50" y="50" width="400" height="300" as="geometry"/>',
  '</mxCell>',
  '<!-- Children use parent="5" -->',
  '',
  'Rules:',
  '- Start IDs from 2 (0 and 1 are reserved root cells)',
  '- All tags must be properly closed',
  '- Every edge must reference valid source and target IDs',
  '- Use parent="1" for top-level elements, parent="<container-id>" for grouped elements',
  '- Always include position (x, y) and dimensions (width, height) on vertices',
].join('\n');

const EDGE_ROUTING_RULES = [
  '## Edge Routing Rules',
  '',
  '1. NEVER let multiple edges share the same path -- use different exitY/entryY values',
  '2. For bidirectional connections (A<->B), use OPPOSITE sides -- A->B exits right, B->A exits left',
  '3. Always specify exitX, exitY, entryX, entryY explicitly in every edge style',
  '4. Route edges AROUND intermediate shapes -- use waypoints with 20-30px clearance',
  '5. Plan layout strategically BEFORE generating XML -- organise into visual layers/zones',
  '6. Use multiple waypoints for complex routing (2-3 points for L-shaped/U-shaped paths)',
  '7. Choose NATURAL connection points based on flow direction -- NEVER use corner connections',
].join('\n');

const LAYOUT_CONSTRAINTS = [
  '## Layout Constraints',
  '',
  '- Keep all elements within x=0-800, y=0-600',
  '- Maximum container width: 700px, height: 550px',
  '- Start from reasonable margins (x=40, y=40)',
  '- Minimum 50px gap between all elements',
  '- Align nodes horizontally or vertically for clean layouts',
].join('\n');

const FEW_SHOT_EXAMPLE = [
  '## Example',
  '',
  'User: Draw a simple flowchart: Start -> Process -> End',
  '',
  'Assistant: I will create a horizontal flowchart with three rounded rectangles connected by arrows, laid out left to right with 80px spacing.',
  '',
  '<mxCell id="2" value="Start" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">',
  '  <mxGeometry x="40" y="200" width="120" height="60" as="geometry"/>',
  '</mxCell>',
  '<mxCell id="3" value="Process" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">',
  '  <mxGeometry x="240" y="200" width="120" height="60" as="geometry"/>',
  '</mxCell>',
  '<mxCell id="4" value="End" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">',
  '  <mxGeometry x="440" y="200" width="120" height="60" as="geometry"/>',
  '</mxCell>',
  '<mxCell id="5" style="endArrow=classic;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="2" target="3">',
  '  <mxGeometry relative="1" as="geometry"/>',
  '</mxCell>',
  '<mxCell id="6" style="endArrow=classic;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="3" target="4">',
  '  <mxGeometry relative="1" as="geometry"/>',
  '</mxCell>',
].join('\n');

/**
 * Builds a notation-specific prompt section.
 */
function buildNotationSection(notation: NotationDefinition): string {
  const shapeList = notation.shapes
    .map((s) => `- **${s.name}**${s.category ? ` (${s.category})` : ''}: \`${s.style}\` — ${s.defaultWidth}x${s.defaultHeight}`)
    .join('\n');

  const colourList = Object.entries(notation.colours)
    .map(([role, c]) => `- ${role}: fillColor=${c.fillColor}, strokeColor=${c.strokeColor}`)
    .join('\n');

  return [
    `## Notation: ${notation.displayName}`,
    '',
    notation.description,
    '',
    '### Available Shapes',
    '',
    shapeList,
    '',
    '### Style Templates',
    '',
    `- Vertex: \`${notation.styleTemplates.vertex}\``,
    `- Edge: \`${notation.styleTemplates.edge}\``,
    `- Container: \`${notation.styleTemplates.container}\``,
    ...(notation.styleTemplates.labelEdge ? [`- Label Edge: \`${notation.styleTemplates.labelEdge}\``] : []),
    '',
    '### Colour Palette',
    '',
    colourList,
    '',
    '### Layout Conventions',
    '',
    `- Preferred flow: ${notation.layout.preferredFlow}`,
    `- Uses containers: ${notation.layout.usesContainers ? 'yes' : 'no'}`,
    ...(notation.layout.suggestedGap ? [`- Suggested gap: ${notation.layout.suggestedGap}px`] : []),
    ...notation.layout.hints.map((h) => `- ${h}`),
    '',
    '### Notation Rules',
    '',
    ...notation.promptRules.map((r) => `- ${r}`),
    '',
    '### Notation Example',
    '',
    notation.fewShotExample,
  ].join('\n');
}

/**
 * Builds the full system prompt for diagram generation.
 *
 * @param notation - Optional notation name. When provided, injects notation-specific
 *   shapes, rules, layout hints, and few-shot example. Defaults to generic notation.
 */
export function buildSystemPrompt(notation?: NotationName): string {
  const sections = [
    ROLE_DEFINITION,
    '',
    FORMAT_RULES,
    '',
    EDGE_ROUTING_RULES,
    '',
    LAYOUT_CONSTRAINTS,
  ];

  if (notation && notation !== 'generic') {
    const notationDef = getNotation(notation);
    sections.push('', buildNotationSection(notationDef));
  } else {
    sections.push('', FEW_SHOT_EXAMPLE);
  }

  return sections.join('\n');
}

/**
 * Builds the system prompt with current diagram context for revision.
 *
 * @param currentXml - The existing diagram XML that the AI should modify
 * @param notation - Optional notation name for notation-aware revision
 */
export function buildRevisionPrompt(currentXml: string, notation?: NotationName): string {
  const base = buildSystemPrompt(notation);

  const contextBlock = [
    '',
    '## Current Diagram (Authoritative)',
    '',
    'The following XML represents the current state of the diagram.',
    'When asked to modify it, output ONLY the changed/added <mxCell> elements',
    'using the edit operations format: { operation: "update"|"add"|"delete", cell_id: string, new_xml?: string }',
    '',
    '```xml',
    currentXml,
    '```',
  ].join('\n');

  return base + contextBlock;
}
