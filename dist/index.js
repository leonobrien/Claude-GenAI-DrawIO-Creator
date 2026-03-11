/**
 * drawio-skill -- Claude Code skill for draw.io diagram generation.
 *
 * Public API surface:
 * - generateModel(project, prompt) -- Generate a new diagram
 * - reviseModel(modelId, instructions) -- Modify an existing diagram
 * - recallModel(query) -- Search for similar historical diagrams
 * - exportToDrawIO(modelId, outputPath) -- Export to .drawio file
 */
export { buildDiagramXml, buildNodeXml, buildEdgeXml, buildContainerXml } from './generator/xml-builder.js';
export { wrapWithMxFile, unwrapMxFile } from './generator/xml-wrapper.js';
export { buildSystemPrompt, buildRevisionPrompt } from './generator/prompt-builder.js';
export { buildImageAnalysisPrompt, buildNotationDetectionGuide } from './generator/image-analyser.js';
export { validateLayout, applyConstraints, getCentre } from './generator/layout-engine.js';
export { applyOperations } from './generator/operations.js';
export { validateXml } from './parser/xml-validator.js';
export { fixXml } from './parser/xml-fixer.js';
export { validateAndFixXml } from './parser/index.js';
export { validateSemantics, validateEdgeReferences, validateExpectedLabels, validateNotationConformance } from './parser/semantic-validator.js';
export { isMxCellXmlComplete, extractCompleteMxCells } from './parser/completion-checker.js';
export { validateShapeRenderable, extractStencilRef } from './parser/shape-validator.js';
export { ModelStore } from './storage/model-store.js';
export { VersionManager } from './storage/version-manager.js';
export { ProjectManager } from './storage/project-manager.js';
export { ExportManager } from './storage/export-manager.js';
export { QdrantClient } from './vector/qdrant-client.js';
export { RecallEngine } from './vector/recall-engine.js';
export { StubEmbeddingProvider } from './vector/embedding-provider.js';
export { buildIndexPayload, payloadToEmbeddingText } from './vector/diagram-indexer.js';
export { getNotation, findNotation, listNotations, isValidNotation, resolveNotationFromShapeLibrary, resolveShape, genericNotation, awsNotation, azureNotation, gcpNotation, ciscoNotation, archimateNotation, umlNotation, bpmnNotation, } from './notation/index.js';
export { StateManager } from './state/state-manager.js';
export { CharGrid, BOX, ARROW, renderPreview } from './preview/index.js';
export { getTemplate, listTemplates, listTemplatesByNotation, listTemplatesByCategory, searchTemplates, threeTierWebApp, microservices, cicdPipeline, hubSpokeNetwork, bpmnOrderFulfilment, umlClassDiagram, archimateLayered, serverless, } from './templates/index.js';
//# sourceMappingURL=index.js.map