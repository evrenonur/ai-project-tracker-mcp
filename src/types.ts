export interface ProjectSession {
  id: string;
  projectName: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'paused' | 'failed';
  totalSteps: number;
  currentStep: number;
  aiModel: string;
  metadata: Record<string, any>;
}

export interface ProjectStep {
  id: string;
  sessionId: string;
  stepNumber: number;
  stepType: StepType;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  errorMessage?: string;
  duration?: number;
  metadata: Record<string, any>;
}

export type StepType = 
  | 'analysis'
  | 'file_read'
  | 'file_write'
  | 'code_generation'
  | 'dependency_install'
  | 'command_execution'
  | 'testing'
  | 'debugging'
  | 'optimization'
  | 'deployment'
  | 'documentation'
  | 'research'
  | 'planning'
  | 'review'
  | 'custom';

export interface StepDetail {
  id: string;
  stepId: string;
  detailType: 'log' | 'file_change' | 'command' | 'error' | 'note' | 'metric';
  timestamp: Date;
  content: string;
  severity?: 'info' | 'warning' | 'error' | 'debug';
  metadata: Record<string, any>;
}

export interface ProjectMetrics {
  sessionId: string;
  totalFiles: number;
  filesCreated: number;
  filesModified: number;
  filesDeleted: number;
  linesOfCode: number;
  commandsExecuted: number;
  errorsEncountered: number;
  timeSpent: number;
  complexity: 'low' | 'medium' | 'high';
  efficiency: number; // 0-100
}

export interface AIInsight {
  id: string;
  sessionId: string;
  timestamp: Date;
  insightType: 'pattern' | 'recommendation' | 'warning' | 'optimization' | 'milestone';
  title: string;
  description: string;
  confidence: number; // 0-100
  metadata: Record<string, any>;
}

export interface ProjectReport {
  session: ProjectSession;
  steps: ProjectStep[];
  metrics: ProjectMetrics;
  insights: AIInsight[];
  timeline: TimelineEvent[];
  summary: ProjectSummary;
}

export interface TimelineEvent {
  sessionId: string;
  timestamp: Date;
  eventType: 'step_start' | 'step_complete' | 'error' | 'milestone' | 'pause' | 'resume';
  title: string;
  description?: string;
  relatedStepId?: string;
}

export interface ProjectSummary {
  sessionId: string;
  overallStatus: 'success' | 'partial_success' | 'failure';
  completionPercentage: number;
  keyAchievements: string[];
  mainChallenges: string[];
  nextSteps: string[];
  totalTimeSpent: number;
  efficiencyScore: number;
}

export interface MCPToolRequest {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
} 