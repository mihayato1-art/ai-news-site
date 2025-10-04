// 🛠️ AIツール情報更新スクリプト（GitHub Actions用）
const fs = require('fs');
const path = require('path');

class AIToolsUpdater {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.toolsFile = path.join(this.dataDir, 'ai-tools.json');
    
    // 主要AIツールの情報
    this.aiTools = [
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        company: 'OpenAI',
        category: 'テキスト生成',
        description: '自然な会話ができる高性能なAIアシスタント。プログラミング、文章作成、学習サポートなど幅広く活用可能。',
        pricing: {
          free: '月20回まで無料',
          paid: '$20/月 (Plus版)'
        },
        features: ['自然言語処理', 'コード生成', '文章作成', '翻訳', '要約'],
        pros: ['使いやすい', '高品質な回答', '豊富な機能'],
        cons: ['無料版は制限あり', '最新情報に弱い'],
        difficulty: '初心者',
        rating: 9.2,
        url: 'https://chat.openai.com',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'claude',
        name: 'Claude',
        company: 'Anthropic',
        category: 'テキスト生成',
        description: '安全性と有用性を重視したAIアシスタント。長文の処理が得意で、詳細な分析や要約に優れています。',
        pricing: {
          free: '月数回まで無料',
          paid: '$20/月 (Pro版)'
        },
        features: ['長文処理', '詳細分析', '安全な回答', 'ファイル解析'],
        pros: ['安全性が高い', '長文処理が得意', '詳細な分析'],
        cons: ['無料版の制限が厳しい', '日本語の精度'],
        difficulty: '初心者',
        rating: 8.8,
        url: 'https://claude.ai',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        company: 'Google',
        category: 'テキスト生成',
        description: 'Googleの最新AIモデル。最新情報へのアクセスが可能で、画像認識機能も搭載。',
        pricing: {
          free: '基本機能無料',
          paid: '$20/月 (Advanced版)'
        },
        features: ['最新情報アクセス', '画像認識', 'Google連携', 'リアルタイム検索'],
        pros: ['最新情報に強い', '画像処理可能', 'Google連携'],
        cons: ['精度にばらつき', '複雑な質問に弱い'],
        difficulty: '初心者',
        rating: 8.5,
        url: 'https://gemini.google.com',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'midjourney',
        name: 'Midjourney',
        company: 'Midjourney',
        category: '画像生成',
        description: '高品質なAI画像生成ツール。アート的で美しい画像の生成が得意。Discord経由で利用。',
        pricing: {
          free: '無料トライアルあり',
          paid: '$10/月～ (Basic版)'
        },
        features: ['高品質画像生成', 'アート風画像', 'スタイル指定', 'バリエーション生成'],
        pros: ['画質が非常に高い', 'アート性に優れる', '豊富なスタイル'],
        cons: ['Discord必須', '操作が独特', '日本語対応限定的'],
        difficulty: '中級者',
        rating: 9.0,
        url: 'https://www.midjourney.com',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'dalle3',
        name: 'DALL-E 3',
        company: 'OpenAI',
        category: '画像生成',
        description: 'OpenAIの画像生成AI。ChatGPT Plusから利用可能で、自然言語での指示が得意。',
        pricing: {
          free: 'なし',
          paid: '$20/月 (ChatGPT Plus経由)'
        },
        features: ['自然言語理解', 'ChatGPT連携', '高精度生成', 'テキスト埋め込み'],
        pros: ['自然な指示で生成', 'ChatGPT連携', '高い理解力'],
        cons: ['ChatGPT Plus必須', '生成枚数制限', '価格が高い'],
        difficulty: '初心者',
        rating: 8.7,
        url: 'https://openai.com/dall-e-3',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'runway',
        name: 'Runway ML',
        company: 'Runway',
        category: '動画生成',
        description: 'AI動画生成・編集ツール。テキストから動画生成や既存動画の編集が可能。',
        pricing: {
          free: '基本機能無料',
          paid: '$12/月～ (Standard版)'
        },
        features: ['動画生成', '動画編集', 'テキストto動画', '画像to動画'],
        pros: ['動画生成のパイオニア', '多機能', 'クリエイティブツール充実'],
        cons: ['操作が複雑', '生成時間が長い', '高い料金'],
        difficulty: '上級者',
        rating: 8.3,
        url: 'https://runwayml.com',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  async updateTools() {
    console.log('🛠️ AIツール情報を更新中...');
    
    try {
      // ツール情報を最新化
      const updatedTools = this.aiTools.map(tool => ({
        ...tool,
        lastUpdated: new Date().toISOString()
      }));

      // データ保存
      await this.saveToolsData(updatedTools);
      
      // 比較表生成
      await this.generateComparisonTable(updatedTools);
      
      console.log(`✅ ${updatedTools.length}個のツール情報を更新しました`);
      
    } catch (error) {
      console.error('❌ ツール情報更新エラー:', error);
      throw error;
    }
  }

  async saveToolsData(tools) {
    const toolsData = {
      lastUpdated: new Date().toISOString(),
      totalCount: tools.length,
      categories: this.getCategoryCounts(tools),
      tools: tools
    };

    // データディレクトリ確保
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // メインデータファイル
    fs.writeFileSync(this.toolsFile, JSON.stringify(toolsData, null, 2));
    
    console.log('💾 ツールデータ保存完了');
  }

  getCategoryCounts(tools) {
    const counts = {};
    tools.forEach(tool => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }

  async generateComparisonTable(tools) {
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIツール比較表 - AI初心者ナビ</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { color: #1e293b; margin-bottom: 10px; }
        .last-updated { color: #64748b; font-size: 0.9rem; }
        
        .tools-grid { display: grid; gap: 20px; margin-bottom: 40px; }
        .tool-card { 
            background: white; padding: 25px; border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.2s ease;
        }
        .tool-card:hover { transform: translateY(-2px); }
        
        .tool-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; }
        .tool-name { font-size: 1.4rem; font-weight: bold; color: #1e293b; }
        .tool-rating { 
            background: #667eea; color: white; padding: 5px 12px; 
            border-radius: 20px; font-size: 0.9rem; font-weight: 600;
        }
        
        .tool-meta { display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.9rem; color: #64748b; }
        .category-badge { background: #e2e8f0; color: #475569; padding: 3px 10px; border-radius: 15px; }
        .difficulty-badge { background: #fef3c7; color: #d97706; padding: 3px 10px; border-radius: 15px; }
        
        .tool-description { margin-bottom: 15px; line-height: 1.6; color: #475569; }
        
        .pricing { margin-bottom: 15px; }
        .pricing-item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9rem; }
        
        .features { margin-bottom: 15px; }
        .features h4 { margin-bottom: 8px; color: #1e293b; }
        .feature-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .feature-tag { background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; }
        
        .pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .pros h4 { color: #059669; }
        .cons h4 { color: #dc2626; }
        .pros-cons ul { margin: 8px 0; padding-left: 20px; }
        .pros-cons li { margin-bottom: 3px; font-size: 0.9rem; }
        
        .tool-link { text-align: center; }
        .tool-link a { 
            display: inline-block; background: #667eea; color: white; 
            padding: 10px 20px; border-radius: 8px; text-decoration: none; 
            font-weight: 600; transition: background 0.2s ease;
        }
        .tool-link a:hover { background: #5a67d8; }
        
        @media (max-width: 768px) {
            .pros-cons { grid-template-columns: 1fr; }
            .tool-header { flex-direction: column; gap: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛠️ AIツール比較表</h1>
            <p class="last-updated">最終更新: ${new Date().toLocaleString('ja-JP')}</p>
        </div>

        <div class="tools-grid">
            ${tools.map(tool => this.generateToolCardHTML(tool)).join('')}
        </div>
    </div>
</body>
</html>`;

    const comparisonFile = path.join(distDir, 'tools-comparison.html');
    fs.writeFileSync(comparisonFile, html);
    console.log('✅ ツール比較表生成完了');
  }

  generateToolCardHTML(tool) {
    return `
    <div class="tool-card">
        <div class="tool-header">
            <h2 class="tool-name">${tool.name}</h2>
            <div class="tool-rating">${tool.rating}/10</div>
        </div>
        
        <div class="tool-meta">
            <span class="category-badge">${tool.category}</span>
            <span class="difficulty-badge">${tool.difficulty}</span>
            <span>${tool.company}</span>
        </div>
        
        <p class="tool-description">${tool.description}</p>
        
        <div class="pricing">
            <div class="pricing-item">
                <span>無料版:</span>
                <span>${tool.pricing.free}</span>
            </div>
            <div class="pricing-item">
                <span>有料版:</span>
                <span>${tool.pricing.paid}</span>
            </div>
        </div>
        
        <div class="features">
            <h4>主な機能</h4>
            <div class="feature-tags">
                ${tool.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
            </div>
        </div>
        
        <div class="pros-cons">
            <div class="pros">
                <h4>👍 メリット</h4>
                <ul>
                    ${tool.pros.map(pro => `<li>${pro}</li>`).join('')}
                </ul>
            </div>
            <div class="cons">
                <h4>👎 デメリット</h4>
                <ul>
                    ${tool.cons.map(con => `<li>${con}</li>`).join('')}
                </ul>
            </div>
        </div>
        
        <div class="tool-link">
            <a href="${tool.url}" target="_blank" rel="noopener">公式サイトを見る</a>
        </div>
    </div>`;
  }
}

// GitHub Actions実行
async function main() {
  try {
    const updater = new AIToolsUpdater();
    await updater.updateTools();
    
    console.log('🎉 AIツール情報更新完了');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ツール更新エラー:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AIToolsUpdater;
