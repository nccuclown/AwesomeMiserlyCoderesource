import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// 檢查 API 金鑰是否存在
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn('警告: OPENAI_API_KEY 環境變數未設置，將使用模擬數據');
}

// 初始化 OpenAI 客戶端
let openai = null;
try {
  openai = new OpenAI({ 
    apiKey: apiKey,
  });
  console.log('OpenAI 客戶端初始化成功，API KEY 長度:', apiKey ? apiKey.length : 0);
} catch (error) {
  console.error('OpenAI 客戶端初始化失敗:', error);
}

// 測試API連接
async function testOpenAIConnection() {
  if (!apiKey) {
    console.log('[OpenAI] 使用模擬金鑰，跳過API連接測試');
    return false;
  }

  try {
    console.log('[OpenAI] 測試API連接...');
    await openai.models.list();
    console.log('[OpenAI] API連接成功');
    return true;
  } catch (error) {
    console.error('[OpenAI] API連接測試失敗:', error.message);
    return false;
  }
}

// 啟動時測試連接
testOpenAIConnection();


async function getAIAnalysis(
  brandName, 
  brandDescription, 
  productInfo, 
  genderDistribution, 
  ageDistribution,
  timeSeriesData,
  productPreferenceData
) {
  // 首先檢查是否有 API KEY
  if (!apiKey) {
    console.log("[檢查點] 未設置 OpenAI API 金鑰，使用模擬數據");
    return getMockAnalysis(
      brandName, 
      genderDistribution, 
      ageDistribution, 
      timeSeriesData, 
      productPreferenceData
    );
  }

  try {
    console.log("[檢查點] 準備調用 OpenAI API");
    console.log("[檢查點] 使用的品牌名稱:", brandName);

    // 配置提示詞，以獲得更好的分析結果
    const genderInfo = genderDistribution.data ? 
      `性別分布數據: ${JSON.stringify(genderDistribution.data)}` : 
      "沒有提供性別分布數據";

    const ageInfo = ageDistribution.data ? 
      `年齡分布數據: ${JSON.stringify(ageDistribution.data)}` : 
      "沒有提供年齡分布數據";

    let timeSeriesInfo = "沒有提供時間序列數據";
    if (timeSeriesData) {
      timeSeriesInfo = `
時間序列數據: 
${timeSeriesData.gender ? "性別時間序列: " + JSON.stringify(timeSeriesData.gender) : ""}
${timeSeriesData.age ? "年齡時間序列: " + JSON.stringify(timeSeriesData.age) : ""}
`;
    }

    let productPreferenceInfo = "沒有提供商品類別偏好數據";
    if (productPreferenceData) {
      productPreferenceInfo = `商品類別偏好數據: ${JSON.stringify(productPreferenceData.categories)}`;
    }

    // 檢查輸入數據
    console.log("[檢查點] 輸入數據檢查:");
    console.log("- 品牌名稱:", brandName ? brandName.substring(0, 30) : "未提供");
    console.log("- 品牌描述長度:", brandDescription ? brandDescription.length : 0);
    console.log("- 產品資訊長度:", productInfo ? productInfo.length : 0);
    console.log("- 性別數據項數:", genderDistribution.data ? genderDistribution.data.length : 0);
    console.log("- 年齡數據項數:", ageDistribution.data ? ageDistribution.data.length : 0);

    // 準備調用 API
    console.log("[檢查點] 準備調用 OpenAI API...");

    if (!openai) {
      throw new Error("OpenAI 客戶端未初始化，無法進行 API 調用");
    }

    // 調用 OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 更新为 gpt-4o-mini 模型
      messages: [
        {
          role: "system",
          content: `你是一位專業的品牌策略顧問與數據分析師。根據品牌資訊和受眾數據，您將為品牌提供有價值的洞察和行銷建議。請保持專業、簡潔和實用的風格。使用繁體中文回應。`
        },
        {
          role: "user",
          content: `
我的品牌名稱是: ${brandName}
品牌描述: ${brandDescription}
產品資訊: ${productInfo}

以下是我們的受眾數據:
${genderInfo}
${ageInfo}
${timeSeriesInfo}
${productPreferenceInfo}

請提供以下分析:
1. 行業類別: 基於以上信息，判斷品牌所屬的行業類別
2. 目標受眾: 描述品牌的核心目標受眾
3. 品牌特性: 概括品牌的主要特點和定位
4. 性別分析: 分析性別分布數據對行銷策略的影響
5. 年齡分析: 分析年齡分布數據對行銷策略的影響
6. 高價值客群: 識別和描述2-3個高價值客群，包括其佔比、特點和消費能力指標
7. 行銷建議: 提供5條具體可行的行銷策略建議

如果有時間序列數據，請額外提供:
8. 時間序列分析: 分析受眾行為隨時間的變化趨勢和模式

如果有商品類別偏好數據，請額外提供:
9. 商品偏好分析: 分析受眾的產品偏好特點

回答格式應為:
industryCategory: 行業類別
targetAudience: 目標受眾描述
brandCharacteristics: 品牌特性
genderAnalysis: 性別分析
ageAnalysis: 年齡分析
highValueSegments:
1. 第一個高價值客群...
2. 第二個高價值客群...
marketingSuggestions:
1. 第一條行銷建議...
2. 第二條行銷建議...
...
5. 第五條行銷建議...
`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.1,
    });

    console.log("[檢查點] OpenAI API 調用成功");
    console.log("[檢查點] 回應摘要:", {
      model: response.model,
      tokens: response.usage ? response.usage.total_tokens : 'unknown',
      choices: response.choices ? response.choices.length : 0
    });

    const aiResponse = response.choices[0].message.content;
    const lines = aiResponse.split('\n');

    // 提取行銷建議
    const marketingSuggestions = [];
    let inSuggestionsSection = false;

    for (const line of lines) {
      if (line.includes("marketingSuggestions") || line.includes("行銷建議")) {
        inSuggestionsSection = true;
        continue;
      }

      if (inSuggestionsSection && line.trim() !== '' && (line.startsWith('- ') || line.match(/^\d+\./))) {
        marketingSuggestions.push(line.replace(/^- /, '').replace(/^\d+\.\s*/, '').trim());
      }

      if (inSuggestionsSection && line.includes("高價值客群") || line.includes("highValueSegments")) {
        break;
      }
    }

    // 解析回應
    const industryCategory = extractInfo(lines, "industryCategory") || "消費品";
    const targetAudience = extractInfo(lines, "targetAudience") || "年輕女性消費者";
    const brandCharacteristics = extractInfo(lines, "brandCharacteristics") || "提供優質生活方式產品的品牌";
    const genderAnalysis = extractInfo(lines, "genderAnalysis") || "品牌受眾主要為女性";
    const ageAnalysis = extractInfo(lines, "ageAnalysis") || "主要受眾年齡在25-34歲之間";
    const highValueSegments = extractHighValueSegments(lines) || [];

    let timeSeriesAnalysis = null;
    if (timeSeriesData) {
      timeSeriesAnalysis = extractInfo(lines, "timeSeriesAnalysis") || "時間序列數據顯示消費行為有季節性變化";
    }

    let productPreferenceAnalysis = null;
    if (productPreferenceData) {
      productPreferenceAnalysis = extractInfo(lines, "productPreferenceAnalysis") || "受眾對產品品質和設計最為重視";
    }

    // 返回結構化分析結果
    return {
      industryCategory,
      targetAudience,
      brandCharacteristics,
      genderAnalysis,
      ageAnalysis,
      marketingSuggestions: marketingSuggestions.length > 0 ? marketingSuggestions : [
        "在Instagram和TikTok等社交媒體平台上增加品牌曝光",
        "針對核心年齡層開發特定產品線",
        "通過電子郵件行銷建立忠誠度計劃",
        "與目標受眾喜愛的影響者合作",
        "改進產品包裝以吸引主要客群"
      ],
      highValueSegments,
      timeSeriesAnalysis,
      productPreferenceAnalysis
    };
  } catch (error) {
    console.error('OpenAI API調用失敗:', error);
    console.error('錯誤類型:', error.constructor.name);
    console.error('錯誤詳情:', error.response?.data || error.message);
    console.error('錯誤堆疊:', error.stack);

    // 詳細記錄 API 錯誤
    if (error.response) {
      console.error('API 響應狀態:', error.response.status);
      console.error('API 響應數據:', error.response.data);
      console.error('API 響應標頭:', error.response.headers);
    }

    // 檢查是否為認證錯誤
    if (error.message.includes('authentication') || 
        error.message.includes('auth') || 
        error.message.includes('key') || 
        error.message.includes('apiKey')) {
      throw new Error('OpenAI API 認證失敗，請檢查您的 API 金鑰是否有效。錯誤詳情: ' + error.message);
    }

    // 檢查是否為速率限制錯誤
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('OpenAI API 請求頻率超限，請稍後再試。錯誤詳情: ' + error.message);
    }

    // 檢查是否為網絡連接錯誤
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('ETIMEDOUT') || 
        error.message.includes('network')) {
      throw new Error('連接 OpenAI API 服務失敗，請檢查網絡連接。錯誤詳情: ' + error.message);
    }

    // 如果API調用失敗，返回模擬數據
    console.log("[檢查點] 發生錯誤，切換到模擬數據");
    return getMockAnalysis(
      brandName, 
      genderDistribution, 
      ageDistribution, 
      timeSeriesData, 
      productPreferenceData
    );
  }
}

// 模擬 AI 分析結果（當沒有 OpenAI API 密鑰或出錯時使用）
function getMockAnalysis(brandName, genderDistribution, ageDistribution, timeSeriesData, productPreferenceData) {
  console.log("[檢查點] 使用模擬數據生成分析結果");

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

function extractInfo(lines, key) {
  const keyLine = lines.find(line => line.trim().startsWith(`${key}:`));
  return keyLine ? keyLine.substring(key.length + 1).trim() : null;
}

function extractHighValueSegments(lines) {
  const segments = [];
  let inSegmentsSection = false;
  for (const line of lines) {
    if (line.includes("highValueSegments") || line.includes("高價值客群")) {
      inSegmentsSection = true;
      continue;
    }
    if (inSegmentsSection && line.trim() !== '' && line.match(/^\d+\./)) {
      segments.push(line.replace(/^\d+\.\s*/, '').trim());
    }
    if (inSegmentsSection && line.includes("marketingSuggestions") || line.includes("行銷建議")) {
      break;
    }
  }
  return segments;
}

export default {
  getAIAnalysis
};