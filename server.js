import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import openaiService from './server/services/openaiService.js'; // Import the new service
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Express JSON 解析中間件 - 確保在路由之前
app.use(express.json());

// 配置 multer 以處理文件上傳
const upload = multer({ dest: 'uploads/' });

// 啟用 CORS 以處理跨源請求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 服務靜態文件
app.use(express.static(path.join(__dirname, 'dist')));

// 添加全域錯誤處理中間件 - 修復格式
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  console.error('錯誤堆疊:', err.stack);
  console.error('錯誤類型:', err.name || 'Unknown Error');
  console.error('錯誤消息:', err.message || 'No message');

  try {
    // 構建詳細的錯誤響應
    const errorResponse = { 
      error: `伺服器錯誤: ${err.message}`,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      type: err.name || 'Error',
      timestamp: new Date().toISOString()
    };

    console.log('發送錯誤響應:', JSON.stringify(errorResponse));

    // 確保返回一致的JSON格式錯誤
    return res.status(500).json(errorResponse);
  } catch (responseError) {
    console.error('構建錯誤響應時失敗:', responseError);

    // 如果JSON響應构建失败，返回纯文本
    return res.status(500).send(`伺服器錯誤: ${err.message || '未知錯誤'}`);
  }
});

// API 路由處理
app.post('/api/analyze', upload.fields([
  { name: 'genderFile', maxCount: 1 },
  { name: 'ageFile', maxCount: 1 },
  { name: 'productPrefFile', maxCount: 1 },
  { name: 'timeSeriesGenderFile', maxCount: 1 },
  { name: 'timeSeriesAgeFile', maxCount: 1 }
]), async (req, res) => {
  console.log('[API] 收到分析请求');
  try {
    console.log('[分析請求] 開始處理分析請求');
    console.log('[分析請求] 表單數據:', req.body);
    console.log('[分析請求] 收到的文件:', req.files ? Object.keys(req.files).map(key => `${key}: ${req.files[key][0]?.originalname}`) : '無文件');

    // 詳細记录文件内容
    if (req.files) {
      for (const key in req.files) {
        if (req.files[key] && req.files[key][0]) {
          console.log(`[分析請求] ${key} 文件路徑: ${req.files[key][0].path}`);
        }
      }
    }

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
    console.error('錯誤類型:', error.name || 'Unknown');

    try {
      // 檢查是否為OpenAI服務錯誤
      if (error.message && error.message.includes('OpenAI')) {
        return res.status(500).json({ 
          error: 'OpenAI 服務錯誤，請檢查 API 金鑰設定',
          details: error.message,
          type: 'OpenAIError'
        });
      }

      // 檢查是否為文件解析錯誤
      if (error.message && error.message.includes('CSV')) {
        return res.status(400).json({ 
          error: 'CSV 文件格式錯誤，請確保符合需求格式',
          details: error.message,
          type: 'CSVParseError'
        });
      }

      // 通用错误处理
      const errorDetails = {
        error: '分析過程發生錯誤',
        message: error.message,
        type: error.name || 'ServerError',
        details: process.env.NODE_ENV === 'production' ? null : error.stack,
        timestamp: new Date().toISOString()
      };

      console.log('發送錯誤響應:', JSON.stringify(errorDetails));
      return res.status(500).json(errorDetails);
    } catch (responseError) {
      // 如果构建 JSON 响应时出错，返回纯文本错误
      console.error('錯誤處理過程中出錯:', responseError);
      console.error('原始錯誤:', error);
      return res.status(500).send(`服務器內部錯誤: ${error.message || '未知錯誤'}`);
    }
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


// 導入診斷工具
import { checkOpenAICredentials, testOpenAICompletion, checkEnvironment } from './server/services/diagnostics.js';

// 添加增強的調試和診斷端點
app.get('/api/debug/status', (req, res) => {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    openai_api_key_exists: hasApiKey,
    openai_api_key_prefix: hasApiKey ? process.env.OPENAI_API_KEY.substring(0, 5) + '...' : null,
    openai_api_key_length: hasApiKey ? process.env.OPENAI_API_KEY.length : 0
  });
});

// OpenAI API 診斷端點
app.get('/api/debug/openai', async (req, res) => {
  try {
    console.log('運行 OpenAI API 診斷...');

    // 收集環境信息
    const envInfo = checkEnvironment();
    console.log('環境信息:', envInfo);

    // 檢查 API 金鑰
    console.log('檢查 API 金鑰...');
    const credentialsCheck = await checkOpenAICredentials();

    // 只有當憑證有效時才測試完成 API
    let completionTest = { status: 'skipped', message: 'API 金鑰無效，跳過完成測試' };
    if (credentialsCheck.isValid) {
      console.log('API 金鑰有效，測試 OpenAI 完成 API...');
      completionTest = await testOpenAICompletion();
    }

    // 返回詳細診斷報告
    res.json({
      timestamp: new Date().toISOString(),
      environment: envInfo,
      credentials: credentialsCheck,
      completion: completionTest
    });
  } catch (error) {
    console.error('運行診斷時發生錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '運行診斷時發生錯誤',
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? null : error.stack
      }
    });
  }
});

// 啟動服務器
app.listen(port, '0.0.0.0', () => {
  console.log(`服務器運行在 http://0.0.0.0:${port}`);
  console.log(`API端點: http://0.0.0.0:${port}/api/analyze`);
  console.log(`API调试端點: http://0.0.0.0:${port}/api/debug/status`);
  console.log(`當前環境變數: NODE_ENV=${process.env.NODE_ENV}`);

  // 檢查OpenAI API金鑰
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  console.log(`OpenAI API金鑰狀態: ${hasApiKey ? '已設置' : '未設置'}`);

  if (!hasApiKey) {
    console.log('注意: 未設置OpenAI API金鑰，將使用模擬數據');
  }
});

// 處理所有其他請求，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});