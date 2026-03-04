/**
 * DiagramIndexer -- Extracts indexable metadata from diagram models.
 *
 * Produces a text representation suitable for embedding, combining
 * the prompt, description, node labels, and edge relationships.
 */

import type { StoredModel } from '../types/index.js';

export interface IndexablePayload {
  model_id: string;
  project: string;
  name: string;
  prompt: string;
  description: string;
  labels: string[];
  edges: string[];
  tags: string[];
  created_at: string;
  version: number;
}

/**
 * Extracts vertex labels from draw.io XML.
 */
function extractLabelsFromXml(xml: string): string[] {
  const labels: string[] = [];
  const pattern = /<mxCell[^>]*\svalue="([^"]*)"[^>]*\svertex="1"[^>]*/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    if (match[1].trim()) {
      labels.push(match[1].trim());
    }
  }

  // Also match vertex before value
  const pattern2 = /<mxCell[^>]*\svertex="1"[^>]*\svalue="([^"]*)"[^>]*/g;
  while ((match = pattern2.exec(xml)) !== null) {
    if (match[1].trim() && !labels.includes(match[1].trim())) {
      labels.push(match[1].trim());
    }
  }

  return labels;
}

/**
 * Extracts edge relationships from draw.io XML as "source_label -> target_label" strings.
 */
function extractEdgeRelationshipsFromXml(xml: string): string[] {
  // Build ID -> label map
  const idToLabel = new Map<string, string>();
  const labelPattern = /<mxCell[^>]*\sid="([^"]+)"[^>]*\svalue="([^"]*)"[^>]*/g;

  let match: RegExpExecArray | null;
  while ((match = labelPattern.exec(xml)) !== null) {
    idToLabel.set(match[1], match[2]);
  }

  // Extract edges
  const relationships: string[] = [];
  const edgePattern = /<mxCell[^>]*\sedge="1"[^>]*\ssource="([^"]+)"[^>]*\starget="([^"]+)"[^>]*/g;

  while ((match = edgePattern.exec(xml)) !== null) {
    const sourceLabel = idToLabel.get(match[1]) ?? match[1];
    const targetLabel = idToLabel.get(match[2]) ?? match[2];
    relationships.push(`${sourceLabel} -> ${targetLabel}`);
  }

  return relationships;
}

/**
 * Builds an indexable payload from a stored model and its XML.
 */
export function buildIndexPayload(
  model: StoredModel,
  xml: string,
): IndexablePayload {
  return {
    model_id: model.id,
    project: model.project,
    name: model.name,
    prompt: model.prompt,
    description: model.description,
    labels: extractLabelsFromXml(xml),
    edges: extractEdgeRelationshipsFromXml(xml),
    tags: model.tags,
    created_at: model.createdAt,
    version: model.currentVersion,
  };
}

/**
 * Converts an indexable payload into a single text string for embedding.
 * Combines all searchable fields into a coherent text representation.
 */
export function payloadToEmbeddingText(payload: IndexablePayload): string {
  const parts: string[] = [];

  if (payload.name) {
    parts.push(`Diagram: ${payload.name}`);
  }
  if (payload.prompt) {
    parts.push(`Prompt: ${payload.prompt}`);
  }
  if (payload.description) {
    parts.push(`Description: ${payload.description}`);
  }
  if (payload.labels.length > 0) {
    parts.push(`Components: ${payload.labels.join(', ')}`);
  }
  if (payload.edges.length > 0) {
    parts.push(`Relationships: ${payload.edges.join('; ')}`);
  }
  if (payload.tags.length > 0) {
    parts.push(`Tags: ${payload.tags.join(', ')}`);
  }

  return parts.join('\n');
}
