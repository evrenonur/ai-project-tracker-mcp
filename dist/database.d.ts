import { ProjectSession, ProjectStep, ProjectMetrics, AIInsight, TimelineEvent } from './types.js';
export declare class DatabaseManager {
    private db;
    constructor(dbPath?: string);
    private initializeTables;
    private runQuery;
    private getQuery;
    private allQuery;
    createSession(session: Omit<ProjectSession, 'id'>): Promise<string>;
    getSession(sessionId: string): Promise<ProjectSession | null>;
    updateSession(sessionId: string, updates: Partial<ProjectSession>): Promise<void>;
    createStep(step: Omit<ProjectStep, 'id'>): Promise<string>;
    updateStep(stepId: string, updates: Partial<ProjectStep>): Promise<void>;
    getSteps(sessionId: string): Promise<ProjectStep[]>;
    initializeMetrics(sessionId: string): Promise<void>;
    updateMetrics(sessionId: string, updates: Partial<ProjectMetrics>): Promise<void>;
    getMetrics(sessionId: string): Promise<ProjectMetrics | null>;
    addInsight(insight: Omit<AIInsight, 'id'>): Promise<string>;
    getInsights(sessionId: string): Promise<AIInsight[]>;
    addTimelineEvent(event: Omit<TimelineEvent, 'id'>): Promise<string>;
    getTimeline(sessionId: string): Promise<TimelineEvent[]>;
    close(): void;
}
//# sourceMappingURL=database.d.ts.map