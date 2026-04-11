/**
 * Core domain types for the draw.io skill.
 * These types define the internal DSL used between AI output parsing
 * and XML serialisation.
 */

export interface Point {
  x: number;
  y: number;
}

export type DiagramType =
  | 'infrastructure'
  | 'flowchart'
  | 'org_chart'
  | 'wireframe'
  | 'sequence'
  | 'generic';

export type NotationName = 'aws' | 'azure' | 'gcp' | 'cisco' | 'archimate' | 'uml' | 'bpmn' | 'fortinet' | 'infographic' | 'generic';

export interface NotationShape {
  name: string;
  style: string;
  defaultWidth: number;
  defaultHeight: number;
  category?: string;
}

export interface NotationStyleTemplates {
  vertex: string;
  edge: string;
  container: string;
  labelEdge?: string;
}

export interface NotationColourPalette {
  [role: string]: { fillColor: string; strokeColor: string };
}

export interface NotationLayoutConventions {
  preferredFlow: 'top-down' | 'left-right' | 'layered';
  usesContainers: boolean;
  suggestedGap?: number;
  hints: string[];
}

export interface NotationDefinition {
  name: NotationName;
  displayName: string;
  stencilPrefix: string;
  description: string;
  shapes: NotationShape[];
  styleTemplates: NotationStyleTemplates;
  colours: NotationColourPalette;
  layout: NotationLayoutConventions;
  fewShotExample: string;
  promptRules: string[];
}

export interface DiagramMetadata {
  title?: string;
  description?: string;
  diagramType?: DiagramType;
  shapeLibrary?: string;
  notation?: NotationName;
  sourceImage?: string;
  concern?: ConcernScope;
}

export interface ImageAnalysisOptions {
  /** User-specified notation — overrides automatic detection. */
  notation?: NotationName;
  /** Hint for expected diagram type (infrastructure, flowchart, etc.). */
  diagramType?: DiagramType;
  /** Additional context the user provides about the image. */
  additionalContext?: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  style: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;
}

export interface DiagramEdge {
  id: string;
  label?: string;
  source: string;
  target: string;
  style: string;
  waypoints?: Point[];
}

export interface DiagramContainer {
  id: string;
  label: string;
  style: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;
  collapsed?: boolean;
}

export interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  containers: DiagramContainer[];
  metadata: DiagramMetadata;
}

export interface DiagramOperation {
  operation: 'update' | 'add' | 'delete';
  cell_id: string;
  new_xml?: string;
}

export interface StoredModel {
  id: string;
  name: string;
  project: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  prompt: string;
  description: string;
  notation?: NotationName;
  concern?: string;
  relatedViews?: string[];
}

export interface VersionEntry {
  version: number;
  timestamp: string;
  description: string;
  xml: string;
}

export interface ProjectInfo {
  name: string;
  createdAt: string;
  description: string;
  updatedAt?: string;
  notation?: NotationName;
  defaultTags?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FixResult {
  xml: string;
  fixesApplied: string[];
  remainingErrors: string[];
}

export type ScopeClassification = 'primary' | 'context' | 'adjacent';

export interface ConcernScope {
  coreConcern: string;
  classifications?: Record<string, ScopeClassification>;
  adjacentConcerns?: string[];
}

export interface RecallResult {
  modelId: string;
  project: string;
  name: string;
  description: string;
  score: number;
}
