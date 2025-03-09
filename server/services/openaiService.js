import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// 初始化 OpenAI 客戶端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 用於測試環境的標誌
const isTest = !process.env.OPENAI_API_KEY;

async function getAIAnalysis(
  brandName, 
  brandDescription, 
  productInfo, 
  genderDistribution, 
  ageDistribution,
  timeSeriesData,
  productPreferenceData
) {
  console.log('[OpenAI分析] 開始AI分析，品牌:', brandName);
  console.log('[OpenAI分析] 檢查環境變數:', process.env.OPENAI_API_KEY ? '有API金鑰' : '缺少API金鑰');
  console.log("[檢查點] OpenAI API 請求數據準備開始");
  console.log(`[檢查點] 品牌名稱: ${brandName}`);
  console.log(`[檢查點] 品牌描述: ${brandDescription}`);

  // 驗證性別數據
  if (genderDistribution && genderDistribution.data) {
    console.log(`[檢查點] 性別數據: ${genderDistribution.data.length} 項`);
    console.log(`[檢查點] 性別數據樣本: ${JSON.stringify(genderDistribution.data.slice(0, 2))}`);
  } else {
    console.log(`[檢查點] 警告: 性別數據為空或格式不正確`);
  }

  // 驗證年齡數據
  if (ageDistribution && ageDistribution.data) {
    console.log(`[檢查點] 年齡數據: ${ageDistribution.data.length} 項`);
    console.log(`[檢查點] 年齡數據樣本: ${JSON.stringify(ageDistribution.data.slice(0, 2))}`);
  } else {
    console.log(`[檢查點] 警告: 年齡數據為空或格式不正確`);
  }

  // 驗證其他選填數據
  if (timeSeriesData) {
    console.log(`[檢查點] 時間序列數據存在`);
    if (timeSeriesData.gender) {
      console.log(`[檢查點] 性別時間序列數據: ${timeSeriesData.gender.length} 項`);
    }
    if (timeSeriesData.age) {
      console.log(`[檢查點] 年齡時間序列數據: ${timeSeriesData.age.length} 項`);
    }
  }

  if (productPreferenceData && productPreferenceData.categories) {
    console.log(`[檢查點] 產品偏好數據: ${productPreferenceData.categories.length} 項`);
    console.log(`[檢查點] 產品偏好樣本: ${JSON.stringify(productPreferenceData.categories.slice(0, 2))}`);
  }

  console.log("[檢查點] 開始 OpenAI 分析");
  console.log(`[檢查點] 品牌資訊: ${brandName}`);
  console.log(`[檢查點] 性別數據項目數: ${genderDistribution.data.length}`);
  console.log(`[檢查點] 年齡數據項目數: ${ageDistribution.data.length}`);

  if (timeSeriesData) {
    console.log(`[檢查點] 時間序列數據可用: ${timeSeriesData.gender ? '性別' : ''}${timeSeriesData.age ? ' 年齡' : ''}`);
  }

  if (productPreferenceData) {
    console.log(`[檢查點] 產品偏好數據可用: ${productPreferenceData.categories.length} 個類別`);
  }

  // 如果沒有設置 API 金鑰，返回模擬數據
  if (isTest) {
    console.log("[檢查點] 使用模擬數據 (沒有找到 OPENAI_API_KEY)");
    return getMockAnalysis(brandName, genderDistribution, ageDistribution, timeSeriesData, productPreferenceData);
  }

  try {
    console.log("[檢查點] 正在準備 OpenAI 請求數據...");

    // 準備輸入數據
    const genderData = genderDistribution.data.map(item => `${item.性別 || item.gender}: ${item.比例 || item.percentage}`).join(", ");
    const ageData = ageDistribution.data.map(item => `${item.年齡 || item.age}: ${item.比例 || item.percentage}`).join(", ");

    let timeSeriesDesc = "";
    if (timeSeriesData) {
      if (timeSeriesData.gender) {
        timeSeriesDesc += "性別時間序列數據: ";
        timeSeriesDesc += JSON.stringify(timeSeriesData.gender.slice(0, 3)) + "...";
      }
      if (timeSeriesData.age) {
        timeSeriesDesc += "年齡時間序列數據: ";
        timeSeriesDesc += JSON.stringify(timeSeriesData.age.slice(0, 3)) + "...";
      }
    }

    let productPrefDesc = "";
    if (productPreferenceData && productPreferenceData.categories) {
      productPrefDesc = "產品偏好: " + productPreferenceData.categories.map(c => 
        `${c.category}: ${c.A}`
      ).join(", ");
    }

    console.log("[檢查點] 發送請求到 OpenAI API...");

    // 請求 OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // 使用 GPT-4o mini 模型
      messages: [
        {
          role: "system",
          content: `你是一位專業的品牌分析師，請根據提供的品牌資訊和受眾數據進行分析。
          分析結果請以JSON格式返回，包含以下字段：
          - industryCategory: 行業類別
          - targetAudience: 目標受眾描述
          - brandCharacteristics: 品牌特性
          - genderAnalysis: 性別分布分析
          - ageAnalysis: 年齡分布分析
          - marketingSuggestions: 行銷建議（數組）
          - highValueSegments: 高價值客群（數組，每個客群包含name, percentage, description, stats）
          ${timeSeriesData ? "- timeSeriesAnalysis: 時間序列數據分析" : ""}
          ${productPreferenceData ? "- productPreferenceAnalysis: 產品偏好分析" : ""}`
        },
        {
          role: "user",
          content: `品牌名稱: ${brandName}
          品牌簡介: ${brandDescription}
          產品資訊: ${productInfo}
          性別分布: ${genderData}
          年齡分布: ${ageData}
          ${timeSeriesDesc}
          ${productPrefDesc}`
        }
      ],
      temperature: 0.3,  // 較低的溫度使結果更確定性
      response_format: { type: "json_object" }  // 指定回傳 JSON 格式
    });

    console.log("[檢查點] 收到 OpenAI API 響應");

    // 解析 API 回應
    try {
      const result = JSON.parse(response.choices[0].message.content);
      console.log("[檢查點] OpenAI 分析結果成功解析");
      return result;
    } catch (parseError) {
      console.error("[檢查點] 解析 OpenAI 響應時出錯:", parseError);
      console.log("[檢查點] 原始回應:", response.choices[0].message.content);
      throw new Error("無法解析 AI 回應格式");
    }
  } catch (error) {
    console.error("[檢查點] OpenAI API 錯誤:", error.message);
    if (error.response) {
      console.error("[檢查點] 錯誤詳情:", JSON.stringify(error.response.data));
    }
    // 出錯時使用模擬數據
    console.log("[檢查點] 發生錯誤，切換到模擬數據");
    return getMockAnalysis(brandName, genderDistribution, ageDistribution, timeSeriesData, productPreferenceData);
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

export default {
  getAIAnalysis
};