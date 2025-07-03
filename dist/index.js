#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { AIProjectTracker } from './tracker.js';
import { TOOLS } from './tools.js';
class AIProjectTrackerMCP {
    server;
    tracker;
    constructor() {
        this.server = new Server({
            name: 'ai-project-tracker',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.tracker = new AIProjectTracker();
        this.setupHandlers();
    }
    setupHandlers() {
        // Araçları listele
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: TOOLS,
            };
        });
        // Araç çağırma işleyicisi
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                const result = await this.handleToolCall(name, args || {});
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
                throw new McpError(ErrorCode.InternalError, `Araç çağrısı başarısız: ${errorMessage}`);
            }
        });
    }
    async handleToolCall(name, args) {
        try {
            switch (name) {
                case 'start_project':
                    const sessionId = await this.tracker.startProject(args.projectName, args.description, args.aiModel, args.metadata);
                    return {
                        success: true,
                        data: { sessionId },
                        metadata: { action: 'project_started', timestamp: new Date().toISOString() }
                    };
                case 'start_step':
                    const stepId = await this.tracker.startStep(args.sessionId, args.stepType, args.title, args.description, args.input, args.metadata);
                    return {
                        success: true,
                        data: { stepId },
                        metadata: { action: 'step_started', timestamp: new Date().toISOString() }
                    };
                case 'complete_step':
                    await this.tracker.completeStep(args.stepId, args.status, args.output, args.errorMessage);
                    return {
                        success: true,
                        data: { message: 'Adım başarıyla tamamlandı' },
                        metadata: { action: 'step_completed', timestamp: new Date().toISOString() }
                    };
                case 'add_log':
                    await this.tracker.addLog(args.stepId, args.content, args.severity, args.metadata);
                    return {
                        success: true,
                        data: { message: 'Log başarıyla eklendi' },
                        metadata: { action: 'log_added', timestamp: new Date().toISOString() }
                    };
                case 'update_metrics':
                    await this.tracker.updateMetrics(args.sessionId, args.metrics);
                    return {
                        success: true,
                        data: { message: 'Metrikler başarıyla güncellendi' },
                        metadata: { action: 'metrics_updated', timestamp: new Date().toISOString() }
                    };
                case 'add_insight':
                    const insightId = await this.tracker.addInsight(args.sessionId, args.insightType, args.title, args.description, args.confidence, args.metadata);
                    return {
                        success: true,
                        data: { insightId },
                        metadata: { action: 'insight_added', timestamp: new Date().toISOString() }
                    };
                case 'complete_project':
                    await this.tracker.completeProject(args.sessionId, args.status);
                    return {
                        success: true,
                        data: { message: 'Proje başarıyla tamamlandı' },
                        metadata: { action: 'project_completed', timestamp: new Date().toISOString() }
                    };
                case 'generate_report':
                    const report = await this.tracker.generateReport(args.sessionId);
                    if (args.format === 'text') {
                        await this.tracker.printReport(args.sessionId);
                        return {
                            success: true,
                            data: { message: 'Rapor konsola yazdırıldı', format: 'text' },
                            metadata: { action: 'report_generated', format: 'text' }
                        };
                    }
                    else if (args.format === 'html') {
                        const htmlReport = this.generateHTMLReport(report);
                        return {
                            success: true,
                            data: { report: htmlReport, format: 'html' },
                            metadata: { action: 'report_generated', format: 'html' }
                        };
                    }
                    else {
                        return {
                            success: true,
                            data: { report, format: 'json' },
                            metadata: { action: 'report_generated', format: 'json' }
                        };
                    }
                case 'get_project_status':
                    const session = await this.tracker.db.getSession(args.sessionId);
                    if (!session) {
                        return {
                            success: false,
                            error: 'Proje oturumu bulunamadı'
                        };
                    }
                    return {
                        success: true,
                        data: { session },
                        metadata: { action: 'status_retrieved' }
                    };
                case 'list_steps':
                    const steps = await this.tracker.db.getSteps(args.sessionId);
                    const filteredSteps = args.status
                        ? steps.filter(step => step.status === args.status)
                        : steps;
                    return {
                        success: true,
                        data: { steps: filteredSteps, count: filteredSteps.length },
                        metadata: { action: 'steps_listed', filter: args.status || 'none' }
                    };
                case 'get_timeline':
                    const timeline = await this.tracker.db.getTimeline(args.sessionId);
                    const filteredTimeline = args.eventType
                        ? timeline.filter(event => event.eventType === args.eventType)
                        : timeline;
                    return {
                        success: true,
                        data: { timeline: filteredTimeline, count: filteredTimeline.length },
                        metadata: { action: 'timeline_retrieved', filter: args.eventType || 'none' }
                    };
                case 'get_insights':
                    const insights = await this.tracker.db.getInsights(args.sessionId);
                    const filteredInsights = args.insightType
                        ? insights.filter(insight => insight.insightType === args.insightType)
                        : insights;
                    return {
                        success: true,
                        data: { insights: filteredInsights, count: filteredInsights.length },
                        metadata: { action: 'insights_retrieved', filter: args.insightType || 'none' }
                    };
                case 'list_sessions':
                    const sessions = await this.tracker.listSessions(args.status, args.limit);
                    return {
                        success: true,
                        data: { sessions, count: sessions.length },
                        metadata: {
                            action: 'sessions_listed',
                            filter: args.status || 'none',
                            limit: args.limit || 'none'
                        }
                    };
                default:
                    return {
                        success: false,
                        error: `Bilinmeyen araç: ${name}`
                    };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
            return {
                success: false,
                error: errorMessage,
                metadata: { action: name, timestamp: new Date().toISOString() }
            };
        }
    }
    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Proje Raporu - ${report.session.projectName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
        .step { background: #fff; border: 1px solid #dee2e6; border-radius: 6px; padding: 15px; margin: 10px 0; }
        .step.completed { border-left: 4px solid #28a745; }
        .step.failed { border-left: 4px solid #dc3545; }
        .step.in_progress { border-left: 4px solid #ffc107; }
        .insight { background: #e7f3ff; border: 1px solid #b8daff; border-radius: 6px; padding: 12px; margin: 8px 0; }
        .timeline-event { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
        .timeline-icon { width: 20px; height: 20px; border-radius: 50%; margin-right: 12px; }
        .timeline-icon.start { background-color: #28a745; }
        .timeline-icon.complete { background-color: #007bff; }
        .timeline-icon.error { background-color: #dc3545; }
        .timeline-icon.milestone { background-color: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 AI Proje Raporu</h1>
            <h2>${report.session.projectName}</h2>
            <p>${report.session.description}</p>
            <p><strong>AI Model:</strong> ${report.session.aiModel} | <strong>Durum:</strong> ${report.session.status}</p>
        </div>

        <div class="metric-grid">
            <div class="metric-card">
                <h3>📈 Tamamlanma</h3>
                <p style="font-size: 24px; font-weight: bold; color: #007bff;">%${report.summary.completionPercentage}</p>
            </div>
            <div class="metric-card">
                <h3>⚡ Verimlilik</h3>
                <p style="font-size: 24px; font-weight: bold; color: #28a745;">%${report.summary.efficiencyScore}</p>
            </div>
            <div class="metric-card">
                <h3>⏱️ Toplam Süre</h3>
                <p style="font-size: 24px; font-weight: bold; color: #6f42c1;">${Math.round(report.summary.totalTimeSpent / 1000)}s</p>
            </div>
            <div class="metric-card">
                <h3>📁 Dosyalar</h3>
                <p style="font-size: 24px; font-weight: bold; color: #fd7e14;">${report.metrics.totalFiles}</p>
            </div>
        </div>

        <h3>🎯 Proje Adımları</h3>
        ${report.steps.map((step) => `
            <div class="step ${step.status}">
                <h4>${step.title} <span style="font-size: 12px; color: #6c757d;">(${step.stepType})</span></h4>
                <p>${step.description}</p>
                <small>Durum: ${step.status} | Süre: ${step.duration ? Math.round(step.duration / 1000) + 's' : 'N/A'}</small>
            </div>
        `).join('')}

        ${report.insights.length > 0 ? `
            <h3>💡 AI İçgörüleri</h3>
            ${report.insights.map((insight) => `
                <div class="insight">
                    <h4>${insight.title} <span style="font-size: 12px;">(%${insight.confidence} güven)</span></h4>
                    <p>${insight.description}</p>
                    <small>Tür: ${insight.insightType}</small>
                </div>
            `).join('')}
        ` : ''}

        <h3>📅 Zaman Çizelgesi</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            ${report.timeline.map((event) => `
                <div class="timeline-event">
                    <div class="timeline-icon ${event.eventType}"></div>
                    <div>
                        <strong>${event.title}</strong>
                        <div style="font-size: 12px; color: #6c757d;">
                            ${new Date(event.timestamp).toLocaleString('tr-TR')}
                        </div>
                        ${event.description ? `<div style="font-size: 14px; margin-top: 4px;">${event.description}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('🚀 AI Proje Takipçisi MCP Serveri başlatıldı!');
    }
    async cleanup() {
        this.tracker.close();
    }
}
// Server'ı başlat
const server = new AIProjectTrackerMCP();
// Graceful shutdown için cleanup handler'ları ekle
process.on('SIGINT', async () => {
    console.error('\n🔄 Sunucu kapatılıyor...');
    await server.cleanup();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.error('\n🔄 Sunucu kapatılıyor...');
    await server.cleanup();
    process.exit(0);
});
// Hataları yakala
process.on('uncaughtException', (error) => {
    console.error('💥 Yakalanmamış hata:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Yakalanmamış promise reddi:', reason);
    process.exit(1);
});
// Server'ı başlat
server.run().catch((error) => {
    console.error('💥 Sunucu başlatılamadı:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map