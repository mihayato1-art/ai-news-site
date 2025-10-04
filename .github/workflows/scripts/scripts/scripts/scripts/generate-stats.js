// 📊 統計・分析データ生成スクリプト（GitHub Actions用）
const fs = require('fs');
const path = require('path');

class StatsGenerator {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.distDir = path.join(process.cwd(), 'dist');
    this.statsFile = path.join(this.dataDir, 'site-stats.json');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.dataDir, this.distDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async generateStats() {
    console.log('📊 統計データを生成中...');
    
    try {
      // 各種データ読み込み
      const newsData = this.loadNewsData();
      const toolsData = this.loadToolsData();
      const previousStats = this.loadPreviousStats();
      
      // 統計計算
      const currentStats = this.calculateStats(newsData, toolsData, previousStats);
      
      // 統計データ保存
      await this.saveStats(currentStats);
      
      // ダッシュボードHTML生成
      await this.generateDashboard(currentStats);
      
      console.log('✅ 統計データ生成完了');
      
    } catch (error) {
      console.error('❌ 統計生成エラー:', error);
      throw error;
    }
  }

  loadNewsData() {
    const newsFile = path.join(this.dataDir, 'latest-news.json');
    if (fs.existsSync(newsFile)) {
      return JSON.parse(fs.readFileSync(newsFile, 'utf8'));
    }
    return { news: [], totalCount: 0 };
  }

  loadToolsData() {
    const toolsFile = path.join(this.dataDir, 'ai-tools.json');
    if (fs.existsSync(toolsFile)) {
      return JSON.parse(fs.readFileSync(toolsFile, 'utf8'));
    }
    return { tools: [], totalCount: 0 };
  }

  loadPreviousStats() {
    if (fs.existsSync(this.statsFile)) {
      return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
    }
    return null;
  }

  calculateStats(newsData, toolsData, previousStats) {
    const now = new Date();
    const news = newsData.news || [];
    const tools = toolsData.tools || [];

    // 基本統計
    const basicStats = {
      totalNews: news.length,
      totalTools: tools.length,
      importantNews: news.filter(n => n.importance >= 7).length,
      mediumNews: news.filter(n => n.importance >= 5 && n.importance < 7).length,
      lowNews: news.filter(n => n.importance < 5).length
    };

    // ニュースソース統計
    const sourceCounts = {};
    news.forEach(article => {
      sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
    });

    // カテゴリ統計
    const categoryCounts = {};
    tools.forEach(tool => {
      categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
    });

    // トレンド分析
    const trends = this.analyzeTrends(news);

    // 品質指標
    const qualityMetrics = this.calculateQualityMetrics(news);

    const currentStats = {
      generatedAt: now.toISOString(),
      period: {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        end: now.toISOString()
      },
      basic: basicStats,
      sources: sourceCounts,
      categories: categoryCounts,
      trends: trends,
      quality: qualityMetrics,
      performance: {
        updateFrequency: '12時間毎',
        lastUpdate: now.toISOString(),
        dataFreshness: this.calculateDataFreshness(news),
        coverageScore: this.calculateCoverageScore(news, tools)
      }
    };

    return currentStats;
  }

  analyzeTrends(news) {
    // キーワード分析
    const keywords = this.extractTrendingKeywords(news);
    
    return {
      newsVolume: 'stable',
      importanceLevel: 'stable',
      sourceVariety: 'stable',
      keywords: keywords
    };
  }

