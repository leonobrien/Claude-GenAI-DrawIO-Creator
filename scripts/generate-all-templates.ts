/**
 * Template library test: Generate all 8 templates to resources/ folder.
 *
 * Builds each template with default params, validates XML and shapes,
 * then exports as .drawio files.
 */

import {
  listTemplates,
  buildDiagramXml,
  wrapWithMxFile,
  validateAndFixXml,
  validateShapeRenderable,
} from '../src/index.js';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('./resources', { recursive: true });

let passed = 0;
let failed = 0;

for (const template of listTemplates()) {
  const model = template.build();
  const bareCells = buildDiagramXml(model);
  const xml = wrapWithMxFile(bareCells, template.displayName);
  const result = validateAndFixXml(xml);
  const shapeResult = validateShapeRenderable(result.finalXml);

  const xmlValid = result.validation.valid;
  const shapesValid = shapeResult.valid;

  const filename = `template-${template.name}.drawio`;
  const exportPath = `./resources/${filename}`;
  writeFileSync(exportPath, result.finalXml, 'utf-8');

  const status = xmlValid && shapesValid ? 'PASS' : 'FAIL';
  if (xmlValid && shapesValid) passed++; else failed++;

  console.log(`[${status}] ${template.displayName}`);
  console.log(`  Nodes: ${model.nodes.length}, Containers: ${model.containers.length}, Edges: ${model.edges.length}`);
  console.log(`  Stencils checked: ${shapeResult.checkedCount}, Issues: ${shapeResult.issues.length}`);
  console.log(`  Exported: ${exportPath}`);

  if (shapeResult.issues.length > 0) {
    for (const issue of shapeResult.issues) {
      console.warn(`  [${issue.severity}] ${issue.message}`);
    }
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} templates`);
if (failed > 0) process.exit(1);
