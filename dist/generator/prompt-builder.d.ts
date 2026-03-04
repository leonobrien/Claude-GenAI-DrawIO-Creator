/**
 * PromptBuilder -- Constructs the system prompt for draw.io XML generation.
 *
 * Implements the prompt engineering strategy from the research paper:
 * 1. Role definition
 * 2. Output format rules (bare mxCell only)
 * 3. Edge routing constraints (7 rules)
 * 4. Layout guidelines
 * 5. Few-shot example
 * 6. Notation-specific section (shapes, rules, layout hints)
 * 7. Current diagram context (for revision)
 */
import type { NotationName } from '../types/index.js';
/**
 * Builds the full system prompt for diagram generation.
 *
 * @param notation - Optional notation name. When provided, injects notation-specific
 *   shapes, rules, layout hints, and few-shot example. Defaults to generic notation.
 */
export declare function buildSystemPrompt(notation?: NotationName): string;
/**
 * Builds the system prompt with current diagram context for revision.
 *
 * @param currentXml - The existing diagram XML that the AI should modify
 * @param notation - Optional notation name for notation-aware revision
 */
export declare function buildRevisionPrompt(currentXml: string, notation?: NotationName): string;
//# sourceMappingURL=prompt-builder.d.ts.map