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
export declare class StateManager {
    private readonly statePath;
    private state;
    constructor(statePath: string);
    /**
     * Loads state from disk. Creates initial state if the file does not exist.
     */
    load(): Promise<SkillState>;
    /**
     * Persists the current state to disk.
     */
    save(): Promise<void>;
    /**
     * Returns the current in-memory state.
     */
    getState(): Readonly<SkillState>;
    /**
     * Sets the active project and model context.
     */
    setContext(project?: string, modelId?: string): void;
    /**
     * Records an operation as started.
     */
    startOperation(op: Omit<OperationRecord, 'timestamp' | 'status'>): void;
    /**
     * Marks the most recent pending operation of the given type as completed.
     */
    completeOperation(type: OperationRecord['type'], details?: string): void;
    /**
     * Marks the most recent pending operation of the given type as failed.
     */
    failOperation(type: OperationRecord['type'], details?: string): void;
    /**
     * Returns operations that were in_progress when the session ended.
     * These represent work that may need to be retried.
     */
    getInterruptedOperations(): OperationRecord[];
    /**
     * Clears all state (for testing or reset).
     */
    reset(): void;
}
//# sourceMappingURL=state-manager.d.ts.map