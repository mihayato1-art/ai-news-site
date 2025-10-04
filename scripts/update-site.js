const fs = require('fs');
const path = require('path');

// メインHTMLページを生成
function generateMainPage() {
    const newsData = loadNewsData();
    const toolsData = loadToolsData();
    const statsData = loadStatsData();

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIを使う初心者のためのまとめサイト</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem 0; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; }
        .main-content { padding: 2rem 0; }
        .section { margin-bottom: 3rem; }
        .section h2 { color: #2c3e50; border-bottom: 3px solid #667eea; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
        .news-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
        .news-card { background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding: 1.5rem; transition: transform 0.3s ease; }
        .news-card:hover { transform: translateY(-5px); }
        .news-title { color: #2c3e50; font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; }
        .news-summary { color: #7f8c8d; font-size: 0.9rem; line-height: 1.5; }
        .news-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.8rem; color: #95a5a6; }
        .importance-badge { background: #e74c3c; color: white; padding: 0.2rem 0.6rem; border-radius: 15px; font-size: 0.7rem; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .tool-card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 1rem; text-align: center; }
        .tool-name { font-weight: bold; color: #2c3e50; margin-bottom: 0.5rem; }
        .stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; }
        .stat-label { font-size: 0.9rem; opacity: 0.9; }
        footer { background: #2c3e50; color: white; text-align: center; padding: 2rem 0; margin-top: 3rem; }
        .update-time { background: #ecf0f1; padding: 1rem; border-radius: 5px; margin-bottom: 2rem; text-align: center; color: #7f8c8d; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🤖 AI初心者ガイド</h1>
            <p class="subtitle">最新のAI情報と使いやすいツールをまとめてお届け</p>
        </div>
    </header>

    <div class="container">
        <div class="main-content">
            <div class="update-time">
                <p>最終更新: ${new Date().toLocaleString('ja-JP')} | 自動更新システムにより毎日9時・18時に更新</p>
            </div>

            <!-- 統計情報 -->
            <section class="section">
                <h2>📊 サイト統計</h2>
                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-number">${statsData.totalArticles || 0}</div>
                        <div class="stat-label">総記事数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${statsData.todayArticles || 0}</div>
                        <div class="stat-label">今日の新着</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${statsData.highImportanceCount || 0}</div>
                        <div class="stat-label">重要記事</div>
                    </div>
                </div>
            </section>

            <!-- 最新AI記事 -->
            <section class="section">
                <h2>📰 最新AI記事</h2>
                <div class="news-grid">
                    ${generateNewsCards(newsData)}
                </div>
            </section>

            <!-- AIツール比較 -->
            <section class="section">
                <h2>🛠️ 人気AIツール</h2>
                <div class="tools-grid">
                    ${generateToolCards(toolsData)}
                </div>
            </section>
        </div>
    </div>

    <footer>
        <div class="container">
            <p>&copy; 2024 AI初心者ガイド | GitHub Actionsにより自動生成・更新</p>
        </div>
    </footer>
</body>
</html>`;

    fs.writeFileSync('index.html', html);
    console.log('✅ メインページを生成しました: index.html');
}

// ニュースカードを生成
function generateNewsCards(newsData) {
    if (!newsData || newsData.length === 0) {
        return '<p>ニュースデータが見つかりません。</p>';
    }

    return newsData.slice(0, 12).map(article => `
        <div class="news-card">
            <div class="news-title">${article.title}</div>
            <div class="news-summary">${article.summary || article.description || '概要なし'}</div>
            <div class="news-meta">
                <span>${article.source}</span>
                <span class="importance-badge">${article.importance}/10</span>
            </div>
        </div>
    `).join('');
}

// ツールカードを生成
function generateToolCards(toolsData) {
    if (!toolsData || toolsData.length === 0) {
        return '<p>ツールデータが見つかりません。</p>';
    }

    return toolsData.slice(0, 6).map(tool => `
        <div class="tool-card">
            <div class="tool-name">${tool.name}</div>
            <div>${tool.description}</div>
        </div>
    `).join('');
}

// データ読み込み関数
function loadNewsData() {
    try {
        return JSON.parse(fs.readFileSync('news.json', 'utf8'));
    } catch (error) {
        console.log('news.json が見つかりません。空のデータを使用します。');
        return [];
    }
}

function loadToolsData() {
    try {
        return JSON.parse(fs.readFileSync('tools.json', 'utf8'));
    } catch (error) {
        console.log('tools.json が見つかりません。デフォルトデータを使用します。');
        return [
            { name: 'ChatGPT', description: '対話型AI、質問応答に最適' },
            { name: 'Claude', description: '長文解析、安全性重視のAI' },
            { name: 'Gemini', description: 'Google製、多機能AIアシスタント' }
        ];
    }
}

function loadStatsData() {
    try {
        return JSON.parse(fs.readFileSync('stats.json', 'utf8'));
    } catch (error) {
        console.log('stats.json が見つかりません。デフォルト統計を使用します。');
        return {
            totalArticles: 0,
            todayArticles: 0,
            highImportanceCount: 0
        };
    }
}

// メイン実行
if (require.main === module) {
    generateMainPage();
}

module.exports = { generateMainPage };
