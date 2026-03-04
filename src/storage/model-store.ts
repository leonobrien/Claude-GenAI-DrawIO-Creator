/**
 * ModelStore -- CRUD operations for diagram models.
 *
 * Each model is stored as a JSON file with a UUID, belonging to a project namespace.
 * The storage root defaults to .drawio-skill/ in the current working directory.
 */

import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { StoredModel } from '../types/index.js';

export class ModelStore {
  private readonly storageRoot: string;

  constructor(storageRoot: string) {
    this.storageRoot = storageRoot;
  }

  private modelsDir(project: string): string {
    return join(this.storageRoot, 'projects', project, 'models');
  }

  private modelPath(project: string, id: string): string {
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
    return JSON.parse(content) as StoredModel;
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
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const models: StoredModel[] = [];
    for (const file of jsonFiles) {
      const content = await readFile(join(dir, file), 'utf-8');
      models.push(JSON.parse(content) as StoredModel);
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
