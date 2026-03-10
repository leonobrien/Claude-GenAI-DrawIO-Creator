/**
 * Template registry — lookup, listing, and filtering for diagram templates.
 */

import type { DiagramTemplate, TemplateCategory } from './types.js';
import type { NotationName } from '../types/index.js';
import { threeTierWebApp } from './three-tier-web-app.js';
import { microservices } from './microservices.js';
import { cicdPipeline } from './cicd-pipeline.js';
import { hubSpokeNetwork } from './hub-spoke-network.js';
import { bpmnOrderFulfilment } from './bpmn-order-fulfilment.js';
import { umlClassDiagram } from './uml-class-diagram.js';
import { archimateLayered } from './archimate-layered.js';
import { serverless } from './serverless.js';

const TEMPLATES: ReadonlyMap<string, DiagramTemplate> = new Map([
  [threeTierWebApp.name, threeTierWebApp],
  [microservices.name, microservices],
  [cicdPipeline.name, cicdPipeline],
  [hubSpokeNetwork.name, hubSpokeNetwork],
  [bpmnOrderFulfilment.name, bpmnOrderFulfilment],
  [umlClassDiagram.name, umlClassDiagram],
  [archimateLayered.name, archimateLayered],
  [serverless.name, serverless],
]);

/** Returns a template by exact name, or undefined. */
export function getTemplate(name: string): DiagramTemplate | undefined {
  return TEMPLATES.get(name);
}

/** Returns all registered templates. */
export function listTemplates(): DiagramTemplate[] {
  return [...TEMPLATES.values()];
}

/** Filters templates by notation. */
export function listTemplatesByNotation(notation: NotationName): DiagramTemplate[] {
  return listTemplates().filter(t => t.notations.includes(notation));
}

/** Filters templates by category. */
export function listTemplatesByCategory(category: TemplateCategory): DiagramTemplate[] {
  return listTemplates().filter(t => t.category === category);
}

/** Searches templates by tag (any match). */
export function searchTemplates(query: string): DiagramTemplate[] {
  const q = query.toLowerCase();
  return listTemplates().filter(t =>
    t.name.includes(q) ||
    t.displayName.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q)),
  );
}
