import { DatabaseManager } from './database.js';
import { format } from 'date-fns';
import chalk from 'chalk';
export class AIProjectTracker {
    db;
    currentSession = null;
    stepStartTimes = new Map();
    constructor(dbPath) {
        this.db = new DatabaseManager(dbPath);
    }
    // Proje oturumu başlatma
    async startProject(projectName, description, aiModel = 'Claude-3.5', metadata = {}) {
        const sessionId = await this.db.createSession({
            projectName,
            description,
            startTime: new Date(),
            status: 'active',
            totalSteps: 0,
            currentStep: 0,
            aiModel,
            metadata
        });
        this.currentSession = await this.db.getSession(sessionId);
        await this.addTimelineEvent({
            sessionId,
            timestamp: new Date(),
            eventType: 'step_start',
            title: 'Proje Başlatıldı',
            description: `${projectName} projesi ${aiModel} ile başlatıldı`
        });
        console.log(chalk.green(`✅ Proje başlatıldı: ${projectName} (ID: ${sessionId})`));
        return sessionId;
    }
    // Proje adımı başlatma
    async startStep(sessionId, stepType, title, description, input, metadata = {}) {
        const session = await this.db.getSession(sessionId);
        if (!session) {
            throw new Error('Proje oturumu bulunamadı');
        }
        const stepNumber = session.currentStep + 1;
        const stepId = await this.db.createStep({
            sessionId,
            stepNumber,
            stepType,
            title,
            description,
            startTime: new Date(),
            status: 'in_progress',
            input,
            metadata
        });
        this.stepStartTimes.set(stepId, new Date());
        await this.db.updateSession(sessionId, {
            currentStep: stepNumber,
            totalSteps: stepNumber
        });
        await this.addTimelineEvent({
            sessionId,
            timestamp: new Date(),
            eventType: 'step_start',
            title: `Adım Başlatıldı: ${title}`,
            description: `${stepType} türünde adım başlatıldı`,
            relatedStepId: stepId
        });
        console.log(chalk.blue(`🚀 Adım başlatıldı: ${title} (${stepType})`));
        return stepId;
    }
    // Proje adımını tamamlama
    async completeStep(stepId, status = 'completed', output, errorMessage) {
        const endTime = new Date();
        const startTime = this.stepStartTimes.get(stepId);
        const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;
        await this.db.updateStep(stepId, {
            endTime,
            status,
            output,
            errorMessage,
            duration
        });
        this.stepStartTimes.delete(stepId);
        // Timeline olayı ekle
        const steps = await this.db.getSteps(this.currentSession?.id || '');
        const step = steps.find(s => s.id === stepId);
        if (step) {
            await this.addTimelineEvent({
                sessionId: step.sessionId,
                timestamp: endTime,
                eventType: status === 'completed' ? 'step_complete' : 'error',
                title: `Adım ${status === 'completed' ? 'Tamamlandı' : 'Başarısız'}: ${step.title}`,
                description: errorMessage || `Adım ${duration}ms sürede tamamlandı`,
                relatedStepId: stepId
            });
            const icon = status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
            const color = status === 'completed' ? chalk.green : status === 'failed' ? chalk.red : chalk.yellow;
            console.log(color(`${icon} Adım ${status === 'completed' ? 'tamamlandı' : 'başarısız'}: ${step.title}`));
        }
    }
    // Log ekleme
    async addLog(stepId, content, severity = 'info', metadata = {}) {
        // Bu fonksiyon step_details tablosunda kullanılabilir
        console.log(chalk.gray(`📝 Log: ${content}`));
    }
    // Metrik güncelleme
    async updateMetrics(sessionId, updates) {
        await this.db.updateMetrics(sessionId, updates);
        console.log(chalk.cyan(`📊 Metrikler güncellendi`));
    }
    // AI içgörüsü ekleme
    async addInsight(sessionId, insightType, title, description, confidence = 85, metadata = {}) {
        const insightId = await this.db.addInsight({
            sessionId,
            timestamp: new Date(),
            insightType,
            title,
            description,
            confidence,
            metadata
        });
        const icon = insightType === 'warning' ? '⚠️' : insightType === 'milestone' ? '🎯' : '💡';
        console.log(chalk.magenta(`${icon} İçgörü: ${title}`));
        return insightId;
    }
    // Proje tamamlama
    async completeProject(sessionId, status = 'completed') {
        await this.db.updateSession(sessionId, {
            endTime: new Date(),
            status
        });
        await this.addTimelineEvent({
            sessionId,
            timestamp: new Date(),
            eventType: 'milestone',
            title: `Proje ${status === 'completed' ? 'Tamamlandı' : 'Başarısız Oldu'}`,
            description: `Proje ${status === 'completed' ? 'başarıyla tamamlandı' : 'başarısız oldu'}`
        });
        const icon = status === 'completed' ? '🎉' : '💥';
        const color = status === 'completed' ? chalk.green : chalk.red;
        console.log(color(`${icon} Proje ${status === 'completed' ? 'tamamlandı' : 'başarısız oldu'}!`));
    }
    // Detaylı rapor oluşturma
    async generateReport(sessionId) {
        const session = await this.db.getSession(sessionId);
        if (!session) {
            throw new Error('Proje oturumu bulunamadı');
        }
        const steps = await this.db.getSteps(sessionId);
        const metrics = await this.db.getMetrics(sessionId);
        const insights = await this.db.getInsights(sessionId);
        const timeline = await this.db.getTimeline(sessionId);
        const summary = await this.generateSummary(session, steps, metrics);
        return {
            session,
            steps,
            metrics: metrics || {
                sessionId,
                totalFiles: 0,
                filesCreated: 0,
                filesModified: 0,
                filesDeleted: 0,
                linesOfCode: 0,
                commandsExecuted: 0,
                errorsEncountered: 0,
                timeSpent: 0,
                complexity: 'low',
                efficiency: 0
            },
            insights,
            timeline,
            summary
        };
    }
    // Proje özeti oluşturma
    async generateSummary(session, steps, metrics) {
        const completedSteps = steps.filter(s => s.status === 'completed');
        const failedSteps = steps.filter(s => s.status === 'failed');
        const totalTime = steps.reduce((acc, step) => acc + (step.duration || 0), 0);
        const completionPercentage = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;
        const efficiencyScore = Math.min(100, Math.max(0, 100 - (failedSteps.length / Math.max(1, steps.length)) * 50));
        let overallStatus = 'success';
        if (completionPercentage < 50) {
            overallStatus = 'failure';
        }
        else if (completionPercentage < 90 || failedSteps.length > 0) {
            overallStatus = 'partial_success';
        }
        const keyAchievements = completedSteps
            .filter(s => ['milestone', 'deployment', 'testing'].includes(s.stepType))
            .map(s => s.title);
        const mainChallenges = failedSteps.map(s => s.title);
        const nextSteps = steps
            .filter(s => s.status === 'pending')
            .slice(0, 3)
            .map(s => s.title);
        return {
            sessionId: session.id,
            overallStatus,
            completionPercentage: Math.round(completionPercentage),
            keyAchievements,
            mainChallenges,
            nextSteps,
            totalTimeSpent: totalTime,
            efficiencyScore: Math.round(efficiencyScore)
        };
    }
    // Zaman çizelgesi olayı ekleme
    async addTimelineEvent(event) {
        await this.db.addTimelineEvent(event);
    }
    // Mevcut oturumları listeleme
    async listSessions() {
        // Bu fonksiyon geliştirilecek - şimdilik boş döndürüyoruz
        return [];
    }
    // Güzel formatlanmış rapor yazdırma
    async printReport(sessionId) {
        const report = await this.generateReport(sessionId);
        console.log(chalk.bold.blue('\n=== PROJE RAPORU ==='));
        console.log(chalk.yellow(`Proje: ${report.session.projectName}`));
        console.log(chalk.gray(`Açıklama: ${report.session.description}`));
        console.log(chalk.gray(`AI Model: ${report.session.aiModel}`));
        console.log(chalk.gray(`Başlangıç: ${format(report.session.startTime, 'dd/MM/yyyy HH:mm')}`));
        if (report.session.endTime) {
            console.log(chalk.gray(`Bitiş: ${format(report.session.endTime, 'dd/MM/yyyy HH:mm')}`));
        }
        console.log(chalk.bold.green(`\n📊 ÖZET:`));
        console.log(`• Tamamlanma: %${report.summary.completionPercentage}`);
        console.log(`• Verimlilik: %${report.summary.efficiencyScore}`);
        console.log(`• Toplam Süre: ${Math.round(report.summary.totalTimeSpent / 1000)}s`);
        console.log(`• Durum: ${report.summary.overallStatus}`);
        if (report.summary.keyAchievements.length > 0) {
            console.log(chalk.bold.green(`\n🎯 BAŞARILAR:`));
            report.summary.keyAchievements.forEach(achievement => {
                console.log(chalk.green(`• ${achievement}`));
            });
        }
        if (report.summary.mainChallenges.length > 0) {
            console.log(chalk.bold.red(`\n⚠️ ZORLUKLAR:`));
            report.summary.mainChallenges.forEach(challenge => {
                console.log(chalk.red(`• ${challenge}`));
            });
        }
        console.log(chalk.bold.cyan(`\n📈 METRİKLER:`));
        console.log(`• Toplam Dosya: ${report.metrics.totalFiles}`);
        console.log(`• Oluşturulan: ${report.metrics.filesCreated}`);
        console.log(`• Değiştirilen: ${report.metrics.filesModified}`);
        console.log(`• Kod Satırı: ${report.metrics.linesOfCode}`);
        console.log(`• Komut: ${report.metrics.commandsExecuted}`);
        console.log(`• Hata: ${report.metrics.errorsEncountered}`);
        if (report.insights.length > 0) {
            console.log(chalk.bold.magenta(`\n💡 İÇGÖRÜLER:`));
            report.insights.slice(0, 5).forEach(insight => {
                console.log(chalk.magenta(`• ${insight.title} (%${insight.confidence})`));
            });
        }
    }
    // Veritabanı bağlantısını kapatma
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=tracker.js.map