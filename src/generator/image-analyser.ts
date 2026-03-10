/**
 * ImageAnalyser -- Constructs prompts for generating draw.io models from reference images.
 *
 * Provides two main capabilities:
 * 1. A structured analysis prompt that instructs the AI to extract components,
 *    relationships, and layout from a reference image and output a DiagramModel JSON.
 * 2. A notation detection guide that helps identify the correct notation from
 *    visual cues when the user has not specified one.
 */

import type { NotationName, ImageAnalysisOptions } from '../types/index.js';
import { getNotation, listNotations } from '../notation/registry.js';

const IMAGE_ANALYSIS_ROLE = [
  'You are an expert diagramming assistant that analyses reference images and reproduces them as draw.io diagrams.',
  'You examine the provided image carefully and output a structured DiagramModel JSON object that faithfully recreates the diagram.',
  '',
  'Your goal is to produce a diagram that is as close to the original image as possible in terms of:',
  '- Components (shapes, icons, labels)',
  '- Connections (arrows, lines, their direction and labels)',
  '- Groupings (containers, subnets, swim lanes, zones)',
  '- Spatial layout (relative positions, alignment, flow direction)',
].join('\n');

const ANALYSIS_INSTRUCTIONS = [
  '## Analysis Steps',
  '',
  'Examine the image systematically:',
  '',
  '1. **Identify the notation/technology** — determine whether this is an AWS, Azure, GCP, Cisco, BPMN, UML, ArchiMate, or generic diagram based on visual cues (icons, colours, shapes)',
  '2. **List all components** — every shape, icon, and labelled element visible in the image',
  '3. **List all connections** — every arrow, line, or connector between components, noting direction and any labels',
  '4. **Identify containers/groups** — any visual groupings such as subnets, zones, pools, lanes, or boundary boxes',
  '5. **Determine layout** — note the overall flow direction (left-right, top-down) and spatial arrangement',
  '6. **Map to notation shapes** — match each visual element to the closest shape in the selected notation catalogue',
].join('\n');

const OUTPUT_FORMAT = [
  '## Output Format',
  '',
  'Output a single JSON object conforming to the DiagramModel interface:',
  '',
  '```typescript',
  'interface DiagramModel {',
  '  nodes: DiagramNode[];',
  '  edges: DiagramEdge[];',
  '  containers: DiagramContainer[];',
  '  metadata: DiagramMetadata;',
  '}',
  '',
  'interface DiagramNode {',
  '  id: string;           // Start from "2" (0 and 1 are reserved)',
  '  label: string;        // Text label visible in the image',
  '  style: string;        // Full draw.io style string from notation shapes',
  '  x: number;            // Horizontal position (0-800)',
  '  y: number;            // Vertical position (0-600)',
  '  width: number;        // Element width',
  '  height: number;       // Element height',
  '  parent?: string;      // Parent container ID, or omit for top-level',
  '}',
  '',
  'interface DiagramEdge {',
  '  id: string;',
  '  label?: string;       // Edge label if visible',
  '  source: string;       // Source node/container ID',
  '  target: string;       // Target node/container ID',
  '  style: string;        // Edge style (endArrow=classic;html=1; etc.)',
  '  waypoints?: Point[];  // Optional intermediate routing points',
  '}',
  '',
  'interface DiagramContainer {',
  '  id: string;',
  '  label: string;',
  '  style: string;        // Container style with dashed=1 for boundaries',
  '  x: number;',
  '  y: number;',
  '  width: number;',
  '  height: number;',
  '  parent?: string;',
  '}',
  '',
  'interface DiagramMetadata {',
  '  title?: string;',
  '  description?: string;',
  '  diagramType?: "infrastructure" | "flowchart" | "org_chart" | "wireframe" | "sequence" | "generic";',
  '  notation?: "aws" | "azure" | "gcp" | "cisco" | "archimate" | "uml" | "bpmn" | "generic";',
  '  sourceImage?: string;',
  '}',
  '```',
  '',
  'Output ONLY valid JSON — no markdown fences, no commentary before or after the JSON.',
].join('\n');

