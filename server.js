import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import openaiService from './server/services/openaiService.js'; // Import the new service

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
  { name: 'ageFile', maxCount: 1 },
  { name: 'productPrefFile', maxCount: 1 },
  { name: 'timeSeriesGenderFile', maxCount: 1 },
  { name: 'timeSeriesAgeFile', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('[分析請求] 開始處理分析請求');
    console.log('[分析請求] 表單數據:', req.body);
    console.log('[分析請求] 收到的文件:', req.files ? Object.keys(req.files).map(key => `${key}: ${req.files[key][0]?.originalname}`) : '無文件');
    
    // 獲取表單數據
    const brandName = req.body.brandName;
    const brandDescription = req.body.brandDescription;
    const productInfo = req.body.productInfo;
    
    if (!brandName) {
      console.log('[分析請求] 缺少品牌名稱');
      return res.status(400).json({ error: '缺少品牌名稱' });
    }

    // 初始化數據變量
    let genderData = null;
    let ageData = null;
    let productPrefData = null;
    let timeSeriesGenderData = null;
    let timeSeriesAgeData = null;

    // 臨時文件路徑列表，用於後續清理
    const tempFiles = [];

    // 處理性別分布文件
    if (req.files['genderFile']) {
      const genderFile = req.files['genderFile'][0];
      genderData = await parseCSVFile(genderFile.path);
      tempFiles.push(genderFile.path);
    }

    // 處理年齡分布文件
    if (req.files['ageFile']) {
      const ageFile = req.files['ageFile'][0];
      ageData = await parseCSVFile(ageFile.path);
      tempFiles.push(ageFile.path);
    }

    // 處理產品偏好文件
    if (req.files['productPrefFile']) {
      const productPrefFile = req.files['productPrefFile'][0];
      productPrefData = await parseCSVFile(productPrefFile.path);
      tempFiles.push(productPrefFile.path);
    }

    // 處理性別時間序列文件
    if (req.files['timeSeriesGenderFile']) {
      const timeSeriesGenderFile = req.files['timeSeriesGenderFile'][0];
      timeSeriesGenderData = await parseCSVFile(timeSeriesGenderFile.path);
      tempFiles.push(timeSeriesGenderFile.path);
    }

    // 處理年齡時間序列文件
    if (req.files['timeSeriesAgeFile']) {
      const timeSeriesAgeFile = req.files['timeSeriesAgeFile'][0];
      timeSeriesAgeData = await parseCSVFile(timeSeriesAgeFile.path);
      tempFiles.push(timeSeriesAgeFile.path);
    }

    // 檢查基本數據是否可用
    if (!genderData && !ageData) {
      return res.status(400).json({ error: '請至少提供性別分布或年齡分布數據' });
    }

    // 分析數據
    const analysisResult = await analyzeData(
      brandName, 
      brandDescription, 
      productInfo, 
      genderData || [], 
      ageData || [],
      productPrefData,
      timeSeriesGenderData,
      timeSeriesAgeData
    );

    // 刪除所有臨時文件
    tempFiles.forEach(filePath => {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`刪除臨時文件 ${filePath} 失敗:`, err);
      }
    });

    // 返回分析結果
    res.json(analysisResult);
  } catch (error) {
    console.error('分析過程發生錯誤:', error);
    console.error('錯誤堆疊:', error.stack);
    
    // 檢查是否為OpenAI服務錯誤
    if (error.message && error.message.includes('OpenAI')) {
      return res.status(500).json({ error: 'OpenAI 服務錯誤，請檢查 API 金鑰設定' });
    }
    
    // 檢查是否為文件解析錯誤
    if (error.message && error.message.includes('CSV')) {
      return res.status(400).json({ error: 'CSV 文件格式錯誤，請確保符合需求格式' });
    }
    
    res.status(500).json({ error: '分析過程發生錯誤: ' + error.message });
  }
});

// 解析 CSV 文件
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    console.log(`[檢查點] 開始解析 CSV 文件: ${filePath}`);

    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (data) => {
        results.push(data);
        // 記錄前幾行數據以便查看格式
        if (results.length <= 2) {
          console.log(`[檢查點] CSV 數據樣本: ${JSON.stringify(data)}`);
        }
      })
      .on('end', () => {
        console.log(`[檢查點] CSV 文件解析完成，共 ${results.length} 行數據`);
        // 檢查數據是否有必要的欄位
        if (results.length > 0) {
          const firstRow = results[0];
          const columns = Object.keys(firstRow);
          console.log(`[檢查點] CSV 欄位: ${columns.join(', ')}`);
        }
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`[檢查點] CSV 解析錯誤: ${error.message}`);
        reject(error);
      });
  });
}

