import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { StateManager } from '../../src/state/state-manager.js';

describe('StateManager', () => {
  let tempDir: string;
  let statePath: string;
  let manager: StateManager;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'state-test-'));
    statePath = join(tempDir, 'state.json');
    manager = new StateManager(statePath);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  it('loads initial state when no file exists', async () => {
    const state = await manager.load();
    expect(state.version).toBe(1);
    expect(state.completedOperations).toHaveLength(0);
    expect(state.pendingOperations).toHaveLength(0);
  });

  it('saves and reloads state', async () => {
    await manager.load();
    manager.setContext('my-project', 'model-123');
    await manager.save();

    const newManager = new StateManager(statePath);
    const state = await newManager.load();
    expect(state.activeProject).toBe('my-project');
    expect(state.activeModelId).toBe('model-123');
  });

  it('tracks operation lifecycle', async () => {
    await manager.load();

    manager.startOperation({ type: 'generate', project: 'proj', modelId: 'model-1' });
    expect(manager.getState().pendingOperations).toHaveLength(1);

    manager.completeOperation('generate', 'Generated successfully');
    expect(manager.getState().pendingOperations).toHaveLength(0);
    expect(manager.getState().completedOperations).toHaveLength(1);
    expect(manager.getState().completedOperations[0].status).toBe('completed');
  });

  it('marks failed operations', async () => {
    await manager.load();

    manager.startOperation({ type: 'revise', modelId: 'model-1' });
    manager.failOperation('revise', 'XML validation failed');

    const state = manager.getState();
    expect(state.completedOperations[0].status).toBe('failed');
    expect(state.completedOperations[0].details).toBe('XML validation failed');
  });

  it('identifies interrupted operations', async () => {
    await manager.load();

    manager.startOperation({ type: 'generate', project: 'proj' });
    manager.startOperation({ type: 'index', modelId: 'model-1' });
    manager.completeOperation('generate');

    const interrupted = manager.getInterruptedOperations();
    expect(interrupted).toHaveLength(1);
    expect(interrupted[0].type).toBe('index');
  });

  it('resets state', async () => {
    await manager.load();
    manager.setContext('proj', 'model');
    manager.startOperation({ type: 'generate' });
    manager.reset();

    const state = manager.getState();
    expect(state.activeProject).toBeUndefined();
    expect(state.pendingOperations).toHaveLength(0);
  });
});
