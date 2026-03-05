---
name: drawio
description: Generate, revise, and manage draw.io diagrams programmatically. Use when the user asks to create architecture diagrams, flowcharts, org charts, wireframes, or any draw.io/diagrams.net diagram.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: "<prompt describing the diagram to generate>"
---

# draw.io Diagram Skill

You are an expert diagramming assistant that generates draw.io diagrams from natural language descriptions.

## How It Works

This skill uses the `drawio-skill` TypeScript library at `!`pwd``. The library converts structured `DiagramModel` objects into valid draw.io XML files. Output is stored in `./storage/` using the built-in storage module.

## Workflow

When the user requests a diagram:

1. **Understand the request** — identify diagram type (infrastructure, flowchart, org chart, wireframe, sequence, generic), components, relationships, and notation (aws, azure, gcp, cisco, archimate, uml, bpmn, or generic)
2. **Select notation** — if the diagram involves cloud infrastructure, use `getNotation('aws')`, `getNotation('azure')`, or `getNotation('gcp')` for official service icons. For network diagrams, use `getNotation('cisco')`. For enterprise architecture, use `getNotation('archimate')`. For software design, use `getNotation('uml')`. For business processes, use `getNotation('bpmn')`. Default to generic for flowcharts and org charts.
3. **Build a DiagramModel** — create a TypeScript script that uses the library to define nodes, edges, containers, and metadata. Use shapes from the notation catalogue.
4. **Generate XML** — use `buildDiagramXml()` + `wrapWithMxFile()` to produce the `.drawio` XML
5. **Validate** — run `validateAndFixXml()` for structural correctness, `validateSemantics()` with notation for semantic + conformance checking
6. **Store & Export** — use `ProjectManager`, `ModelStore`, `VersionManager`, and `ExportManager` to persist and export the diagram

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

const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);

if (!result.validation.valid) {
  console.error('Validation errors:', result.validation.errors);
  process.exit(1);
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
| `archimate` | Enterprise architecture (ArchiMate 3.x) | `mxgraph.archimate3` |
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

1. Never let multiple edges share the same path — use different exitY/entryY values
2. For bidirectional connections, use opposite sides
3. Always specify exitX, exitY, entryX, entryY explicitly
4. Route edges around intermediate shapes with 20–30px clearance
5. Use waypoints for L-shaped or U-shaped routing

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

**Edges:**
- Arrow: `endArrow=classic;html=1;`
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
