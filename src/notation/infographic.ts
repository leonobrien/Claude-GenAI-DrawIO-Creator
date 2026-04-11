/**
 * Infographic notation — draw.io infographic shapes for visual data presentation.
 *
 * Uses the mxgraph.infographic stencil library for banners, ribbons, pyramids,
 * dials, callouts, and other presentation-grade shapes. Also includes select
 * mxgraph.basic shapes commonly used in infographic compositions.
 */

import type { NotationDefinition } from '../types/index.js';

/** Default brand blue used across infographic shapes. */
const BRAND_BLUE = '#10739E';

/** Base style for infographic vertex shapes. */
const INFOGRAPHIC_BASE = 'html=1;shadow=0;strokeColor=none;';

/** Helper for mxgraph.infographic shapes with standard styling. */
function infographicShape(shapeName: string, extras = ''): string {
  return `${INFOGRAPHIC_BASE}shape=mxgraph.infographic.${shapeName};fillColor=${BRAND_BLUE};${extras}`;
}

/** Helper for mxgraph.basic shapes used in infographic contexts. */
function basicShape(shapeName: string, extras = ''): string {
  return `${INFOGRAPHIC_BASE}shape=mxgraph.basic.${shapeName};fillColor=${BRAND_BLUE};${extras}`;
}

