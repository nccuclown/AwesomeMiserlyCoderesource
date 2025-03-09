
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// 初始化 OpenAI 客戶端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 使用 GPT-4o mini 分析品牌資訊
async function analyzeBrandInfo(brandInfo) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // 使用 GPT-4o mini 模型
      messages: [
        {
          role: "system",
          content: "你是一位專業的品牌分析師，請根據提供的品牌資訊進行分析。分析結果請以JSON格式返回，包含行業類別、目標受眾和品牌特性。"
        },
        {
          role: "user",
          content: `品牌名稱: ${brandInfo.brandName}\n品牌簡介: ${brandInfo.brandDescription}\n產品資訊: ${brandInfo.productInfo}`
        }
      ],
      temperature: 0.3,  // 較低的溫度使結果更確定性
      response_format: { type: "json_object" }  // 指定回傳 JSON 格式
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API 呼叫失敗:", error);
    throw new Error("品牌分析失敗，請稍後再試");
  }
}

// 使用 GPT-4o mini 分析受眾數據
async function getAIAnalysis(
  brandName, 
  brandDescription, 
  productInfo, 
  genderDistribution, 
  ageDistribution,
  timeSeriesData,
  productPreferenceData
) {
  try {
    const prompt = createAnalysisPrompt(
      brandName, 
      brandDescription, 
      productInfo, 
      genderDistribution, 
      ageDistribution,
      timeSeriesData,
      productPreferenceData
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一位專業的品牌受眾分析師，擅長從數據中獲取洞見並提供品牌行銷建議。請基於提供的數據進行深入分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API 分析失敗:", error);
    
    // 如果API出錯，返回模擬數據
    return getMockAnalysisResult(brandName, genderDistribution, ageDistribution);
  }
}

// 建立分析提示詞
function createAnalysisPrompt(
  brandName, 
  brandDescription, 
  productInfo, 
  genderDistribution, 
  ageDistribution,
  timeSeriesData,
  productPreferenceData
) {
  let prompt = `
請分析以下品牌與受眾數據，並提供品牌受眾特性和行銷建議：

品牌名稱: ${brandName}
品牌介紹: ${brandDescription}
產品資訊: ${productInfo}

性別分布數據:
${JSON.stringify(genderDistribution.data, null, 2)}

年齡分布數據:
${JSON.stringify(ageDistribution.data, null, 2)}
`;

  // 添加時間序列資料（如果有）
  if (timeSeriesData) {
    prompt += `\n時間序列數據:\n${JSON.stringify(timeSeriesData, null, 2)}\n`;
  }

  // 添加產品偏好資料（如果有）
  if (productPreferenceData) {
    prompt += `\n商品類別偏好數據:\n${JSON.stringify(productPreferenceData, null, 2)}\n`;
  }

  prompt += `
請根據上述數據，進行全面且深入的分析，並以JSON格式回傳以下項目：
1. industryCategory: 品牌所屬行業類別
2. targetAudience: 品牌目標受眾描述
3. brandCharacteristics: 品牌特性分析
4. genderAnalysis: 性別分布數據的深入分析
5. ageAnalysis: 年齡分布數據的深入分析
6. marketingSuggestions: 至少5條針對性的行銷建議
7. highValueSegments: 至少2個高價值客群分析，每個包含name、percentage、description和stats
`;

  if (timeSeriesData) {
    prompt += "8. timeSeriesAnalysis: 時間序列數據的趨勢分析\n";
  }

  if (productPreferenceData) {
    prompt += "9. productPreferenceAnalysis: 商品類別偏好數據分析\n";
  }

  return prompt;
}

// 模擬分析結果（API失敗時使用）
function getMockAnalysisResult(brandName, genderDistribution, ageDistribution) {
  return {
    industryCategory: "消費品零售",
    targetAudience: `25-34歲的女性為主的消費者，具有較高的購買力和品牌意識`,
    brandCharacteristics: `${brandName}是一個專注於品質和用戶體驗的品牌，產品設計時尚現代，注重細節和功能性`,
    genderAnalysis: `您的品牌主要受眾為女性，這表明您的產品在該性別群體中較受歡迎。深入分析顯示，這些消費者更注重產品的實用性和設計感。`,
    ageAnalysis: `您的品牌主要吸引25-34歲的消費者，這一年齡段通常具有較強的消費能力和明確的品牌偏好。他們追求品質生活，願意為優質產品支付溢價。`,
    marketingSuggestions: [
      `針對女性消費者偏好的社交媒體平台投放精準廣告，如Instagram和TikTok`,
      `調整產品設計和包裝以更好地滿足25-34歲消費者的審美和功能需求`,
      `開發符合主要受眾生活方式的行銷活動和忠誠度計劃，強調社區感和獨特體驗`,
      `加強品牌故事的傳播，塑造符合目標受眾價值觀的品牌形象`,
      `與目標受眾喜愛的KOL合作，提升品牌在核心消費群體中的影響力`
    ],
    highValueSegments: [
      {
        name: "品質追求者",
        percentage: "18%",
        description: "25-34歲的女性消費者，月均消費金額超過3000元，購買頻率高，對品牌忠誠度強，非常注重產品品質和設計細節。",
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
}

export default {
  analyzeBrandInfo,
  getAIAnalysis
};
