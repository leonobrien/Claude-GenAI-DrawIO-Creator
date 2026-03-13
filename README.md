# drawio-skill

A TypeScript library for programmatic generation, revision, and management of [draw.io](https://www.drawio.com/) diagrams. Built as a Claude Code skill, it converts structured diagram models into fully editable `.drawio` files — no external MCP servers required.

## Attribution

This project is inspired by and builds upon the following work:

**next-ai-draw-io** by Dayuan Jiang
https://github.com/DayuanJiang/next-ai-draw-io

A Next.js web application that integrates Claude 3.7 (via Amazon Bedrock) with an embedded draw.io editor. This project adapts the core XML generation, validation, and revision logic from this reference implementation into a standalone Claude Code skill, removing the dependency on a web application and MCP server infrastructure.

Refer to [ATTRIBUTION.md](./ATTRIBUTION.md) for full details.

## A note on why not using MCP
The project is intended to be used directly within Claude Code and Skills feature is perfectly suited to local execution of such logic. The benefit of using Skills and the avoidance of having to use MCP - they are overused, fragile, poorly developed in most cases, and adds multiple framework layers that add no value when undertaking local development with Claude Code. In short, they have become just as pain inducing as javascript.

## Installation

### As a Claude Code Skill

The easiest way to use drawio-skill is as a Claude Code slash command. This gives you `/drawio` in any Claude Code session.

**Option A: Install for a single project**

```bash
# From your project directory
git clone https://github.com/your-org/drawio-skill.git .claude/skills/drawio-repo
cd .claude/skills/drawio-repo && npm install && cd -
```

Or symlink if you already have it cloned elsewhere:

```bash
mkdir -p .claude/skills
ln -s /path/to/modelling_skill .claude/skills/drawio
```

**Option B: Install globally (available in all projects)**

```bash
mkdir -p ~/.claude/skills
ln -s /path/to/modelling_skill ~/.claude/skills/drawio
cd /path/to/modelling_skill && npm install
```

**Option C: Use as an additional directory**

```bash
claude --add-dir /path/to/modelling_skill
```

Once installed, type `/drawio` in Claude Code followed by a description of the diagram you want:

```
/drawio Create an AWS architecture with a load balancer, three app servers, and a database cluster
```

Claude will generate the `.drawio` file and save it to your working directory.

### As a TypeScript Library

If you want to use the API programmatically in your own code:

```bash
cd /path/to/modelling_skill
npm install
npm run build
```

## Quick Start

```typescript
import {
  buildDiagramXml,
  wrapWithMxFile,
  validateAndFixXml,
  ProjectContext,
} from 'drawio-skill';
import type { DiagramModel } from 'drawio-skill';

// 1. Define your diagram
const model: DiagramModel = {
  containers: [],
  nodes: [
    { id: '2', label: 'Start', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;', x: 40, y: 200, width: 120, height: 60 },
    { id: '3', label: 'End', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;', x: 240, y: 200, width: 120, height: 60 },
  ],
  edges: [
    { id: '10', source: '2', target: '3', style: 'endArrow=classic;html=1;' },
  ],
  metadata: { title: 'My Diagram', diagramType: 'flowchart' },
};

// 2. Generate and validate XML
const bareCells = buildDiagramXml(model);
const fullXml = wrapWithMxFile(bareCells);
const result = validateAndFixXml(fullXml);

console.log(result.validation.valid); // true
console.log(result.finalXml);         // Complete .drawio XML

// 3. Store and export (ProjectContext handles all storage boilerplate)
const ctx = await ProjectContext.open({
  storageRoot: '.drawio-skill',
  projectId: 'my-project',
  description: 'My project',
});

const { model: stored, version, isNew } = await ctx.saveModel({
  name: 'My Diagram',
  xml: result.finalXml,
  description: 'Two-node flowchart',
  prompt: 'A simple start-to-end flow',
  tags: ['example'],
});

const exportPath = await ctx.exportModel('My Diagram', './output.drawio');
console.log(`${isNew ? 'Created' : 'Updated'} v${version}: ${exportPath}`);
```

Open `output.drawio` in [draw.io](https://app.diagrams.net/) or any compatible editor.

---

## Core Concepts

### DiagramModel

Every diagram starts as a `DiagramModel` — a typed intermediate representation that gets converted to draw.io XML:

```typescript
interface DiagramModel {
  nodes: DiagramNode[];       // Shapes (vertices)
  edges: DiagramEdge[];       // Connectors between nodes
  containers: DiagramContainer[];  // Groups that hold child nodes
  metadata: DiagramMetadata;  // Title, type, description
}
```

### XML Pipeline

The generation pipeline follows this flow:

```
DiagramModel → buildDiagramXml() → bare <mxCell> elements
                                          ↓
                                   wrapWithMxFile() → complete .drawio XML
                                          ↓
                                   validateAndFixXml() → validated XML
                                          ↓
                                   ExportManager → .drawio file on disk
```

The AI (or your code) generates **only bare `<mxCell>` elements**. The `<mxfile>` wrapper structure is added deterministically by `wrapWithMxFile()`.

---

## Examples

### Example 1: AWS Infrastructure Diagram

A three-tier web architecture with a VPC container, load balancer, application servers, and database cluster.

```typescript
import { buildDiagramXml, wrapWithMxFile, validateAndFixXml, validateSemantics } from 'drawio-skill';
import type { DiagramModel } from 'drawio-skill';

const infrastructure: DiagramModel = {
  containers: [
    {
      id: 'vpc', label: 'VPC',
      style: 'rounded=1;whiteSpace=wrap;html=1;dashed=1;fillColor=#f5f5f5;strokeColor=#666666;',
      x: 40, y: 40, width: 680, height: 480,
    },
  ],
  nodes: [
    {
      id: 'lb', label: 'Load Balancer',
      style: 'shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.elb;rounded=1;fillColor=#d5e8d4;strokeColor=#82b366;',
      x: 260, y: 60, width: 120, height: 60, parent: 'vpc',
    },
    {
      id: 'app1', label: 'App Server 1',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
      x: 60, y: 200, width: 120, height: 60, parent: 'vpc',
    },
    {
      id: 'app2', label: 'App Server 2',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
      x: 260, y: 200, width: 120, height: 60, parent: 'vpc',
    },
    {
      id: 'app3', label: 'App Server 3',
      style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
      x: 460, y: 200, width: 120, height: 60, parent: 'vpc',
    },
    {
      id: 'db', label: 'RDS Primary',
      style: 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#fff2cc;strokeColor=#d6b656;',
      x: 160, y: 360, width: 100, height: 80, parent: 'vpc',
    },
    {
      id: 'db-replica', label: 'RDS Replica',
      style: 'shape=cylinder3;whiteSpace=wrap;html=1;size=15;fillColor=#fff2cc;strokeColor=#d6b656;',
      x: 380, y: 360, width: 100, height: 80, parent: 'vpc',
    },
  ],
  edges: [
    { id: 'e1', source: 'lb', target: 'app1', style: 'endArrow=classic;html=1;exitX=0;exitY=1;entryX=0.5;entryY=0;' },
    { id: 'e2', source: 'lb', target: 'app2', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
    { id: 'e3', source: 'lb', target: 'app3', style: 'endArrow=classic;html=1;exitX=1;exitY=1;entryX=0.5;entryY=0;' },
    { id: 'e4', source: 'app1', target: 'db', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
    { id: 'e5', source: 'app2', target: 'db', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
    { id: 'e6', source: 'app3', target: 'db-replica', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
    { id: 'e7', label: 'Replication', source: 'db', target: 'db-replica', style: 'endArrow=classic;html=1;dashed=1;' },
  ],
  metadata: {
    title: 'AWS Three-Tier Architecture',
    diagramType: 'infrastructure',
    shapeLibrary: 'aws4',
  },
};

const xml = wrapWithMxFile(buildDiagramXml(infrastructure));
const validated = validateAndFixXml(xml);
console.log(validated.validation.valid); // true

// Verify all expected components are present
const semantics = validateSemantics(xml, ['Load Balancer', 'App Server', 'RDS']);
console.log(semantics.valid); // true
```

### Example 2: CI/CD Pipeline Flowchart

A branching flowchart with a decision diamond and a retry loop.

```typescript
import { buildDiagramXml, wrapWithMxFile, validateAndFixXml } from 'drawio-skill';
import type { DiagramModel } from 'drawio-skill';

const pipeline: DiagramModel = {
  containers: [],
  nodes: [
    { id: '2', label: 'Code Commit', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;', x: 40, y: 200, width: 120, height: 60 },
    { id: '3', label: 'Build', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 220, y: 200, width: 100, height: 60 },
    { id: '4', label: 'Test', style: 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;', x: 380, y: 185, width: 100, height: 90 },
    { id: '5', label: 'Deploy', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 540, y: 200, width: 100, height: 60 },
    { id: '6', label: 'Monitor', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;', x: 700, y: 200, width: 100, height: 60 },
    { id: '7', label: 'Fix', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;', x: 380, y: 360, width: 100, height: 50 },
  ],
  edges: [
    { id: 'e1', source: '2', target: '3', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
    { id: 'e2', source: '3', target: '4', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
    { id: 'e3', label: 'Pass', source: '4', target: '5', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
    { id: 'e4', source: '5', target: '6', style: 'endArrow=classic;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
    { id: 'e5', label: 'Fail', source: '4', target: '7', style: 'endArrow=classic;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeColor=#b85450;' },
    {
      id: 'e6', source: '7', target: '2',
      style: 'endArrow=classic;html=1;exitX=0;exitY=0.5;entryX=0.5;entryY=1;dashed=1;',
      waypoints: [{ x: 100, y: 385 }],  // Route around other nodes
    },
  ],
  metadata: { title: 'CI/CD Pipeline', diagramType: 'flowchart' },
};

const xml = wrapWithMxFile(buildDiagramXml(pipeline));
console.log(validateAndFixXml(xml).validation.valid); // true
```

### Example 3: Organisation Chart

A hierarchical org chart using `endArrow=none` for structural (non-directional) connections.

```typescript
import { buildDiagramXml, wrapWithMxFile } from 'drawio-skill';
import type { DiagramModel } from 'drawio-skill';

const orgChart: DiagramModel = {
  containers: [],
  nodes: [
    { id: '2', label: 'CEO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;', x: 300, y: 40, width: 120, height: 60 },
    { id: '3', label: 'CTO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 100, y: 160, width: 120, height: 60 },
    { id: '4', label: 'CFO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 300, y: 160, width: 120, height: 60 },
    { id: '5', label: 'COO', style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;', x: 500, y: 160, width: 120, height: 60 },
    { id: '6', label: 'Engineering', style: 'rounded=1;whiteSpace=wrap;html=1;', x: 40, y: 280, width: 120, height: 60 },
    { id: '7', label: 'Design', style: 'rounded=1;whiteSpace=wrap;html=1;', x: 180, y: 280, width: 120, height: 60 },
  ],
  edges: [
    // Org chart edges use endArrow=none (no arrowhead)
    { id: 'e1', source: '2', target: '3', style: 'endArrow=none;html=1;' },
    { id: 'e2', source: '2', target: '4', style: 'endArrow=none;html=1;' },
    { id: 'e3', source: '2', target: '5', style: 'endArrow=none;html=1;' },
    { id: 'e4', source: '3', target: '6', style: 'endArrow=none;html=1;' },
    { id: 'e5', source: '3', target: '7', style: 'endArrow=none;html=1;' },
  ],
  metadata: { title: 'Company Structure', diagramType: 'org_chart' },
};

const xml = wrapWithMxFile(buildDiagramXml(orgChart));
```

### Example 4: Revising an Existing Diagram

Use `applyOperations()` to update, add, or delete cells by ID. Delete cascades to children and referencing edges.

```typescript
import { wrapWithMxFile, applyOperations, validateAndFixXml } from 'drawio-skill';
import type { DiagramOperation } from 'drawio-skill';

// Start with an existing diagram
const existingXml = wrapWithMxFile([
  '<mxCell id="2" value="Frontend" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="120" height="60" as="geometry"/></mxCell>',
  '<mxCell id="3" value="Backend" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="300" y="100" width="120" height="60" as="geometry"/></mxCell>',
  '<mxCell id="10" style="endArrow=classic;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell>',
].join('\n'));

// Apply edits
const operations: DiagramOperation[] = [
  // Update: rename "Backend" to "API Gateway"
  {
    operation: 'update',
    cell_id: '3',
    new_xml: '<mxCell id="3" value="API Gateway" style="rounded=1;fillColor=#dae8fc;" vertex="1" parent="1"><mxGeometry x="300" y="100" width="120" height="60" as="geometry"/></mxCell>',
  },
  // Add: new "Database" node
  {
    operation: 'add',
    cell_id: '4',
    new_xml: '<mxCell id="4" value="Database" style="shape=cylinder3;whiteSpace=wrap;html=1;size=15;" vertex="1" parent="1"><mxGeometry x="500" y="100" width="100" height="80" as="geometry"/></mxCell>',
  },
  // Add: edge from API Gateway to Database
  {
    operation: 'add',
    cell_id: '11',
    new_xml: '<mxCell id="11" style="endArrow=classic;html=1;" edge="1" parent="1" source="3" target="4"><mxGeometry relative="1" as="geometry"/></mxCell>',
  },
];

const result = applyOperations(existingXml, operations);
console.log(result.applied);  // ['Updated cell "3"', 'Added cell "4"', 'Added cell "11"']
console.log(result.errors);   // []

// Validate the revised XML
const validated = validateAndFixXml(result.xml);
console.log(validated.validation.valid); // true
```

**Cascade delete example:**

```typescript
// Deleting "Frontend" (id="2") also removes the edge (id="10") that references it
const deleteResult = applyOperations(existingXml, [
  { operation: 'delete', cell_id: '2' },
]);

console.log(deleteResult.xml.includes('id="2"'));   // false — node removed
console.log(deleteResult.xml.includes('id="10"'));   // false — edge cascade-deleted
console.log(deleteResult.xml.includes('id="3"'));    // true  — other nodes preserved
```

### Example 5: Storage, Versioning, and Export

Full lifecycle using `ProjectContext`: create a project, store models with upsert, iterate versions, and export.

```typescript
import { ProjectContext } from 'drawio-skill';

// Open (or create) a project — handles all storage setup
const ctx = await ProjectContext.open({
  storageRoot: '.drawio-skill',
  projectId: 'web-app',
  description: 'Web application diagrams',
  defaultTags: ['architecture'],
});

// Save version 1 (creates the model automatically)
const v1Xml = '<mxfile>...</mxfile>'; // Your generated XML
const { model, version: v1 } = await ctx.saveModel({
  name: 'System Architecture',
  xml: v1Xml,
  description: 'High-level system architecture',
  prompt: 'Draw a system architecture diagram',
});
console.log(v1); // 1

// Save version 2 (upsert — same name updates the existing model)
const v2Xml = '<mxfile>...revised...</mxfile>';
const { version: v2, isNew } = await ctx.saveModel({
  name: 'System Architecture',
  xml: v2Xml,
  description: 'Added caching layer',
});
console.log(v2, isNew); // 2, false

// List models, find by name, load latest XML
const allModels = await ctx.listModels();
const found = await ctx.findModel('System Architecture');
const latestXml = await ctx.loadLatestXml('System Architecture');

// Export to .drawio file
const exportPath = await ctx.exportModel('System Architecture', './architecture.drawio');
```

**Advanced: direct manager access for rollback and version history:**

```typescript
// The underlying managers are exposed as public readonly properties
const history = await ctx.versions.listVersions('web-app', model.id);
console.log(history);
// [
//   { version: 1, timestamp: '...', description: 'High-level system architecture' },
//   { version: 2, timestamp: '...', description: 'Added caching layer' },
// ]

// Roll back to version 1
const v1Entry = await ctx.versions.loadVersion('web-app', model.id, 1);
console.log(v1Entry!.xml); // Original XML

// Export a specific version
await ctx.exporter.exportVersionToFile({
  project: 'web-app', modelId: model.id,
  versionNumber: 1, outputPath: './architecture-v1.drawio',
});

// Find a model by ID across all projects
const foundById = await ctx.models.findById(model.id);
```

### Example 6: Semantic Search with Qdrant

Index diagrams for later retrieval by natural language query. Requires a running [Qdrant](https://qdrant.tech/) instance.

```typescript
import {
  QdrantClient,
  RecallEngine,
  StubEmbeddingProvider,  // Replace with a real provider in production
  buildIndexPayload,
  payloadToEmbeddingText,
} from 'drawio-skill';
import type { StoredModel, EmbeddingProvider } from 'drawio-skill';

// Initialise
const qdrant = new QdrantClient({
  url: 'http://localhost:6333',
  collectionName: 'drawio_diagrams',
  vectorSize: 1024,
});
const embeddings = new StubEmbeddingProvider(1024);
const recall = new RecallEngine(qdrant, embeddings);

// Create collection (idempotent)
await recall.initialise();

// Index a diagram
const model: StoredModel = { /* ... */ };
const xml = '<mxfile>...</mxfile>';
await recall.index(model, xml);

// Search for similar diagrams
const results = await recall.recall('kubernetes deployment architecture');
for (const result of results) {
  console.log(`${result.name} (score: ${result.score.toFixed(3)}) — ${result.description}`);
}

// Check Qdrant availability
const healthy = await recall.isAvailable();
```

**Custom embedding provider:**

```typescript
import type { EmbeddingProvider } from 'drawio-skill';

class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 1536;

  async embed(text: string): Promise<number[]> {
    // Call OpenAI embeddings API
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    });
    const data = await response.json();
    return data.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}
```

### Example 7: Crash Recovery with StateManager

Track in-progress operations so they can be resumed after a session interruption.

```typescript
import { StateManager } from 'drawio-skill';

const state = new StateManager('.drawio-skill/state.json');
await state.load();

// Track context
state.setContext('my-project', 'model-123');

// Start an operation
state.startOperation({ type: 'generate', project: 'my-project', modelId: 'model-123' });
await state.save();  // Persist to disk

// ... if the session crashes here, the next session can detect it:

const recovered = new StateManager('.drawio-skill/state.json');
await recovered.load();

const interrupted = recovered.getInterruptedOperations();
if (interrupted.length > 0) {
  console.log('Resuming interrupted operations:', interrupted);
  // Re-run the interrupted operations...
  recovered.completeOperation('generate', 'Recovered successfully');
  await recovered.save();
}
```

### Example 8: Validating and Fixing AI-Generated XML

The parser pipeline automatically corrects common AI generation errors.

```typescript
import { validateXml, fixXml, validateAndFixXml, isMxCellXmlComplete } from 'drawio-skill';

// Check if XML output is complete (not truncated)
const partial = '<mxCell id="2" value="A" vertex="1" parent="1"><mxGeometry x="0" y="0';
console.log(isMxCellXmlComplete(partial)); // false

// Validate XML structure
const result = validateXml('<mxCell id="2" value="A & B" vertex="1" parent="1"/>');
console.log(result.warnings); // ['Found unescaped & character(s)...']

// Fix common AI errors automatically
const fixed = fixXml('```xml\n<Cell id="2" value="test" vertex="1" parent="1"/>\n```');
console.log(fixed.xml);          // '<mxCell id="2" value="test" vertex="1" parent="1"/>'
console.log(fixed.fixesApplied); // ['Strip LLM artifacts (round 1)', 'Fix <Cell> to <mxCell> (round 1)']

// Combined validate-and-fix pipeline (preferred)
const xmlWithErrors = '<Cell id="2" value="A & B" vertex="1" parent="1"/>';
const combined = validateAndFixXml(xmlWithErrors);
console.log(combined.finalXml);         // Corrected XML
console.log(combined.fix?.fixesApplied); // List of corrections applied
```

### Example 9: Using the Prompt Builder

Generate system prompts for instructing an LLM to produce draw.io XML.

```typescript
import { buildSystemPrompt, buildRevisionPrompt } from 'drawio-skill';

// For new diagram generation
const systemPrompt = buildSystemPrompt();
// Send to your LLM as the system message, with the user's request as the user message

// For revising an existing diagram
const existingXml = '<mxfile>...</mxfile>';
const revisionPrompt = buildRevisionPrompt(existingXml);
// The revision prompt includes the current diagram XML so the LLM knows what to modify
```

---

## API Reference

### Generator

| Function | Description |
|---|---|
| `buildDiagramXml(model)` | Converts a `DiagramModel` into bare `<mxCell>` XML |
| `buildNodeXml(node)` | Generates XML for a single vertex |
| `buildEdgeXml(edge)` | Generates XML for a single edge (with optional waypoints) |
| `buildContainerXml(container)` | Generates XML for a grouping container |
| `wrapWithMxFile(bareCells, pageName?)` | Wraps bare cells in the full `<mxfile>` structure |
| `unwrapMxFile(fullXml)` | Extracts bare cells from a complete `.drawio` XML |
| `applyOperations(xml, operations)` | Applies update/add/delete operations to existing XML |
| `buildSystemPrompt()` | Returns the system prompt for LLM-based generation |
| `buildRevisionPrompt(currentXml)` | Returns the system prompt with diagram context for revision |
| `validateLayout(model, constraints?)` | Checks for layout violations (out-of-bounds, overlaps) |
| `applyConstraints(model, constraints?)` | Clamps positions to fit within canvas bounds |

### Parser

| Function | Description |
|---|---|
| `validateXml(xml)` | Structural validation — returns `{ valid, errors, warnings }` |
| `fixXml(xml)` | Auto-correction pipeline — returns `{ xml, fixesApplied, remainingErrors }` |
| `validateAndFixXml(xml)` | Combined validate → fix → re-validate pipeline |
| `validateSemantics(xml, expectedLabels?)` | Checks edge references and expected components |
| `isMxCellXmlComplete(xml)` | Detects truncated XML output |
| `extractCompleteMxCells(partialXml)` | Extracts only complete cells from partial/streaming XML |

### Storage

| Class | Key Methods |
|---|---|
| `ProjectContext` | `open()`, `saveModel()`, `findModel()`, `listModels()`, `loadLatestXml()`, `exportModel()` |
| `ProjectManager` | `create()`, `get()`, `list()`, `delete()`, `ensureExists()`, `update()` |
| `ModelStore` | `save()`, `load()`, `listByProject()`, `delete()`, `findById()`, `findByName()` |
| `VersionManager` | `saveVersion()`, `loadVersion()`, `loadLatest()`, `listVersions()`, `getLatestVersion()` |
| `ExportManager` | `exportToFile()`, `exportVersionToFile()`, `getXml()` |

### Vector

| Class | Key Methods |
|---|---|
| `QdrantClient` | `ensureCollection()`, `upsert()`, `search()`, `deletePoint()`, `healthCheck()` |
| `RecallEngine` | `initialise()`, `index()`, `recall()`, `remove()`, `isAvailable()` |
| `StubEmbeddingProvider` | `embed()`, `embedBatch()` — deterministic stub for testing |

### State

| Class | Key Methods |
|---|---|
| `StateManager` | `load()`, `save()`, `setContext()`, `startOperation()`, `completeOperation()`, `failOperation()`, `getInterruptedOperations()`, `reset()` |

---

## Common draw.io Styles

**Shapes:**

| Style | Result |
|---|---|
| `rounded=1;whiteSpace=wrap;html=1;` | Rounded rectangle |
| `rhombus;whiteSpace=wrap;html=1;` | Diamond (decision) |
| `ellipse;whiteSpace=wrap;html=1;` | Ellipse |
| `shape=cylinder3;whiteSpace=wrap;html=1;size=15;` | Database cylinder |
| `shape=parallelogram;whiteSpace=wrap;html=1;` | Parallelogram (I/O) |

**Colours (fill + stroke):**

| Colour | Fill | Stroke |
|---|---|---|
| Green | `fillColor=#d5e8d4` | `strokeColor=#82b366` |
| Blue | `fillColor=#dae8fc` | `strokeColor=#6c8ebf` |
| Yellow | `fillColor=#fff2cc` | `strokeColor=#d6b656` |
| Red | `fillColor=#f8cecc` | `strokeColor=#b85450` |
| Purple | `fillColor=#e1d5e7` | `strokeColor=#9673a6` |
| Grey | `fillColor=#f5f5f5` | `strokeColor=#666666` |

**Edges:**

| Style | Result |
|---|---|
| `endArrow=classic;html=1;` | Arrow with classic head |
| `endArrow=none;html=1;` | Line with no arrowhead (org charts) |
| `dashed=1;` | Dashed line |
| `strokeColor=#b85450;` | Coloured edge |
| `exitX=1;exitY=0.5;entryX=0;entryY=0.5;` | Explicit connection points (right→left) |

**Connection points** — `exitX`/`exitY`/`entryX`/`entryY` use values 0–1:

```
(0,0)-----(0.5,0)-----(1,0)
  |                      |
(0,0.5)              (1,0.5)
  |                      |
(0,1)-----(0.5,1)-----(1,1)
```

---

## Testing

```bash
npm test                              # Run all tests
npm run test:watch                    # Watch mode
npx vitest run tests/parser/          # Run tests in a specific directory
npx vitest run -t "validates layout"  # Run tests matching a pattern
```

---

## Storage Layout

```
.drawio-skill/
  projects/
    <project-name>/
      project.json                    # { name, createdAt, description, updatedAt?, notation?, defaultTags? }
      models/
        <uuid>.json                   # StoredModel metadata
        <uuid>.versions/
          v1.xml                      # Full XML snapshot
          v1.meta.json                # { version, timestamp, description }
          v2.xml
          v2.meta.json
  state.json                          # Recovery state
```
