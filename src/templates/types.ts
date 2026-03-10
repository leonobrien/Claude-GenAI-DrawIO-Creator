/**
 * Template types for pre-built diagram patterns.
 */

import type { DiagramModel, NotationName, DiagramType } from '../types/index.js';

export type TemplateCategory = 'infrastructure' | 'process' | 'software' | 'network';

export interface TemplateParams {
  [key: string]: string;
}

export interface DiagramTemplate {
  /** Unique identifier (kebab-case). */
  name: string;
  /** Human-readable display name. */
  displayName: string;
  /** Short description of what the template produces. */
  description: string;
  /** Broad category for filtering. */
  category: TemplateCategory;
  /** Diagram type produced. */
  diagramType: DiagramType;
  /** Which notations this template is designed for. */
  notations: NotationName[];
  /** Tags for search/filtering. */
  tags: string[];
  /** Parameterisable label keys with default values. */
  defaultParams: TemplateParams;
  /** Builds a DiagramModel from the template, substituting params for defaults. */
  build(params?: TemplateParams): DiagramModel;
}
