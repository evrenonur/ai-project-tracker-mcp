import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import {
  ProjectSession,
  ProjectStep,
  StepDetail,
  ProjectMetrics,
  AIInsight,
  TimelineEvent,
  ProjectSummary
} from './types.js';

export class DatabaseManager {
  private db: sqlite3.Database;

  constructor(dbPath: string = './ai_project_tracker.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    const tables = [
      // Proje oturumları tablosu
      `CREATE TABLE IF NOT EXISTS project_sessions (
        id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL,
        description TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        status TEXT NOT NULL,
        total_steps INTEGER DEFAULT 0,
        current_step INTEGER DEFAULT 0,
        ai_model TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Proje adımları tablosu
      `CREATE TABLE IF NOT EXISTS project_steps (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        step_number INTEGER NOT NULL,
        step_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        status TEXT NOT NULL,
        input TEXT,
        output TEXT,
        error_message TEXT,
        duration INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES project_sessions (id)
      )`,

      // Adım detayları tablosu
      `CREATE TABLE IF NOT EXISTS step_details (
        id TEXT PRIMARY KEY,
        step_id TEXT NOT NULL,
        detail_type TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        content TEXT NOT NULL,
        severity TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (step_id) REFERENCES project_steps (id)
      )`,

      // Proje metrikleri tablosu
      `CREATE TABLE IF NOT EXISTS project_metrics (
        session_id TEXT PRIMARY KEY,
        total_files INTEGER DEFAULT 0,
        files_created INTEGER DEFAULT 0,
        files_modified INTEGER DEFAULT 0,
        files_deleted INTEGER DEFAULT 0,
        lines_of_code INTEGER DEFAULT 0,
        commands_executed INTEGER DEFAULT 0,
        errors_encountered INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        complexity TEXT DEFAULT 'low',
        efficiency INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES project_sessions (id)
      )`,

      // AI içgörüleri tablosu
      `CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        insight_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        confidence INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES project_sessions (id)
      )`,

      // Zaman çizelgesi olayları tablosu
      `CREATE TABLE IF NOT EXISTS timeline_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        event_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        related_step_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES project_sessions (id),
        FOREIGN KEY (related_step_id) REFERENCES project_steps (id)
      )`,

      // İndeksler
      `CREATE INDEX IF NOT EXISTS idx_project_steps_session_id ON project_steps (session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_step_details_step_id ON step_details (step_id)`,
      `CREATE INDEX IF NOT EXISTS idx_ai_insights_session_id ON ai_insights (session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_timeline_events_session_id ON timeline_events (session_id)`
    ];

    for (const table of tables) {
      await this.runQuery(table);
    }
  }

  private runQuery(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  private getQuery(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  private allQuery(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: any, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Proje oturumu işlemleri
  async createSession(session: Omit<ProjectSession, 'id'>): Promise<string> {
    const id = uuidv4();
    const sql = `
      INSERT INTO project_sessions 
      (id, project_name, description, start_time, status, ai_model, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runQuery(sql, [
      id,
      session.projectName,
      session.description,
      session.startTime.toISOString(),
      session.status,
      session.aiModel,
      JSON.stringify(session.metadata)
    ]);

    // İlk metrik kaydını oluştur
    await this.initializeMetrics(id);
    
    return id;
  }

  async getSession(sessionId: string): Promise<ProjectSession | null> {
    const sql = `SELECT * FROM project_sessions WHERE id = ?`;
    const row = await this.getQuery(sql, [sessionId]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      projectName: row.project_name,
      description: row.description,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      status: row.status,
      totalSteps: row.total_steps,
      currentStep: row.current_step,
      aiModel: row.ai_model,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  async updateSession(sessionId: string, updates: Partial<ProjectSession>): Promise<void> {
    const fields = [];
    const values = [];

    if (updates.projectName !== undefined) {
      fields.push('project_name = ?');
      values.push(updates.projectName);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.endTime !== undefined) {
      fields.push('end_time = ?');
      values.push(updates.endTime.toISOString());
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.totalSteps !== undefined) {
      fields.push('total_steps = ?');
      values.push(updates.totalSteps);
    }
    if (updates.currentStep !== undefined) {
      fields.push('current_step = ?');
      values.push(updates.currentStep);
    }

    if (fields.length === 0) return;

    const sql = `UPDATE project_sessions SET ${fields.join(', ')} WHERE id = ?`;
    values.push(sessionId);

    await this.runQuery(sql, values);
  }

  async getAllSessions(status?: string, limit?: number): Promise<ProjectSession[]> {
    let sql = `SELECT * FROM project_sessions`;
    const params: any[] = [];

    if (status) {
      sql += ` WHERE status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY start_time DESC`;

    if (limit) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }

    const rows = await this.allQuery(sql, params);
    
    return rows.map(row => ({
      id: row.id,
      projectName: row.project_name,
      description: row.description,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      status: row.status,
      totalSteps: row.total_steps,
      currentStep: row.current_step,
      aiModel: row.ai_model,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  // Proje adımı işlemleri
  async createStep(step: Omit<ProjectStep, 'id'>): Promise<string> {
    const id = uuidv4();
    const sql = `
      INSERT INTO project_steps 
      (id, session_id, step_number, step_type, title, description, start_time, status, input, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runQuery(sql, [
      id,
      step.sessionId,
      step.stepNumber,
      step.stepType,
      step.title,
      step.description,
      step.startTime.toISOString(),
      step.status,
      JSON.stringify(step.input || {}),
      JSON.stringify(step.metadata)
    ]);
    
    return id;
  }

  async updateStep(stepId: string, updates: Partial<ProjectStep>): Promise<void> {
    const fields = [];
    const values = [];

    if (updates.endTime !== undefined) {
      fields.push('end_time = ?');
      values.push(updates.endTime.toISOString());
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.output !== undefined) {
      fields.push('output = ?');
      values.push(JSON.stringify(updates.output));
    }
    if (updates.errorMessage !== undefined) {
      fields.push('error_message = ?');
      values.push(updates.errorMessage);
    }
    if (updates.duration !== undefined) {
      fields.push('duration = ?');
      values.push(updates.duration);
    }

    if (fields.length === 0) return;

    const sql = `UPDATE project_steps SET ${fields.join(', ')} WHERE id = ?`;
    values.push(stepId);

    await this.runQuery(sql, values);
  }

  async getSteps(sessionId: string): Promise<ProjectStep[]> {
    const sql = `SELECT * FROM project_steps WHERE session_id = ? ORDER BY step_number`;
    const rows = await this.allQuery(sql, [sessionId]);
    
    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      stepNumber: row.step_number,
      stepType: row.step_type,
      title: row.title,
      description: row.description,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      status: row.status,
      input: JSON.parse(row.input || '{}'),
      output: JSON.parse(row.output || '{}'),
      errorMessage: row.error_message,
      duration: row.duration,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  // Metrik işlemleri
  async initializeMetrics(sessionId: string): Promise<void> {
    const sql = `
      INSERT OR IGNORE INTO project_metrics (session_id)
      VALUES (?)
    `;
    await this.runQuery(sql, [sessionId]);
  }

  async updateMetrics(sessionId: string, updates: Partial<ProjectMetrics>): Promise<void> {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (key !== 'sessionId' && updates[key as keyof ProjectMetrics] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = ?`);
        values.push(updates[key as keyof ProjectMetrics]);
      }
    });

    if (fields.length === 0) return;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE project_metrics SET ${fields.join(', ')} WHERE session_id = ?`;
    values.push(sessionId);

    await this.runQuery(sql, values);
  }

  async getMetrics(sessionId: string): Promise<ProjectMetrics | null> {
    const sql = `SELECT * FROM project_metrics WHERE session_id = ?`;
    const row = await this.getQuery(sql, [sessionId]);
    
    if (!row) return null;
    
    return {
      sessionId: row.session_id,
      totalFiles: row.total_files,
      filesCreated: row.files_created,
      filesModified: row.files_modified,
      filesDeleted: row.files_deleted,
      linesOfCode: row.lines_of_code,
      commandsExecuted: row.commands_executed,
      errorsEncountered: row.errors_encountered,
      timeSpent: row.time_spent,
      complexity: row.complexity,
      efficiency: row.efficiency
    };
  }

  // AI İçgörü işlemleri
  async addInsight(insight: Omit<AIInsight, 'id'>): Promise<string> {
    const id = uuidv4();
    const sql = `
      INSERT INTO ai_insights 
      (id, session_id, timestamp, insight_type, title, description, confidence, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runQuery(sql, [
      id,
      insight.sessionId,
      insight.timestamp.toISOString(),
      insight.insightType,
      insight.title,
      insight.description,
      insight.confidence,
      JSON.stringify(insight.metadata)
    ]);
    
    return id;
  }

  async getInsights(sessionId: string): Promise<AIInsight[]> {
    const sql = `SELECT * FROM ai_insights WHERE session_id = ? ORDER BY timestamp DESC`;
    const rows = await this.allQuery(sql, [sessionId]);
    
    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      timestamp: new Date(row.timestamp),
      insightType: row.insight_type,
      title: row.title,
      description: row.description,
      confidence: row.confidence,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  // Zaman çizelgesi işlemleri
  async addTimelineEvent(event: Omit<TimelineEvent, 'id'>): Promise<string> {
    const id = uuidv4();
    const sql = `
      INSERT INTO timeline_events 
      (id, session_id, timestamp, event_type, title, description, related_step_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runQuery(sql, [
      id,
      event.sessionId,
      event.timestamp.toISOString(),
      event.eventType,
      event.title,
      event.description,
      event.relatedStepId
    ]);
    
    return id;
  }

  async getTimeline(sessionId: string): Promise<TimelineEvent[]> {
    const sql = `SELECT * FROM timeline_events WHERE session_id = ? ORDER BY timestamp`;
    const rows = await this.allQuery(sql, [sessionId]);
    
    return rows.map(row => ({
      sessionId: row.session_id,
      timestamp: new Date(row.timestamp),
      eventType: row.event_type,
      title: row.title,
      description: row.description,
      relatedStepId: row.related_step_id
    }));
  }

  // Kapanış işlemi
  close(): void {
    this.db.close();
  }
} 