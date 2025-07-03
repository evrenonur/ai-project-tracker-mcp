# 🤖 AI Proje Takipçisi MCP Servisi

**Yapay zeka destekli proje geliştirme süreçlerini detaylı olarak takip eden Model Context Protocol (MCP) servisi**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-blue?style=for-the-badge)](https://github.com/modelcontextprotocol)

## 📖 Genel Bakış

AI Proje Takipçisi, yapay zeka ile geliştirilen projelerin her adımını, metriklerini ve performansını detaylı olarak izleyen bir MCP servisidir. Proje sürecindeki tüm aktiviteleri kayıt altına alır, analiz eder ve kapsamlı raporlar sunar.

### 🎯 Temel Özellikler

- **🚀 Proje Takibi**: AI projelerinin başlangıçtan bitişe kadar her adımını izler
- **📊 Metrik Analizi**: Dosya işlemleri, kod satırları, süre ve verimlilik metrikleri
- **💡 AI İçgörüleri**: Akıllı öneriler, uyarılar ve optimizasyon tavsiyeleri
- **📈 Zaman Çizelgesi**: Projedeki tüm olayların kronolojik takibi
- **📋 Çoklu Rapor Formatı**: JSON, HTML ve text formatlarında detaylı raporlar
- **🎨 Görsel Çıktılar**: Renkli terminal çıktıları ve modern HTML raporları
- **🗄️ Kalıcı Depolama**: SQLite veritabanı ile güvenli veri saklama

## 🛠️ Kurulum

### Gereksinimler

- **Node.js** 18.0.0 veya üzeri
- **npm** veya **yarn** paket yöneticisi

### Hızlı Kurulum

```bash
# Projeyi klonlayın
git clone <repository-url>
cd mcp

# Bağımlılıkları yükleyin
npm install

# TypeScript kodunu derleyin
npm run build

# Servisi başlatın
npm start
```

### Geliştirme Modu

```bash
# Geliştirme modunda çalıştırın (hot reload)
npm run dev
```

## 📚 Kullanım

### MCP İstemcisi ile Bağlantı

Bu servis Model Context Protocol üzerinden çalışır. Destekleyen MCP istemcileri ile bağlanabilirsiniz:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'ai-project-tracker-client',
  version: '1.0.0'
});

// Servise bağlanın
await client.connect(transport);
```

### Temel İş Akışı

```typescript
// 1. Proje başlatın
const startResult = await client.callTool('start_project', {
  projectName: 'Örnek AI Projesi',
  description: 'Claude ile web uygulaması geliştirme',
  aiModel: 'Claude-3.5'
});

const sessionId = startResult.data.sessionId;

// 2. Adım başlatın
const stepResult = await client.callTool('start_step', {
  sessionId,
  stepType: 'analysis',
  title: 'Proje Analizi',
  description: 'Projenin gereksinimlerini analiz et'
});

const stepId = stepResult.data.stepId;

// 3. Adımı tamamlayın
await client.callTool('complete_step', {
  stepId,
  status: 'completed',
  output: { analysis: 'Gereksinimler belirlendi' }
});

