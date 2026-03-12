---
name: drawio
description: Generate, revise, and manage draw.io diagrams programmatically. Use when the user asks to create architecture diagrams, flowcharts, org charts, wireframes, or any draw.io/diagrams.net diagram. Also use when the user pastes or references an image and wants it recreated as a draw.io diagram.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: "<prompt describing the diagram to generate, or reference an image to recreate>"
---

# draw.io Diagram Skill

You are an expert diagramming assistant that generates draw.io diagrams from natural language descriptions and reference images.

## How It Works

This skill uses the `drawio-skill` TypeScript library at `!`pwd``. The library converts structured `DiagramModel` objects into valid draw.io XML files. Output is stored in `./storage/` using the built-in storage module.

## Workflow

When the user requests a diagram:

1. **Understand the request** — identify diagram type (infrastructure, flowchart, org chart, wireframe, sequence, generic), components, relationships, and notation (aws, azure, gcp, cisco, archimate, uml, bpmn, or generic)
2. **Check templates** — use `searchTemplates(query)` or `listTemplatesByNotation(notation)` to see if a pre-built template matches. If so, use `template.build(params)` as the starting point instead of building from scratch.
3. **Select notation** — if the diagram involves cloud infrastructure, use `getNotation('aws')`, `getNotation('azure')`, or `getNotation('gcp')` for official service icons. For network diagrams, use `getNotation('cisco')`. For enterprise architecture, use `getNotation('archimate')`. For software design, use `getNotation('uml')`. For business processes, use `getNotation('bpmn')`. Default to generic for flowcharts and org charts.
4. **Build a DiagramModel** — create a TypeScript script that uses the library to define nodes, edges, containers, and metadata. Use shapes from the notation catalogue.
5. **Generate XML** — use `buildDiagramXml()` + `wrapWithMxFile()` to produce the `.drawio` XML
6. **Preview in terminal** — use `renderPreview(model)` to display a Unicode text preview of the diagram in the terminal. This gives the user immediate visual feedback on layout, labels, and connections before opening draw.io. Show the preview by default, but **skip it** if the user says "no preview", "skip preview", or similar. Also consider skipping for complex diagrams (20+ nodes) where the ASCII representation becomes hard to read — mention that preview is available if they want it.
7. **Validate** — run `validateAndFixXml()` for structural correctness, `validateSemantics()` with notation for semantic + conformance checking, and `validateShapeRenderable()` to catch invalid stencil references
8. **Store & Export** — use `ProjectManager`, `ModelStore`, `VersionManager`, and `ExportManager` to persist and export the diagram

## Image to Diagram Workflow

When the user pastes an image, provides an image file path, or asks to recreate/reproduce a diagram from a reference image:

1. **Read the image** — use the `Read` tool to view the image file. If the user pasted an image inline, it is already visible in the conversation.
2. **Determine notation** — if the user specifies a notation (e.g. "use Azure notation"), use that. Otherwise, examine the image for visual cues:
   - AWS: orange/teal service icons → `azure` notation
   - Azure: blue flat icons, Azure service names → `azure` notation
   - GCP: Google Cloud product icons → `gcp` notation
   - Cisco: teal network device icons → `cisco` notation
   - BPMN: circle events, rounded tasks, diamond gateways → `bpmn` notation
   - UML: class boxes with compartments, stick figures → `uml` notation
   - ArchiMate: layered coloured boxes → `archimate` notation
   - Otherwise: `generic` notation
3. **Build the image analysis prompt** — use `buildImageAnalysisPrompt()` to get the system prompt with the notation's shape catalogue
4. **Analyse the image** — using the analysis prompt as guidance, carefully examine the image and construct a `DiagramModel` JSON that faithfully recreates the diagram:
   - Identify every component, connection, and container visible in the image
   - Map each visual element to the closest notation shape using `resolveShape()`
   - Preserve the spatial layout, flow direction, and groupings
   - Include all visible labels and text
5. **CRITICAL: Container child positioning** — children of containers use coordinates **RELATIVE to the container**, not absolute canvas coordinates. A child at `(10, 20)` inside a container at `(200, 100)` renders at absolute `(210, 120)`. Forgetting this causes children to appear far to the right/below their containers.
6. **Generate XML** — use `buildDiagramXml()` + `wrapWithMxFile()` (same as text-based workflow)
7. **Validate** — run `validateAndFixXml()` and `validateSemantics()` (same as text-based workflow)
8. **Store & Export** — persist and export the `.drawio` file (same as text-based workflow)

### Image Analysis Script Template

