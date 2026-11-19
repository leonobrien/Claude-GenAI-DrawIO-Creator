import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ProjectContext } from '../../src/storage/project-context.js';

describe('ProjectContext', () => {
  let storageRoot: string;

  beforeEach(async () => {
    storageRoot = await mkdtemp(join(tmpdir(), 'drawio-ctx-'));
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true });
  });

  describe('open', () => {
    it('creates a new project on open', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
        description: 'Test project',
      });

      expect(ctx.projectId).toBe('test-project');
      const info = await ctx.projects.get('test-project');
      expect(info).not.toBeNull();
      expect(info!.description).toBe('Test project');
    });

    it('opens an existing project without overwriting', async () => {
      const ctx1 = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
        description: 'Original',
      });

      const ctx2 = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
        description: 'Updated',
      });

      expect(ctx2.projectId).toBe('test-project');
      const info = await ctx2.projects.get('test-project');
      expect(info!.createdAt).toBe((await ctx1.projects.get('test-project'))!.createdAt);
    });

    it('sets notation and defaultTags on project', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'tagged-project',
        notation: 'aws',
        defaultTags: ['infra', 'cloud'],
      });

      const info = await ctx.projects.get('tagged-project');
      expect(info!.notation).toBe('aws');
      expect(info!.defaultTags).toEqual(['infra', 'cloud']);
    });
  });

  describe('saveModel', () => {
    it('creates a new model on first save', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const { model, version, isNew } = await ctx.saveModel({
        name: 'my-diagram',
        xml: '<mxfile>test</mxfile>',
        description: 'Test diagram',
        prompt: 'Draw a test',
        tags: ['test'],
      });

      expect(isNew).toBe(true);
      expect(version).toBe(1);
      expect(model.name).toBe('my-diagram');
      expect(model.currentVersion).toBe(1);
      expect(model.description).toBe('Test diagram');
      expect(model.prompt).toBe('Draw a test');
      expect(model.tags).toEqual(['test']);
    });

    it('updates an existing model on subsequent save (upsert)', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const first = await ctx.saveModel({
        name: 'my-diagram',
        xml: '<mxfile>v1</mxfile>',
        description: 'Version 1',
      });

      const second = await ctx.saveModel({
        name: 'my-diagram',
        xml: '<mxfile>v2</mxfile>',
        description: 'Version 2',
      });

      expect(first.isNew).toBe(true);
      expect(second.isNew).toBe(false);
      expect(second.version).toBe(2);
      expect(second.model.id).toBe(first.model.id);
      expect(second.model.currentVersion).toBe(2);
      expect(second.model.description).toBe('Version 2');
    });

    it('matches names case-insensitively for upsert', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'My-Diagram', xml: '<mxfile>v1</mxfile>' });
      const result = await ctx.saveModel({ name: 'my-diagram', xml: '<mxfile>v2</mxfile>' });

      expect(result.isNew).toBe(false);
      expect(result.model.name).toBe('My-Diagram'); // preserves original casing
    });

    it('applies default tags when none specified', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
        defaultTags: ['auto-tag'],
      });

      const { model } = await ctx.saveModel({
        name: 'tagged-diagram',
        xml: '<mxfile>test</mxfile>',
      });

      expect(model.tags).toEqual(['auto-tag']);
    });

    it('applies default notation when none specified', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
        notation: 'aws',
      });

      const { model } = await ctx.saveModel({
        name: 'aws-diagram',
        xml: '<mxfile>test</mxfile>',
      });

      expect(model.notation).toBe('aws');
    });

    it('overrides default notation with explicit notation', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
        notation: 'aws',
      });

      const { model } = await ctx.saveModel({
        name: 'gcp-diagram',
        xml: '<mxfile>test</mxfile>',
        notation: 'gcp',
      });

      expect(model.notation).toBe('gcp');
    });

    it('updates project updatedAt on save', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'diagram', xml: '<mxfile>test</mxfile>' });

      const info = await ctx.projects.get('test-project');
      expect(info!.updatedAt).toBeDefined();
    });
  });

  describe('findModel', () => {
    it('finds a model by name', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'find-me', xml: '<mxfile>test</mxfile>' });

      const found = await ctx.findModel('find-me');
      expect(found).not.toBeNull();
      expect(found!.name).toBe('find-me');
    });

    it('returns null for non-existent model', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const found = await ctx.findModel('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('listModels', () => {
    it('lists all models in the project', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'diagram-a', xml: '<mxfile>a</mxfile>' });
      await ctx.saveModel({ name: 'diagram-b', xml: '<mxfile>b</mxfile>' });

      const list = await ctx.listModels();
      expect(list).toHaveLength(2);
    });

    it('returns empty list for project with no models', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'empty-project',
      });

      const list = await ctx.listModels();
      expect(list).toHaveLength(0);
    });
  });

  describe('loadLatestXml', () => {
    it('loads latest XML by model name', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'my-diagram', xml: '<mxfile>v1</mxfile>' });
      await ctx.saveModel({ name: 'my-diagram', xml: '<mxfile>v2</mxfile>' });

      const xml = await ctx.loadLatestXml('my-diagram');
      expect(xml).toBe('<mxfile>v2</mxfile>');
    });

    it('loads latest XML by model UUID', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const { model } = await ctx.saveModel({ name: 'my-diagram', xml: '<mxfile>test</mxfile>' });

      const xml = await ctx.loadLatestXml(model.id);
      expect(xml).toBe('<mxfile>test</mxfile>');
    });

    it('returns null for non-existent model', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const xml = await ctx.loadLatestXml('non-existent');
      expect(xml).toBeNull();
    });
  });

  describe('exportModel', () => {
    it('exports model to default path', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'export-me', xml: '<mxfile>export</mxfile>' });

      const exportPath = await ctx.exportModel('export-me');
      expect(exportPath).not.toBeNull();
      expect(exportPath!).toContain('export-me.drawio');
    });

    it('exports model to custom path', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'export-me', xml: '<mxfile>export</mxfile>' });

      const customPath = join(storageRoot, 'custom', 'output.drawio');
      const exportPath = await ctx.exportModel('export-me', customPath);
      expect(exportPath).toBe(customPath);
    });

    it('returns null for non-existent model', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const result = await ctx.exportModel('non-existent');
      expect(result).toBeNull();
    });
  });
});
