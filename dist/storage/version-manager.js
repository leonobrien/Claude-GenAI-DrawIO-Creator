/**
 * VersionManager -- Manages XML version history for diagram models.
 *
 * Each revision creates a new version file (v1.xml, v2.xml, ...) in the
 * model's versions directory. Supports rollback to any previous version.
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
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
export class VersionManager {
    storageRoot;
    constructor(storageRoot) {
        this.storageRoot = storageRoot;
    }
    versionsDir(project, modelId) {
        assertSafeName(project, 'project name');
        assertSafeName(modelId, 'model id');
        return join(this.storageRoot, 'projects', project, 'models', `${modelId}.versions`);
    }
    versionPath(project, modelId, version) {
        return join(this.versionsDir(project, modelId), `v${version}.xml`);
    }
    metadataPath(project, modelId, version) {
        return join(this.versionsDir(project, modelId), `v${version}.meta.json`);
    }
    /**
     * Ensures the versions directory exists.
     */
    async ensureDir(project, modelId) {
        const dir = this.versionsDir(project, modelId);
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
    /**
     * Saves a new version of the diagram XML.
     *
     * @returns The version number assigned
     */
    async saveVersion(project, modelId, xml, description) {
        await this.ensureDir(project, modelId);
        const currentVersion = await this.getLatestVersion(project, modelId);
        const newVersion = currentVersion + 1;
        const entry = {
            version: newVersion,
            timestamp: new Date().toISOString(),
            description,
        };
        await writeFile(this.versionPath(project, modelId, newVersion), xml, 'utf-8');
        await writeFile(this.metadataPath(project, modelId, newVersion), JSON.stringify(entry, null, 2), 'utf-8');
        return newVersion;
    }
    /**
     * Loads the XML for a specific version.
     */
    async loadVersion(project, modelId, version) {
        const xmlPath = this.versionPath(project, modelId, version);
        const metaPath = this.metadataPath(project, modelId, version);
        if (!existsSync(xmlPath)) {
            return null;
        }
        const xml = await readFile(xmlPath, 'utf-8');
        if (existsSync(metaPath)) {
            const meta = safeJsonParse(await readFile(metaPath, 'utf-8'), `version ${version} metadata`);
            return { version: meta.version, timestamp: meta.timestamp, description: meta.description, xml };
        }
        return {
            version,
            timestamp: new Date().toISOString(),
            description: '',
            xml,
        };
    }
    /**
     * Returns the latest version number, or 0 if no versions exist.
     */
    async getLatestVersion(project, modelId) {
        const dir = this.versionsDir(project, modelId);
        if (!existsSync(dir)) {
            return 0;
        }
        const files = await readdir(dir);
        const versionNumbers = files
            .filter((f) => f.match(/^v\d+\.xml$/))
            .map((f) => parseInt(f.replace('v', '').replace('.xml', ''), 10));
        return versionNumbers.length > 0 ? Math.max(...versionNumbers) : 0;
    }
    /**
     * Lists all version entries for a model (metadata only, no XML).
     */
    async listVersions(project, modelId) {
        const dir = this.versionsDir(project, modelId);
        if (!existsSync(dir)) {
            return [];
        }
        const files = await readdir(dir);
        const metaFiles = files.filter((f) => f.endsWith('.meta.json')).sort().slice(0, MAX_LIST_ITEMS);
        const entries = [];
        for (const file of metaFiles) {
            try {
                const content = await readFile(join(dir, file), 'utf-8');
                entries.push(safeJsonParse(content, `version metadata ${file}`));
            }
            catch {
                // Skip malformed metadata files
            }
        }
        return entries;
    }
    /**
     * Loads the latest version's XML.
     */
    async loadLatest(project, modelId) {
        const latest = await this.getLatestVersion(project, modelId);
        if (latest === 0) {
            return null;
        }
        return this.loadVersion(project, modelId, latest);
    }
}
//# sourceMappingURL=version-manager.js.map