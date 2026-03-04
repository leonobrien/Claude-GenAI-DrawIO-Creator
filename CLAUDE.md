# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Claude Code skill** for programmatic generation, revision, and management of draw.io diagrams. Eliminates the need for external MCP servers by embedding diagram generation logic directly into the toolset.

Based on:
- **Research paper:** arXiv:2601.05162v1 — stored in `resources/2601.05162v1.pdf`
- **Reference implementation:** [DayuanJiang/next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)

## Build & Test Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript (tsc -> dist/)
npm test             # Run all tests (vitest run)
npm run test:watch   # Run tests in watch mode
npm run test:single -- -t "pattern"  # Run a single test by name
npx tsc --noEmit     # Type-check without emitting
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
```

## Architecture

Five modules under `src/`, each with a barrel `index.ts`:

### Generator (`src/generator/`)
- **XmlBuilder** — Converts `DiagramModel` (typed intermediate DSL) into bare `<mxCell>` elements
- **XmlWrapper** — Wraps bare cells in the `<mxfile><diagram><mxGraphModel><root>` hierarchy with mandatory root cells (id="0", id="1"). The AI generates ONLY bare cells; wrapping is deterministic.
- **PromptBuilder** — Constructs system prompts with role definition, format rules, 7 edge routing rules, layout constraints, and few-shot examples. Accepts optional `NotationName` to inject notation-specific shapes, rules, and examples. Separate builder for revision prompts that inject current diagram XML.
- **LayoutEngine** — Validates/applies spatial constraints (800x600 canvas, 50px min gaps, 40px margins)
- **Operations** — Applies `update`/`add`/`delete` operations to XML by cell ID. Delete cascades to children and referencing edges.

### Parser (`src/parser/`)
- **XmlValidator** — Structural checks: duplicate IDs, orphaned edge refs, nested mxCells, mismatched tags, empty IDs, unescaped entities
- **XmlFixer** — Iterative auto-correction pipeline (max 10 rounds): fixes JSON escaping, CDATA, LLM artifacts, `<Cell>`→`<mxCell>`, bare ampersands, duplicate IDs, etc.
- **SemanticValidator** — Verifies user-requested labels appear in output, all edge source/target IDs exist, and optionally checks notation conformance (stencil prefix matching)
- **CompletionChecker** — Detects truncated XML (unclosed tags/attributes) for continuation handling
- **`validateAndFixXml()`** — Combined pipeline: validate → fix → re-validate

### Storage (`src/storage/`)
- **ModelStore** — CRUD for `StoredModel` JSON files, keyed by UUID within project namespaces
- **VersionManager** — Ordered XML snapshots (`v1.xml`, `v2.xml`, ...) with metadata, supports rollback
- **ProjectManager** — Project directory management under `.drawio-skill/projects/`
- **ExportManager** — Writes `.drawio` or `.xml` files from stored versions

### Notation (`src/notation/`)
- **Generic** — Default notation with standard draw.io shapes (rectangle, diamond, cylinder, ellipse, cloud)
- **AWS** — 31 AWS service shapes using full `mxgraph.aws4.resourceIcon` styles with category fill colours and 78×78 sizing
- **Azure** — 21 Azure service shapes using `image=img/lib/azure2/<category>/<Service>.svg` SVG references
- **GCP** — 32 Google Cloud shapes using `shape=mxgraph.gcp2.<service>` stencils
- **Cisco** — 20 Cisco network shapes using `shape=mxgraph.cisco19.rect;prIcon=mxgraph.cisco19.<icon>;` composite pattern
- **ArchiMate** — 15 ArchiMate 3.x shapes per layer using `shape=mxgraph.archimate3.<element>;archiType=<type>;`
- **UML** — 23 UML 2.x shapes for class, sequence, component, use case, and activity diagrams using native draw.io shapes
- **BPMN** — 30 BPMN 2.0 shapes for events, tasks, gateways, pools, and data objects using `mxgraph.bpmn` stencils
- **Registry** — `getNotation()`, `findNotation()`, `listNotations()`, `isValidNotation()`, `resolveNotationFromShapeLibrary()` for lookup and resolution

### VectorBridge (`src/vector/`)
- **QdrantClient** — Thin REST wrapper (collection CRUD, upsert, search, delete)
- **DiagramIndexer** — Extracts labels, edge relationships, and metadata from XML for embedding
- **RecallEngine** — Coordinates embeddings + Qdrant search for `recallModel(query)` API
- **EmbeddingProvider** — Interface + `StubEmbeddingProvider` (deterministic hash-based, for testing)

### State (`src/state/`)
- **StateManager** — Persists `state.json` for crash recovery. Tracks active project/model, operation lifecycle (pending → completed/failed), interrupted operations for retry.

## Key Design Decisions

- **Bare cells pattern**: AI generates only `<mxCell>` elements. The `<mxfile>` wrapper is added deterministically by `XmlWrapper.wrapWithMxFile()`. This prevents inconsistent wrapper structures.
- **DiagramModel DSL**: Typed intermediate representation (`DiagramNode`, `DiagramEdge`, `DiagramContainer`) decouples AI output from XML serialisation. Enables structural validation, programmatic layout, and clean Qdrant indexing.
- **Cascade delete**: Deleting a cell removes all children (`parent="<id>"`) and all edges referencing it as source or target.
- **Shallow copy hazard**: `StateManager` explicitly creates new arrays when initialising/resetting state to avoid shared-reference bugs from object spread.
- **Notation registry**: Read-only, deterministic registry of notation definitions. Each notation provides shapes, style templates, colours, layout conventions, few-shot examples, and prompt rules. `resolveNotationFromShapeLibrary()` bridges the legacy `shapeLibrary` field to `NotationName`.

## draw.io XML Format

```xml
<mxfile>
  <diagram name="Page-1" id="page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>                    <!-- mandatory root -->
        <mxCell id="1" parent="0"/>         <!-- mandatory default parent -->
        <!-- AI-generated cells from id="2" onwards -->
        <mxCell id="2" value="Label" style="..." vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="3" style="..." edge="1" parent="1" source="2" target="4">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Conventions

- **Australian English** spelling throughout code and documentation
- **SOLID** principles — favour composition over inheritance
- Modular, open-source-ready structure
