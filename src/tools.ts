import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const TOOLS: Tool[] = [
  // Proje başlatma aracı
  {
    name: 'start_project',
    description: 'Yeni bir AI proje takip oturumu başlatır',
    inputSchema: {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: 'Projenin adı'
        },
        description: {
          type: 'string',
          description: 'Projenin açıklaması'
        },
        aiModel: {
          type: 'string',
          description: 'Kullanılan AI modeli (opsiyonel, varsayılan: Claude-3.5)',
          default: 'Claude-3.5'
        },
        metadata: {
          type: 'object',
          description: 'Ek proje bilgileri (opsiyonel)',
          additionalProperties: true
        }
      },
      required: ['projectName', 'description']
    }
  },

  // Adım başlatma aracı
  {
    name: 'start_step',
    description: 'Projede yeni bir adım başlatır',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        stepType: {
          type: 'string',
          enum: [
            'analysis', 'file_read', 'file_write', 'code_generation',
            'dependency_install', 'command_execution', 'testing',
            'debugging', 'optimization', 'deployment', 'documentation',
            'research', 'planning', 'review', 'custom'
          ],
          description: 'Adımın türü'
        },
        title: {
          type: 'string',
          description: 'Adımın başlığı'
        },
        description: {
          type: 'string',
          description: 'Adımın detaylı açıklaması'
        },
        input: {
          type: 'object',
          description: 'Adım için giriş verileri (opsiyonel)',
          additionalProperties: true
        },
        metadata: {
          type: 'object',
          description: 'Ek adım bilgileri (opsiyonel)',
          additionalProperties: true
        }
      },
      required: ['sessionId', 'stepType', 'title', 'description']
    }
  },

  // Adım tamamlama aracı
  {
    name: 'complete_step',
    description: 'Başlatılan bir adımı tamamlar',
    inputSchema: {
      type: 'object',
      properties: {
        stepId: {
          type: 'string',
          description: 'Tamamlanacak adımın ID\'si'
        },
        status: {
          type: 'string',
          enum: ['completed', 'failed', 'skipped'],
          description: 'Adımın final durumu',
          default: 'completed'
        },
        output: {
          type: 'object',
          description: 'Adımdan elde edilen çıktı (opsiyonel)',
          additionalProperties: true
        },
        errorMessage: {
          type: 'string',
          description: 'Hata mesajı (başarısız durumda, opsiyonel)'
        }
      },
      required: ['stepId']
    }
  },

  // Log ekleme aracı
  {
    name: 'add_log',
    description: 'Bir adıma log kaydı ekler',
    inputSchema: {
      type: 'object',
      properties: {
        stepId: {
          type: 'string',
          description: 'Log eklenecek adımın ID\'si'
        },
        content: {
          type: 'string',
          description: 'Log içeriği'
        },
        severity: {
          type: 'string',
          enum: ['info', 'warning', 'error', 'debug'],
          description: 'Log seviyesi',
          default: 'info'
        },
        metadata: {
          type: 'object',
          description: 'Ek log bilgileri (opsiyonel)',
          additionalProperties: true
        }
      },
      required: ['stepId', 'content']
    }
  },

  // Metrik güncelleme aracı
  {
    name: 'update_metrics',
    description: 'Proje metriklerini günceller',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        metrics: {
          type: 'object',
          properties: {
            totalFiles: { type: 'integer', description: 'Toplam dosya sayısı' },
            filesCreated: { type: 'integer', description: 'Oluşturulan dosya sayısı' },
            filesModified: { type: 'integer', description: 'Değiştirilen dosya sayısı' },
            filesDeleted: { type: 'integer', description: 'Silinen dosya sayısı' },
            linesOfCode: { type: 'integer', description: 'Toplam kod satırı sayısı' },
            commandsExecuted: { type: 'integer', description: 'Çalıştırılan komut sayısı' },
            errorsEncountered: { type: 'integer', description: 'Karşılaşılan hata sayısı' },
            timeSpent: { type: 'integer', description: 'Harcanan süre (milisaniye)' },
            complexity: { 
              type: 'string', 
              enum: ['low', 'medium', 'high'],
              description: 'Proje karmaşıklığı' 
            },
            efficiency: { 
              type: 'integer', 
              minimum: 0, 
              maximum: 100,
              description: 'Verimlilik skoru (0-100)' 
            }
          },
          additionalProperties: false
        }
      },
      required: ['sessionId', 'metrics']
    }
  },

  // İçgörü ekleme aracı
  {
    name: 'add_insight',
    description: 'Proje için AI içgörüsü ekler',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        insightType: {
          type: 'string',
          enum: ['pattern', 'recommendation', 'warning', 'optimization', 'milestone'],
          description: 'İçgörü türü'
        },
        title: {
          type: 'string',
          description: 'İçgörü başlığı'
        },
        description: {
          type: 'string',
          description: 'İçgörü açıklaması'
        },
        confidence: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          description: 'Güven oranı (0-100)',
          default: 85
        },
        metadata: {
          type: 'object',
          description: 'Ek içgörü bilgileri (opsiyonel)',
          additionalProperties: true
        }
      },
      required: ['sessionId', 'insightType', 'title', 'description']
    }
  },

  // Proje tamamlama aracı
  {
    name: 'complete_project',
    description: 'Projeyi tamamlar',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        status: {
          type: 'string',
          enum: ['completed', 'failed'],
          description: 'Proje final durumu',
          default: 'completed'
        }
      },
      required: ['sessionId']
    }
  },

  // Rapor oluşturma aracı
  {
    name: 'generate_report',
    description: 'Proje için detaylı rapor oluşturur',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        format: {
          type: 'string',
          enum: ['json', 'text', 'html'],
          description: 'Rapor formatı',
          default: 'json'
        }
      },
      required: ['sessionId']
    }
  },

  // Proje durumu sorgulama aracı
  {
    name: 'get_project_status',
    description: 'Projenin mevcut durumunu alır',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        }
      },
      required: ['sessionId']
    }
  },

  // Adım listesi alma aracı
  {
    name: 'list_steps',
    description: 'Projenin tüm adımlarını listeler',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'failed', 'skipped'],
          description: 'Belirli durumda olan adımları filtrele (opsiyonel)'
        }
      },
      required: ['sessionId']
    }
  },

  // Zaman çizelgesi alma aracı
  {
    name: 'get_timeline',
    description: 'Proje zaman çizelgesini alır',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        eventType: {
          type: 'string',
          enum: ['step_start', 'step_complete', 'error', 'milestone', 'pause', 'resume'],
          description: 'Belirli olay türünü filtrele (opsiyonel)'
        }
      },
      required: ['sessionId']
    }
  },

  // İçgörüler alma aracı
  {
    name: 'get_insights',
    description: 'Proje içgörülerini alır',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Proje oturum ID\'si'
        },
        insightType: {
          type: 'string',
          enum: ['pattern', 'recommendation', 'warning', 'optimization', 'milestone'],
          description: 'Belirli içgörü türünü filtrele (opsiyonel)'
        }
      },
      required: ['sessionId']
    }
  },

  // Mevcut oturumları listeleme aracı
  {
    name: 'list_sessions',
    description: 'Tüm proje oturumlarını listeler',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'completed', 'paused', 'failed'],
          description: 'Belirli durumda olan oturumları filtrele (opsiyonel)'
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Sonuç sayısını sınırla',
          default: 10
        }
      }
    }
  }
];

