/**
 * ProjectManager -- Manages project namespaces.
 *
 * Projects are directories under the storage root that group related diagrams.
 */
import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
const SAFE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
function assertSafeName(value, label) {
    if (!SAFE_NAME_PATTERN.test(value)) {
        throw new Error(`Invalid ${label}: must match ${SAFE_NAME_PATTERN.source}`);
    }
}
function safeJsonParse(content, context) {
    try {
        return JSON.parse(content);
    }
    catch (err) {
        throw new Error(`Failed to parse ${context}: ${err instanceof Error ? err.message : String(err)}`);
    }
}
export class ProjectManager {
    storageRoot;
    constructor(storageRoot) {
        this.storageRoot = storageRoot;
    }
    projectsDir() {
        return join(this.storageRoot, 'projects');
    }
    projectDir(name) {
        assertSafeName(name, 'project name');
        return join(this.projectsDir(), name);
    }
    projectInfoPath(name) {
        return join(this.projectDir(name), 'project.json');
    }
    /**
     * Creates a new project.
     * Returns the ProjectInfo, or null if the project already exists.
     */
    async create(name, description = '') {
        const dir = this.projectDir(name);
        if (existsSync(dir)) {
            return null;
        }
        await mkdir(dir, { recursive: true });
        const info = {
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
    async get(name) {
        const infoPath = this.projectInfoPath(name);
        if (!existsSync(infoPath)) {
            return null;
        }
        const content = await readFile(infoPath, 'utf-8');
        return safeJsonParse(content, `project ${name}`);
    }
    /**
     * Lists all projects.
     */
    async list() {
        const dir = this.projectsDir();
        if (!existsSync(dir)) {
            return [];
        }
        const entries = await readdir(dir, { withFileTypes: true });
        const projects = [];
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const info = await this.get(entry.name);
                if (info) {
                    projects.push(info);
                }
            }
        }
        return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    /**
     * Deletes a project and all its contents.
     * Returns true if the project existed and was deleted.
     */
    async delete(name) {
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
    async ensureExists(name, description = '') {
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
//# sourceMappingURL=project-manager.js.map