const LAYOUT_RULES = [
  '## Layout Rules',
  '',
  '- Canvas bounds: x=0-800, y=0-600',
  '- Start from margins: x=40, y=40',
  '- Minimum 50px gap between elements',
  '- Preserve the relative spatial arrangement from the image',
  '- Maintain flow direction (left-right or top-down) as shown in the image',
  '- Place containers first, then position child elements within them',
  '- CRITICAL: Container children use coordinates RELATIVE TO THE CONTAINER, not the canvas',
  '  e.g. a child at (10, 10) inside a container at (200, 100) renders at absolute (210, 110)',
  '- Ensure container bounds fully enclose their children with 20px padding',
].join('\n');

const EDGE_RULES = [
  '## Edge Rules',
  '',
  '- Every edge must reference valid source and target IDs',
  '- Preserve arrow direction as shown in the image',
  '- Include edge labels where visible',
  '- Use style "endArrow=classic;html=1;" for directional arrows',
  '- Use style "endArrow=none;html=1;" for undirected lines',
  '- Use "dashed=1;" for dashed connections',
  '- Specify exitX/exitY/entryX/entryY when precise routing matters',
].join('\n');

/**
 * Builds visual identification heuristics for each notation.
 * Used when the user has not specified a notation and the AI must detect it from the image.
 */
export function buildNotationDetectionGuide(): string {
  const guides: string[] = [
    '## Notation Detection Guide',
    '',
    'Use these visual cues to identify the diagram notation:',
    '',
    '### AWS',
    '- Orange/dark-teal service icons with white symbol insets',
    '- Characteristic AWS service icon shapes (shield for security, database cylinder, Lambda logo)',
    '- Purple/pink containers for VPCs and subnets',
    '- "AWS" or Amazon service names in labels',
    '',
    '### Azure',
    '- Blue flat/outline icons in Microsoft Azure style',
    '- Azure logo (blue quadrilateral) or "Azure" in labels',
    '- Service names like "App Service", "SQL Database", "Virtual Machine"',
    '- Blue colour scheme with gradient or flat fills',
    '',
    '### GCP (Google Cloud)',
    '- Hexagonal or coloured Google Cloud product icons',
    '- Google Cloud logo or "GCP" in labels',
    '- Red, blue, green, yellow colour accents from Google palette',
    '- Service names like "Compute Engine", "Cloud Run", "BigQuery"',
    '',
    '### Cisco',
    '- Teal/dark-blue network device icons (distinctive router, switch shapes)',
    '- Network topology layout with hierarchical tiers',
    '- Device labels like "Router", "Switch", "Firewall", "Server"',
    '- Link speed annotations (1G, 10G, 100G)',
    '',
    '### BPMN',
    '- Circle events (start/end), rounded-rectangle tasks, diamond gateways',
    '- Swim lane pools with horizontal bands',
    '- Flow markers (exclusive X, parallel +, inclusive O)',
    '- Business process terminology',
    '',
    '### UML',
    '- Box classes with compartments (name, attributes, methods)',
    '- Stick-figure actors, use case ellipses',
    '- Sequence diagram lifelines and activation bars',
    '- Stereotype annotations (<<interface>>, <<abstract>>)',
    '',
    '### ArchiMate',
    '- Layered coloured boxes (yellow=business, blue=application, green=technology)',
    '- Small corner icons indicating element type',
    '- Motivation and strategy elements with distinct shapes',
    '- Enterprise architecture terminology',
    '',
    '### Generic',
    '- Standard flowchart shapes (rectangles, diamonds, ellipses)',
    '- No vendor-specific icons',
    '- Simple colour coding without notation-specific patterns',
    '- Use this as the fallback when no specific notation is identified',
  ];

  return guides.join('\n');
}

