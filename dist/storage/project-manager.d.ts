/**
 * ProjectManager -- Manages project namespaces.
 *
 * Projects are directories under the storage root that group related diagrams.
 */
import type { ProjectInfo } from '../types/index.js';
export declare class ProjectManager {
    private readonly storageRoot;
    constructor(storageRoot: string);
    private projectsDir;
    private projectDir;
    private projectInfoPath;
    /**
     * Creates a new project.
     * Returns the ProjectInfo, or null if the project already exists.
     */
    create(name: string, description?: string): Promise<ProjectInfo | null>;
    /**
     * Gets project info by name.
     */
    get(name: string): Promise<ProjectInfo | null>;
    /**
     * Lists all projects.
     */
    list(): Promise<ProjectInfo[]>;
    /**
     * Deletes a project and all its contents.
     * Returns true if the project existed and was deleted.
     */
    delete(name: string): Promise<boolean>;
    /**
     * Ensures a project exists, creating it if necessary.
     */
    ensureExists(name: string, description?: string): Promise<ProjectInfo>;
}
//# sourceMappingURL=project-manager.d.ts.map