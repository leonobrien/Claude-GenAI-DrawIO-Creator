/**
 * VersionManager -- Manages XML version history for diagram models.
 *
 * Each revision creates a new version file (v1.xml, v2.xml, ...) in the
 * model's versions directory. Supports rollback to any previous version.
 */
import type { VersionEntry } from '../types/index.js';
export declare class VersionManager {
    private readonly storageRoot;
    constructor(storageRoot: string);
    private versionsDir;
    private versionPath;
    private metadataPath;
    /**
     * Ensures the versions directory exists.
     */
    private ensureDir;
    /**
     * Saves a new version of the diagram XML.
     *
     * @returns The version number assigned
     */
    saveVersion(project: string, modelId: string, xml: string, description: string): Promise<number>;
    /**
     * Loads the XML for a specific version.
     */
    loadVersion(project: string, modelId: string, version: number): Promise<VersionEntry | null>;
    /**
     * Returns the latest version number, or 0 if no versions exist.
     */
    getLatestVersion(project: string, modelId: string): Promise<number>;
    /**
     * Lists all version entries for a model (metadata only, no XML).
     */
    listVersions(project: string, modelId: string): Promise<Omit<VersionEntry, 'xml'>[]>;
    /**
     * Loads the latest version's XML.
     */
    loadLatest(project: string, modelId: string): Promise<VersionEntry | null>;
}
//# sourceMappingURL=version-manager.d.ts.map