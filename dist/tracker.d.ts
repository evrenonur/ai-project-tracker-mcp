import { DatabaseManager } from './database.js';
import { ProjectSession, StepType, ProjectMetrics, ProjectReport } from './types.js';
export declare class AIProjectTracker {
    db: DatabaseManager;
    private currentSession;
    private stepStartTimes;
    constructor(dbPath?: string);
    startProject(projectName: string, description: string, aiModel?: string, metadata?: Record<string, any>): Promise<string>;
    startStep(sessionId: string, stepType: StepType, title: string, description: string, input?: any, metadata?: Record<string, any>): Promise<string>;
    completeStep(stepId: string, status?: 'completed' | 'failed' | 'skipped', output?: any, errorMessage?: string): Promise<void>;
    addLog(stepId: string, content: string, severity?: 'info' | 'warning' | 'error' | 'debug', metadata?: Record<string, any>): Promise<void>;
    updateMetrics(sessionId: string, updates: Partial<ProjectMetrics>): Promise<void>;
    addInsight(sessionId: string, insightType: 'pattern' | 'recommendation' | 'warning' | 'optimization' | 'milestone', title: string, description: string, confidence?: number, metadata?: Record<string, any>): Promise<string>;
    completeProject(sessionId: string, status?: 'completed' | 'failed'): Promise<void>;
    generateReport(sessionId: string): Promise<ProjectReport>;
    private generateSummary;
    private addTimelineEvent;
    listSessions(): Promise<ProjectSession[]>;
    printReport(sessionId: string): Promise<void>;
    close(): void;
}
//# sourceMappingURL=tracker.d.ts.map