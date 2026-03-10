/**
 * ModelStore -- CRUD operations for diagram models.
 *
 * Each model is stored as a JSON file with a UUID, belonging to a project namespace.
 * The storage root defaults to .drawio-skill/ in the current working directory.
 */
import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
const SAFE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const MAX_LIST_ITEMS = 1000;
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
export class ModelStore {
    storageRoot;
    constructor(storageRoot) {
        this.storageRoot = storageRoot;
    }
    modelsDir(project) {
        assertSafeName(project, 'project name');
        return join(this.storageRoot, 'projects', project, 'models');
    }
    modelPath(project, id) {
        assertSafeName(id, 'model id');
        return join(this.modelsDir(project), `${id}.json`);
    }
    /**
     * Ensures the models directory exists for the given project.
     */
    async ensureDir(project) {
        const dir = this.modelsDir(project);
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
    /**
     * Saves a model to storage.
     */
    async save(model) {
        await this.ensureDir(model.project);
        const filePath = this.modelPath(model.project, model.id);
        await writeFile(filePath, JSON.stringify(model, null, 2), 'utf-8');
    }
    /**
     * Loads a model by ID and project.
     * Returns null if the model does not exist.
     */
    async load(project, id) {
        const filePath = this.modelPath(project, id);
        if (!existsSync(filePath)) {
            return null;
        }
        const content = await readFile(filePath, 'utf-8');
        return safeJsonParse(content, `model ${id}`);
    }
    /**
     * Lists all models in a project.
     */
    async listByProject(project) {
        const dir = this.modelsDir(project);
        if (!existsSync(dir)) {
            return [];
        }
        const files = await readdir(dir);
        const jsonFiles = files.filter((f) => f.endsWith('.json')).slice(0, MAX_LIST_ITEMS);
        const models = [];
        for (const file of jsonFiles) {
            try {
                const content = await readFile(join(dir, file), 'utf-8');
                models.push(safeJsonParse(content, `model file ${file}`));
            }
            catch {
                // Skip malformed model files
            }
        }
        return models.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    /**
     * Deletes a model by ID and project.
     * Returns true if the model was found and deleted.
     */
    async delete(project, id) {
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
    async findById(id) {
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
//# sourceMappingURL=model-store.js.map