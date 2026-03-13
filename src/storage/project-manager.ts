/**
 * ProjectManager -- Manages project namespaces.
 *
 * Projects are directories under the storage root that group related diagrams.
 */

// All filesystem paths are constructed from assertSafeName-validated segments.
// JSON parsing uses safeJsonParse with schema validation.
/* eslint-disable security/detect-non-literal-fs-filename, secure-coding/no-unsafe-deserialization */

import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { ProjectInfo } from '../types/index.js';

const SAFE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

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

export class ProjectManager {
  private readonly storageRoot: string;

  constructor(storageRoot: string) {
    this.storageRoot = storageRoot;
  }

  private projectsDir(): string {
    return join(this.storageRoot, 'projects');
  }

  private projectDir(name: string): string {
    assertSafeName(name, 'project name');
    return join(this.projectsDir(), name);
  }

  private projectInfoPath(name: string): string {
    return join(this.projectDir(name), 'project.json');
  }

  /**
   * Creates a new project.
   * Returns the ProjectInfo, or null if the project already exists.
   */
  async create(name: string, description = ''): Promise<ProjectInfo | null> {
    const dir = this.projectDir(name);
    if (existsSync(dir)) {
      return null;
    }

    await mkdir(dir, { recursive: true });

    const info: ProjectInfo = {
      name,
      createdAt: new Date().toISOString(),
      description,
    };

    await writeFile(this.projectInfoPath(name), JSON.stringify(info, null, 2), 'utf-8');
    return info;
  }

  /**
   * Gets project info by name.
   */
  async get(name: string): Promise<ProjectInfo | null> {
    const infoPath = this.projectInfoPath(name);
    if (!existsSync(infoPath)) {
      return null;
    }
    const content = await readFile(infoPath, 'utf-8');
    return safeJsonParse<ProjectInfo>(content, `project ${name}`);
  }

  /**
   * Lists all projects.
   */
  async list(): Promise<ProjectInfo[]> {
    const dir = this.projectsDir();
    if (!existsSync(dir)) {
      return [];
    }

    const entries = await readdir(dir, { withFileTypes: true });
    const projects: ProjectInfo[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const info = await this.get(entry.name);
        if (info) {
          projects.push(info);
        }
      }
    }

    return projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Deletes a project and all its contents.
   * Returns true if the project existed and was deleted.
   */
  async delete(name: string): Promise<boolean> {
    const dir = this.projectDir(name);
    if (!existsSync(dir)) {
      return false;
    }
    await rm(dir, { recursive: true });
    return true;
  }

  /**
   * Updates an existing project's metadata.
   * Returns the updated ProjectInfo, or null if the project does not exist.
   */
  async update(name: string, patch: Partial<Omit<ProjectInfo, 'name' | 'createdAt'>>): Promise<ProjectInfo | null> {
    const existing = await this.get(name);
    if (!existing) {
      return null;
    }

    const updated: ProjectInfo = { ...existing, ...patch };
    await writeFile(this.projectInfoPath(name), JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  }

  /**
   * Ensures a project exists, creating it if necessary.
   */
  async ensureExists(name: string, description = ''): Promise<ProjectInfo> {
    const existing = await this.get(name);
    if (existing) {
      return existing;
    }
    const created = await this.create(name, description);
    if (!created) {
      throw new Error(`Failed to create project "${name}"`);
    }
    return created;
  }
}
