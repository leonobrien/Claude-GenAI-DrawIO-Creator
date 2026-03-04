import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ModelStore } from '../../src/storage/model-store.js';
import { VersionManager } from '../../src/storage/version-manager.js';
import { ProjectManager } from '../../src/storage/project-manager.js';
import { ExportManager } from '../../src/storage/export-manager.js';
import { readFile } from 'node:fs/promises';
import type { StoredModel } from '../../src/types/index.js';

describe('Storage', () => {
  let storageRoot: string;
  let modelStore: ModelStore;
  let versionManager: VersionManager;
  let projectManager: ProjectManager;

  beforeEach(async () => {
    storageRoot = await mkdtemp(join(tmpdir(), 'drawio-test-'));
    modelStore = new ModelStore(storageRoot);
    versionManager = new VersionManager(storageRoot);
    projectManager = new ProjectManager(storageRoot);
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true });
  });

  describe('ProjectManager', () => {
    it('creates and retrieves a project', async () => {
      const project = await projectManager.create('test-project', 'A test');
      expect(project).not.toBeNull();
      expect(project!.name).toBe('test-project');

      const retrieved = await projectManager.get('test-project');
      expect(retrieved!.description).toBe('A test');
    });

    it('returns null for duplicate project', async () => {
      await projectManager.create('test-project');
      const dup = await projectManager.create('test-project');
      expect(dup).toBeNull();
    });

    it('lists all projects', async () => {
      await projectManager.create('project-a');
      await projectManager.create('project-b');
      const list = await projectManager.list();
      expect(list).toHaveLength(2);
    });

    it('deletes a project', async () => {
      await projectManager.create('to-delete');
      const deleted = await projectManager.delete('to-delete');
      expect(deleted).toBe(true);
      const retrieved = await projectManager.get('to-delete');
      expect(retrieved).toBeNull();
    });

    it('ensureExists creates if missing', async () => {
      const info = await projectManager.ensureExists('auto-created');
      expect(info.name).toBe('auto-created');

      // Second call returns existing
      const again = await projectManager.ensureExists('auto-created');
      expect(again.createdAt).toBe(info.createdAt);
    });
  });

  describe('ModelStore', () => {
    const testModel: StoredModel = {
      id: 'test-uuid-1',
      name: 'Test Diagram',
      project: 'test-project',
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['test'],
      prompt: 'Draw a test diagram',
      description: 'A simple test diagram',
    };

    it('saves and loads a model', async () => {
      await projectManager.create('test-project');
      await modelStore.save(testModel);
      const loaded = await modelStore.load('test-project', 'test-uuid-1');
      expect(loaded).not.toBeNull();
      expect(loaded!.name).toBe('Test Diagram');
    });

    it('returns null for non-existent model', async () => {
      const loaded = await modelStore.load('test-project', 'non-existent');
      expect(loaded).toBeNull();
    });

    it('lists models by project', async () => {
      await projectManager.create('test-project');
      await modelStore.save(testModel);
      await modelStore.save({ ...testModel, id: 'test-uuid-2', name: 'Second' });

      const list = await modelStore.listByProject('test-project');
      expect(list).toHaveLength(2);
    });

    it('deletes a model', async () => {
      await projectManager.create('test-project');
      await modelStore.save(testModel);
      const deleted = await modelStore.delete('test-project', 'test-uuid-1');
      expect(deleted).toBe(true);
      const loaded = await modelStore.load('test-project', 'test-uuid-1');
      expect(loaded).toBeNull();
    });

    it('finds model by ID across projects', async () => {
      await projectManager.create('test-project');
      await modelStore.save(testModel);
      const found = await modelStore.findById('test-uuid-1');
      expect(found).not.toBeNull();
      expect(found!.project).toBe('test-project');
    });
  });

  describe('VersionManager', () => {
    it('saves and retrieves versions', async () => {
      await projectManager.create('test-project');

      const v1 = await versionManager.saveVersion('test-project', 'model-1', '<xml>v1</xml>', 'Initial');
      expect(v1).toBe(1);

      const v2 = await versionManager.saveVersion('test-project', 'model-1', '<xml>v2</xml>', 'Revised');
      expect(v2).toBe(2);

      const loaded = await versionManager.loadVersion('test-project', 'model-1', 1);
      expect(loaded!.xml).toBe('<xml>v1</xml>');
      expect(loaded!.description).toBe('Initial');
    });

    it('returns latest version', async () => {
      await projectManager.create('test-project');
      await versionManager.saveVersion('test-project', 'model-1', '<xml>v1</xml>', 'v1');
      await versionManager.saveVersion('test-project', 'model-1', '<xml>v2</xml>', 'v2');

      const latest = await versionManager.loadLatest('test-project', 'model-1');
      expect(latest!.xml).toBe('<xml>v2</xml>');
    });

    it('lists version metadata', async () => {
      await projectManager.create('test-project');
      await versionManager.saveVersion('test-project', 'model-1', '<xml>v1</xml>', 'First');
      await versionManager.saveVersion('test-project', 'model-1', '<xml>v2</xml>', 'Second');

      const versions = await versionManager.listVersions('test-project', 'model-1');
      expect(versions).toHaveLength(2);
      expect(versions[0].description).toBe('First');
      expect(versions[1].description).toBe('Second');
    });

    it('returns 0 for no versions', async () => {
      const latest = await versionManager.getLatestVersion('test-project', 'no-model');
      expect(latest).toBe(0);
    });
  });

  describe('ExportManager', () => {
    it('exports latest version to file', async () => {
      await projectManager.create('test-project');
      await versionManager.saveVersion('test-project', 'model-1', '<mxfile>test</mxfile>', 'Initial');

      const exportManager = new ExportManager(versionManager);
      const outputPath = join(storageRoot, 'output.drawio');
      const result = await exportManager.exportToFile('test-project', 'model-1', outputPath);

      expect(result).toBe(outputPath);
      const content = await readFile(outputPath, 'utf-8');
      expect(content).toBe('<mxfile>test</mxfile>');
    });

    it('returns null for non-existent model', async () => {
      const exportManager = new ExportManager(versionManager);
      const result = await exportManager.exportToFile('test-project', 'no-model', '/tmp/out.drawio');
      expect(result).toBeNull();
    });
  });
});
