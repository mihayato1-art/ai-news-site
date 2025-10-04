const axios = require('axios');
const Parser = require('rss-parser');
const fs = require('fs');

const parser = new Parser();

// RSS feed URLs
const RSS_FEEDS = [
    'https://openai.com/blog/rss.xml',
    'https://ai.googleblog.com/feeds/posts/default',
    'https://blogs.microsoft.com/ai/feed/',
    'https://blog.research.google/feeds/posts/default/-/Machine%20Learning',
    'https://www.deepmind.com/blog/rss.xml'
];

// NewsAPI設定
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

async function collectNews() {
    console.log('🚀 AI記事の収集を開始します...');
    
    let allArticles = [];
    
    // RSS feedsから記事収集
    console.log('📡 RSS feedsから記事を収集中...');
    for (const feedUrl of RSS_FEEDS) {
        try {
            console.log(`  → ${feedUrl} を処理中...`);
            const feed = await parser.parseURL(feedUrl);
            
            const articles = feed.items.slice(0, 5).map(item => ({
                title: item.title,
                description: item.contentSnippet || item.summary || '',
                url: item.link,
                publishedAt: item.pubDate || item.isoDate,
                source: feed.title || extractDomain(feedUrl),
                category: 'AI News',
                importance: calculateImportance(item.title + ' ' + (item.contentSnippet || '')),
                type: 'rss'
            }));
            
            allArticles = allArticles.concat(articles);
            console.log(`  ✅ ${articles.length}件の記事を収集`);
            
        } catch (error) {
            console.log(`  ❌ RSS feed エラー (${feedUrl}): ${error.message}`);
        }
    }
    
    // NewsAPIから記事収集（APIキーが設定されている場合）
    if (NEWS_API_KEY) {
        console.log('📰 NewsAPIから記事を収集中...');
        try {
            const response = await axios.get(NEWS_API_URL, {
                params: {
                    q: 'AI OR "人工知能" OR "機械学習" OR ChatGPT OR OpenAI',
                    language: 'ja',
                    sortBy: 'publishedAt',
                    pageSize: 20,
                    apiKey: NEWS_API_KEY
                }
            });
            
            const newsArticles = response.data.articles.map(article => ({
                title: article.title,
                description: article.description || '',
                url: article.url,
                publishedAt: article.publishedAt,
                source: article.source.name,
                category: 'AI News',
                importance: calculateImportance(article.title + ' ' + (article.description || '')),
                type: 'newsapi'
            }));
            
            allArticles = allArticles.concat(newsArticles);
            console.log(`  ✅ ${newsArticles.length}件の記事を収集`);
            
        } catch (error) {
            console.log(`  ❌ NewsAPI エラー: ${error.message}`);
        }
    } else {
        console.log('⚠️ NewsAPIキーが設定されていません。RSS feedsのみ使用します。');
    }
    
    // 重複記事の除去
    const uniqueArticles = removeDuplicates(allArticles);
    
    // 重要度でソート
    uniqueArticles.sort((a, b) => b.importance - a.importance);
    
    // ファイルに保存
    fs.writeFileSync('news.json', JSON.stringify(uniqueArticles, null, 2));
    
    console.log(`✅ 記事収集完了: 総${uniqueArticles.length}件`);
    console.log(`📊 高重要度記事: ${uniqueArticles.filter(a => a.importance >= 8).length}件`);
    
    return uniqueArticles;
}

// 重要度計算（1-10のスコア）
function calculateImportance(text) {
    const highKeywords = ['ChatGPT', 'GPT-4', 'OpenAI', 'breakthrough', '突破', '革新'];
    const mediumKeywords = ['AI', '人工知能', '機械学習', 'deep learning', 'neural network'];
    
    let score = 5; // 基本スコア
    
    highKeywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
            score += 2;
        }
    });
    
    mediumKeywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
            score += 1;
        }
    });
    
    return Math.min(10, Math.max(1, score));
}

// 重複記事除去
function removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
        const key = article.title.toLowerCase().trim();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// ドメイン抽出
function extractDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return 'Unknown';
    }
}

// メイン実行
if (require.main === module) {
    collectNews().catch(console.error);
}

module.exports = { collectNews };
