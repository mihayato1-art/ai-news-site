const fs = require('fs');

// AIツール情報を更新
function updateAITools() {
    const toolsData = [
        {
            name: 'ChatGPT',
            company: 'OpenAI',
            description: '対話型AI、質問応答・文章生成に最適',
            features: ['対話形式', '文章生成', 'コード生成', '翻訳'],
            pricing: '無料版あり、Plus版$20/月',
            pros: ['使いやすいUI', '高品質な回答', '豊富な知識'],
            cons: ['最新情報に制限', 'リアルタイム検索不可'],
            rating: 9.2,
            category: '汎用AI',
            url: 'https://chat.openai.com/',
            lastUpdated: new Date().toISOString()
        },
        {
            name: 'Claude',
            company: 'Anthropic',
            description: '安全性重視、長文解析に強いAIアシスタント',
            features: ['長文処理', '安全性重視', 'コード解析', '文書要約'],
            pricing: '無料版あり、Pro版$20/月',
            pros: ['長文対応', '安全性高い', '詳細な分析'],
            cons: ['応答速度やや遅い', '日本語やや弱い'],
            rating: 8.8,
            category: '汎用AI',
            url: 'https://claude.ai/',
            lastUpdated: new Date().toISOString()
        },
        {
            name: 'Gemini',
            company: 'Google',
            description: 'Google製多機能AIアシスタント、検索連携が強み',
            features: ['リアルタイム検索', '多言語対応', '画像認識', 'Google連携'],
            pricing: '無料版あり、Advanced版￥2,900/月',
            pros: ['最新情報アクセス', 'Google連携', '多機能'],
            cons: ['回答の一貫性にばらつき', 'プライバシー懸念'],
            rating: 8.5,
            category: '汎用AI',
            url: 'https://gemini.google.com/',
            lastUpdated: new Date().toISOString()
        },
        {
            name: 'Midjourney',
            company: 'Midjourney Inc.',
            description: '高品質AI画像生成ツール、アート性の高い画像作成',
            features: ['画像生成', 'アート性重視', 'スタイル多様', 'コミュニティ'],
            pricing: 'Basic $10/月、Standard $30/月',
            pros: ['画像品質高い', 'アート性抜群', 'スタイル豊富'],
            cons: ['Discord必須', '学習コスト高い', '有料のみ'],
            rating: 9.0,
            category: '画像生成AI',
            url: 'https://www.midjourney.com/',
            lastUpdated: new Date().toISOString()
        },
        {
            name: 'DALL-E 3',
            company: 'OpenAI',
            description: 'OpenAI製画像生成AI、自然な指示で高品質画像作成',
            features: ['画像生成', '自然言語指示', 'ChatGPT連携', '高解像度'],
            pricing: 'ChatGPT Plus経由 $20/月',
            pros: ['指示が簡単', 'ChatGPT連携', '高品質'],
            cons: ['単体利用不可', '生成数制限', '商用利用制限'],
            rating: 8.7,
            category: '画像生成AI',
            url: 'https://openai.com/dall-e-3',
            lastUpdated: new Date().toISOString()
        },
        {
            name: 'Stable Diffusion',
            company: 'Stability AI',
            description: 'オープンソース画像生成AI、カスタマイズ性が高い',
            features: ['オープンソース', 'カスタマイズ可能', '無料利用可能', '拡張性'],
            pricing: '基本無料、クラウド版有料オプション',
            pros: ['完全無料', 'カスタマイズ自由', 'コミュニティ活発'],
            cons: ['技術知識必要', '設定複雑', 'PC性能要求'],
            rating: 8.3,
            category: '画像生成AI',
            url: 'https://stability.ai/',
            lastUpdated: new Date().toISOString()
        }
    ];

    // ツール比較表HTMLを生成
    const comparisonHTML = generateToolComparisonHTML(toolsData);
    
    // JSONファイルとして保存
    fs.writeFileSync('tools.json', JSON.stringify(toolsData, null, 2));
    
    // HTML比較表を保存
    fs.writeFileSync('tools.html', comparisonHTML);
    
    console.log('✅ AIツール情報を更新しました');
    console.log(`📊 総ツール数: ${toolsData.length}`);
    
    return toolsData;
}

// ツール比較表HTML生成
function generateToolComparisonHTML(tools) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIツール比較表 - AI初心者ガイド</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem 0; margin-bottom: 2rem; border-radius: 10px; }
        h1 { text-align: center; font-size: 2.5rem; }
        .comparison-table { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #2c3e50; color: white; padding: 1rem; text-align: left; font-weight: 600; }
        td { padding: 1rem; border-bottom: 1px solid #ecf0f1; vertical-align: top; }
        .tool-name { font-weight: bold; color: #2c3e50; font-size: 1.1rem; }
        .company { color: #7f8c8d; font-size: 0.9rem; }
        .rating { background: #e74c3c; color: white; padding: 0.3rem 0.6rem; border-radius: 15px; font-size: 0.8rem; display: inline-block; }
        .category { background: #3498db; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; }
        .features { font-size: 0.9rem; }
        .pros { color: #27ae60; }
        .cons { color: #e74c3c; }
        .back-link { display: inline-block; margin-bottom: 1rem; color: #667eea; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        .update-time { text-align: center; color: #7f8c8d; margin-top: 2rem; }
        
        @media (max-width: 768px) {
            .comparison-table { overflow-x: auto; }
            th, td { min-width: 150px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← メインページに戻る</a>
        
        <header>
            <h1>🛠️ AIツール詳細比較</h1>
        </header>

        <div class="comparison-table">
            <table>
                <thead>
                    <tr>
                        <th>ツール名</th>
                        <th>説明</th>
                        <th>主な機能</th>
                        <th>料金</th>
                        <th>メリット</th>
                        <th>デメリット</th>
                        <th>評価</th>
                    </tr>
                </thead>
                <tbody>
                    ${tools.map(tool => `
                        <tr>
                            <td>
                                <div class="tool-name">${tool.name}</div>
                                <div class="company">${tool.company}</div>
                                <div class="category">${tool.category}</div>
                            </td>
                            <td>${tool.description}</td>
                            <td class="features">${tool.features.join('、')}</td>
                            <td>${tool.pricing}</td>
                            <td class="pros">${tool.pros.join('、')}</td>
                            <td class="cons">${tool.cons.join('、')}</td>
                            <td><span class="rating">${tool.rating}/10</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="update-time">
            <p>最終更新: ${new Date().toLocaleString('ja-JP')}</p>
        </div>
    </div>
</body>
</html>`;
}

// メイン実行
if (require.main === module) {
    updateAITools();
}

module.exports = { updateAITools };
