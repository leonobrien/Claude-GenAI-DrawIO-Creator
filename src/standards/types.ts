/**
 * Client modelling standard types.
 *
 * A client owns one or more modelling standards (typically one per domain,
 * e.g. "software" using a UML subset and "business-architecture" using an
 * ArchiMate subset). A standard enumerates the element, connector and
 * container styles that may appear in a diagram produced for that client.
 */

import type { NotationName } from '../types/index.js';

export type StandardEnforcement = 'strict' | 'warn';

export type StandardElementKind = 'vertex' | 'edge' | 'container';

export interface ClientDefinition {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StandardSourceFile {
  /** Path relative to the client directory (e.g. "sources/archimate-palette.drawio"). */
  path: string;
  sha256: string;
}

export interface StandardSource {
  kind: 'manual' | 'generated';
  files?: StandardSourceFile[];
  generatedAt?: string;
}

export interface StandardElement {
  /** Element type name as used in the client's standard (e.g. "Application Component"). */
  name: string;
  kind: StandardElementKind;
  /** Canonical draw.io style string to use when generating this element. */
  style: string;
  /**
   * Normalised identity key derived from the style. Computed automatically
   * when omitted in a hand-written definition.
   */
  identity?: string;
  /**
   * Optional reference to a built-in notation shape, "<notation>:<shape name>"
   * (e.g. "archimate:Application Component"). When set and `style` is empty,
   * the style is resolved from the notation catalogue at load time.
   */
  ref?: string;
  aliases?: string[];
  category?: string;
  description?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  /** Set by the extractor when no meaningful name could be derived. */
  needsName?: boolean;
}

export interface StandardPalette {
  fills: string[];
  strokes: string[];
  fonts: string[];
  fontColours: string[];
}

export interface StandardRules {
  /** Colours used in a diagram must appear in the palette. */
  lockPalette?: boolean;
  /**
   * Presentational keys (fill, stroke, stroke width, font) must match the
   * canonical style of the matched element exactly.
   */
  lockElementStyle?: boolean;
  /** Allow free text cells (style starting with "text") even if not defined. */
  allowFreeText?: boolean;
}

export interface ModellingStandard {
  id: string;
  clientId: string;
  name: string;
  /** Domain the standard applies to (e.g. "software", "business-architecture"). */
  domain: string;
  description?: string;
  version: number;
  baseNotation: NotationName;
  enforcement: StandardEnforcement;
  source: StandardSource;
  elements: StandardElement[];
  connectors: StandardElement[];
  containers: StandardElement[];
  palette?: StandardPalette;
  rules?: StandardRules;
  /** Free-form guidance passed to the reasoning engine (Australian English). */
  promptRules?: string[];
  updatedAt?: string;
}

export interface StandardRef {
  clientId: string;
  standardId: string;
  version: number;
}

export interface StandardSummary {
  id: string;
  name: string;
  domain: string;
  version: number;
  baseNotation: NotationName;
  enforcement: StandardEnforcement;
  sourceKind: 'manual' | 'generated';
  elementCount: number;
  connectorCount: number;
  containerCount: number;
}
