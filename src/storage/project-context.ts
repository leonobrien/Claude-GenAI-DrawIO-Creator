/**
 * ProjectContext -- Facade for multi-model project workflows.
 *
 * Reduces ~30 lines of storage boilerplate to ~8 lines and adds
 * name-based model lookup with upsert semantics.
 */

// All filesystem paths are constructed from validated segments by underlying managers.
/* eslint-disable security/detect-non-literal-fs-filename */

import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { StoredModel, NotationName, ModelStandardRef } from '../types/index.js';
import { ModelStore } from './model-store.js';
import { VersionManager } from './version-manager.js';
import { ProjectManager } from './project-manager.js';
import { ExportManager } from './export-manager.js';

export interface ProjectContextOptions {
  storageRoot: string;
  projectId: string;
  description?: string;
  notation?: NotationName;
  defaultTags?: string[];
  /** Client id — recorded in project.json; enables client modelling standards. */
  client?: string;
}

export interface SaveModelOptions {
  name: string;
  xml: string;
  description?: string;
  prompt?: string;
  tags?: string[];
  notation?: NotationName;
  concern?: string;
  relatedViews?: string[];
  /** Client modelling standard the diagram was generated against. */
  standard?: ModelStandardRef;
}

export interface SaveModelResult {
  model: StoredModel;
  version: number;
  isNew: boolean;
}

export class ProjectContext {
  readonly projectId: string;
  readonly projects: ProjectManager;
  readonly models: ModelStore;
  readonly versions: VersionManager;
  readonly exporter: ExportManager;

  private readonly defaultTags: string[];
  private readonly defaultNotation?: NotationName;

  private constructor(
    projectId: string,
    storageRoot: string,
    defaultTags: string[],
    defaultNotation?: NotationName,
  ) {
    this.projectId = projectId;
    this.projects = new ProjectManager(storageRoot);
    this.models = new ModelStore(storageRoot);
    this.versions = new VersionManager(storageRoot);
    this.exporter = new ExportManager(this.versions);
    this.defaultTags = defaultTags;
    this.defaultNotation = defaultNotation;
  }

  /**
   * Opens (or creates) a project context, ensuring all storage directories exist.
   */
  static async open(opts: ProjectContextOptions): Promise<ProjectContext> {
    mkdirSync(opts.storageRoot, { recursive: true });

    const ctx = new ProjectContext(
      opts.projectId,
      opts.storageRoot,
      opts.defaultTags ?? [],
      opts.notation,
    );

    await ctx.projects.ensureExists(opts.projectId, opts.description ?? '');

    if (opts.notation || opts.defaultTags || opts.client) {
      await ctx.projects.update(opts.projectId, {
        ...(opts.notation ? { notation: opts.notation } : {}),
        ...(opts.defaultTags ? { defaultTags: opts.defaultTags } : {}),
        ...(opts.client ? { client: opts.client } : {}),
      });
    }

    return ctx;
  }

  /**
   * Saves a model with upsert semantics: creates if new, adds a version if existing.
   * Name matching is case-insensitive; original casing is preserved from first creation.
   */
  async saveModel(opts: SaveModelOptions): Promise<SaveModelResult> {
    const now = new Date().toISOString();
    const existing = await this.models.findByName(this.projectId, opts.name);

    const result = existing
      ? await this.updateExistingModel(existing, opts, now)
      : await this.createNewModel(opts, now);

    await this.projects.update(this.projectId, { updatedAt: now });
    return result;
  }

  private async updateExistingModel(
    existing: StoredModel,
    opts: SaveModelOptions,
    now: string,
  ): Promise<SaveModelResult> {
    const version = await this.versions.saveVersion(
      this.projectId,
      existing.id,
      opts.xml,
      opts.description ?? '',
    );

    const updated: StoredModel = {
      ...existing,
      currentVersion: version,
      updatedAt: now,
      ...(opts.description !== undefined ? { description: opts.description } : {}),
      ...(opts.prompt !== undefined ? { prompt: opts.prompt } : {}),
      ...(opts.tags !== undefined ? { tags: opts.tags } : {}),
      ...(opts.notation !== undefined ? { notation: opts.notation } : {}),
      ...(opts.concern !== undefined ? { concern: opts.concern } : {}),
      ...(opts.relatedViews !== undefined ? { relatedViews: opts.relatedViews } : {}),
      ...(opts.standard !== undefined ? { standard: opts.standard } : {}),
    };

    await this.models.save(updated);
    return { model: updated, version, isNew: false };
  }

