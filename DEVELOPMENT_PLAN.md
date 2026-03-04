# Development Plan

## Overview

This project implements a Claude Code skill for programmatic generation, revision, and management of draw.io diagrams. The skill operates as a standalone set of commands within Claude Code, eliminating the need for external web applications or MCP servers.

The skill is implemented in **TypeScript** and distributed as a Claude Code skill package.

---

## Module Breakdown

### 1. Generator (`src/generator/`)

Responsible for converting natural language prompts into draw.io-compatible XML.

| Component | Responsibility |
|---|---|
| `PromptBuilder` | Constructs the system prompt with role definition, XML format rules, edge routing constraints, layout guidelines, and few-shot examples. Injects current diagram context when revising. |
| `XmlBuilder` | Programmatically constructs `<mxCell>` elements from the internal `DiagramModel` representation. Handles vertices (shapes), edges (connectors), containers (groups), and geometry. |
| `XmlWrapper` | Wraps bare `<mxCell>` output in the full `<mxfile><diagram><mxGraphModel><root>` hierarchy with the mandatory root cells (`id="0"` and `id="1"`). |
| `LayoutEngine` | Applies layout constraints: bounding box (0-800 x 0-600), minimum 50px gaps, margin offsets, container sizing. Supports horizontal and vertical flow directions. |

**Key design decision:** The AI generates bare `<mxCell>` elements only. The wrapping structure is added deterministically by `XmlWrapper`. This mirrors the reference implementation's approach and prevents the AI from producing inconsistent wrapper structures.

### 2. Parser (`src/parser/`)

Validates and corrects AI-generated XML output.

| Component | Responsibility |
|---|---|
| `XmlValidator` | Structural validation: DOM parsing, duplicate ID detection, orphaned edge references, nested mxCell detection, unescaped special characters, mismatched tags, empty IDs, invalid entity references. |
| `XmlFixer` | Auto-correction pipeline (applied iteratively, max 10 rounds): fix escaped quotes, remove CDATA wrappers, strip trailing wrapper tags, escape bare `&` characters, fix `<Cell>` to `<mxCell>`, close unclosed tags, flatten nested mxCells, de-duplicate IDs, drop unfixable elements. |
| `SemanticValidator` | Verifies user-requested components are present in output. Checks that all edge source/target IDs reference existing vertex IDs. Reports missing elements. |
| `CompletionChecker` | Detects truncated XML output (unclosed tags, incomplete attributes). Signals the need for continuation when output is cut short. |

**Validation pipeline:** `XmlValidator` runs first. If invalid, `XmlFixer` attempts repair, then `XmlValidator` re-validates. If still invalid after max rounds, the unfixable elements are dropped and a warning is raised.

### 3. Storage (`src/storage/`)

Filesystem-based persistence with project namespaces and version history.

| Component | Responsibility |
|---|---|
| `ModelStore` | CRUD operations for diagram models. Each model has a unique UUID, belongs to a project namespace, and is stored as a JSON file containing metadata + XML. |
| `VersionManager` | Maintains an ordered list of XML snapshots per model. Each revision creates a new version entry with timestamp, description, and full XML. Supports rollback to any previous version. |
| `ProjectManager` | Manages project namespaces. Projects are directories under the storage root. Handles listing, creation, and deletion of projects. |
| `ExportManager` | Produces final `.drawio` files from stored models. Handles the `exportToDrawIO(modelId)` API. |

**Storage layout:**

```
.drawio-skill/
  projects/
    <project-name>/
      models/
        <uuid>.json          # { id, name, project, currentVersion, createdAt, updatedAt }
        <uuid>.versions/
          v1.xml             # Full XML snapshot
          v2.xml
          ...
      project.json           # { name, createdAt, description }
  state.json                 # Recovery state (Phase 4)
```

**Model JSON schema:**

```typescript
interface StoredModel {
  id: string;                // UUID v4
  name: string;              // Human-readable name
  project: string;           // Project namespace
  currentVersion: number;    // Latest version number
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
  tags: string[];            // For search/filtering
  prompt: string;            // Original generation prompt
  description: string;       // AI-generated summary of diagram content
}
```

### 4. VectorBridge (`src/vector/`)

Qdrant integration for semantic retrieval of historical diagrams.

