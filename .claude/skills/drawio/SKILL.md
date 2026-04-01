---
name: drawio
description: Generate, revise, and manage draw.io diagrams programmatically. Use when the user asks to create architecture diagrams, flowcharts, org charts, wireframes, or any draw.io/diagrams.net diagram. Also use when the user pastes or references an image and wants it recreated as a draw.io diagram. Also use when the user references a markdown file and wants diagrams generated from its content.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: "<prompt describing the diagram to generate, reference an image to recreate, or point to a markdown file for batch generation>"
---

# draw.io Diagram Skill

You are an expert diagramming assistant that generates draw.io diagrams from natural language descriptions, reference images, and architecture documentation files.

## How It Works

This skill uses the `drawio-skill` TypeScript library at `!`pwd``. The library converts structured `DiagramModel` objects into valid draw.io XML files. Output is stored in `./storage/` using the built-in storage module.

## Workflow

When the user requests a diagram:

1. **Understand the request** — identify diagram type (infrastructure, flowchart, org chart, wireframe, sequence, generic), components, relationships, and notation (aws, azure, gcp, cisco, archimate, uml, bpmn, or generic)
1.5. **Scope the concern** — extract the core concern from the user's request and classify potential elements:
   - Apply the **newspaper test** internally: "If I removed this element, would the core message change?"
   - Classify elements into three tiers:
     - **Primary** — directly implements the concern → full notation detail
     - **Context** — anchors Primary elements spatially → simplified labelled boundary
     - **Adjacent** — tangentially related → omit, track for separate views
   - Present a lightweight scope proposal:
     ```
     Scope: [core concern phrase]
     Primary: [elements modelled in detail]
     Context: [elements shown as boundaries]
     Omitted: [excluded elements, with reason]
     ```
   - Wait for user confirmation; accept adjustments or "skip scope" / "include everything"
   - **Auto-skip** for: simple requests (≤5 elements), explicit template requests, revision requests
   - When scope is confirmed, pass it to `buildScopedPrompt(scope, notation)` instead of `buildSystemPrompt(notation)` to include scoping instructions in the generation prompt
2. **Check templates** — use `searchTemplates(query)` or `listTemplatesByNotation(notation)` to see if a pre-built template matches. If so, use `template.build(params)` as the starting point instead of building from scratch.
3. **Select notation** — if the diagram involves cloud infrastructure, use `getNotation('aws')`, `getNotation('azure')`, or `getNotation('gcp')` for official service icons. For network diagrams, use `getNotation('cisco')`. For enterprise architecture, use `getNotation('archimate')`. For software design, use `getNotation('uml')`. For business processes, use `getNotation('bpmn')`. Default to generic for flowcharts and org charts.
4. **Build a DiagramModel** — create a TypeScript script that uses the library to define nodes, edges, containers, and metadata. Use shapes from the notation catalogue.
5. **Resolve layout** — run `resolveOverlaps(model)` to automatically fix any overlapping sibling elements, then `validateLayout(model)` to check for remaining violations (negative coords, canvas bounds, overlaps). Log any displacements or violations so layout issues are caught before export.
6. **Generate XML** — use `buildDiagramXml()` + `wrapWithMxFile()` to produce the `.drawio` XML
7. **Preview in terminal** — use `renderPreview(model)` to display a Unicode text preview of the diagram in the terminal. This gives the user immediate visual feedback on layout, labels, and connections before opening draw.io. Show the preview by default, but **skip it** if the user says "no preview", "skip preview", or similar. Also consider skipping for complex diagrams (20+ nodes) where the ASCII representation becomes hard to read — mention that preview is available if they want it.
8. **Validate** — run `validateAndFixXml()` for structural correctness, `validateSemantics()` with notation for semantic + conformance checking, and `validateShapeRenderable()` to catch invalid stencil references
9. **Store & Export** — use `ProjectManager`, `ModelStore`, `VersionManager`, and `ExportManager` to persist and export the diagram. When saving a scoped diagram, include the `concern` field in `saveModel()` options.
9.5. **Surface adjacent concerns** — if adjacent concerns were identified during scoping:
   - Briefly mention them: "I omitted [X] and [Y] — would you like separate views for any of these?"
   - If user says yes, loop back to Step 1.5 with the new concern, reusing the same `ProjectContext`
   - Link the new model to the original via `ctx.linkViews(originalName, newName)`
   - Use `ctx.getRelatedViews(name)` to query related views later

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
6. **Resolve layout** — run `resolveOverlaps(model)` then `validateLayout(model)` (same as text-based workflow)
7. **Generate XML** — use `buildDiagramXml()` + `wrapWithMxFile()` (same as text-based workflow)
8. **Validate** — run `validateAndFixXml()` and `validateSemantics()` (same as text-based workflow)
9. **Store & Export** — persist and export the `.drawio` file (same as text-based workflow)

