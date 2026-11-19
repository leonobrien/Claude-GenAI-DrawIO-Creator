/**
 * Builds a compact textual description of a modelling standard for the
 * reasoning engine (Claude Code) to plan a diagram with.
 */

import type { ModellingStandard, StandardElement } from './types.js';

export interface StandardPromptOptions {
  /** Include full style strings (default false — names only). */
  includeStyles?: boolean;
}

export function buildStandardPrompt(standard: ModellingStandard, opts: StandardPromptOptions = {}): string {
  const list = (title: string, items: StandardElement[]) => {
    if (items.length === 0) return [`${title}: (none)`];
    return [
      `${title} (${items.length}):`,
      ...items.map(e => {
        const extras = [e.category, e.aliases?.length ? `aka ${e.aliases.join(', ')}` : ''].filter(Boolean).join('; ');
        return `  - ${e.name}${extras ? ` [${extras}]` : ''}${opts.includeStyles ? `\n      style: ${e.style}` : ''}`;
      }),
    ];
  };

  const rules = standard.rules ?? {};
  const lines = [
    `CLIENT MODELLING STANDARD: ${standard.name} (${standard.clientId}/${standard.id} v${standard.version})`,
    `Domain: ${standard.domain} · Base notation: ${standard.baseNotation} · Enforcement: ${standard.enforcement}`,
    '',
    'Only the following may appear in the diagram. Use each item\'s style exactly.',
    ...list('Elements', standard.elements),
    ...list('Containers', standard.containers),
    ...list('Connectors', standard.connectors),
    '',
    'Rules:',
    `  - Colours ${rules.lockPalette ? 'MUST come from the standard palette' : 'may vary from the palette'}.`,
    `  - Element presentation (fill/stroke/font) ${rules.lockElementStyle ? 'MUST match the standard style exactly' : 'may be adjusted'}.`,
    `  - Free text annotations are ${rules.allowFreeText ? 'allowed' : 'only allowed if defined as an element'}.`,
    '  - If a concept has no matching element, do not invent a shape — map to the closest allowed element and confirm with the user.',
    ...(standard.promptRules ?? []).map(r => `  - ${r}`),
  ];
  if (standard.palette) {
    lines.push('', `Palette fills: ${standard.palette.fills.join(', ') || '(none)'}`, `Palette strokes: ${standard.palette.strokes.join(', ') || '(none)'}`);
  }
  return lines.join('\n');
}
