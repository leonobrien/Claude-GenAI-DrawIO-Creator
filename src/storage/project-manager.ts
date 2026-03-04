/**
 * ProjectManager -- Manages project namespaces.
 *
 * Projects are directories under the storage root that group related diagrams.
 */

import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { ProjectInfo } from '../types/index.js';

export class ProjectManager {
  private readonly storageRoot: string;

  constructor(storageRoot: string) {
    this.storageRoot = storageRoot;
  }

  private projectsDir(): string {
    return join(this.storageRoot, 'projects');
  }

  private projectDir(name: string): string {
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
    return JSON.parse(content) as ProjectInfo;
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
   * Ensures a project exists, creating it if necessary.
   */
  async ensureExists(name: string, description = ''): Promise<ProjectInfo> {
    const existing = await this.get(name);
    if (existing) {
      return existing;
    }
    const created = await this.create(name, description);
    return created!;
  }
}