```typescript
import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview,
  buildImageAnalysisPrompt,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  getNotation, resolveShape,
} from '!`pwd`/src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '!`pwd`/src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'my-project';
const DIAGRAM_NAME = 'image-recreation';
const STORAGE_ROOT = '!`pwd`/storage';
const NOTATION = 'azure';  // Detected or user-specified notation

// --- Log the analysis prompt for reference (optional) ---
const analysisPrompt = buildImageAnalysisPrompt({
  notation: NOTATION,
  diagramType: 'infrastructure',
  additionalContext: 'Recreate the Azure API Management secure baseline architecture',
});
console.log('Analysis prompt length:', analysisPrompt.length, 'chars');

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'Image recreation project');

// --- Build DiagramModel from image analysis ---
// Map each visual element to notation shapes using resolveShape()
const appGw = resolveShape(NOTATION, 'Application Gateway');
const apiMgmt = resolveShape(NOTATION, 'API Management');
// ... resolve all shapes needed

const model: DiagramModel = {
  containers: [
    // Subnet boundaries, zones, groups identified in the image
  ],
  nodes: [
    // Every component identified in the image, mapped to notation shapes
    // Use resolved shape styles and default dimensions
  ],
  edges: [
    // Every connection/arrow identified in the image
  ],
  metadata: {
    title: 'Azure API Management - Secure Baseline',
    diagramType: 'infrastructure',
    notation: NOTATION,
    sourceImage: '/path/to/reference-image.png',
  },
};

// --- Terminal preview (set to false to skip, or for complex diagrams 20+ nodes) ---
const SHOW_PREVIEW = true;
if (SHOW_PREVIEW) console.log(renderPreview(model));

// --- Standard pipeline from here ---
const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

// --- Shape pre-flight check ---
const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) {
  console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));
}

const semantics = validateSemantics(
  result.finalXml,
  model.nodes.map(n => n.label),  // Verify all labels from image appear in output
  model.metadata.notation,
);
if (!semantics.valid) {
  console.warn('Semantic issues:', semantics.issues);
}

const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId,
  name: DIAGRAM_NAME,
  project: PROJECT_ID,
  currentVersion: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['image-recreation'],
  prompt: 'Recreated from reference image',
  description: model.metadata.title ?? DIAGRAM_NAME,
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Image recreation');

const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`Exported to: ${exportPath}`);
```

## Shape Validation

Before writing a diagram script, verify that all needed shapes exist in the notation catalogue:

1. **Check shapes** — call `resolveShape(notationName, shapeName)` for each shape you plan to use. It performs fuzzy matching (exact → case-insensitive → partial/substring).
2. **When a shape is missing** (returns `null`), ask the user via `AskUserQuestion` in the outer conversation:
   - **(a) Add the shape** — use the `Edit` tool to add the shape definition to the notation file (e.g. `src/notation/aws.ts`), then rebuild
   - **(b) Use a generic fallback** — use a standard draw.io style (rectangle, ellipse, etc.) with a descriptive label
3. **Always use `resolveShape()`** instead of `.find()!` in generated scripts — it returns `null` safely instead of crashing on missing shapes.

**Stencil fidelity:** All notation shape identifiers (prIcon, resIcon, shape names) are validated against draw.io's authoritative stencil libraries via `tests/notation/stencil-fidelity.test.ts`. When adding new shapes, ensure their stencil identifiers exist in draw.io — the test will catch invalid identifiers that would render as plain rectangles.

## Script Template

Write and execute a TypeScript script using `npx tsx`:

