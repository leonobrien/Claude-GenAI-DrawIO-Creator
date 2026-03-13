/**
 * ExportManager -- Exports diagram models to .drawio or .xml files.
 */

// Output paths are validated by assertSafeOutputPath (null-byte check) and resolved to absolute paths.
/* eslint-disable security/detect-non-literal-fs-filename */

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { VersionManager } from './version-manager.js';

export type ExportFormat = 'drawio' | 'xml';

export interface ExportVersionOptions {
  project: string;
  modelId: string;
  versionNumber: number;
  outputPath: string;
  format?: ExportFormat;
}

function assertSafeOutputPath(outputPath: string): void {
  if (outputPath.includes('\0')) {
    throw new Error('Invalid output path: contains null bytes');
  }
  // Block writing to sensitive system directories
  const resolved = resolve(outputPath);
  const blocked = ['/etc', '/usr', '/bin', '/sbin', '/boot', '/proc', '/sys', '/dev'];
  for (const dir of blocked) {
    if (resolved.startsWith(dir + '/') || resolved === dir) {
      throw new Error(`Invalid output path: cannot write to system directory ${dir}`);
    }
  }
}

export class ExportManager {
  private readonly versionManager: VersionManager;

  constructor(versionManager: VersionManager) {
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
  async exportToFile(
    project: string,
    modelId: string,
    outputPath: string,
    format: ExportFormat = 'drawio',
  ): Promise<string | null> {
    assertSafeOutputPath(outputPath);

    const version = await this.versionManager.loadLatest(project, modelId);
    if (!version) {
      return null;
    }

    const finalPath = resolve(
      outputPath.endsWith(`.${format}`) ? outputPath : `${outputPath}.${format}`,
    );

    await writeFile(finalPath, version.xml, 'utf-8');
    return finalPath;
  }

  /**
   * Exports a specific version of a model to a file.
   */
  async exportVersionToFile(opts: ExportVersionOptions): Promise<string | null> {
    const { project, modelId, versionNumber, outputPath, format = 'drawio' } = opts;
    assertSafeOutputPath(outputPath);

    const version = await this.versionManager.loadVersion(project, modelId, versionNumber);
    if (!version) {
      return null;
    }

    const finalPath = resolve(
      outputPath.endsWith(`.${format}`) ? outputPath : `${outputPath}.${format}`,
    );

    await writeFile(finalPath, version.xml, 'utf-8');
    return finalPath;
  }

  /**
   * Returns the XML content for the latest version without writing to disk.
   */
  async getXml(project: string, modelId: string): Promise<string | null> {
    const version = await this.versionManager.loadLatest(project, modelId);
    return version?.xml ?? null;
  }
}