export const TOOL_DESCRIPTIONS = {
  start_project: 'Yeni bir AI proje takip oturumu başlatır. Proje adı, açıklama ve AI modeli bilgilerini alır.',
  start_step: 'Projede yeni bir adım başlatır. Adım türü, başlık ve açıklama gereklidir.',
  complete_step: 'Başlatılan bir adımı tamamlar. Başarılı, başarısız veya atlandı durumlarından birini alabilir.',
  add_log: 'Bir adıma log kaydı ekler. Farklı seviyede logları destekler.',
  update_metrics: 'Proje metriklerini günceller. Dosya sayıları, kod satırları ve performans metrikleri.',
  add_insight: 'Proje için AI içgörüsü ekler. Farklı türde içgörüler ve güven oranları destekler.',
  complete_project: 'Projeyi tamamlar. Başarılı veya başarısız durumunda bitirebilir.',
  generate_report: 'Proje için detaylı rapor oluşturur. JSON, text veya HTML formatlarında.',
  get_project_status: 'Projenin mevcut durumunu ve temel bilgilerini alır.',
  list_steps: 'Projenin tüm adımlarını listeler. Duruma göre filtreleme yapılabilir.',
  get_timeline: 'Proje zaman çizelgesini alır. Tüm olayları kronolojik sırada gösterir.',
  get_insights: 'Proje içgörülerini alır. Türe göre filtreleme yapılabilir.',
  list_sessions: 'Tüm proje oturumlarını listeler. Duruma göre filtreleme ve sayı sınırlaması.'
}; 