// 4. Rapor oluşturun
const report = await client.callTool('generate_report', {
  sessionId,
  format: 'html'
});
```

## 🔧 Mevcut Araçlar

| Araç | Açıklama | Parametreler |
|------|----------|-------------|
| `start_project` | Yeni proje oturumu başlatır | `projectName`, `description`, `aiModel?` |
| `start_step` | Yeni adım başlatır | `sessionId`, `stepType`, `title`, `description` |
| `complete_step` | Adımı tamamlar | `stepId`, `status?`, `output?` |
| `add_log` | Adıma log ekler | `stepId`, `content`, `severity?` |
| `update_metrics` | Proje metriklerini günceller | `sessionId`, `metrics` |
| `add_insight` | AI içgörüsü ekler | `sessionId`, `insightType`, `title`, `description` |
| `complete_project` | Projeyi tamamlar | `sessionId`, `status?` |
| `generate_report` | Detaylı rapor oluşturur | `sessionId`, `format?` |
| `get_project_status` | Proje durumunu alır | `sessionId` |
| `list_steps` | Adımları listeler | `sessionId`, `status?` |
| `get_timeline` | Zaman çizelgesini alır | `sessionId`, `eventType?` |
| `get_insights` | İçgörüleri alır | `sessionId`, `insightType?` |
| `list_sessions` | Oturumları listeler | `status?`, `limit?` |

### 📁 Adım Türleri

- `analysis` - Analiz ve inceleme
- `file_read` - Dosya okuma
- `file_write` - Dosya yazma
- `code_generation` - Kod oluşturma
- `dependency_install` - Bağımlılık kurulumu
- `command_execution` - Komut çalıştırma
- `testing` - Test işlemleri
- `debugging` - Hata ayıklama
- `optimization` - Optimizasyon
- `deployment` - Dağıtım
- `documentation` - Dokümantasyon
- `research` - Araştırma
- `planning` - Planlama
- `review` - İnceleme
- `custom` - Özel işlem

## 📊 Metrikler ve Raporlama

### Takip Edilen Metrikler

- **Dosya İşlemleri**: Oluşturulan, değiştirilen, silinen dosya sayıları
- **Kod İstatistikleri**: Toplam kod satırı sayısı
- **Süre Analizi**: Adım ve toplam proje süreleri
- **Hata İstatistikleri**: Karşılaşılan hata sayıları
- **Verimlilik Skoru**: 0-100 arası performans değerlendirmesi
- **Karmaşıklık Seviyesi**: Düşük, orta, yüksek

### Rapor Formatları

#### JSON Raporu
```json
{
  "session": { /* proje bilgileri */ },
  "steps": [ /* tüm adımlar */ ],
  "metrics": { /* performans metrikleri */ },
  "insights": [ /* AI içgörüleri */ ],
  "timeline": [ /* olay geçmişi */ ],
  "summary": { /* özet bilgiler */ }
}
```

#### HTML Raporu
Modern, responsive web sayfası formatında:
- 📈 Görsel metrik kartları
- 🎯 Adım durumu göstergeleri
- 💡 İçgörü panelleri
- 📅 İnteraktif zaman çizelgesi

#### Metin Raporu
Terminalde renkli ve düzenli formatlama

## 🗄️ Veritabanı Yapısı

Proje SQLite veritabanı kullanır ve şu tabloları içerir:

- `sessions` - Proje oturumları
- `steps` - Proje adımları
- `step_details` - Adım detayları ve logları
- `metrics` - Proje metrikleri
- `insights` - AI içgörüleri
- `timeline` - Olay geçmişi

## 🎨 Özelleştirme

### Veritabanı Konumu
```typescript
const tracker = new AIProjectTracker('/özel/yol/database.db');
```

### Özel Metrik Alanları
```typescript
await tracker.updateMetrics(sessionId, {
  totalFiles: 15,
  filesCreated: 8,
  customMetric: 'özel_değer'
});
```

## 🔍 Örnekler

### Tam Proje Döngüsü

```typescript
// Proje başlat
const sessionId = await client.callTool('start_project', {
  projectName: 'E-ticaret API',
  description: 'Node.js ile RESTful API geliştirme',
  aiModel: 'Claude-3.5'
});

// Analiz adımı
const analysisStepId = await client.callTool('start_step', {
  sessionId: sessionId.data.sessionId,
  stepType: 'analysis',
  title: 'Gereksinim Analizi',
  description: 'API gereksinimlerini belirle'
});

// Kod oluşturma adımı
const codeStepId = await client.callTool('start_step', {
  sessionId: sessionId.data.sessionId,
  stepType: 'code_generation',
  title: 'API Endpoint\'leri',
  description: 'CRUD işlemleri için endpoint\'ler oluştur'
});

// Metrik güncelleme
await client.callTool('update_metrics', {
  sessionId: sessionId.data.sessionId,
  metrics: {
    totalFiles: 5,
    filesCreated: 5,
    linesOfCode: 250,
    complexity: 'medium',
    efficiency: 85
  }
});

// İçgörü ekleme
await client.callTool('add_insight', {
  sessionId: sessionId.data.sessionId,
  insightType: 'recommendation',
  title: 'Güvenlik Önerisi',
  description: 'API endpoint\'lerine rate limiting eklenebilir',
  confidence: 90
});

// HTML rapor oluştur
const report = await client.callTool('generate_report', {
  sessionId: sessionId.data.sessionId,
  format: 'html'
});
```

## 🧪 Test

```bash
# Testleri çalıştır
npm test

# Test kapsamı raporu
npm run test:coverage
```

## 📦 Paketleme

```bash
# Production build
npm run build

# NPM paketi oluştur
npm pack
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik ekle'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🆘 Destek

- 📧 **E-posta**: onur.evren.1999@gmail.com


## 🗺️ Yol Haritası

- [ ] **v1.1.0**: Web arayüzü eklenmesi
- [ ] **v1.2.0**: Gerçek zamanlı dashboard
- [ ] **v1.3.0**: Slack/Discord entegrasyonu
- [ ] **v2.0.0**: Çoklu AI model desteği

---

**AI Proje Takipçisi** ile projelerinizi daha verimli geliştirin! 🚀