| Component | Responsibility |
|---|---|
| `QdrantClient` | Thin wrapper around the Qdrant REST API. Handles collection management, point upsert, and search. Configurable endpoint (defaults to `localhost:6333`). |
| `DiagramIndexer` | Extracts indexable metadata from a diagram model: the original prompt, AI-generated description, component labels, edge relationships, and tags. Produces a text representation for embedding. |
| `RecallEngine` | Implements `recallModel(query)`. Performs semantic search against indexed diagrams. Returns ranked results with model IDs and similarity scores. |
| `EmbeddingProvider` | Generates text embeddings. Uses a configurable provider (defaults to a local model or Claude's embedding endpoint). Abstracted behind an interface for swappability. |

**Qdrant collection schema:**

```
Collection: drawio_diagrams
  Vectors:
    size: 1024 (configurable based on embedding model)
    distance: Cosine

  Payload schema:
    model_id: string       # Links back to StoredModel.id
    project: string        # Project namespace
    name: string           # Diagram name
    prompt: string         # Original generation prompt
    description: string    # AI-generated content summary
    labels: string[]       # Extracted node labels from the diagram
    edges: string[]        # Edge relationships as "source_label -> target_label"
    tags: string[]         # User-defined and auto-generated tags
    created_at: string     # ISO 8601
    version: number        # Version at time of indexing
```

---

## Internal DSL: DiagramModel

Before XML conversion, diagrams are represented as a `DiagramModel` — a typed intermediate structure that decouples the AI's output from the XML serialisation.

```typescript
interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  containers: DiagramContainer[];
  metadata: DiagramMetadata;
}

interface DiagramNode {
  id: string;
  label: string;
  style: string;              // draw.io style string
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;            // Container ID if grouped
}

interface DiagramEdge {
  id: string;
  label?: string;
  source: string;             // Source node ID
  target: string;             // Target node ID
  style: string;              // draw.io edge style string
  waypoints?: Point[];        // Intermediate routing points
}

interface DiagramContainer {
  id: string;
  label: string;
  style: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;            // Nested containers
  collapsed?: boolean;
}

interface DiagramMetadata {
  title?: string;
  description?: string;
  diagramType?: 'infrastructure' | 'flowchart' | 'org_chart' | 'wireframe' | 'sequence' | 'generic';
  shapeLibrary?: string;      // e.g., 'aws4', 'azure2', 'gcp2', 'k8s'
}

interface Point {
  x: number;
  y: number;
}
```

The `DiagramModel` is produced by the AI (via structured output or parsed from its XML response) and then serialised to draw.io XML by `XmlBuilder`. This separation allows:

1. Validation at the structural level before XML generation
2. Programmatic layout adjustments without XML string manipulation
3. Clean mapping to Qdrant payloads via `DiagramIndexer`
4. Type-safe revision operations (add/update/delete nodes by ID)

---

## Skill API Surface

These are the public entry points exposed as Claude Code skill commands:

```
/drawio generate <project> "<prompt>"
  → Generates a new diagram, stores it, indexes to Qdrant, returns model ID + XML

/drawio revise <modelId> "<instructions>"
  → Loads existing model, applies targeted edits, creates new version

/drawio recall "<query>"
  → Semantic search for similar historical diagrams via Qdrant

/drawio export <modelId> [--format drawio|xml] [--output path]
  → Exports the final .drawio or .xml file to disk

/drawio list [project]
  → Lists models, optionally filtered by project

/drawio history <modelId>
  → Shows version history for a model

/drawio rollback <modelId> <version>
  → Restores a model to a previous version
```

---

## Edit Operations

The revision system supports three operation types, matching the reference implementation:

```typescript
interface DiagramOperation {
  operation: 'update' | 'add' | 'delete';
  cell_id: string;
  new_xml?: string;           // Required for 'update' and 'add'
}
```

- **update**: Replace the mxCell with the given ID. Finds by ID in the DOM, replaces the element.
- **add**: Append a new mxCell to the root. The `cell_id` becomes the new element's ID.
- **delete**: Remove the mxCell with the given ID. Cascade deletes all children (cells with `parent="<id>"`) and all edges referencing it as source or target.

---

## System Prompt Architecture

The skill constructs a multi-part system prompt:

1. **Role definition**: Expert diagramming assistant specialising in draw.io XML
2. **Output format rules**: Generate bare `<mxCell>` elements only, no wrapper tags
3. **Edge routing rules** (7 rules from reference implementation): no shared paths, bidirectional on opposite sides, explicit exit/entry points, route around shapes, strategic layout planning, multiple waypoints, natural connection points
4. **Layout constraints**: Bounding box 0-800 x 0-600, max container 700x550, margins from x=40 y=40, minimum 50px element gaps
5. **Few-shot example**: Minimal diagram with one shape + one connector to anchor output format
6. **Current diagram context** (for revision): The existing XML is injected as a separate context block so the AI can see what's on the canvas

---

## Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety for XML structures, matches Claude Code skill ecosystem |
| XML handling | `fast-xml-parser` | Lightweight, no native dependencies, handles draw.io's XML well |
| UUID generation | `crypto.randomUUID()` | Built-in, no dependency needed |
| Qdrant client | `@qdrant/js-client-rest` | Official Qdrant TypeScript client |
| Testing | `vitest` | Fast, TypeScript-native, compatible with Claude Code's test patterns |
| Linting | `eslint` + `prettier` | Standard TypeScript linting |

---

## Phase Progression

| Phase | Status | Deliverables |
|---|---|---|
| 1. Research & Discovery | Complete | Research findings documented in this plan |
| 2. Implementation Planning | Complete | This document + `ATTRIBUTION.md` |
| 3. Core Skill Development | Complete | `src/generator/`, `src/parser/`, `src/storage/`, `src/vector/` |
| 4. Recovery & State Management | Complete | `src/state/state-manager.ts` |
| 5. Testing & Validation | Complete | 87 tests across 13 files (unit + integration + E2E) |