export const infographicNotation: NotationDefinition = {
  name: 'infographic',
  displayName: 'Infographic',
  stencilPrefix: 'mxgraph.infographic',
  description: 'Infographic and presentation shapes for visual data communication — banners, ribbons, pyramids, dials, callouts, and chart elements.',
  shapes: [
    // Badges & Markers — reliable shapes for numbered items and status indicators
    {
      name: 'Badge',
      style: `ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=${BRAND_BLUE};strokeColor=none;shadow=0;fontColor=#ffffff;fontSize=18;fontStyle=1;align=center;verticalAlign=middle;`,
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'badge',
    },
    {
      name: 'Badge Outlined',
      style: `ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=none;strokeColor=${BRAND_BLUE};strokeWidth=3;shadow=0;fontColor=${BRAND_BLUE};fontSize=18;fontStyle=1;align=center;verticalAlign=middle;`,
      defaultWidth: 40,
      defaultHeight: 40,
      category: 'badge',
    },
    {
      name: 'Pill',
      style: `rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=${BRAND_BLUE};strokeColor=none;shadow=0;fontColor=#ffffff;fontSize=12;fontStyle=1;align=center;verticalAlign=middle;`,
      defaultWidth: 120,
      defaultHeight: 32,
      category: 'badge',
    },
    {
      name: 'Content Box',
      style: `rounded=1;whiteSpace=wrap;html=1;arcSize=8;fillColor=#f5f5f5;strokeColor=${BRAND_BLUE};strokeWidth=2;shadow=0;fontColor=#333333;fontSize=10;align=left;verticalAlign=middle;spacing=8;`,
      defaultWidth: 260,
      defaultHeight: 50,
      category: 'badge',
    },

    // Ribbons & Banners
    {
      name: 'Ribbon',
      style: infographicShape('ribbonSimple', 'notch1=20;notch2=20;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;'),
      defaultWidth: 200,
      defaultHeight: 40,
      category: 'banner',
    },
    {
      name: 'Ribbon Rolled',
      style: infographicShape('ribbonRolled', 'dx=185;dy=15;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;'),
      defaultWidth: 200,
      defaultHeight: 70,
      category: 'banner',
    },
    {
      name: 'Ribbon Double Folded',
      style: infographicShape('ribbonDoubleFolded', 'dx=25;dy=15;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;'),
      defaultWidth: 200,
      defaultHeight: 70,
      category: 'banner',
    },
    {
      name: 'Ribbon Front Folded',
      style: infographicShape('ribbonFrontFolded', 'dx=25;dy=15;notch=15;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingTop=10;'),
      defaultWidth: 200,
      defaultHeight: 55,
      category: 'banner',
    },
    {
      name: 'Ribbon Back Folded',
      style: infographicShape('ribbonBackFolded', 'dx=25;dy=15;notch=15;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingTop=10;'),
      defaultWidth: 200,
      defaultHeight: 55,
      category: 'banner',
    },
    {
      name: 'Banner',
      style: infographicShape('banner', 'dx=32;dy=17;notch=15;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingBottom=15;'),
      defaultWidth: 260,
      defaultHeight: 70,
      category: 'banner',
    },
    {
      name: 'Banner Single Fold',
      style: infographicShape('bannerSingleFold', 'dx=32;dx2=20;dy=17;notch=15;align=left;verticalAlign=middle;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingBottom=15;spacingLeft=25;'),
      defaultWidth: 260,
      defaultHeight: 70,
      category: 'banner',
    },
    {
      name: 'Banner Half Fold',
      style: infographicShape('bannerHalfFold', 'dx=40;dx2=20;notch=15;align=left;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingLeft=25;spacingTop=5;'),
      defaultWidth: 200,
      defaultHeight: 200,
      category: 'banner',
    },
    {
      name: 'Flag',
      style: infographicShape('flag', 'dx=30;dy=20;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingTop=5;'),
      defaultWidth: 200,
      defaultHeight: 70,
      category: 'banner',
    },

    // Callouts & Labels
    {
      name: 'Bar Callout',
      style: infographicShape('barCallout', 'dx=100;dy=30;align=center;verticalAlign=top;fontColor=#ffffff;fontSize=14;fontStyle=1;spacingTop=5;'),
      defaultWidth: 200,
      defaultHeight: 70,
      category: 'callout',
    },
    {
      name: 'Circular Callout',
      style: infographicShape('circularCallout', 'dy=15;verticalLabelPosition=middle;verticalAlign=middle;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;whiteSpace=wrap;'),
      defaultWidth: 100,
      defaultHeight: 100,
      category: 'callout',
    },
    {
      name: 'Circular Callout 2',
      style: `html=1;shadow=0;shape=mxgraph.infographic.circularCallout2;dy=15;strokeColor=${BRAND_BLUE};verticalLabelPosition=middle;verticalAlign=middle;labelPosition=center;align=center;fontColor=#10739E;fontStyle=1;fontSize=24;`,
      defaultWidth: 60,
      defaultHeight: 140,
      category: 'callout',
    },

    // Dials & Progress
    {
      name: 'Circular Dial',
      style: infographicShape('circularDial', 'dy=15;verticalLabelPosition=middle;verticalAlign=bottom;labelPosition=center;align=center;fontStyle=1;fontSize=15;spacingBottom=5;whiteSpace=wrap;'),
      defaultWidth: 80,
      defaultHeight: 110,
      category: 'progress',
    },
    {
      name: 'Bending Arch',
      style: infographicShape('bendingArch', 'startAngle=0.75;endAngle=0.25;arcWidth=0.25;verticalLabelPosition=middle;verticalAlign=middle;fontSize=19;fontColor=#FFFFFF;labelPosition=center;align=center;fontStyle=1;whiteSpace=wrap;'),
      defaultWidth: 100,
      defaultHeight: 100,
      category: 'progress',
    },
    {
      name: 'Progress Ring',
      style: infographicShape('partConcEllipse', 'startAngle=0;endAngle=0.75;arcWidth=0.4;verticalLabelPosition=middle;verticalAlign=middle;fontSize=20;fontColor=#10739E;align=center;fontStyle=1;'),
      defaultWidth: 100,
      defaultHeight: 100,
      category: 'progress',
    },
    {
      name: 'Pie',
      style: basicShape('pie', 'verticalLabelPosition=bottom;verticalAlign=top;startAngle=0.2;endAngle=0.9;'),
      defaultWidth: 100,
      defaultHeight: 100,
      category: 'progress',
    },
    {
      name: 'Arc',
      style: `html=1;shadow=0;shape=mxgraph.basic.arc;strokeColor=${BRAND_BLUE};strokeWidth=6;startAngle=0.3;endAngle=0.1;verticalLabelPosition=bottom;verticalAlign=top;`,
      defaultWidth: 100,
      defaultHeight: 100,
      category: 'progress',
    },
    {
      name: 'Donut',
      style: basicShape('donut', 'dx=10;verticalLabelPosition=bottom;verticalAlign=top;fontSize=10;align=center;fillOpacity=20;'),
      defaultWidth: 100,
      defaultHeight: 100,
      category: 'progress',
    },

    // 3D Shapes
    {
      name: 'Shaded Triangle',
      style: infographicShape('shadedTriangle', 'verticalLabelPosition=bottom;verticalAlign=top;'),
      defaultWidth: 80,
      defaultHeight: 100,
      category: '3d',
    },
    {
      name: 'Shaded Pyramid',
      style: infographicShape('shadedPyramid', 'verticalLabelPosition=bottom;verticalAlign=top;'),
      defaultWidth: 60,
      defaultHeight: 100,
      category: '3d',
    },
    {
      name: 'Pyramid Step',
      style: infographicShape('pyramidStep', 'verticalLabelPosition=bottom;verticalAlign=top;'),
      defaultWidth: 60,
      defaultHeight: 100,
      category: '3d',
    },
    {
      name: 'Cylinder',
      style: infographicShape('cylinder', 'verticalLabelPosition=bottom;verticalAlign=top;'),
      defaultWidth: 60,
      defaultHeight: 100,
      category: '3d',
    },
    {
      name: 'Shaded Cube',
      style: infographicShape('shadedCube', 'isoAngle=15;verticalLabelPosition=bottom;verticalAlign=top;'),
      defaultWidth: 100,
      defaultHeight: 100,
      category: '3d',
    },

    // Layout & Structure
    {
      name: 'Parallelogram',
      style: infographicShape('parallelogram', 'dx=5;whiteSpace=wrap;fontSize=17;fontColor=#FFFFFF;align=center;fontStyle=1;'),
      defaultWidth: 200,
      defaultHeight: 40,
      category: 'layout',
    },
    {
      name: 'Numbered Entry',
      style: infographicShape('numberedEntryVert', 'dy=25;verticalLabelPosition=middle;verticalAlign=top;fontSize=17;fontColor=#FFFFFF;align=center;labelPosition=center;spacingTop=32;fontStyle=1;whiteSpace=wrap;'),
      defaultWidth: 80,
      defaultHeight: 160,
      category: 'layout',
    },
    {
      name: 'Chevron',
      style: 'shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;size=10;fillColor=#10739E;strokeColor=none;fontSize=17;fontStyle=1;fontColor=#ffffff;align=center;shadow=0;',
      defaultWidth: 200,
      defaultHeight: 30,
      category: 'layout',
    },
    {
      name: 'Hexagon',
      style: 'shape=hexagon;html=1;fillColor=#10739E;strokeColor=#ffffff;strokeWidth=4;shadow=0;fontSize=10;fontColor=#FFFFFF;align=center;whiteSpace=wrap;spacing=10;rounded=0;',
      defaultWidth: 112,
      defaultHeight: 102,
      category: 'layout',
    },

    // Decorative
    {
      name: 'Diagonal Round Rect',
      style: basicShape('diag_round_rect', 'dx=37;flipH=1;fontSize=12;fontColor=#FFFFFF;align=center;whiteSpace=wrap;strokeWidth=8;'),
      defaultWidth: 150,
      defaultHeight: 150,
      category: 'decorative',
    },
    {
      name: 'Three Corner Round Rect',
      style: basicShape('three_corner_round_rect', 'dx=18;flipH=1;fontSize=12;fontColor=#FFFFFF;align=center;whiteSpace=wrap;rounded=0;'),
      defaultWidth: 100,
      defaultHeight: 100,
      category: 'decorative',
    },
  ],
  styleTemplates: {
    vertex: `rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=${BRAND_BLUE};strokeColor=none;shadow=0;fontColor=#ffffff;fontSize=12;fontStyle=1;align=center;verticalAlign=middle;`,
    edge: `html=1;strokeColor=${BRAND_BLUE};strokeWidth=2;endArrow=classic;endSize=6;`,
    container: `rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=${BRAND_BLUE};strokeWidth=2;verticalAlign=top;fontStyle=1;fontSize=14;fontColor=${BRAND_BLUE};shadow=0;`,
    labelEdge: `html=1;strokeColor=${BRAND_BLUE};strokeWidth=2;endArrow=classic;endSize=6;fontSize=10;fontColor=${BRAND_BLUE};`,
  },
  colours: {
    badge: { fillColor: '#10739E', strokeColor: '#10739E' },
    banner: { fillColor: '#10739E', strokeColor: '#10739E' },
    callout: { fillColor: '#10739E', strokeColor: '#10739E' },
    progress: { fillColor: '#12AAB5', strokeColor: '#12AAB5' },
    '3d': { fillColor: '#F2931E', strokeColor: '#F2931E' },
    layout: { fillColor: '#56517E', strokeColor: '#56517E' },
    decorative: { fillColor: '#AE4132', strokeColor: '#AE4132' },
    accent1: { fillColor: '#10739E', strokeColor: '#10739E' },
    accent2: { fillColor: '#F2931E', strokeColor: '#F2931E' },
    accent3: { fillColor: '#AE4132', strokeColor: '#AE4132' },
    accent4: { fillColor: '#12AAB5', strokeColor: '#12AAB5' },
    accent5: { fillColor: '#56517E', strokeColor: '#56517E' },
    accent6: { fillColor: '#23445D', strokeColor: '#23445D' },
  },
  layout: {
    preferredFlow: 'top-down',
    usesContainers: false,
    suggestedGap: 30,
    hints: [
      // Information hierarchy
      'Structure content in zones: title (10-15% of canvas) → primary content (60-70%) → supporting detail (20-25%)',
      'Use size, weight, and position to encode importance — not just colour',
      'Design section flow to match natural reading patterns: F-pattern for dense content, Z-pattern for sparse layouts',
      // Layout pattern selection (flexible — choose based on content)
      'Layout patterns to consider based on content type: (a) top-down narrative for sequential content, (b) side-by-side columns for peer-level sections, (c) hub-and-spoke for content radiating from a central concept, (d) full-width bands for tabular data or summaries, (e) 2x2 or 3x3 grids for categorised items of equal weight',
      'For multi-section infographics, combine patterns — e.g., side-by-side columns for two peer sections with a full-width table below',
      // Section structure
      'Group related items with proximity, shared backgrounds, or coloured section headers — Gestalt principle of common region',
      'Coloured header bars (saturated fill + white text) or left-border accents (4-6px) effectively delineate sections',
      // Canvas sizing
      'Scale canvas for content density — default 800x600 suits ≤10 elements; 12+ elements warrants A4 landscape (1169x827) or A3 (1587x1122)',
      // Shape and colour discipline
      'Limit to 2-3 shape types per diagram — differentiate with colour and border weight, not shape variety',
      'Use consistent colour coding: one accent colour per section or category, max 5-6 distinct hues total',
      'Vary shape size to communicate relative importance or magnitude',
      // Specific shape guidance
      'Use Badge (filled ellipse) for numbered markers — avoid circularCallout for simple numbers as the pointer stem clips text',
      'Use Pill (rounded rect with arcSize=50) for short labels and titles — more reliable text rendering than ribbonSimple',
      'Use Content Box (rounded rect) for descriptions — pairs well with Badge and Pill shapes',
      'Use ribbons and banners for decorative headings where visual flair is desired',
      'Use dials, arcs, and progress rings for KPIs and percentage metrics',
      'Use 3D shapes (cubes, pyramids, cylinders) sparingly for visual emphasis',
    ],
  },
  fewShotExample: [
    '<!-- Title banner -->',
    '<mxCell id="2" value="Project Roadmap" style="html=1;shadow=0;strokeColor=none;shape=mxgraph.infographic.banner;dx=32;dy=17;notch=15;fillColor=#23445D;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=16;fontStyle=1;spacingBottom=15;" vertex="1" parent="1">',
    '  <mxGeometry x="40" y="30" width="520" height="55" as="geometry"/>',
    '</mxCell>',
    '<!-- Numbered item: Badge + Pill title + Content Box description -->',
    '<mxCell id="3" value="1" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#10739E;strokeColor=none;shadow=0;fontColor=#ffffff;fontSize=18;fontStyle=1;align=center;verticalAlign=middle;" vertex="1" parent="1">',
    '  <mxGeometry x="50" y="110" width="40" height="40" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="4" value="Define Requirements" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#10739E;strokeColor=none;shadow=0;fontColor=#ffffff;fontSize=12;fontStyle=1;align=center;verticalAlign=middle;" vertex="1" parent="1">',
    '  <mxGeometry x="110" y="114" width="180" height="32" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="5" value="Gather stakeholder needs, document scope and acceptance criteria" style="rounded=1;whiteSpace=wrap;html=1;arcSize=8;fillColor=#f5f5f5;strokeColor=#10739E;strokeWidth=2;shadow=0;fontColor=#333333;fontSize=10;align=left;verticalAlign=middle;spacing=8;" vertex="1" parent="1">',
    '  <mxGeometry x="310" y="105" width="250" height="50" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="6" style="html=1;strokeColor=#10739E;strokeWidth=2;endArrow=none;" edge="1" parent="1" source="3" target="4">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<mxCell id="7" style="html=1;strokeColor=#10739E;strokeWidth=2;endArrow=classic;endSize=6;" edge="1" parent="1" source="4" target="5">',
    '  <mxGeometry relative="1" as="geometry"/>',
    '</mxCell>',
    '<!-- KPI progress ring -->',
    '<mxCell id="8" value="75%" style="html=1;shadow=0;strokeColor=none;shape=mxgraph.infographic.partConcEllipse;fillColor=#12AAB5;startAngle=0;endAngle=0.75;arcWidth=0.4;verticalLabelPosition=middle;verticalAlign=middle;fontSize=20;fontColor=#12AAB5;align=center;fontStyle=1;" vertex="1" parent="1">',
    '  <mxGeometry x="50" y="200" width="80" height="80" as="geometry"/>',
    '</mxCell>',
  ].join('\n'),
  promptRules: [
    // Shape selection
    'Use Badge (filled ellipse) for numbered markers and status indicators — renders cleanly at any size with centred text',
    'Use Pill (rounded rect, arcSize=50) for short titles and labels — text renders reliably within the shape',
    'Use Content Box (rounded rect, arcSize=8) for descriptions and detail text — pairs with Badge + Pill in numbered list layouts',
    'Use Banner (mxgraph.infographic.banner) for decorative page/section headings',
    'Avoid circularCallout for simple numbers — the pointer stem clips text; use Badge instead',
    'Avoid ribbonSimple at narrow widths — notch geometry eats into text area; use Pill instead',
    'Use chevrons (shape=step) for sequential processes and timelines',
    'Use progress rings (partConcEllipse) and dials (circularDial) for KPI/metric visualisation — set endAngle proportional to the value',
    // Text density — infographics must be scannable, not readable like a document
    'Text density targets: titles 4-8 words, item labels 8-12 words, card bodies 10-20 words, table cells 3-8 words — if writing sentences, the text is too long',
    'Each element should be scannable in under 3 seconds — use noun phrases and fragments, not full sentences',
    // Colour and style
    'Use the infographic colour palette: blue #10739E, orange #F2931E, red #AE4132, dark blue #23445D, teal #12AAB5, purple #56517E',
    'Keep font sizes large (12-18px) and use fontStyle=1 (bold) for readability',
    'Override fillColor per shape to create colour-coded visual groupings — change the colour, not the shape',
    'Every colour should encode meaning (section, category, priority) — if a colour does not signify something, use grey',
    // Table construction
    'For tabular data, build grids of cells: coloured header row (saturated fill + white text), data rows with alternating light grey (#e8e8e8) / white (#f5f5f5) backgrounds, left-aligned text with spacingLeft',
    // Overlap resolution
    'Use a small overlap gap (2-8px) with resolveOverlaps for infographics — tight spacing is intentional and large gaps break the visual cohesion',
  ],
};
