#!/usr/bin/env node
/**
 * drawio-standards — manage client modelling standards.
 *
 * Usage:
 *   drawio-standards clients
 *   drawio-standards standards <client>
 *   drawio-standards show <client> <standard> [--styles]
 *   drawio-standards create-client <client> --name "<display name>" [--description "..."]
 *   drawio-standards extract <client> <standard> --domain <domain> [--name "..."]
 *        [--enforcement strict|warn] [--notation <notation>] [--lock-palette] [--lock-style]
 *        [--allow-text] [--dry-run] <file.drawio>...
 *   drawio-standards check <client> <standard>
 *   drawio-standards validate <client> <standard> <diagram.drawio>
 *   drawio-standards prompt <client> <standard> [--styles]
 *
 * Global options: --clients-dir <path>, --json
 */

/* eslint-disable security/detect-non-literal-fs-filename, security/detect-object-injection */

import { readFileSync, existsSync } from 'node:fs';
import { StandardStore, summarise } from '../standards/store.js';
import { extractStandardFromFiles } from '../standards/extractor.js';
import { validateStandardDefinition } from '../standards/definition.js';
import { validateStandardConformance, formatConformanceReport } from '../standards/validator.js';
import { buildStandardPrompt } from '../standards/prompt.js';
import { isValidNotation } from '../notation/registry.js';
import type { NotationName } from '../types/index.js';
import type { ModellingStandard, StandardEnforcement } from '../standards/types.js';

interface Args {
  positional: string[];
  flags: Record<string, string | boolean>;
}

const BOOLEAN_FLAGS = new Set(['json', 'dry-run', 'styles', 'lock-palette', 'lock-style', 'allow-text', 'help']);

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (BOOLEAN_FLAGS.has(key)) flags[key] = true;
      else flags[key] = argv[++i] ?? '';
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function out(json: boolean, data: unknown, text: string): void {
  process.stdout.write(`${json ? JSON.stringify(data, null, 2) : text}\n`);
}

function table(rows: string[][]): string {
  if (rows.length === 0) return '';
  const widths = rows[0].map((_, c) => Math.max(...rows.map(r => (r[c] ?? '').length)));
  return rows.map(r => r.map((cell, c) => cell.padEnd(widths[c])).join('  ').trimEnd()).join('\n');
}

function fail(msg: string, code = 2): never {
  process.stderr.write(`drawio-standards: ${msg}\n`);
  process.exit(code);
}

function need(args: Args, n: number, usage: string): void {
  if (args.positional.length < n) fail(`usage: drawio-standards ${usage}`);
}

function showStandard(s: ModellingStandard, styles: boolean): string {
  const lines = [
    `${s.name}  (${s.clientId}/${s.id} v${s.version})`,
    `Domain: ${s.domain} · Base notation: ${s.baseNotation} · Enforcement: ${s.enforcement} · Source: ${s.source.kind}`,
  ];
  if (s.source.files?.length) lines.push(`Source files: ${s.source.files.map(f => f.path).join(', ')}${s.source.generatedAt ? ` (generated ${s.source.generatedAt.slice(0, 10)})` : ''}`);
  const r = s.rules ?? {};
  lines.push(`Rules: lockPalette=${!!r.lockPalette} lockElementStyle=${!!r.lockElementStyle} allowFreeText=${!!r.allowFreeText}`);
  for (const [title, list] of [['Elements', s.elements], ['Containers', s.containers], ['Connectors', s.connectors]] as const) {
    lines.push('', `${title} (${list.length})`);
    for (const e of list) {
      lines.push(`  - ${e.name}${e.needsName ? '  ⚠ needs name' : ''}${e.aliases?.length ? `  [aka ${e.aliases.join(', ')}]` : ''}`);
      if (styles) lines.push(`      ${e.style}`);
    }
  }
  if (s.palette) {
    lines.push('', `Palette fills: ${s.palette.fills.join(', ') || '-'}`, `Palette strokes: ${s.palette.strokes.join(', ') || '-'}`, `Fonts: ${s.palette.fonts.join(', ') || '-'}`);
  }
  return lines.join('\n');
}

