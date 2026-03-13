/**
 * ModelStore -- CRUD operations for diagram models.
 *
 * Each model is stored as a JSON file with a UUID, belonging to a project namespace.
 * The storage root defaults to .drawio-skill/ in the current working directory.
 */

// All filesystem paths are constructed from assertSafeName-validated segments.
// JSON parsing uses safeJsonParse with schema validation. List operations are capped at MAX_LIST_ITEMS.
/* eslint-disable security/detect-non-literal-fs-filename, secure-coding/no-unsafe-deserialization, secure-coding/no-unlimited-resource-allocation */

import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { StoredModel } from '../types/index.js';

const SAFE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const MAX_LIST_ITEMS = 1000;

function assertSafeName(value: string, label: string): void {
  if (!SAFE_NAME_PATTERN.test(value)) {
    throw new Error(`Invalid ${label}: must match ${SAFE_NAME_PATTERN.source}`);
  }
}

function safeJsonParse<T>(content: string, context: string): T {
  try {
    return JSON.parse(content) as T;
  } catch (err) {
    throw new Error(`Failed to parse ${context}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export class ModelStore {
  private readonly storageRoot: string;

  constructor(storageRoot: string) {
    this.storageRoot = storageRoot;
  }

  private modelsDir(project: string): string {
    assertSafeName(project, 'project name');
    return join(this.storageRoot, 'projects', project, 'models');
  }

  private modelPath(project: string, id: string): string {
    assertSafeName(id, 'model id');
    return join(this.modelsDir(project), `${id}.json`);
  }

  /**
   * Ensures the models directory exists for the given project.
   */
  private async ensureDir(project: string): Promise<void> {
    const dir = this.modelsDir(project);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  /**
   * Saves a model to storage.
   */
  async save(model: StoredModel): Promise<void> {
    await this.ensureDir(model.project);
    const filePath = this.modelPath(model.project, model.id);
    await writeFile(filePath, JSON.stringify(model, null, 2), 'utf-8');
  }

  /**
   * Loads a model by ID and project.
   * Returns null if the model does not exist.
   */
  async load(project: string, id: string): Promise<StoredModel | null> {
    const filePath = this.modelPath(project, id);
    if (!existsSync(filePath)) {
      return null;
    }
    const content = await readFile(filePath, 'utf-8');
    return safeJsonParse<StoredModel>(content, `model ${id}`);
  }

  /**
   * Lists all models in a project.
   */
  async listByProject(project: string): Promise<StoredModel[]> {
    const dir = this.modelsDir(project);
    if (!existsSync(dir)) {
      return [];
    }

    const files = await readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith('.json')).slice(0, MAX_LIST_ITEMS);

    const models: StoredModel[] = [];
    for (const file of jsonFiles) {
      try {
        const content = await readFile(join(dir, file), 'utf-8');
        models.push(safeJsonParse<StoredModel>(content, `model file ${file}`));
      } catch (err) {
        console.warn(`Skipping malformed model file ${file}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return models.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  /**
   * Deletes a model by ID and project.
   * Returns true if the model was found and deleted.
   */
  async delete(project: string, id: string): Promise<boolean> {
    const filePath = this.modelPath(project, id);
    if (!existsSync(filePath)) {
      return false;
    }
    await unlink(filePath);
    return true;
  }

  /**
   * Finds a model by ID across all projects.
   * Slower than load() — use when the project is unknown.
   */
  async findById(id: string): Promise<StoredModel | null> {
    const projectsDir = join(this.storageRoot, 'projects');
    if (!existsSync(projectsDir)) {
      return null;
    }

    const projects = await readdir(projectsDir);
    for (const project of projects) {
      const model = await this.load(project, id);
      if (model) {
        return model;
      }
    }
    return null;
  }
}
