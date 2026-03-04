/**
 * StateManager -- Crash/session recovery via state.json.
 *
 * Persists the current development state so that after a crash or session
 * timeout, work can resume without duplication or context loss.
 *
 * The state file tracks:
 * - Current phase and step
 * - Active model IDs and projects
 * - Last completed operation
 * - Pending operations queue
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { existsSync } from 'node:fs';

export interface OperationRecord {
  type: 'generate' | 'revise' | 'recall' | 'export' | 'index';
  modelId?: string;
  project?: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
}

export interface SkillState {
  version: number;
  lastUpdated: string;
  activeProject?: string;
  activeModelId?: string;
  currentPhase?: string;
  completedOperations: OperationRecord[];
  pendingOperations: OperationRecord[];
}

const INITIAL_STATE: SkillState = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  completedOperations: [],
  pendingOperations: [],
};

export class StateManager {
  private readonly statePath: string;
  private state: SkillState;

  constructor(statePath: string) {
    this.statePath = statePath;
    this.state = { ...INITIAL_STATE };
  }

  /**
   * Loads state from disk. Creates initial state if the file does not exist.
   */
  async load(): Promise<SkillState> {
    if (!existsSync(this.statePath)) {
      this.state = {
        ...INITIAL_STATE,
        lastUpdated: new Date().toISOString(),
        completedOperations: [],
        pendingOperations: [],
      };
      return this.state;
    }

    const content = await readFile(this.statePath, 'utf-8');
    this.state = JSON.parse(content) as SkillState;
    return this.state;
  }

  /**
   * Persists the current state to disk.
   */
  async save(): Promise<void> {
    this.state.lastUpdated = new Date().toISOString();

    const dir = dirname(this.statePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(this.statePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  /**
   * Returns the current in-memory state.
   */
  getState(): Readonly<SkillState> {
    return this.state;
  }

  /**
   * Sets the active project and model context.
   */
  setContext(project?: string, modelId?: string): void {
    this.state.activeProject = project;
    this.state.activeModelId = modelId;
  }

  /**
   * Records an operation as started.
   */
  startOperation(op: Omit<OperationRecord, 'timestamp' | 'status'>): void {
    const record: OperationRecord = {
      ...op,
      timestamp: new Date().toISOString(),
      status: 'in_progress',
    };

    this.state.pendingOperations.push(record);
  }

  /**
   * Marks the most recent pending operation of the given type as completed.
   */
  completeOperation(type: OperationRecord['type'], details?: string): void {
    const index = this.state.pendingOperations.findIndex(
      (op) => op.type === type && op.status === 'in_progress',
    );

    if (index !== -1) {
      const op = this.state.pendingOperations.splice(index, 1)[0];
      op.status = 'completed';
      if (details) op.details = details;
      this.state.completedOperations.push(op);
    }
  }

  /**
   * Marks the most recent pending operation of the given type as failed.
   */
  failOperation(type: OperationRecord['type'], details?: string): void {
    const index = this.state.pendingOperations.findIndex(
      (op) => op.type === type && op.status === 'in_progress',
    );

    if (index !== -1) {
      const op = this.state.pendingOperations.splice(index, 1)[0];
      op.status = 'failed';
      if (details) op.details = details;
      this.state.completedOperations.push(op);
    }
  }

  /**
   * Returns operations that were in_progress when the session ended.
   * These represent work that may need to be retried.
   */
  getInterruptedOperations(): OperationRecord[] {
    return this.state.pendingOperations.filter((op) => op.status === 'in_progress');
  }

  /**
   * Clears all state (for testing or reset).
   */
  reset(): void {
    this.state = {
      ...INITIAL_STATE,
      lastUpdated: new Date().toISOString(),
      completedOperations: [],
      pendingOperations: [],
    };
  }
}
