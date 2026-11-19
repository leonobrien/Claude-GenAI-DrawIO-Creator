/**
 * StandardStore — File-based storage for clients and their modelling standards.
 *
 * Layout:
 *   <clientsDir>/<client-id>/client.json
 *   <clientsDir>/<client-id>/standards/<standard-id>.json
 *   <clientsDir>/<client-id>/standards/.history/<standard-id>.v<n>.json
 *   <clientsDir>/<client-id>/sources/*.drawio
 *
 * The clients directory resolves to (first match):
 *   1. explicit `clientsDir` argument
 *   2. $MODELLING_CLIENTS_DIR
 *   3. $MODELLING_AGENT_HOME/clients
 *   4. ./clients
 */

// All paths are built from assertSafeId-validated segments under the clients root.
/* eslint-disable security/detect-non-literal-fs-filename, secure-coding/no-unsafe-deserialization, secure-coding/no-unlimited-resource-allocation */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { normaliseStandard } from './definition.js';
import type { ClientDefinition, ModellingStandard, StandardRef, StandardSummary } from './types.js';

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const MAX_ITEMS = 500;

function assertSafeId(value: string, label: string): void {
  if (!SAFE_ID.test(value)) throw new Error(`Invalid ${label} "${value}": must match ${SAFE_ID.source}`);
}

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch (err) {
    throw new Error(`Failed to read ${path}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function getClientsDir(clientsDir?: string): string {
  if (clientsDir) return resolve(clientsDir);
  if (process.env.MODELLING_CLIENTS_DIR) return resolve(process.env.MODELLING_CLIENTS_DIR);
  if (process.env.MODELLING_AGENT_HOME) return resolve(process.env.MODELLING_AGENT_HOME, 'clients');
  return resolve('clients');
}

export class StandardStore {
  readonly root: string;

  constructor(clientsDir?: string) {
    this.root = getClientsDir(clientsDir);
  }

  clientDir(clientId: string): string {
    assertSafeId(clientId, 'client id');
    return join(this.root, clientId);
  }

  private standardsDir(clientId: string): string {
    return join(this.clientDir(clientId), 'standards');
  }

  private standardPath(clientId: string, standardId: string): string {
    assertSafeId(standardId, 'standard id');
    return join(this.standardsDir(clientId), `${standardId}.json`);
  }

  listClients(): ClientDefinition[] {
    if (!existsSync(this.root)) return [];
    return readdirSync(this.root, { withFileTypes: true })
      .filter(d => d.isDirectory() && SAFE_ID.test(d.name) && existsSync(join(this.root, d.name, 'client.json')))
      .slice(0, MAX_ITEMS)
      .map(d => this.getClient(d.name) as ClientDefinition)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getClient(clientId: string): ClientDefinition | null {
    const p = join(this.clientDir(clientId), 'client.json');
    if (!existsSync(p)) return null;
    const c = readJson<ClientDefinition>(p);
    return { ...c, id: clientId };
  }

  /** Case-insensitive lookup by id or display name. */
  findClient(query: string): ClientDefinition | null {
    const q = query.trim().toLowerCase();
    const all = this.listClients();
    return all.find(c => c.id.toLowerCase() === q) ?? all.find(c => c.name.toLowerCase() === q) ?? null;
  }

  createClient(def: { id: string; name: string; description?: string }): ClientDefinition {
    const dir = this.clientDir(def.id);
    const p = join(dir, 'client.json');
    if (existsSync(p)) throw new Error(`Client "${def.id}" already exists`);
    mkdirSync(join(dir, 'standards'), { recursive: true });
    mkdirSync(join(dir, 'sources'), { recursive: true });
    const now = new Date().toISOString();
    const client: ClientDefinition = { id: def.id, name: def.name, ...(def.description ? { description: def.description } : {}), createdAt: now, updatedAt: now };
    writeFileSync(p, `${JSON.stringify(client, null, 2)}\n`, 'utf-8');
    return client;
  }

  ensureClient(def: { id: string; name?: string; description?: string }): ClientDefinition {
    return this.getClient(def.id) ?? this.createClient({ id: def.id, name: def.name ?? def.id, description: def.description });
  }

  listStandards(clientId: string): StandardSummary[] {
    const dir = this.standardsDir(clientId);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .slice(0, MAX_ITEMS)
      .map(f => this.loadStandard(clientId, f.replace(/\.json$/, '')))
      .map(summarise)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  hasStandard(clientId: string, standardId: string): boolean {
    return existsSync(this.standardPath(clientId, standardId));
  }

  /** Loads and normalises a standard. Throws if missing or invalid. */
  loadStandard(clientId: string, standardId: string): ModellingStandard {
    const p = this.standardPath(clientId, standardId);
    if (!existsSync(p)) throw new Error(`Standard "${standardId}" not found for client "${clientId}"`);
    const raw = readJson<Record<string, unknown>>(p);
    return normaliseStandard({ clientId, id: standardId, ...raw });
  }

  /** Reads the raw JSON without normalisation (for validation of hand-edited files). */
  readRawStandard(clientId: string, standardId: string): unknown {
    return readJson<unknown>(this.standardPath(clientId, standardId));
  }

  /**
   * Saves a standard. If one already exists, the previous file is archived to
   * `.history/` and the version is incremented.
   */
  saveStandard(standard: ModellingStandard): ModellingStandard {
    const validated = normaliseStandard(standard);
    this.ensureClient({ id: validated.clientId });
    const dir = this.standardsDir(validated.clientId);
    mkdirSync(dir, { recursive: true });
    const p = this.standardPath(validated.clientId, validated.id);
    let version = validated.version;
    if (existsSync(p)) {
      const previous = readJson<ModellingStandard>(p);
      const prevVersion = previous.version ?? 1;
      const historyDir = join(dir, '.history');
      mkdirSync(historyDir, { recursive: true });
      writeFileSync(join(historyDir, `${validated.id}.v${prevVersion}.json`), `${JSON.stringify(previous, null, 2)}\n`, 'utf-8');
      version = Math.max(version, prevVersion + 1);
    }
    const saved: ModellingStandard = { ...validated, version, updatedAt: new Date().toISOString() };
    writeFileSync(p, `${JSON.stringify(saved, null, 2)}\n`, 'utf-8');
    return saved;
  }

  /** Copies source .drawio files into the client's sources/ directory. Returns the recorded relative paths. */
  copySources(clientId: string, files: string[]): string[] {
    const dir = join(this.clientDir(clientId), 'sources');
    mkdirSync(dir, { recursive: true });
    return files.map(f => {
      const name = basename(f);
      const dest = join(dir, name);
      if (resolve(f) !== resolve(dest)) copyFileSync(f, dest);
      return `sources/${name}`;
    });
  }

  refFor(standard: ModellingStandard): StandardRef {
    return { clientId: standard.clientId, standardId: standard.id, version: standard.version };
  }
}

export function summarise(s: ModellingStandard): StandardSummary {
  return {
    id: s.id,
    name: s.name,
    domain: s.domain,
    version: s.version,
    baseNotation: s.baseNotation,
    enforcement: s.enforcement,
    sourceKind: s.source.kind,
    elementCount: s.elements.length,
    connectorCount: s.connectors.length,
    containerCount: s.containers.length,
  };
}