  private async createNewModel(
    opts: SaveModelOptions,
    now: string,
  ): Promise<SaveModelResult> {
    const modelId = randomUUID();
    const notation = opts.notation ?? this.defaultNotation;
    const tags = opts.tags ?? [...this.defaultTags];

    const model: StoredModel = {
      id: modelId,
      name: opts.name,
      project: this.projectId,
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
      tags,
      prompt: opts.prompt ?? '',
      description: opts.description ?? opts.name,
      ...(notation ? { notation } : {}),
      ...(opts.concern ? { concern: opts.concern } : {}),
      ...(opts.relatedViews ? { relatedViews: opts.relatedViews } : {}),
      ...(opts.standard ? { standard: opts.standard } : {}),
    };

    await this.models.save(model);
    const version = await this.versions.saveVersion(
      this.projectId,
      modelId,
      opts.xml,
      opts.description ?? 'Initial generation',
    );

    return { model, version, isNew: true };
  }

  /**
   * Finds a model by name (case-insensitive) within this project.
   */
  async findModel(name: string): Promise<StoredModel | null> {
    return this.models.findByName(this.projectId, name);
  }

  /**
   * Returns the client modelling standard a model was generated against, if any.
   * Revisions should reuse this standard.
   */
  async getModelStandard(name: string): Promise<ModelStandardRef | null> {
    const model = await this.models.findByName(this.projectId, name);
    return model?.standard ?? null;
  }

  /**
   * Lists all models in this project.
   */
  async listModels(): Promise<StoredModel[]> {
    return this.models.listByProject(this.projectId);
  }

  /**
   * Loads the latest XML for a model by name or UUID.
   * Tries name lookup first, falls back to UUID.
   */
  async loadLatestXml(nameOrId: string): Promise<string | null> {
    const byName = await this.models.findByName(this.projectId, nameOrId);
    const modelId = byName?.id ?? nameOrId;

    const entry = await this.versions.loadLatest(this.projectId, modelId);
    return entry?.xml ?? null;
  }

  /**
   * Exports a model's latest version to a .drawio file.
   * If no outputPath is given, exports to the project's exports directory.
   * Returns the export path, or null if the model was not found.
   */
  async exportModel(name: string, outputPath?: string): Promise<string | null> {
    const model = await this.models.findByName(this.projectId, name);
    if (!model) {
      return null;
    }

    const finalPath = outputPath ?? this.defaultExportPath(name);
    const exportDir = finalPath.substring(0, finalPath.lastIndexOf('/'));
    mkdirSync(exportDir, { recursive: true });

    return this.exporter.exportToFile(this.projectId, model.id, finalPath);
  }

  /**
   * Bidirectionally links two models by name within this project.
   * Each model's ID is added to the other's `relatedViews` array (deduplicated).
   */
  async linkViews(modelNameA: string, modelNameB: string): Promise<void> {
    const modelA = await this.models.findByName(this.projectId, modelNameA);
    const modelB = await this.models.findByName(this.projectId, modelNameB);

    if (!modelA) {
      throw new Error(`Model not found: ${modelNameA}`);
    }
    if (!modelB) {
      throw new Error(`Model not found: ${modelNameB}`);
    }

    const addLink = (model: StoredModel, targetId: string): StoredModel => {
      const existing = model.relatedViews ?? [];
      if (existing.includes(targetId)) {
        return model;
      }
      return { ...model, relatedViews: [...existing, targetId] };
    };

    const updatedA = addLink(modelA, modelB.id);
    const updatedB = addLink(modelB, modelA.id);

    await this.models.save(updatedA);
    await this.models.save(updatedB);
  }

  /**
   * Returns all related view models for a model identified by name.
   * Filters out stale references (models that no longer exist).
   */
  async getRelatedViews(name: string): Promise<StoredModel[]> {
    const model = await this.models.findByName(this.projectId, name);
    if (!model || !model.relatedViews || model.relatedViews.length === 0) {
      return [];
    }

    const results: StoredModel[] = [];
    for (const relatedId of model.relatedViews) {
      const related = await this.models.load(this.projectId, relatedId);
      if (related) {
        results.push(related);
      }
    }
    return results;
  }

  private defaultExportPath(name: string): string {
    return join(
      this.projects['storageRoot'],
      'projects',
      this.projectId,
      'exports',
      `${name}.drawio`,
    );
  }
}
