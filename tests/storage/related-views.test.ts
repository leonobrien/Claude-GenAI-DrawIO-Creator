import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ProjectContext } from '../../src/storage/project-context.js';

describe('Related Views', () => {
  let storageRoot: string;

  beforeEach(async () => {
    storageRoot = await mkdtemp(join(tmpdir(), 'drawio-views-'));
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true });
  });

  describe('linkViews', () => {
    it('creates bidirectional links between two models', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'security-view', xml: '<mxfile>security</mxfile>' });
      await ctx.saveModel({ name: 'network-view', xml: '<mxfile>network</mxfile>' });

      await ctx.linkViews('security-view', 'network-view');

      const security = await ctx.findModel('security-view');
      const network = await ctx.findModel('network-view');

      expect(security!.relatedViews).toContain(network!.id);
      expect(network!.relatedViews).toContain(security!.id);
    });

    it('is idempotent on re-link', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'view-a', xml: '<mxfile>a</mxfile>' });
      await ctx.saveModel({ name: 'view-b', xml: '<mxfile>b</mxfile>' });

      await ctx.linkViews('view-a', 'view-b');
      await ctx.linkViews('view-a', 'view-b');

      const viewA = await ctx.findModel('view-a');
      const viewB = await ctx.findModel('view-b');

      // Each ID should appear exactly once
      expect(viewA!.relatedViews!.filter((id) => id === viewB!.id)).toHaveLength(1);
      expect(viewB!.relatedViews!.filter((id) => id === viewA!.id)).toHaveLength(1);
    });

    it('throws when model A is not found', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'existing', xml: '<mxfile>x</mxfile>' });

      await expect(ctx.linkViews('non-existent', 'existing')).rejects.toThrow('Model not found: non-existent');
    });

    it('throws when model B is not found', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'existing', xml: '<mxfile>x</mxfile>' });

      await expect(ctx.linkViews('existing', 'non-existent')).rejects.toThrow('Model not found: non-existent');
    });

    it('supports linking more than two models', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'view-a', xml: '<mxfile>a</mxfile>' });
      await ctx.saveModel({ name: 'view-b', xml: '<mxfile>b</mxfile>' });
      await ctx.saveModel({ name: 'view-c', xml: '<mxfile>c</mxfile>' });

      await ctx.linkViews('view-a', 'view-b');
      await ctx.linkViews('view-a', 'view-c');

      const viewA = await ctx.findModel('view-a');
      expect(viewA!.relatedViews).toHaveLength(2);
    });
  });

  describe('getRelatedViews', () => {
    it('returns linked models', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'security-view', xml: '<mxfile>security</mxfile>' });
      await ctx.saveModel({ name: 'network-view', xml: '<mxfile>network</mxfile>' });

      await ctx.linkViews('security-view', 'network-view');

      const related = await ctx.getRelatedViews('security-view');
      expect(related).toHaveLength(1);
      expect(related[0].name).toBe('network-view');
    });

    it('returns empty array for model with no related views', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'lonely-view', xml: '<mxfile>lonely</mxfile>' });

      const related = await ctx.getRelatedViews('lonely-view');
      expect(related).toHaveLength(0);
    });

    it('returns empty array for non-existent model', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const related = await ctx.getRelatedViews('non-existent');
      expect(related).toHaveLength(0);
    });

    it('filters out stale references', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({ name: 'view-a', xml: '<mxfile>a</mxfile>' });
      await ctx.saveModel({ name: 'view-b', xml: '<mxfile>b</mxfile>' });

      await ctx.linkViews('view-a', 'view-b');

      // Delete view-b to create a stale reference
      const viewB = await ctx.findModel('view-b');
      await ctx.models.delete('test-project', viewB!.id);

      const related = await ctx.getRelatedViews('view-a');
      expect(related).toHaveLength(0);
    });
  });

  describe('saveModel with concern and relatedViews', () => {
    it('persists concern field on new model', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const { model } = await ctx.saveModel({
        name: 'scoped-diagram',
        xml: '<mxfile>scoped</mxfile>',
        concern: 'FortiGate security connectivity',
      });

      expect(model.concern).toBe('FortiGate security connectivity');

      // Verify persistence by reloading
      const loaded = await ctx.findModel('scoped-diagram');
      expect(loaded!.concern).toBe('FortiGate security connectivity');
    });

    it('persists relatedViews field on new model', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      const { model } = await ctx.saveModel({
        name: 'linked-diagram',
        xml: '<mxfile>linked</mxfile>',
        relatedViews: ['some-uuid-1', 'some-uuid-2'],
      });

      expect(model.relatedViews).toEqual(['some-uuid-1', 'some-uuid-2']);
    });

    it('updates concern on existing model', async () => {
      const ctx = await ProjectContext.open({
        storageRoot,
        projectId: 'test-project',
      });

      await ctx.saveModel({
        name: 'evolving-diagram',
        xml: '<mxfile>v1</mxfile>',
        concern: 'initial concern',
      });

      const { model } = await ctx.saveModel({
        name: 'evolving-diagram',
        xml: '<mxfile>v2</mxfile>',
        concern: 'refined concern',
      });

      expect(model.concern).toBe('refined concern');
    });
  });
});
