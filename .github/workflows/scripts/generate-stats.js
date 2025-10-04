const fs = require('fs');

// 統計データを生成
function generateStats() {
    const newsData = loadNewsData();
    const toolsData = loadToolsData();
    
    const today = new Date();
    const todayStr = today.toDateString();
    
    // 基本統計の計算
    const stats = {
        // 記事統計
        totalArticles: newsData.length,
        todayArticles: newsData.filter(article => {
            const articleDate = new Date(article.publishedAt || article.date);
            return articleDate.toDateString() === todayStr;
        }).length,
        
        // 重要度統計
        highImportanceCount: newsData.filter(article => article.importance >= 8).length,
        mediumImportanceCount: newsData.filter(article => article.importance >= 6 && article.importance < 8).length,
        lowImportanceCount: newsData.filter(article => article.importance < 6).length,
        
        // 平均重要度
        averageImportance: newsData.length > 0 ? 
            (newsData.reduce((sum, article) => sum + (article.importance || 5), 0) / newsData.length).toFixed(1) : 0,
        
        // ソース別統計
        sourceStats: calculateSourceStats(newsData),
        
        // カテゴリ別統計
        categoryStats: calculateCategoryStats(newsData),
        
        // ツール統計
        totalTools: toolsData.length,
        averageToolRating: toolsData.length > 0 ? 
            (toolsData.reduce((sum, tool) => sum + (tool.rating || 5), 0) / toolsData.length).toFixed(1) : 0,
        
        // 時系列データ（過去7日間）
        weeklyStats: generateWeeklyStats(newsData),
        
        // 更新情報
        lastUpdated: today.toISOString(),
        updateTime: today.toLocaleString('ja-JP'),
        
        // システム情報
        systemInfo: {
            version: '1.0.0',
            autoUpdate: true,
            updateFrequency: '毎日9時・18時',
            dataSourcesCount: getDataSourcesCount()
        }
    };
    
    // 詳細統計の追加
    const detailedStats = {
        ...stats,
        detailed: {
            articlesPerDay: calculateArticlesPerDay(newsData),
            topKeywords: extractTopKeywords(newsData),
            trendingTopics: identifyTrendingTopics(newsData),
            qualityMetrics: calculateQualityMetrics(newsData)
        }
    };
    
    // ファイル保存
    fs.writeFileSync('stats.json', JSON.stringify(detailedStats, null, 2));
    
    // ダッシュボードHTML生成
    const dashboardHTML = generateDashboardHTML(detailedStats);
    fs.writeFileSync('dashboard.html', dashboardHTML);
    
    console.log('✅ 統計データを生成しました');
    console.log(`📊 総記事数: ${stats.totalArticles}`);
    console.log(`📈 今日の新着: ${stats.todayArticles}`);
    console.log(`⭐ 高重要度記事: ${stats.highImportanceCount}`);
    
    return detailedStats;
}

// ソース別統計計算
function calculateSourceStats(newsData) {
    const sources = {};
    newsData.forEach(article => {
        const source = article.source || 'Unknown';
        sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([source, count]) => ({ source, count }));
}

// カテゴリ別統計計算
function calculateCategoryStats(newsData) {
    const categories = {};
    newsData.forEach(article => {
        const category = article.category || 'General';
        categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count }));
}

// 週間統計生成
function generateWeeklyStats(newsData) {
    const weeklyData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayArticles = newsData.filter(article => {
            const articleDate = new Date(article.publishedAt || article.date);
            return articleDate.toDateString() === dateStr;
        });
        
        weeklyData.push({
            date: date.toLocaleDateString('ja-JP'),
            articleCount: dayArticles.length,
            highImportanceCount: dayArticles.filter(a => a.importance >= 8).length
        });
    }
    
    return weeklyData;
}

// 日別記事数計算
function calculateArticlesPerDay(newsData) {
    const articlesPerDay = {};
    newsData.forEach(article => {
        const date = new Date(article.publishedAt || article.date).toLocaleDateString('ja-JP');
        articlesPerDay[date] = (articlesPerDay[date] || 0) + 1;
    });
    return articlesPerDay;
}

// トップキーワード抽出
function extractTopKeywords(newsData) {
    const keywords = {};
    const commonWords = ['AI', '人工知能', 'ChatGPT', 'Google', 'OpenAI', 'Microsoft', 'Meta'];
    
    newsData.forEach(article => {
        const text = (article.title + ' ' + (article.description || '')).toLowerCase();
        commonWords.forEach(word => {
            if (text.includes(word.toLowerCase())) {
                keywords[word] = (keywords[word] || 0) + 1;
            }
        });
    });
    
    return Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));
}

// トレンドトピック識別
function identifyTrendingTopics(newsData) {
    const topics = ['機械学習', 'ディープラーニング', '自然言語処理', '画像認識', 'ロボット', 'エッジAI'];
    return topics.map(topic => ({
        topic,
        mentions: newsData.filter(article => 
            (article.title + ' ' + (article.description || '')).toLowerCase().includes(topic)
        ).length
    })).filter(t => t.mentions > 0).sort((a, b) => b.mentions - a.mentions);
}

// 品質メトリクス計算
function calculateQualityMetrics(newsData) {
    return {
        articlesWithSummary: newsData.filter(a => a.summary && a.summary.length > 50).length,
        averageTitleLength: newsData.reduce((sum, a) => sum + (a.title?.length || 0), 0) / newsData.length,
        sourceDiversity: new Set(newsData.map(a => a.source)).size
    };
}

// データソース数取得
function getDataSourcesCount() {
    return 8; // RSS feeds + NewsAPI
}

// ダッシュボードHTML生成
function generateDashboardHTML(stats) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI記事統計ダッシュボード</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8f9fa; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2.5rem; font-weight: bold; color: #667eea; margin-bottom: 0.5rem; }
        .stat-label { color: #7f8c8d; font-size: 0.9rem; }
        .chart-container { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .chart-title { color: #2c3e50; font-size: 1.3rem; margin-bottom: 1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem; }
        .back-link { display: inline-block; margin-bottom: 1rem; color: #667eea; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.8rem; text-align: left; border-bottom: 1px solid #ecf0f1; }
        th { background: #f8f9fa; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← メインページに戻る</a>
        
        <header>
            <h1>📊 AI記事統計ダッシュボード</h1>
            <p>最終更新: ${stats.updateTime}</p>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalArticles}</div>
                <div class="stat-label">総記事数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.todayArticles}</div>
                <div class="stat-label">今日の新着</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.highImportanceCount}</div>
                <div class="stat-label">重要記事</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.averageImportance}</div>
                <div class="stat-label">平均重要度</div>
            </div>
        </div>

        <div class="chart-container">
            <h2 class="chart-title">📈 過去7日間の記事数推移</h2>
            <table>
                <thead>
                    <tr><th>日付</th><th>記事数</th><th>重要記事</th></tr>
                </thead>
                <tbody>
                    ${stats.weeklyStats.map(day => `
                        <tr>
                            <td>${day.date}</td>
                            <td>${day.articleCount}</td>
                            <td>${day.highImportanceCount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="chart-container">
            <h2 class="chart-title">📰 ソース別記事数</h2>
            <table>
                <thead>
                    <tr><th>ソース</th><th>記事数</th></tr>
                </thead>
                <tbody>
                    ${stats.sourceStats.map(source => `
                        <tr>
                            <td>${source.source}</td>
                            <td>${source.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
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
        console.log('tools.json が見つかりません。空のデータを使用します。');
        return [];
    }
}

// メイン実行
if (require.main === module) {
    generateStats();
}

module.exports = { generateStats };