/**
 * Builds a notation-specific shape catalogue section for the prompt.
 */
function buildShapeCatalogueSection(notationName: NotationName): string {
  const notation = getNotation(notationName);

  const shapeList = notation.shapes
    .map(
      (s) =>
        `- **${s.name}**${s.category ? ` (${s.category})` : ''}: \`${s.style}\` — ${s.defaultWidth}x${s.defaultHeight}`,
    )
    .join('\n');

  const colourList = Object.entries(notation.colours)
    .map(([role, c]) => `- ${role}: fillColor=${c.fillColor}, strokeColor=${c.strokeColor}`)
    .join('\n');

  return [
    `## Notation: ${notation.displayName}`,
    '',
    notation.description,
    '',
    '### Available Shapes (use these styles for matching elements)',
    '',
    shapeList,
    '',
    '### Style Templates',
    '',
    `- Vertex: \`${notation.styleTemplates.vertex}\``,
    `- Edge: \`${notation.styleTemplates.edge}\``,
    `- Container: \`${notation.styleTemplates.container}\``,
    ...(notation.styleTemplates.labelEdge
      ? [`- Label Edge: \`${notation.styleTemplates.labelEdge}\``]
      : []),
    '',
    '### Colour Palette',
    '',
    colourList,
    '',
    '### Notation Rules',
    '',
    ...notation.promptRules.map((r) => `- ${r}`),
  ].join('\n');
}

/**
 * Builds a summary of all notations with their key shapes, for use when
 * notation is not specified and the AI must detect and select one.
 */
function buildAllNotationsSummary(): string {
  const notations = listNotations();
  const sections = notations.map((n) => {
    const topShapes = n.shapes
      .slice(0, 8)
      .map((s) => s.name)
      .join(', ');
    return `- **${n.name}** (${n.displayName}): prefix \`${n.stencilPrefix}\` — ${topShapes}${n.shapes.length > 8 ? `, ... (${n.shapes.length} total)` : ''}`;
  });

  return [
    '## Available Notations',
    '',
    'Select the best-matching notation based on your image analysis, then use its shapes:',
    '',
    ...sections,
    '',
    'After identifying the notation, use the full style strings from that notation\'s shape catalogue.',
    'If no specific notation matches, use "generic" with standard draw.io styles.',
  ].join('\n');
}

/**
 * Builds the full system prompt for image-to-diagram analysis.
 *
 * @param options - Configuration for the analysis. When `notation` is provided,
 *   the prompt includes that notation's full shape catalogue. When omitted,
 *   includes the notation detection guide and a summary of all notations.
 */
export function buildImageAnalysisPrompt(options?: ImageAnalysisOptions): string {
  const sections = [
    IMAGE_ANALYSIS_ROLE,
    '',
    ANALYSIS_INSTRUCTIONS,
    '',
    OUTPUT_FORMAT,
    '',
    LAYOUT_RULES,
    '',
    EDGE_RULES,
  ];

  if (options?.notation && options.notation !== 'generic') {
    // User specified a notation — inject its full shape catalogue
    sections.push('', buildShapeCatalogueSection(options.notation));
  } else if (options?.notation === 'generic') {
    // Explicitly generic — no detection needed, use standard shapes
    sections.push('', buildShapeCatalogueSection('generic'));
  } else {
    // No notation specified — include detection guide and all notation summaries
    sections.push('', buildNotationDetectionGuide());
    sections.push('', buildAllNotationsSummary());
  }

  if (options?.diagramType) {
    sections.push(
      '',
      `## Diagram Type Hint`,
      '',
      `The user expects this to be a "${options.diagramType}" diagram. Use this to inform your layout strategy.`,
    );
  }

  if (options?.additionalContext) {
    sections.push(
      '',
      '## Additional Context',
      '',
      options.additionalContext,
    );
  }

  return sections.join('\n');
}