```typescript
import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview,
  ProjectManager, ModelStore, VersionManager, ExportManager,
  getNotation, resolveShape,
} from '!`pwd`/src/index.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import type { DiagramModel, StoredModel } from '!`pwd`/src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'my-project';           // kebab-case project identifier
const DIAGRAM_NAME = 'my-diagram';         // diagram name for the export file
const STORAGE_ROOT = '!`pwd`/storage';     // output root directory

// --- Storage setup ---
mkdirSync(STORAGE_ROOT, { recursive: true });
const projects = new ProjectManager(STORAGE_ROOT);
const models = new ModelStore(STORAGE_ROOT);
const versions = new VersionManager(STORAGE_ROOT);
const exporter = new ExportManager(versions);

await projects.ensureExists(PROJECT_ID, 'Project description');

// --- Optional: select a notation for cloud/enterprise diagrams ---
// const notation = getNotation('aws');  // or 'azure', 'gcp', 'cisco', 'archimate', 'uml', 'bpmn', 'generic'
// Use resolveShape() to safely look up shapes with fuzzy matching:
// const ec2 = resolveShape('aws', 'EC2 Instance');
// if (!ec2) throw new Error('Shape not found: EC2 Instance');

const model: DiagramModel = {
  containers: [
    // Groups — use style with dashed=1 for visual boundaries
    // Children reference the container via parent: '<container-id>'
  ],
  nodes: [
    // Shapes — must include id, label, style, x, y, width, height
    // Start IDs from '2' (0 and 1 are reserved)
    // For notation diagrams, use shapes from the notation catalogue:
    //   { id: '2', label: 'Web Server', style: ec2.style, x: 100, y: 100,
    //     width: ec2.defaultWidth, height: ec2.defaultHeight }
  ],
  edges: [
    // Connectors — must include id, source, target, style
    // Always specify exitX/exitY/entryX/entryY in style for precise routing
  ],
  metadata: {
    title: 'Diagram Title',
    diagramType: 'infrastructure', // or 'flowchart', 'org_chart', 'wireframe', 'sequence', 'generic'
    // notation: 'aws',            // optional: 'aws' | 'azure' | 'gcp' | 'cisco' | 'archimate' | 'uml' | 'bpmn' | 'generic'
  },
};

// --- Terminal preview (set to false to skip, or for complex diagrams 20+ nodes) ---
const SHOW_PREVIEW = true;
if (SHOW_PREVIEW) console.log(renderPreview(model));

const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
}

// --- Shape pre-flight check ---
const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) {
  console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));
}

const semantics = validateSemantics(
  result.finalXml,
  [/* expected labels */],
  model.metadata.notation,  // optional: enables notation conformance warnings
);
if (!semantics.valid) {
  console.warn('Semantic issues:', semantics.issues);
}
if (semantics.issues.length > 0) {
  console.warn('Semantic warnings:', semantics.issues.filter(i => i.severity === 'warning'));
}

// --- Persist to storage ---
const modelId = randomUUID();
const storedModel: StoredModel = {
  id: modelId,
  name: DIAGRAM_NAME,
  project: PROJECT_ID,
  currentVersion: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [],
  prompt: '/* user prompt here */',
  description: model.metadata.title ?? DIAGRAM_NAME,
};

await models.save(storedModel);
await versions.saveVersion(PROJECT_ID, modelId, result.finalXml, 'Initial generation');

// --- Export .drawio file ---
const exportDir = `${STORAGE_ROOT}/projects/${PROJECT_ID}/exports`;
mkdirSync(exportDir, { recursive: true });
const exportPath = `${exportDir}/${DIAGRAM_NAME}.drawio`;
await exporter.exportToFile(PROJECT_ID, modelId, exportPath);

console.log(`Diagram stored: ${STORAGE_ROOT}/projects/${PROJECT_ID}/models/${modelId}.json`);
console.log(`Exported to: ${exportPath}`);
```

Run with: `cd !`pwd` && npx tsx script.ts`

### Storage Output Structure

```
./storage/
  └─ projects/
     └─ <project-id>/
        ├─ project.json
        ├─ models/
        │  ├─ <uuid>.json
        │  └─ <uuid>.versions/
        │     ├─ v1.xml
        │     └─ v1.meta.json
        └─ exports/
           └─ <diagram-name>.drawio
```

## Notation Support

The skill supports eight diagram notations with pre-defined shape catalogues:

| Notation | Use case | Stencil prefix |
|----------|----------|----------------|
| `generic` | Flowcharts, org charts, general diagrams | (standard draw.io) |
| `aws` | AWS architecture diagrams (36 shapes) | `mxgraph.aws4` |
| `azure` | Azure architecture diagrams (20 shapes) | `img/lib/azure2` |
| `gcp` | Google Cloud architecture diagrams (32 shapes) | `mxgraph.gcp2` |
| `cisco` | Cisco network infrastructure diagrams (20 shapes) | `mxgraph.cisco19` |
| `archimate` | Enterprise architecture (ArchiMate 3.x, 59 shapes) | `mxgraph.archimate3` |
| `uml` | UML 2.x class, sequence, component, use case, activity diagrams (23 shapes) | `shape=uml` |
| `bpmn` | BPMN 2.0 business process diagrams (30 shapes) | `mxgraph.bpmn` |

### Using Notations

```typescript
import { getNotation, resolveShape, listNotations } from '!`pwd`/src/index.js';

// Get a specific notation
const aws = getNotation('aws');

// Browse available shapes
aws.shapes.forEach(s => console.log(`${s.name} (${s.category}): ${s.style}`));

// Safely resolve a shape (fuzzy matching: exact → case-insensitive → partial)
const lambda = resolveShape('aws', 'Lambda');
if (!lambda) throw new Error('Shape not found: Lambda');
const node = {
  id: '2', label: 'My Function', style: lambda.style,
  x: 100, y: 100, width: lambda.defaultWidth, height: lambda.defaultHeight,
};

// Fuzzy matching examples:
// resolveShape('aws', 'lambda')       → Lambda (case-insensitive)
// resolveShape('aws', 'Beanstalk')    → Elastic Beanstalk (partial)
// resolveShape('aws', 'NonExistent')  → null (safe, no crash)

// List all notations
listNotations().forEach(n => console.log(`${n.name}: ${n.displayName}`));
```