  extractTrendingKeywords(news) {
    const keywordCounts = {};
    const importantKeywords = [
      'ChatGPT', 'GPT-4', 'Claude', 'Gemini', 'OpenAI', 'Anthropic',
      'Google AI', 'AI', '人工知能', 'machine learning', '機械学習',
      'breakthrough', '革新', 'release', '発表', 'update', 'アップデート'
    ];

    news.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      
      importantKeywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
      });
    });

    return Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  calculateQualityMetrics(news) {
    return {
      averageImportance: news.length > 0 ? 
        (news.reduce((sum, n) => sum + n.importance, 0) / news.length).toFixed(2) : 0,
      highQualityRatio: news.length > 0 ? 
        ((news.filter(n => n.importance >= 7).length / news.length) * 100).toFixed(1) : 0,
      descriptionCoverage: news.length > 0 ? 
        ((news.filter(n => n.description && n.description.length > 50).length / news.length) * 100).toFixed(1) : 0,
      sourceReliability: this.calculateSourceReliability(news)
    };
  }

  calculateSourceReliability(news) {
    const reliableSources = [
      'OpenAI Blog', 'Google AI Blog', 'Anthropic News', 
      'MIT Tech Review AI', 'ITmedia AI'
    ];
    
    const reliableCount = news.filter(n => reliableSources.includes(n.source)).length;
    return news.length > 0 ? ((reliableCount / news.length) * 100).toFixed(1) : 0;
  }

  calculateDataFreshness(news) {
    if (news.length === 0) return 0;
    
    const now = new Date();
    const freshness = news.map(article => {
      if (!article.publishedAt) return 0;
      const publishedTime = new Date(article.publishedAt);
      const hoursOld = (now - publishedTime) / (1000 * 60 * 60);
      return Math.max(0, 100 - hoursOld * 2); // 50時間で0になる
    });

    return (freshness.reduce((sum, f) => sum + f, 0) / freshness.length).toFixed(1);
  }

  calculateCoverageScore(news, tools) {
    const expectedSources = 8; // 期待するソース数
    const expectedTools = 6;   // 期待するツール数
    
    const sourceCoverage = Math.min(100, (new Set(news.map(n => n.source)).size / expectedSources) * 100);
    const toolCoverage = Math.min(100, (tools.length / expectedTools) * 100);
    
    return ((sourceCoverage + toolCoverage) / 2).toFixed(1);
  }

  async saveStats(stats) {
    // メイン統計ファイル
    fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    
    // API用統計ファイル
    const apiStats = {
      lastUpdated: stats.generatedAt,
      summary: {
        totalNews: stats.basic.totalNews,
        importantNews: stats.basic.importantNews,
        averageImportance: stats.quality.averageImportance,
        dataFreshness: stats.performance.dataFreshness
      },
      trends: stats.trends.keywords.slice(0, 5)
    };
    
    fs.writeFileSync(
      path.join(this.distDir, 'api-stats.json'),
      JSON.stringify(apiStats, null, 2)
    );

    console.log('💾 統計データ保存完了');
  }

  async generateDashboard(stats) {
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI情報サイト ダッシュボード</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { color: #1e293b; }
        .last-updated { color: #64748b; font-size: 0.9rem; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #64748b; font-size: 0.9rem; }
        
        .chart-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .chart-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 15px; color: #1e293b; }
        
        .quality-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric { text-align: center; padding: 15px; background: #f1f5f9; border-radius: 8px; }
        .metric-value { font-size: 1.5rem; font-weight: bold; color: #667eea; }
        .metric-label { font-size: 0.8rem; color: #64748b; margin-top: 5px; }
        
        .trending-keywords { display: flex; flex-wrap: wrap; gap: 10px; }
        .keyword-tag { background: #667eea; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; }
        .keyword-count { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; margin-left: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 AI情報サイト ダッシュボード</h1>
            <p class="last-updated">最終更新: ${new Date(stats.generatedAt).toLocaleString('ja-JP')}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" style="color: #667eea;">${stats.basic.totalNews}</div>
                <div class="stat-label">総記事数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #f59e0b;">${stats.basic.importantNews}</div>
                <div class="stat-label">重要記事</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #10b981;">${Object.keys(stats.sources).length}</div>
                <div class="stat-label">情報源</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #8b5cf6;">${stats.performance.dataFreshness}%</div>
                <div class="stat-label">データ新鮮度</div>
            </div>
        </div>

        <div class="chart-section">
            <h2 class="chart-title">品質指標</h2>
            <div class="quality-metrics">
                <div class="metric">
                    <div class="metric-value">${stats.quality.averageImportance}</div>
                    <div class="metric-label">平均重要度</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${stats.quality.highQualityRatio}%</div>
                    <div class="metric-label">高品質記事率</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${stats.quality.sourceReliability}%</div>
                    <div class="metric-label">信頼性のあるソース率</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${stats.performance.coverageScore}%</div>
                    <div class="metric-label">カバレッジスコア</div>
                </div>
            </div>
        </div>

        <div class="chart-section">
            <h2 class="chart-title">トレンドキーワード</h2>
            <div class="trending-keywords">
                ${stats.trends.keywords.map(item => 
                    `<span class="keyword-tag">${item.keyword}<span class="keyword-count">${item.count}</span></span>`
                ).join('')}
            </div>
        </div>

        <div class="chart-section">
            <h2 class="chart-title">情報源別記事数</h2>
            <div style="display: grid; gap: 10px;">
                ${Object.entries(stats.sources).sort(([,a], [,b]) => b - a).slice(0, 8).map(([source, count]) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span>${source}</span>
                    <span style="font-weight: bold; color: #667eea;">${count}件</span>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

    const dashboardFile = path.join(this.distDir, 'dashboard.html');
    fs.writeFileSync(dashboardFile, html);
    console.log('✅ ダッシュボード生成完了');
  }
}

// GitHub Actions実行
async function main() {
  try {
    const generator = new StatsGenerator();
    await generator.generateStats();
    
    console.log('🎉 統計・分析データ生成完了');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 統計生成エラー:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = StatsGenerator;
