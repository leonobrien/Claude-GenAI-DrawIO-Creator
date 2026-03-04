/**
 * ExportManager -- Exports diagram models to .drawio or .xml files.
 */
import { writeFile } from 'node:fs/promises';
export class ExportManager {
    versionManager;
    constructor(versionManager) {
        this.versionManager = versionManager;
    }
    /**
     * Exports the latest version of a model to a file.
     *
     * @param project - The project namespace
     * @param modelId - The model's UUID
     * @param outputPath - The file path to write to
     * @param format - The export format (drawio or xml)
     * @returns The output path, or null if the model/version was not found
     */
    async exportToFile(project, modelId, outputPath, format = 'drawio') {
        const version = await this.versionManager.loadLatest(project, modelId);
        if (!version) {
            return null;
        }
        const finalPath = outputPath.endsWith(`.${format}`)
            ? outputPath
            : `${outputPath}.${format}`;
        await writeFile(finalPath, version.xml, 'utf-8');
        return finalPath;
    }
    /**
     * Exports a specific version of a model to a file.
     */
    async exportVersionToFile(project, modelId, versionNumber, outputPath, format = 'drawio') {
        const version = await this.versionManager.loadVersion(project, modelId, versionNumber);
        if (!version) {
            return null;
        }
        const finalPath = outputPath.endsWith(`.${format}`)
            ? outputPath
            : `${outputPath}.${format}`;
        await writeFile(finalPath, version.xml, 'utf-8');
        return finalPath;
    }
    /**
     * Returns the XML content for the latest version without writing to disk.
     */
    async getXml(project, modelId) {
        const version = await this.versionManager.loadLatest(project, modelId);
        return version?.xml ?? null;
    }
}
//# sourceMappingURL=export-manager.js.map