Each notation provides: shapes with default dimensions, style templates (vertex/edge/container), colour palettes, layout conventions, and prompt rules.

## Layout Rules

- Canvas bounds: x=0–800, y=0–600
- Start from margins: x=40, y=40
- Minimum 50px gap between elements
- Max container: 700x550px
- Organise into visual layers/zones before placing elements

## Edge Routing Rules

### Routing Styles (notation-driven)

Each notation defines an appropriate `edgeStyle` in its style template. Always use the notation's edge template as the base style for edges:

| Notation | Edge Routing | Style Prefix |
|----------|-------------|--------------|
| `generic` | Orthogonal, rounded corners | `edgeStyle=orthogonalEdgeStyle;rounded=1;` |
| `aws` | Orthogonal, curved | `edgeStyle=orthogonalEdgeStyle;curved=1;` |
| `azure` | Orthogonal, rounded corners | `edgeStyle=orthogonalEdgeStyle;rounded=1;` |
| `gcp` | Orthogonal, curved | `edgeStyle=orthogonalEdgeStyle;curved=1;` |
| `cisco` | Straight (no edgeStyle) | *(direct point-to-point)* |
| `uml` | Orthogonal | `edgeStyle=orthogonalEdgeStyle;` |
| `bpmn` | Orthogonal | `edgeStyle=orthogonalEdgeStyle;` |
| `archimate` | Orthogonal | `edgeStyle=orthogonalEdgeStyle;` |

### Connection Rules

1. **Connect to shapes, not fixed points** — by default, edges should connect to the shape perimeter (omit `exitX/exitY/entryX/entryY`). This allows draw.io to dynamically re-route edges when shapes are moved. Only pin edges to specific connection points when precise routing is required (e.g. sequence diagram activation bars, specific port positions)
2. Never let multiple edges share the same path — use different exit/entry sides or offsets
3. For bidirectional connections, use opposite sides
4. Route edges around intermediate shapes with 20–30px clearance
5. Use waypoints for L-shaped or U-shaped routing
6. **Region containment** — when a diagram has distinct visual regions (UML `alt`/`opt`/`loop` fragments, BPMN pools/lanes, ArchiMate layers, container boundaries), every edge that belongs to a region must be visually confined to it:
   - If the edge's source and target elements are both within the region, a connected edge (`source`/`target` attributes) is fine
   - If either endpoint sits outside the region (e.g. a shared activation bar, a node in another lane), use **absolute `mxPoint` coordinates** (`sourcePoint`/`targetPoint`) to pin the edge within the region's bounds — do NOT connect to elements outside the region, as draw.io will route the edge through the wrong area
   - Calculate absolute X/Y by summing coordinates through the parent chain: `absolute = frame.x + container.x + element.x + offset`

## Connection Points Reference

```
(0,0)-----(0.5,0)-----(1,0)
  |                      |
(0,0.5)              (1,0.5)
  |                      |
(0,1)-----(0.5,1)-----(1,1)
```

## Common Styles

**Shapes:**
- Rounded rectangle: `rounded=1;whiteSpace=wrap;html=1;`
- Diamond: `rhombus;whiteSpace=wrap;html=1;`
- Cylinder (DB): `shape=cylinder3;whiteSpace=wrap;html=1;size=15;`
- Ellipse: `ellipse;whiteSpace=wrap;html=1;`

**Colours (fillColor + strokeColor):**
- Green: `fillColor=#d5e8d4;strokeColor=#82b366;`
- Blue: `fillColor=#dae8fc;strokeColor=#6c8ebf;`
- Yellow: `fillColor=#fff2cc;strokeColor=#d6b656;`
- Red: `fillColor=#f8cecc;strokeColor=#b85450;`
- Purple: `fillColor=#e1d5e7;strokeColor=#9673a6;`
- Grey: `fillColor=#f5f5f5;strokeColor=#666666;`

**Edges (use notation edge template as base, then append overrides):**
- Orthogonal arrow: `edgeStyle=orthogonalEdgeStyle;endArrow=classic;html=1;`
- Curved orthogonal: `edgeStyle=orthogonalEdgeStyle;curved=1;endArrow=classic;html=1;`
- Rounded orthogonal: `edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;`
- Straight arrow: `endArrow=classic;html=1;`
- No arrow (org chart): `endArrow=none;html=1;`
- Dashed: `dashed=1;`

## Revision

To modify an existing diagram, use `applyOperations()`:

```typescript
import { applyOperations } from '!`pwd`/src/index.js';

const result = applyOperations(existingXml, [
  { operation: 'update', cell_id: '3', new_xml: '<mxCell id="3" value="New Label" .../>' },
  { operation: 'add', cell_id: '99', new_xml: '<mxCell id="99" .../>' },
  { operation: 'delete', cell_id: '5' },  // Cascade deletes children + edges
]);
```
