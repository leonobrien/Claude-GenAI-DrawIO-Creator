/**
 * ExportManager -- Exports diagram models to .drawio or .xml files.
 */
import { VersionManager } from './version-manager.js';
export type ExportFormat = 'drawio' | 'xml';
export declare class ExportManager {
    private readonly versionManager;
    constructor(versionManager: VersionManager);
    /**
     * Exports the latest version of a model to a file.
     *
     * @param project - The project namespace
     * @param modelId - The model's UUID
     * @param outputPath - The file path to write to
     * @param format - The export format (drawio or xml)
     * @returns The output path, or null if the model/version was not found
     */
    exportToFile(project: string, modelId: string, outputPath: string, format?: ExportFormat): Promise<string | null>;
    /**
     * Exports a specific version of a model to a file.
     */
    exportVersionToFile(project: string, modelId: string, versionNumber: number, outputPath: string, format?: ExportFormat): Promise<string | null>;
    /**
     * Returns the XML content for the latest version without writing to disk.
     */
    getXml(project: string, modelId: string): Promise<string | null>;
}
//# sourceMappingURL=export-manager.d.ts.map