### Image Analysis Script Template

```typescript
import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview,
  resolveOverlaps, validateLayout,
  buildImageAnalysisPrompt,
  ProjectContext,
  getNotation, resolveShape,
} from '!`pwd`/src/index.js';
import type { DiagramModel } from '!`pwd`/src/types/index.js';

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
const ctx = await ProjectContext.open({
  storageRoot: STORAGE_ROOT,
  projectId: PROJECT_ID,
  description: 'Image recreation project',
  notation: NOTATION,
  defaultTags: ['image-recreation'],
});

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

// --- Resolve layout overlaps ---
const { model: layoutModel, displacements } = resolveOverlaps(model, 50);
if (displacements > 0) {
  console.log(`Layout: resolved ${displacements} overlap(s)`);
}
const layoutIssues = validateLayout(layoutModel);
if (layoutIssues.length > 0) {
  console.warn('Layout warnings:', layoutIssues);
}

// --- Terminal preview (set to false to skip, or for complex diagrams 20+ nodes) ---
const SHOW_PREVIEW = true;
if (SHOW_PREVIEW) console.log(renderPreview(layoutModel));

// --- Standard pipeline from here ---
const bareCells = buildDiagramXml(layoutModel);
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
  layoutModel.nodes.map(n => n.label),  // Verify all labels from image appear in output
  layoutModel.metadata.notation,
);
if (!semantics.valid) {
  console.warn('Semantic issues:', semantics.issues);
}

// --- Save & export (upsert) ---
const { model: stored, version, isNew } = await ctx.saveModel({
  name: DIAGRAM_NAME,
  xml: result.finalXml,
  description: layoutModel.metadata.title ?? DIAGRAM_NAME,
  prompt: 'Recreated from reference image',
  notation: NOTATION,
});

const exportPath = await ctx.exportModel(DIAGRAM_NAME);
console.log(`${isNew ? 'Created' : 'Updated'} model "${stored.name}" (v${version}): ${exportPath}`);
```

## Batch from Markdown Workflow

When the user references a markdown file (`.md` or `.markdown`) and asks for diagrams to be generated from it, follow this workflow. The markdown file is a **human-written architecture document** — not a structured manifest. Your job is to read it, understand the architecture it describes, and generate multiple diagrams based on the user's intent.

### Detection

Use this workflow when:
- The user's argument contains a file path ending in `.md` or `.markdown` (e.g. `./docs/architecture.md`, `~/projects/design.md`)
- The user says "from this file", "from this doc", "based on this document", "generate diagrams from"
- The user references a markdown file they've already pasted or discussed in the conversation

### Steps

1. **Read the file** — use the `Read` tool to load the markdown content. For very large documents (500+ lines), focus on the sections most relevant to the user's request rather than processing everything at once.

2. **Analyse and plan** — based on the user's prompt and the file content, produce a **diagram plan**. Each entry should have:
   - **Name** (kebab-case, used as the model name for storage and export filename)
   - **Concern** (core concern phrase — what this diagram is focused on)
   - **Notation** (auto-detected from content or user-specified)
   - **Diagram type** (infrastructure, flowchart, org_chart, sequence, generic)
   - **Description** (what the diagram will show)
   - **Key components** (the main nodes, edges, and containers to include)

   **Deriving diagrams from document content:**
   - **Section-based**: when the user asks for "a diagram per section", map each H1/H2 heading to a separate diagram
   - **Concern-based**: when the user asks for "all infrastructure diagrams", identify distinct architectural concerns (networking, compute, data, security, CI/CD) and create one diagram per concern
   - **Notation inference**: if the document mentions AWS services (EC2, S3, Lambda), auto-select `aws` notation. Same for Azure, GCP, Cisco keywords. If multiple cloud providers are mentioned, create separate notation-specific diagrams.
   - **Relationship extraction**: look for "connects to", "depends on", "sends to", "reads from", "calls", arrows (→, ->), and list hierarchies to derive edges
   - **Component identification**: service names, database names, queue names, API names, system names become nodes

