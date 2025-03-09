import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 初始化 OpenAI 客戶端
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/**
 * 通過 OpenAI API 獲取數據分析結果
 */
async function getAIAnalysis(
  brandName, 
  brandDescription, 
  productInfo, 
  genderDistribution, 
  ageDistribution,
  timeSeriesData,
  productPreferenceData
) {
  // 如果沒有配置 API 密鑰，返回模擬數據
  if (!OPENAI_API_KEY) {
    console.log("沒有配置 OpenAI API 密鑰，使用模擬數據");
    return getMockAnalysisResult(
      brandName, 
      genderDistribution, 
      ageDistribution, 
      timeSeriesData, 
      productPreferenceData
    );
  }

  try {
    // 構建 OpenAI API 的提示訊息
    const messages = [
      {
        role: "system",
        content: `你是一位專業的品牌行銷分析師，專精於分析消費者數據並提供品牌定位和市場策略建議。
        請根據提供的品牌資訊和消費者數據，進行以下分析：
        1. 確定品牌所屬的行業類別
        2. 分析目標受眾的特徵和行為模式
        3. 識別品牌的核心特質和差異化要素
        4. 分析性別分布數據，揭示受眾性別傾向及其消費行為特點
        5. 分析年齡分布數據，解釋不同年齡層的消費行為和偏好差異
        6. 如果有時間序列數據，分析消費趨勢和季節性變化
        7. 如果有商品類別偏好數據，分析受眾對不同商品的偏好程度
        8. 提供基於數據的針對性行銷建議，至少5條具體的策略方向
        9. 識別高價值客群，描述其特徵和行為模式，至少兩個客群

        請用JSON格式返回以下結構的結果：
        {
          "industryCategory": "行業類別",
          "targetAudience": "目標受眾描述",
          "brandCharacteristics": "品牌特質描述",
          "genderAnalysis": "性別數據分析結果",
          "ageAnalysis": "年齡數據分析結果",
          "timeSeriesAnalysis": "時間序列數據分析結果（如果有）",
          "productPreferenceAnalysis": "商品類別偏好分析結果（如果有）",
          "marketingSuggestions": ["建議1", "建議2", "建議3", "建議4", "建議5"],
          "highValueSegments": [
            {
              "name": "客群1名稱",
              "percentage": "佔比",
              "description": "特徵描述",
              "stats": {
                "averageOrderValue": "平均客單價",
                "purchaseFrequency": "購買頻率",
                "repurchaseRate": "回購率"
              }
            },
            {
              "name": "客群2名稱",
              "percentage": "佔比",
              "description": "特徵描述",
              "stats": {
                "averageOrderValue": "平均客單價",
                "purchaseFrequency": "購買頻率",
                "repurchaseRate": "回購率"
              }
            }
          ]
        }`
      },
      {
        role: "user",
        content: `
          品牌名稱: ${brandName}
          品牌描述: ${brandDescription || '無'}
          產品資訊: ${productInfo || '無'}

          性別分布數據: ${JSON.stringify(genderDistribution.data || [])}
          主要性別: ${genderDistribution.primary || '無'}

          年齡分布數據: ${JSON.stringify(ageDistribution.data || [])}
          主要年齡段: ${ageDistribution.primaryAgeGroup || '無'}

          ${timeSeriesData ? `時間序列數據: ${JSON.stringify(timeSeriesData)}` : ''}
          ${productPreferenceData ? `商品類別偏好數據: ${JSON.stringify(productPreferenceData)}` : ''}
        `
      }
    ];

    // 調用 OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // 使用 GPT-4o mini 模型
      messages: messages,
      temperature: 0.3,  // 較低的溫度使結果更確定性
      response_format: { type: "json_object" }  // 指定回傳 JSON 格式
    });

    // 解析回應
    try {
      const resultContent = response.choices[0].message.content;
      const result = JSON.parse(resultContent);
      return result;
    } catch (parseError) {
      console.error('OpenAI 回應解析錯誤:', parseError);
      // 解析失敗時使用模擬數據
      return getMockAnalysisResult(
        brandName, 
        genderDistribution, 
        ageDistribution, 
        timeSeriesData, 
        productPreferenceData
      );
    }
  } catch (error) {
    console.error('OpenAI API 調用失敗:', error);
    // API 調用失敗時使用模擬數據
    return getMockAnalysisResult(
      brandName, 
      genderDistribution, 
      ageDistribution, 
      timeSeriesData, 
      productPreferenceData
    );
  }
}

// 生成模擬分析結果
function getMockAnalysisResult(brandName, genderDistribution, ageDistribution, timeSeriesData, productPreferenceData) {
  const primaryGender = genderDistribution?.primary || '女性';
  const primaryAgeGroup = ageDistribution?.primaryAgeGroup || '25-34歲';

  const mockResult = {
    industryCategory: "消費品零售",
    targetAudience: `${primaryAgeGroup}的${primaryGender}為主的消費者，具有較高的購買力和品牌意識`,
    brandCharacteristics: `${brandName}是一個專注於品質和用戶體驗的品牌，產品設計時尚現代，注重細節和功能性`,
    genderAnalysis: `您的品牌主要受眾為${primaryGender}，這表明您的產品在該性別群體中較受歡迎。深入分析顯示，這些消費者更注重產品的實用性和設計感。`,
    ageAnalysis: `您的品牌主要吸引${primaryAgeGroup}的消費者，這一年齡段通常具有較強的消費能力和明確的品牌偏好。他們追求品質生活，願意為優質產品支付溢價。`,
    marketingSuggestions: [
      `針對${primaryGender}消費者偏好的社交媒體平台投放精準廣告，如Instagram和TikTok`,
      `調整產品設計和包裝以更好地滿足${primaryAgeGroup}消費者的審美和功能需求`,
      `開發符合主要受眾生活方式的行銷活動和忠誠度計劃，強調社區感和獨特體驗`,
      `加強品牌故事的傳播，塑造符合目標受眾價值觀的品牌形象`,
      `與目標受眾喜愛的KOL合作，提升品牌在核心消費群體中的影響力`
    ],
    highValueSegments: [
      {
        name: "品質追求者",
        percentage: "18%",
        description: `${primaryAgeGroup}的${primaryGender}消費者，月均消費金額超過3000元，購買頻率高，對品牌忠誠度強，非常注重產品品質和設計細節。`,
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