export function main(argv: string[]): void {
  const args = parseArgs(argv);
  const [cmd, ...rest] = args.positional;
  args.positional = rest;
  const json = args.flags.json === true;
  const store = new StandardStore(typeof args.flags['clients-dir'] === 'string' ? (args.flags['clients-dir'] as string) : undefined);

  switch (cmd) {
    case 'clients': {
      const clients = store.listClients().map(c => ({ ...c, standards: store.listStandards(c.id).map(s => s.id) }));
      out(json, { clientsDir: store.root, clients }, clients.length === 0
        ? `No clients configured in ${store.root}`
        : `Clients (${store.root})\n\n${table([['ID', 'NAME', 'STANDARDS'], ...clients.map(c => [c.id, c.name, c.standards.join(', ') || '-'])])}`);
      return;
    }
    case 'standards': {
      need(args, 1, 'standards <client>');
      const client = store.findClient(args.positional[0]) ?? fail(`unknown client "${args.positional[0]}" — run "drawio-standards clients"`);
      const list = store.listStandards(client.id);
      out(json, { client, standards: list }, list.length === 0
        ? `Client "${client.name}" has no standards configured.`
        : `Standards for ${client.name} (${client.id})\n\n${table([['ID', 'NAME', 'DOMAIN', 'NOTATION', 'ENFORCE', 'VER', 'SOURCE', 'EL/CONN/CONT'],
          ...list.map(s => [s.id, s.name, s.domain, s.baseNotation, s.enforcement, String(s.version), s.sourceKind, `${s.elementCount}/${s.connectorCount}/${s.containerCount}`])])}`);
      return;
    }
    case 'show': {
      need(args, 2, 'show <client> <standard>');
      const client = store.findClient(args.positional[0]) ?? fail(`unknown client "${args.positional[0]}"`);
      const s = store.loadStandard(client.id, args.positional[1]);
      out(json, s, showStandard(s, args.flags.styles === true));
      return;
    }
    case 'prompt': {
      need(args, 2, 'prompt <client> <standard>');
      const client = store.findClient(args.positional[0]) ?? fail(`unknown client "${args.positional[0]}"`);
      const s = store.loadStandard(client.id, args.positional[1]);
      out(false, null, buildStandardPrompt(s, { includeStyles: args.flags.styles === true }));
      return;
    }
    case 'create-client': {
      need(args, 1, 'create-client <client> --name "<display name>"');
      const c = store.createClient({
        id: args.positional[0],
        name: typeof args.flags.name === 'string' ? args.flags.name : args.positional[0],
        description: typeof args.flags.description === 'string' ? args.flags.description : undefined,
      });
      out(json, c, `Created client "${c.name}" (${c.id}) in ${store.clientDir(c.id)}`);
      return;
    }
    case 'extract': {
      need(args, 3, 'extract <client> <standard> --domain <domain> <file.drawio>...');
      const [clientId, standardId, ...files] = args.positional;
      if (typeof args.flags.domain !== 'string') fail('--domain is required');
      for (const f of files) if (!existsSync(f)) fail(`file not found: ${f}`);
      const enforcement = (args.flags.enforcement ?? 'strict') as StandardEnforcement;
      if (enforcement !== 'strict' && enforcement !== 'warn') fail('--enforcement must be strict or warn');
      const notation = args.flags.notation;
      if (notation !== undefined && (typeof notation !== 'string' || !isValidNotation(notation))) fail(`unknown notation "${String(notation)}"`);
      const existingClient = store.findClient(clientId);
      const resolvedClientId = existingClient?.id ?? clientId;
      const report = extractStandardFromFiles(files, {
        clientId: resolvedClientId,
        standardId,
        domain: args.flags.domain,
        enforcement,
        name: typeof args.flags.name === 'string' ? args.flags.name : undefined,
        description: typeof args.flags.description === 'string' ? args.flags.description : undefined,
        ...(notation ? { baseNotation: notation as NotationName } : {}),
        rules: {
          lockPalette: args.flags['lock-palette'] === true,
          lockElementStyle: args.flags['lock-style'] === true,
          allowFreeText: args.flags['allow-text'] === true,
        },
      });
      let standard = report.standard;
      const dryRun = args.flags['dry-run'] === true;
      if (!dryRun) {
        store.ensureClient({ id: resolvedClientId, name: typeof args.flags['client-name'] === 'string' ? args.flags['client-name'] : undefined });
        store.copySources(resolvedClientId, files);
        standard = store.saveStandard(standard);
      }
      const summary = {
        dryRun,
        standard: summarise(standard),
        notationBreakdown: report.notationBreakdown,
        pagesScanned: report.pagesScanned,
        cellsScanned: report.cellsScanned,
        needsName: report.needsName.map(e => ({ kind: e.kind, name: e.name, style: e.style })),
        palette: standard.palette,
      };
      out(json, json ? { ...summary, definition: standard } : summary, [
        `${dryRun ? '[dry run] ' : ''}Extracted ${standard.clientId}/${standard.id} v${standard.version} from ${files.length} file(s), ${report.pagesScanned} page(s), ${report.cellsScanned} cell(s)`,
        `Base notation: ${standard.baseNotation} (stencil families: ${JSON.stringify(report.notationBreakdown)})`,
        '',
        showStandard(standard, false),
        '',
        report.needsName.length ? `⚠ ${report.needsName.length} item(s) need a meaningful name — edit the standard JSON then run "check".` : 'All items named.',
        dryRun ? '' : `Saved to ${store.clientDir(standard.clientId)}/standards/${standard.id}.json`,
      ].join('\n'));
      return;
    }
    case 'check': {
      need(args, 2, 'check <client> <standard>');
      const client = store.findClient(args.positional[0]) ?? fail(`unknown client "${args.positional[0]}"`);
      const result = validateStandardDefinition({ clientId: client.id, id: args.positional[1], ...(store.readRawStandard(client.id, args.positional[1]) as object) });
      out(json, result, [
        result.valid ? 'Definition is valid.' : 'Definition is INVALID.',
        ...result.errors.map(e => `  error: ${e}`),
        ...result.warnings.map(w => `  warning: ${w}`),
      ].join('\n'));
      if (!result.valid) process.exit(1);
      return;
    }
    case 'validate': {
      need(args, 3, 'validate <client> <standard> <diagram.drawio>');
      const client = store.findClient(args.positional[0]) ?? fail(`unknown client "${args.positional[0]}"`);
      const s = store.loadStandard(client.id, args.positional[1]);
      const xml = readFileSync(args.positional[2], 'utf-8');
      const result = validateStandardConformance(xml, s);
      out(json, result, formatConformanceReport(result));
      if (!result.valid) process.exit(1);
      return;
    }
    default:
      process.stdout.write(`drawio-standards — manage client modelling standards

Commands:
  clients                                   List configured clients and their standards
  standards <client>                        List standards for a client
  show <client> <standard> [--styles]       Show a standard's allowed elements
  prompt <client> <standard> [--styles]     Print the standard as reasoning-engine guidance
  create-client <client> --name "<name>"    Create a client
  extract <client> <standard> --domain <d> [--name ..] [--enforcement strict|warn]
          [--notation <n>] [--lock-palette] [--lock-style] [--allow-text] [--dry-run] <files...>
                                            Generate a standard from source .drawio files
  check <client> <standard>                 Validate a (hand-edited) standard definition
  validate <client> <standard> <file>       Check a diagram conforms to a standard

Options: --clients-dir <path> (default $MODELLING_CLIENTS_DIR, $MODELLING_AGENT_HOME/clients, ./clients), --json
`);
      if (cmd && cmd !== 'help' && args.flags.help !== true) process.exit(2);
  }
}

try {
  main(process.argv.slice(2));
} catch (err) {
  fail(err instanceof Error ? err.message : String(err), 1);
}