3. **Present the plan** — show the plan to the user as a numbered markdown table before generating anything. Include diagram name, concern, notation, type, and description. Ask for confirmation. The user may add, remove, or modify entries. **Limit to 10 diagrams per batch** by default — if the document suggests more, ask the user to prioritise. After batch completes, group remaining adjacent concerns and surface them as potential additional views.

4. **Execute sequentially** — for each diagram in the confirmed plan, write and run a TypeScript script using the batch script template below. All diagrams go into the same `ProjectContext` with a single project ID (derived from the markdown filename, e.g. `architecture.md` → `architecture`). Generate **one script per diagram** to keep script size manageable and isolate failures.

5. **Summarise** — after all diagrams are generated, show a summary table:

   | # | Diagram | Notation | Version | Export Path | Warnings |
   |---|---------|----------|---------|-------------|----------|
   | 1 | network-topology | cisco | v1 | storage/.../network-topology.drawio | — |
   | 2 | api-services | aws | v1 | storage/.../api-services.drawio | 1 shape warning |

### Batch Script Template

Each diagram in the batch uses this template. Run with `cd !`pwd` && npx tsx scripts/script.ts`:

```typescript
import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics,
  validateShapeRenderable, renderPreview,
  resolveOverlaps, validateLayout,
  ProjectContext,
  getNotation, resolveShape,
} from '!`pwd`/src/index.js';
import type { DiagramModel } from '!`pwd`/src/types/index.js';

// --- Configuration (shared across all diagrams in this batch) ---
const PROJECT_ID = 'architecture';             // derived from markdown filename
const STORAGE_ROOT = '!`pwd`/storage';

const ctx = await ProjectContext.open({
  storageRoot: STORAGE_ROOT,
  projectId: PROJECT_ID,
  description: 'Diagrams generated from architecture.md',
  defaultTags: ['batch', 'from-markdown'],
});

// --- Diagram definition (one per script) ---
const DIAGRAM_NAME = 'network-topology';       // from the plan
const NOTATION = 'cisco';                       // from the plan

// Resolve shapes from the notation catalogue
// const router = resolveShape(NOTATION, 'Router');
// ...

const model: DiagramModel = {
  containers: [
    // Groups identified from the document's architecture
  ],
  nodes: [
    // Components extracted from the document content
  ],
  edges: [
    // Relationships described in the document
  ],
  metadata: {
    title: 'Network Topology',
    diagramType: 'infrastructure',
    notation: NOTATION,
  },
};

// --- Resolve layout overlaps ---
const { model: layoutModel, displacements } = resolveOverlaps(model, 50);
if (displacements > 0) {
  console.log(`Layout: resolved ${displacements} overlap(s)`);
}
const layoutIssues = validateLayout(layoutModel);
if (layoutIssues.length > 0) {
  console.warn('Layout warnings:', layoutIssues);
}

// --- Preview (skip for batches of 6+ diagrams to reduce noise) ---
console.log(renderPreview(layoutModel));

// --- Validate ---
const bareCells = buildDiagramXml(layoutModel);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error(`Validation failed for ${DIAGRAM_NAME}:`, result.validation.errors);
  process.exit(1);
}

const shapeResult = validateShapeRenderable(result.finalXml);
if (shapeResult.issues.length > 0) {
  console.warn('Shape warnings:', shapeResult.issues.map(i => i.message));
}

const semantics = validateSemantics(
  result.finalXml,
  layoutModel.nodes.map(n => n.label),
  layoutModel.metadata.notation,
);
if (semantics.issues.length > 0) {
  console.warn('Semantic warnings:', semantics.issues.map(i => `${i.severity}: ${i.message}`));
}

// --- Save & export (upsert) ---
const { model: stored, version, isNew } = await ctx.saveModel({
  name: DIAGRAM_NAME,
  xml: result.finalXml,
  description: layoutModel.metadata.title ?? DIAGRAM_NAME,
  prompt: 'Batch generated from architecture.md',
  notation: layoutModel.metadata.notation,
});

const exportPath = await ctx.exportModel(DIAGRAM_NAME);
console.log(`${isNew ? 'Created' : 'Updated'} "${stored.name}" (v${version}): ${exportPath}`);
```

