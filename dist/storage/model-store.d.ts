/**
 * ModelStore -- CRUD operations for diagram models.
 *
 * Each model is stored as a JSON file with a UUID, belonging to a project namespace.
 * The storage root defaults to .drawio-skill/ in the current working directory.
 */
import type { StoredModel } from '../types/index.js';
export declare class ModelStore {
    private readonly storageRoot;
    constructor(storageRoot: string);
    private modelsDir;
    private modelPath;
    /**
     * Ensures the models directory exists for the given project.
     */
    private ensureDir;
    /**
     * Saves a model to storage.
     */
    save(model: StoredModel): Promise<void>;
    /**
     * Loads a model by ID and project.
     * Returns null if the model does not exist.
     */
    load(project: string, id: string): Promise<StoredModel | null>;
    /**
     * Lists all models in a project.
     */
    listByProject(project: string): Promise<StoredModel[]>;
    /**
     * Deletes a model by ID and project.
     * Returns true if the model was found and deleted.
     */
    delete(project: string, id: string): Promise<boolean>;
    /**
     * Finds a model by ID across all projects.
     * Slower than load() — use when the project is unknown.
     */
    findById(id: string): Promise<StoredModel | null>;
}
//# sourceMappingURL=model-store.d.ts.map