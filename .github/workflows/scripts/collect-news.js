// 🤖 GitHub Actions用 AI ニュース収集スクリプト
const https = require('https');
const fs = require('fs');
const path = require('path');

class GitHubActionsNewsCollector {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.forceUpdate = process.env.FORCE_UPDATE === 'true';
    
    this.rssFeeds = {
      'OpenAI Blog': 'https://openai.com/blog/rss.xml',
      'Google AI Blog': 'https://ai.googleblog.com/feeds/posts/default',
      'MIT Tech Review AI': 'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
      'VentureBeat AI': 'https://venturebeat.com/ai/feed/',
      'ITmedia AI': 'https://www.itmedia.co.jp/ai/rss/rss2.xml',
      'AI-SCHOLAR': 'https://ai-scholar.tech/feed/'
    };

    this.dataDir = path.join(process.cwd(), 'data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log('📁 データディレクトリを作成しました');
    }
  }

  async collectNews() {
    console.log('🔍 AI最新ニュース収集を開始...');
    console.log(`⚙️ 強制更新モード: ${this.forceUpdate ? 'ON' : 'OFF'}`);
    
    const allNews = [];
    let rssCount = 0;
    let apiCount = 0;

    try {
      // RSS収集
      console.log('📡 RSS フィード収集中...');
      
      for (const [sourceName, url] of Object.entries(this.rssFeeds)) {
        try {
          const news = await this.fetchRSSFeed(sourceName, url);
          allNews.push(...news);
          rssCount += news.length;
          console.log(`✅ ${sourceName}: ${news.length}件`);
          
          // レート制限対策
          await this.sleep(1500);
        } catch (error) {
          console.log(`⚠️ ${sourceName}: ${error.message}`);
        }
      }

      // NewsAPI収集（APIキーがある場合のみ）
      if (this.newsApiKey) {
        console.log('🔗 NewsAPI収集中...');
        const apiNews = await this.fetchNewsAPI();
        allNews.push(...apiNews);
        apiCount = apiNews.length;
        console.log(`✅ NewsAPI: ${apiCount}件`);
      } else {
        console.log('⚠️ NewsAPI キーが設定されていません（RSS収集のみ）');
      }

      // データ処理
      const processedNews = this.processNews(allNews);
      
      // 保存
      await this.saveNews(processedNews, { rssCount, apiCount });
      
      console.log(`🎉 収集完了: 合計${processedNews.length}件のニュース`);
      return processedNews;

    } catch (error) {
      console.error('❌ 収集エラー:', error);
      throw error;
    }
  }

  async fetchRSSFeed(sourceName, url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout: 15000 }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const news = this.parseRSS(data, sourceName);
            resolve(news);
          } catch (error) {
            reject(new Error(`RSS解析エラー: ${error.message}`));
          }
        });
      });
      
      request.on('error', (error) => {
        reject(new Error(`接続エラー: ${error.message}`));
      });
      
      request.on('timeout', () => {
        request.abort();
        reject(new Error('タイムアウト'));
      });
    });
  }

  parseRSS(xml, sourceName) {
    const news = [];
    const itemRegex = /<item[^>]*>(.*?)<\/item>/gs;
    const titleRegex = /<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s;
    const linkRegex = /<link[^>]*>(.*?)<\/link>/s;
    const descRegex = /<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s;
    const dateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/s;
    
    let match;
    let count = 0;
    
    while ((match = itemRegex.exec(xml)) !== null && count < 5) {
      const item = match[1];
      
      const titleMatch = titleRegex.exec(item);
      const linkMatch = linkRegex.exec(item);
      const descMatch = descRegex.exec(item);
      const dateMatch = dateRegex.exec(item);
      
      if (titleMatch && linkMatch) {
        const title = this.cleanText(titleMatch[1] || '');
        if (title.length > 10) {
          news.push({
            title: title,
            url: this.cleanText(linkMatch[1] || ''),
            description: this.cleanText(descMatch ? descMatch[1] : ''),
            publishedAt: this.cleanText(dateMatch ? dateMatch[1] : ''),
            source: sourceName,
            type: 'rss',
            collected: new Date().toISOString()
          });
          count++;
        }
      }
    }
    
    return news;
  }

  async fetchNewsAPI() {
    if (!this.newsApiKey) return [];
    
    const axios = require('axios');
    const news = [];
    
    const queries = [
      'ChatGPT OR "GPT-4" OR Claude OR Gemini',
      'OpenAI OR Anthropic OR "Google AI"',
      'AI OR "人工知能" OR "機械学習"'
    ];
    
    for (let i = 0; i < queries.length && i < 3; i++) {
      try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(queries[i])}&language=ja&sortBy=publishedAt&pageSize=8&apiKey=${this.newsApiKey}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        const articles = response.data.articles.slice(0, 6).map(article => ({
          title: article.title,
          url: article.url,
          description: article.description,
          publishedAt: article.publishedAt,
          source: article.source.name,
          type: 'api',
          collected: new Date().toISOString()
        }));
        
        news.push(...articles);
        await this.sleep(2000);
        
      } catch (error) {
        console.log(`⚠️ NewsAPI エラー (${queries[i]}): ${error.message}`);
      }
    }
    
    return news;
  }

  processNews(rawNews) {
    // 重複除去
    const uniqueNews = this.removeDuplicates(rawNews);
    
    // 重要度計算
    const newsWithImportance = uniqueNews.map(article => ({
      ...article,
      importance: this.calculateImportance(article)
    }));
    
    // 重要度でソート
    const sortedNews = newsWithImportance.sort((a, b) => b.importance - a.importance);
    
    // 最新20件に制限
    return sortedNews.slice(0, 20);
  }

  removeDuplicates(news) {
    const seen = new Set();
    return news.filter(article => {
      const key = article.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  calculateImportance(article) {
    let score = 5; // 基本点
    
    const title = article.title.toLowerCase();
    const desc = (article.description || '').toLowerCase();
    
    const keywords = {
      'gpt-4': 4, 'chatgpt': 3, 'claude': 3, 'gemini': 3,
      'openai': 2, 'anthropic': 2, 'google ai': 2,
      'breakthrough': 3, '革新': 3, 'release': 2, '発表': 2,
      'update': 1, 'アップデート': 1, 'ai': 1
    };
    
    Object.entries(keywords).forEach(([keyword, points]) => {
      if (title.includes(keyword) || desc.includes(keyword)) {
        score += points;
      }
    });
    
    // 新しさボーナス
    if (article.publishedAt) {
      const hoursOld = (new Date() - new Date(article.publishedAt)) / (1000 * 60 * 60);
      if (hoursOld < 6) score += 2;
      else if (hoursOld < 24) score += 1;
    }
    
    return Math.min(score, 10);
  }

  async saveNews(news, stats) {
    const output = {
      lastUpdated: new Date().toISOString(),
      totalCount: news.length,
      stats: {
        rssArticles: stats.rssCount,
        apiArticles: stats.apiCount,
        importantNews: news.filter(n => n.importance >= 7).length,
        categories: this.getCategoryStats(news)
      },
      news: news
    };
    
    // メインデータファイル
    const mainFile = path.join(this.dataDir, 'latest-news.json');
    fs.writeFileSync(mainFile, JSON.stringify(output, null, 2));
    
    // 重要ニュースのみ
    const importantNews = news.filter(n => n.importance >= 6);
    const importantFile = path.join(this.dataDir, 'important-news.json');
    fs.writeFileSync(importantFile, JSON.stringify(importantNews, null, 2));
    
    // バックアップ（日付付き）
    const backupDir = path.join(this.dataDir, 'archive');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `news-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(output, null, 2));
    
    console.log('💾 データ保存完了:');
    console.log(`  📰 総合データ: ${news.length}件`);
    console.log(`  ⭐ 重要ニュース: ${importantNews.length}件`);
    console.log(`  📁 バックアップ: ${backupFile}`);
  }

  getCategoryStats(news) {
    const categories = {};
    news.forEach(article => {
      const source = article.source;
      categories[source] = (categories[source] || 0) + 1;
    });
    return categories;
  }

  cleanText(text) {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// GitHub Actions実行
async function main() {
  try {
    const collector = new GitHubActionsNewsCollector();
    const<span class="cursor">█</span>