### Re-running a Batch

If the user asks to regenerate or update diagrams from the same markdown file (e.g. after the document has been updated), the upsert semantics of `ProjectContext.saveModel()` handle this automatically — existing models are versioned up rather than duplicated. Simply re-run the same scripts with the same project ID and diagram names.

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
  resolveOverlaps, validateLayout,
  ProjectContext,
  getNotation, resolveShape,
} from '!`pwd`/src/index.js';
import type { DiagramModel } from '!`pwd`/src/types/index.js';

// --- Configuration ---
const PROJECT_ID = 'my-project';           // kebab-case project identifier
const DIAGRAM_NAME = 'my-diagram';         // diagram name (used for upsert)
const STORAGE_ROOT = '!`pwd`/storage';     // output root directory

// --- Storage setup (replaces ~30 lines of boilerplate) ---
const ctx = await ProjectContext.open({
  storageRoot: STORAGE_ROOT,
  projectId: PROJECT_ID,
  description: 'Project description',
  // notation: 'aws',              // optional: sets default notation for all models
  // defaultTags: ['infra'],       // optional: auto-applied to new models
});

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

// --- Resolve layout overlaps ---
const { model: layoutModel, displacements } = resolveOverlaps(model, 50);
if (displacements > 0) {
  console.log(`Layout: resolved ${displacements} overlap(s)`);
}
const layoutIssues = validateLayout(layoutModel);
if (layoutIssues.length > 0) {
  console.warn('Layout warnings:', layoutIssues);
}

// --- Terminal preview (set to false to skip, or for complex diagrams 20+ nodes) ---
const SHOW_PREVIEW = true;
if (SHOW_PREVIEW) console.log(renderPreview(layoutModel));

const bareCells = buildDiagramXml(layoutModel);
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
  layoutModel.metadata.notation,  // optional: enables notation conformance warnings
);
if (!semantics.valid) {
  console.warn('Semantic issues:', semantics.issues);
}
if (semantics.issues.length > 0) {
  console.warn('Semantic warnings:', semantics.issues.filter(i => i.severity === 'warning'));
}

// --- Save & export (upsert: creates on first run, adds version on re-run) ---
const { model: stored, version, isNew } = await ctx.saveModel({
  name: DIAGRAM_NAME,
  xml: result.finalXml,
  description: layoutModel.metadata.title ?? DIAGRAM_NAME,
  prompt: '/* user prompt here */',
});

const exportPath = await ctx.exportModel(DIAGRAM_NAME);
console.log(`${isNew ? 'Created' : 'Updated'} model "${stored.name}" (v${version}): ${exportPath}`);
```

Run with: `cd !`pwd` && npx tsx scripts/script.ts`

**Important:** Always write generation scripts to the `scripts/` directory (e.g. `scripts/generate-diagram.ts`), never to the repo root. The `scripts/` directory is gitignored as a session artefact folder.

### Continuing an Existing Project

```typescript
import {
  buildDiagramXml, wrapWithMxFile, validateAndFixXml,
  applyOperations, ProjectContext,
} from '!`pwd`/src/index.js';

const ctx = await ProjectContext.open({
  storageRoot: '!`pwd`/storage',
  projectId: 'my-project',
});

// List existing models
const models = await ctx.listModels();
console.log('Models:', models.map(m => `${m.name} (v${m.currentVersion})`));

// Load and revise an existing model
const existingXml = await ctx.loadLatestXml('my-diagram');
if (existingXml) {
  const revised = applyOperations(existingXml, [
    { operation: 'update', cell_id: '3', new_xml: '<mxCell id="3" value="New Label" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="120" height="60" as="geometry"/></mxCell>' },
  ]);

  const result = validateAndFixXml(revised);
  const { version } = await ctx.saveModel({
    name: 'my-diagram',
    xml: result.finalXml,
    description: 'Updated labels',
  });
  console.log(`Updated to v${version}`);
}
```

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

## Label Rules

- **Never use `\n` (escaped newlines) in labels.** Use plain spaces instead. draw.io handles text wrapping automatically via `whiteSpace=wrap` in the style. Escaped newlines render as literal `\n` text in some contexts and break semantic label matching.

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
