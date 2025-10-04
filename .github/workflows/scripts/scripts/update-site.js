// 🎨 GitHub Actions用 サイト更新スクリプト
const fs = require('fs');
const path = require('path');

class SiteUpdater {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.distDir = path.join(process.cwd(), 'dist');
    this.newsFile = path.join(this.dataDir, 'latest-news.json');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.dataDir, this.distDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async updateSite() {
    console.log('🎨 Webサイトコンテンツを更新中...');
    
    try {
      // ニュースデータ読み込み
      const newsData = this.loadNewsData();
      
      // HTMLページ生成
      await this.generateNewsPage(newsData);
      
      // JSON API生成
      await this.generateAPIFiles(newsData);
      
      // RSS フィード生成
      await this.generateRSSFeed(newsData);
      
      console.log('✅ サイト更新完了');
      
    } catch (error) {
      console.error('❌ サイト更新エラー:', error);
      throw error;
    }
  }

  loadNewsData() {
    if (!fs.existsSync(this.newsFile)) {
      console.log('⚠️ ニュースデータが見つかりません');
      return { news: [], lastUpdated: new Date().toISOString() };
    }
    
    const data = JSON.parse(fs.readFileSync(this.newsFile, 'utf8'));
    console.log(`📰 ${data.totalCount || 0}件のニュースデータを読み込み`);
    return data;
  }

  async generateNewsPage(newsData) {
    const news = newsData.news || [];
    const lastUpdated = newsData.lastUpdated || new Date().toISOString();
    
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI初心者ナビ - 最新情報</title>
    <meta name="description" content="AI初心者向けの最新情報とツール比較。ChatGPT、Claude、Geminiなどの使い方ガイド">
    <meta name="keywords" content="AI,人工知能,ChatGPT,Claude,Gemini,初心者,ガイド">
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; background: #f8fafc; color: #334155;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 0; margin-bottom: 40px; border-radius: 15px; }
        .header-content { text-align: center; }
        h1 { font-size: 2.5rem; margin-bottom: 10px; font-weight: 700; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; }
        .last-updated { font-size: 0.9rem; margin-top: 15px; opacity: 0.8; }
        
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #667eea; }
        .stat-label { color: #64748b; margin-top: 5px; }
        
        .news-grid { display: grid; gap: 20px; }
        .news-item { 
            background: white; padding: 25px; border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.2s ease;
            border-left: 4px solid #667eea;
        }
        .news-item:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        
        .news-title { font-size: 1.3rem; font-weight: 600; margin-bottom: 10px; }
        .news-title a { color: #1e293b; text-decoration: none; }
        .news-title a:hover { color: #667eea; }
        
        .news-meta { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; font-size: 0.9rem; color: #64748b; }
        .importance-badge { 
            display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
        }
        .importance-high { background: #fee2e2; color: #dc2626; }
        .importance-medium { background: #fef3c7; color: #d97706; }
        .importance-low { background: #ecfdf5; color: #059669; }
        
        .news-description { color: #475569; line-height: 1.6; margin-bottom: 15px; }
        .news-source { font-size: 0.85rem; color: #64748b; }
        
        .footer { text-align: center; margin-top: 60px; padding: 30px; background: white; border-radius: 12px; }
        
        @media (max-width: 768px) {
            .container { padding: 15px; }
            h1 { font-size: 2rem; }
            .stats { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <h1>🤖 AI初心者ナビ</h1>
                <p class="subtitle">最新のAI情報とツール比較を初心者向けに分かりやすく</p>
                <p class="last-updated">最終更新: ${new Date(lastUpdated).toLocaleString('ja-JP')}</p>
            </div>
        </header>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${news.length}</div>
                <div class="stat-label">最新記事数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${news.filter(n => n.importance >= 7).length}</div>
                <div class="stat-label">重要記事</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${new Set(news.map(n => n.source)).size}</div>
                <div class="stat-label">情報源</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">24時間</div>
                <div class="stat-label">更新間隔</div>
            </div>
        </div>

        <div class="news-grid">
            ${news.map(article => this.generateNewsItemHTML(article)).join('')}
        </div>

        <footer class="footer">
            <p>🤖 このサイトは GitHub Actions で自動更新されています</p>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">
                AI初心者の学習をサポートする最新情報をお届けします
            </p>
        </footer>
    </div>
</body>
</html>`;

    const outputFile = path.join(this.distDir, 'index.html');
    fs.writeFileSync(outputFile, html);
    console.log('✅ メインページ生成完了');
  }

  generateNewsItemHTML(article) {
    const importanceClass = article.importance >= 7 ? 'high' : 
                           article.importance >= 5 ? 'medium' : 'low';
    
    const publishedDate = article.publishedAt ? 
      new Date(article.publishedAt).toLocaleDateString('ja-JP') : '';

    return `
    <article class="news-item">
        <h2 class="news-title">
            <a href="${article.url}" target="_blank" rel="noopener">${article.title}</a>
        </h2>
        <div class="news-meta">
            <span class="importance-badge importance-${importanceClass}">
                重要度: ${article.importance}/10
            </span>
            <span>${article.source}</span>
            ${publishedDate ? `<span>${publishedDate}</span>` : ''}
        </div>
        <p class="news-description">${article.description || 'この記事の詳細は元記事をご確認ください。'}</p>
        <p class="news-source">情報源: ${article.source}</p>
    </article>`;
  }

  async generateAPIFiles(newsData) {
    // API v1 - 全データ
    const apiV1 = {
      version: "1.0",
      lastUpdated: newsData.lastUpdated,
      totalCount: newsData.totalCount || 0,
      data: newsData.news || []
    };
    
    fs.writeFileSync(
      path.join(this.distDir, 'api-v1.json'),
      JSON.stringify(apiV1, null, 2)
    );

    // API v1 - 重要記事のみ
    const importantNews = (newsData.news || []).filter(n => n.importance >= 6);
    const apiImportant = {
      version: "1.0",
      lastUpdated: newsData.lastUpdated,
      totalCount: importantNews.length,
      data: importantNews
    };
    
    fs.writeFileSync(
      path.join(this.distDir, 'api-important.json'),
      JSON.stringify(apiImportant, null, 2)
    );

    console.log('✅ API ファイル生成完了');
  }

  async generateRSSFeed(newsData) {
    const news = newsData.news || [];
    const lastUpdated = newsData.lastUpdated || new Date().toISOString();
    
    const rssItems = news.slice(0, 10).map(article => {
      const pubDate = article.publishedAt ? 
        new Date(article.publishedAt).toUTCString() : 
        new Date().toUTCString();

      return `
        <item>
            <title><![CDATA[${article.title}]]></title>
            <link>${article.url}</link>
            <description><![CDATA[${article.description || ''}]]></description>
            <pubDate>${pubDate}</pubDate>
            <guid>${article.url}</guid>
            <category>AI</category>
            <source>${article.source}</source>
        </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>AI初心者ナビ - 最新情報</title>
        <description>AI初心者向けの最新情報とツール比較</description>
        <link>https://your-site-url.com</link>
        <language>ja</language>
        <lastBuildDate>${new Date(lastUpdated).toUTCString()}</lastBuildDate>
        <generator>AI News Auto Generator</generator>
        ${rssItems}
    </channel>
</rss>`;

    fs.writeFileSync(path.join(this.distDir, 'rss.xml'), rss);
    console.log('✅ RSS フィード生成完了');
  }
}

// GitHub Actions実行
async function main() {
  try {
    const updater = new SiteUpdater();
    await updater.updateSite();
    
    console.log('🎉 サイト更新プロセス完了');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ サイト更新エラー:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SiteUpdater;