// 使用 OpenAI API 進行數據分析
async function analyzeData(
  brandName, 
  brandDescription, 
  productInfo, 
  genderData, 
  ageData,
  productPrefData,
  timeSeriesGenderData,
  timeSeriesAgeData
) {
  console.log("[檢查點] 開始數據分析，品牌名稱:", brandName);
  console.log(`[檢查點] 數據概況:
    - 性別數據: ${genderData.length} 項
    - 年齡數據: ${ageData.length} 項
    - 產品偏好: ${productPrefData ? productPrefData.length + ' 項' : '無'}
    - 時間序列-性別: ${timeSeriesGenderData ? timeSeriesGenderData.length + ' 項' : '無'}
    - 時間序列-年齡: ${timeSeriesAgeData ? timeSeriesAgeData.length + ' 項' : '無'}`);
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

  // 處理商品類別偏好數據（如果有的話）
  let productPreferenceData = null;
  if (productPrefData && productPrefData.length > 0) {
    productPreferenceData = {
      categories: productPrefData.map(item => ({
        category: item.商品類別 || item.category,
        A: parseFloat(item.權重分數 || item.score),
        fullMark: 150
      })),
      analysis: "商品類別偏好數據顯示您的品牌受眾偏好..."
    };
  }

  // 處理性別時間序列數據（如果有的話）
  let genderTimeSeriesData = null;
  if (timeSeriesGenderData && timeSeriesGenderData.length > 0) {
    genderTimeSeriesData = processTimeSeriesData(timeSeriesGenderData, '性別');
  }

  // 處理年齡時間序列數據（如果有的話）
  let ageTimeSeriesData = null;
  if (timeSeriesAgeData && timeSeriesAgeData.length > 0) {
    ageTimeSeriesData = processTimeSeriesData(timeSeriesAgeData, '年齡');
  }

  // 合併時間序列數據
  let timeSeriesData = null;
  if (genderTimeSeriesData || ageTimeSeriesData) {
    timeSeriesData = {
      gender: genderTimeSeriesData,
      age: ageTimeSeriesData,
      analysis: "時間序列數據顯示您的品牌受眾消費行為隨時間的變化..."
    };
  }

  // 使用 OpenAI API 進行更深入的分析
  const openaiResult = await openaiService.getAIAnalysis(
    brandName, 
    brandDescription, 
    productInfo, 
    genderDistribution, 
    ageDistribution,
    timeSeriesData,
    productPreferenceData
  );

  const result = {
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
    marketingSuggestions: openaiResult.marketingSuggestions,
    highValueSegments: openaiResult.highValueSegments || [
      {
        name: "黃金客群",
        percentage: "18%",
        description: "25-34歲的女性消費者，月均消費金額超過3000元，購買頻率高，對品牌忠誠度強。",
        stats: {
          averageOrderValue: "¥4,200",
          purchaseFrequency: "3.5次",
          repurchaseRate: "85%"
        }
      },
      {
        name: "新興消費力",
        percentage: "12%",
        description: "18-24歲的年輕消費者，對新品嘗試意願高，社交媒體影響力大，平均客單價中等但增長迅速。",
        stats: {
          averageOrderValue: "¥2,100",
          purchaseFrequency: "2.8次",
          repurchaseRate: "65%"
        }
      }
    ]
  };

  // 添加時間序列數據分析（如果有的話）
  if (timeSeriesData) {
    result.timeSeriesData = {
      ...timeSeriesData,
      analysis: openaiResult.timeSeriesAnalysis || "時間序列數據顯示您的品牌受眾消費行為有季節性變化..."
    };
  }

  // 添加商品類別偏好數據分析（如果有的話）
  if (productPreferenceData) {
    result.productPreferenceData = {
      ...productPreferenceData,
      analysis: openaiResult.productPreferenceAnalysis || "商品類別偏好數據顯示您的品牌受眾更注重產品質量和設計..."
    };
  }

  return result;
}

// 判斷是否為時間序列數據
function isTimeSeriesData(data) {
  if (!data || data.length === 0) return false;

  // 檢查是否包含日期字段
  return data[0].hasOwnProperty('日期') || data[0].hasOwnProperty('date');
}

// 處理時間序列數據
function processTimeSeriesData(data, categoryField) {
  const dateField = data[0].hasOwnProperty('日期') ? '日期' : 'date';
  const amountField = data[0].hasOwnProperty('平均訂單金額') ? '平均訂單金額' : 'amount';
  const categories = [...new Set(data.map(item => item[categoryField]))];

  // 按日期分組
  const dateGroups = {};
  data.forEach(item => {
    if (!dateGroups[item[dateField]]) {
      dateGroups[item[dateField]] = {};
    }
    dateGroups[item[dateField]][item[categoryField]] = parseFloat(item[amountField]);
  });

  // 轉換為圖表數據格式
  return Object.keys(dateGroups).map(date => {
    const entry = { name: date };
    categories.forEach(category => {
      entry[category] = dateGroups[date][category] || 0;
    });
    return entry;
  }).sort((a, b) => new Date(a.name) - new Date(b.name));
}

// 判斷是否為商品類別偏好數據
function isProductPreferenceData(data) {
  if (!data || data.length === 0) return false;

  // 檢查是否包含商品類別和權重分數字段
  return data[0].hasOwnProperty('商品類別') || data[0].hasOwnProperty('category');
}

