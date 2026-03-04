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
const INITIAL_STATE = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    completedOperations: [],
    pendingOperations: [],
};
export class StateManager {
    statePath;
    state;
    constructor(statePath) {
        this.statePath = statePath;
        this.state = { ...INITIAL_STATE };
    }
    /**
     * Loads state from disk. Creates initial state if the file does not exist.
     */
    async load() {
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
        this.state = JSON.parse(content);
        return this.state;
    }
    /**
     * Persists the current state to disk.
     */
    async save() {
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
    getState() {
        return this.state;
    }
    /**
     * Sets the active project and model context.
     */
    setContext(project, modelId) {
        this.state.activeProject = project;
        this.state.activeModelId = modelId;
    }
    /**
     * Records an operation as started.
     */
    startOperation(op) {
        const record = {
            ...op,
            timestamp: new Date().toISOString(),
            status: 'in_progress',
        };
        this.state.pendingOperations.push(record);
    }
    /**
     * Marks the most recent pending operation of the given type as completed.
     */
    completeOperation(type, details) {
        const index = this.state.pendingOperations.findIndex((op) => op.type === type && op.status === 'in_progress');
        if (index !== -1) {
            const op = this.state.pendingOperations.splice(index, 1)[0];
            op.status = 'completed';
            if (details)
                op.details = details;
            this.state.completedOperations.push(op);
        }
    }
    /**
     * Marks the most recent pending operation of the given type as failed.
     */
    failOperation(type, details) {
        const index = this.state.pendingOperations.findIndex((op) => op.type === type && op.status === 'in_progress');
        if (index !== -1) {
            const op = this.state.pendingOperations.splice(index, 1)[0];
            op.status = 'failed';
            if (details)
                op.details = details;
            this.state.completedOperations.push(op);
        }
    }
    /**
     * Returns operations that were in_progress when the session ended.
     * These represent work that may need to be retried.
     */
    getInterruptedOperations() {
        return this.state.pendingOperations.filter((op) => op.status === 'in_progress');
    }
    /**
     * Clears all state (for testing or reset).
     */
    reset() {
        this.state = {
            ...INITIAL_STATE,
            lastUpdated: new Date().toISOString(),
            completedOperations: [],
            pendingOperations: [],
        };
    }
}
//# sourceMappingURL=state-manager.js.map