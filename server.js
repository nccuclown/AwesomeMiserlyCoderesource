
import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 配置 multer 以處理文件上傳
const upload = multer({ dest: 'uploads/' });

// 服務靜態文件
app.use(express.static(path.join(__dirname, 'dist')));

// API 路由處理
app.post('/api/analyze', upload.fields([
  { name: 'genderFile', maxCount: 1 },
  { name: 'ageFile', maxCount: 1 }
]), async (req, res) => {
  try {
    // 獲取表單數據
    const brandName = req.body.brandName;
    const brandDescription = req.body.brandDescription;
    const productInfo = req.body.productInfo;
    
    // 獲取上傳的文件
    const genderFile = req.files['genderFile'][0];
    const ageFile = req.files['ageFile'][0];
    
    // 讀取和解析性別分布數據
    const genderData = await parseCSVFile(genderFile.path);
    
    // 讀取和解析年齡分布數據
    const ageData = await parseCSVFile(ageFile.path);
    
    // 分析數據
    const analysisResult = await analyzeData(brandName, brandDescription, productInfo, genderData, ageData);
    
    // 刪除臨時文件
    fs.unlinkSync(genderFile.path);
    fs.unlinkSync(ageFile.path);
    
    // 返回分析結果
    res.json(analysisResult);
  } catch (error) {
    console.error('分析過程發生錯誤:', error);
    res.status(500).json({ error: '分析過程發生錯誤' });
  }
});

// 解析 CSV 文件
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// 使用 OpenAI API 進行數據分析
async function analyzeData(brandName, brandDescription, productInfo, genderData, ageData) {
  // 處理性別數據
  const genderDistribution = {
    data: genderData,
    primary: getPrimaryCategory(genderData, '性別', '比例'),
    analysis: "根據數據，您的品牌受眾性別分布顯示..." // 這裡將被 AI 分析結果取代
  };
  
  // 處理年齡數據
  const ageDistribution = {
    data: ageData,
    primaryAgeGroup: getPrimaryCategory(ageData, '年齡', '比例'),
    analysis: "根據數據，您的品牌受眾年齡分布顯示..." // 這裡將被 AI 分析結果取代
  };
  
  // 使用 OpenAI API 進行更深入的分析
  // 注意：您需要設置自己的 OpenAI API 密鑰
  const openaiResult = await getAIAnalysis(
    brandName, 
    brandDescription, 
    productInfo, 
    genderDistribution, 
    ageDistribution
  );
  
  return {
    brandName,
    industryCategory: openaiResult.industryCategory,
    targetAudience: openaiResult.targetAudience,
    brandCharacteristics: openaiResult.brandCharacteristics,
    genderDistribution: {
      ...genderDistribution,
      analysis: openaiResult.genderAnalysis
    },
    ageDistribution: {
      ...ageDistribution,
      analysis: openaiResult.ageAnalysis
    },
    marketingSuggestions: openaiResult.marketingSuggestions
  };
}

// 獲取主要類別（性別或年齡組）
function getPrimaryCategory(data, categoryField, valueField) {
  if (!data || data.length === 0) return "未知";
  
  let maxValue = 0;
  let primaryCategory = "";
  
  data.forEach(item => {
    const value = parseFloat(item[valueField]);
    if (value > maxValue) {
      maxValue = value;
      primaryCategory = item[categoryField];
    }
  });
  
  return primaryCategory;
}

// 使用 OpenAI API 進行分析
async function getAIAnalysis(brandName, brandDescription, productInfo, genderDistribution, ageDistribution) {
  // 這裡需要設置您的 OpenAI API 密鑰
  // 注意：實際生產環境中應使用環境變量
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // 如果沒有配置 API 密鑰，返回模擬數據
  if (!process.env.OPENAI_API_KEY) {
    console.warn('未設置 OpenAI API 密鑰，返回模擬數據');
    return getMockAnalysis(brandName, genderDistribution, ageDistribution);
  }
  
  const openai = new OpenAIApi(configuration);
  
  const prompt = `
    分析以下品牌資訊並給出建議：
    
    品牌名稱：${brandName}
    品牌簡介：${brandDescription}
    產品資訊：${productInfo}
    
    性別分布：
    ${JSON.stringify(genderDistribution.data)}
    
    年齡分布：
    ${JSON.stringify(ageDistribution.data)}
    
    請提供以下資訊：
    1. 行業類別
    2. 目標受眾特徵
    3. 品牌特點摘要
    4. 性別分布分析
    5. 年齡分布分析
    6. 三點針對性的行銷建議
  `;
  
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    // 解析 AI 回應
    const aiText = response.data.choices[0].text.trim();
    
    // 這裡需要解析 AI 回應文本
    // 實際應用中可能需要更複雜的解析邏輯
    const lines = aiText.split('\n');
    
    return {
      industryCategory: extractInfo(lines, "行業類別"),
      targetAudience: extractInfo(lines, "目標受眾"),
      brandCharacteristics: extractInfo(lines, "品牌特點"),
      genderAnalysis: extractInfo(lines, "性別分布分析"),
      ageAnalysis: extractInfo(lines, "年齡分布分析"),
      marketingSuggestions: extractMarketingSuggestions(lines)
    };
  } catch (error) {
    console.error('OpenAI API 調用錯誤:', error);
    return getMockAnalysis(brandName, genderDistribution, ageDistribution);
  }
}

// 從 AI 回應中提取信息
function extractInfo(lines, keyword) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(keyword) && i + 1 < lines.length) {
      return lines[i + 1].trim();
    }
  }
  return `未能提取 ${keyword} 資訊`;
}

// 從 AI 回應中提取行銷建議
function extractMarketingSuggestions(lines) {
  const suggestions = [];
  let inSuggestionsSection = false;
  
  for (const line of lines) {
    if (line.includes("行銷建議")) {
      inSuggestionsSection = true;
      continue;
    }
    
    if (inSuggestionsSection && line.trim() !== '') {
      suggestions.push(line.trim());
      if (suggestions.length >= 3) break;
    }
  }
  
  return suggestions.length > 0 ? suggestions : ["針對您的目標受眾進行社交媒體行銷", "開發更符合主要客群需求的產品", "優化品牌訊息以吸引核心受眾"];
}

// 模擬 AI 分析結果（當沒有 OpenAI API 密鑰時使用）
function getMockAnalysis(brandName, genderDistribution, ageDistribution) {
  return {
    industryCategory: "消費品零售",
    targetAudience: `${ageDistribution.primaryAgeGroup}歲的${genderDistribution.primary}為主的消費者`,
    brandCharacteristics: `${brandName}是一個專注於品質和用戶體驗的品牌`,
    genderAnalysis: `您的品牌主要受眾為${genderDistribution.primary}，這表明您的產品在該性別群體中較受歡迎。`,
    ageAnalysis: `您的品牌主要吸引${ageDistribution.primaryAgeGroup}歲的消費者，這一年齡段通常具有較強的消費能力和明確的品牌偏好。`,
    marketingSuggestions: [
      `針對${genderDistribution.primary}消費者偏好的平台投放廣告`,
      `調整產品設計以更好地滿足${ageDistribution.primaryAgeGroup}歲消費者的需求`,
      `開發符合主要受眾生活方式的行銷活動和忠誠度計劃`
    ]
  };
}

// 啟動服務器
app.listen(port, '0.0.0.0', () => {
  console.log(`服務器運行在 http://0.0.0.0:${port}`);
});

// 處理所有其他請求，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
