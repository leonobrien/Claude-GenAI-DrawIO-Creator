/**
 * Terminal preview test: Render all templates as terminal previews.
 *
 * Outputs each template's preview to stdout and saves to resources/
 * as .txt files for review.
 */

import { listTemplates, renderPreview } from '../src/index.js';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('./resources', { recursive: true });

for (const template of listTemplates()) {
  const model = template.build();
  const preview = renderPreview(model, { width: 100, height: 30 });

  console.log(`\n${'='.repeat(100)}`);
  console.log(`Template: ${template.displayName}`);
  console.log('='.repeat(100));
  console.log(preview);

  const filename = `preview-${template.name}.txt`;
  writeFileSync(`./resources/${filename}`, preview, 'utf-8');
}

console.log(`\nGenerated ${listTemplates().length} preview files to resources/`);