// 處理商品類別偏好數據
function processProductPreferenceData(data) {
  const categoryField = data[0].hasOwnProperty('商品類別') ? '商品類別' : 'category';
  const scoreField = data[0].hasOwnProperty('權重分數') ? '權重分數' : 'score';

  return data.map(item => ({
    category: item[categoryField],
    A: parseFloat(item[scoreField]),
    fullMark: 150
  }));
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


// 模擬 AI 分析結果（當沒有 OpenAI API 密鑰時使用）
function getMockAnalysis(brandName, genderDistribution, ageDistribution, timeSeriesData, productPreferenceData) {
  const mockResult = {
    industryCategory: "消費品零售",
    targetAudience: `${ageDistribution.primaryAgeGroup}歲的${genderDistribution.primary}為主的消費者，具有較高的購買力和品牌意識`,
    brandCharacteristics: `${brandName}是一個專注於品質和用戶體驗的品牌，產品設計時尚現代，注重細節和功能性`,
    genderAnalysis: `您的品牌主要受眾為${genderDistribution.primary}，這表明您的產品在該性別群體中較受歡迎。深入分析顯示，這些消費者更注重產品的實用性和設計感。`,
    ageAnalysis: `您的品牌主要吸引${ageDistribution.primaryAgeGroup}歲的消費者，這一年齡段通常具有較強的消費能力和明確的品牌偏好。他們追求品質生活，願意為優質產品支付溢價。`,
    marketingSuggestions: [
      `針對${genderDistribution.primary}消費者偏好的社交媒體平台投放精準廣告，如Instagram和TikTok`,
      `調整產品設計和包裝以更好地滿足${ageDistribution.primaryAgeGroup}歲消費者的審美和功能需求`,
      `開發符合主要受眾生活方式的行銷活動和忠誠度計劃，強調社區感和獨特體驗`,
      `加強品牌故事的傳播，塑造符合目標受眾價值觀的品牌形象`,
      `與目標受眾喜愛的KOL合作，提升品牌在核心消費群體中的影響力`
    ],
    highValueSegments: [
      {
        name: "品質追求者",
        percentage: "18%",
        description: `${ageDistribution.primaryAgeGroup}歲的${genderDistribution.primary}消費者，月均消費金額超過3000元，購買頻率高，對品牌忠誠度強，非常注重產品品質和設計細節。`,
        stats: {
          averageOrderValue: "¥4,200",
          purchaseFrequency: "3.5次",
          repurchaseRate: "85%"
        }
      },
      {
        name: "時尚先鋒",
        percentage: "12%",
        description: "18-24歲的年輕消費者，對新品嘗試意願高，社交媒體影響力大，平均客單價中等但增長迅速，非常看重品牌形象和社交價值。",
        stats: {
          averageOrderValue: "¥2,100",
          purchaseFrequency: "2.8次",
          repurchaseRate: "65%"
        }
      }
    ]
  };

  // 如果有時間序列數據，添加相應的分析
  if (timeSeriesData) {
    mockResult.timeSeriesAnalysis = "消費行為時間趨勢分析顯示，您的品牌受眾在節假日期間消費明顯增加，女性消費者在促銷活動期間的響應度高於男性。此外，年初和年末是消費高峰期，建議在這些時間點加強行銷力度。";
  }

  // 如果有商品類別偏好數據，添加相應的分析
  if (productPreferenceData) {
    mockResult.productPreferenceAnalysis = "商品類別偏好分析顯示，您的品牌受眾最看重產品的品質和設計，其次是服務體驗。價格敏感度相對較低，表明您的客戶群體願意為優質產品和體驗支付溢價。建議強化這些優勢領域，並針對便利性方面進行改進。";
  }

  return mockResult;
}

// 從 AI 回應中提取高價值客群信息
function extractHighValueSegments(lines) {
  let segments = [];
  let inSegmentsSection = false;
  let currentSegment = null;

  for (const line of lines) {
    if (line.includes("高價值客群") || line.includes("highValueSegments")) {
      inSegmentsSection = true;
      continue;
    }

    if (inSegmentsSection && line.trim() !== '') {
      // 嘗試識別一個新的客群開始
      if (line.includes("客群") || line.includes("群體") || /^\d+\./.test(line)) {
        if (currentSegment) {
          segments.push(currentSegment);
        }
        currentSegment = {
          name: line.replace(/^\d+\.\s*/, "").trim(),
          description: "",
          percentage: "15%",
          stats: {
            averageOrderValue: "¥3,500",
            purchaseFrequency: "3.0次",
            repurchaseRate: "75%"
          }
        };
      } else if (currentSegment) {
        // 將行添加到當前客群的描述中
        currentSegment.description += " " + line.trim();
      }
    }

    // 如果我們達到了下一個部分，退出客群識別
    if (inSegmentsSection && (line.includes("行銷建議") || line.includes("marketingSuggestions"))) {
      inSegmentsSection = false;
      if (currentSegment) {
        segments.push(currentSegment);
      }
      break;
    }
  }

  // 確保最後一個客群也被添加
  if (inSegmentsSection && currentSegment) {
    segments.push(currentSegment);
  }

  return segments.length > 0 ? segments : null;
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

// 啟動服務器
app.listen(port, '0.0.0.0', () => {
  console.log(`服務器運行在 http://0.0.0.0:${port}`);
});

// 處理所有其他請求，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});