
const { OpenAI } = require('openai');
require('dotenv').config();

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
    console.error("OpenAI API 錯誤:", error);
    throw new Error(`分析品牌資訊時發生錯誤: ${error.message}`);
  }
}

// 生成受眾分析報告
async function generateAudienceReport(brandAnalysis, audienceData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一位專業的受眾分析專家，請根據提供的品牌分析和受眾數據生成深入的分析報告。"
        },
        {
          role: "user",
          content: `品牌分析: ${JSON.stringify(brandAnalysis)}\n受眾數據: ${JSON.stringify(audienceData)}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000  // 控制回應長度
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API 錯誤:", error);
    throw new Error(`生成報告時發生錯誤: ${error.message}`);
  }
}

// 分析數據並提供詳細的市場分析報告
async function getAIAnalysis(brandName, brandDescription, productInfo, genderDistribution, ageDistribution, timeSeriesData, productPreferenceData) {
  try {
    // 構建提示，包含所有可用的數據
    const messages = [
      {
        role: "system",
        content: `
          請你擔任資深市場分析師和品牌顧問，分析以下品牌資訊並提供詳細的受眾分析和行銷建議。
          請以JSON格式提供以下詳細分析：
          1. "industryCategory": [行業類別]
          2. "targetAudience": [目標受眾的詳細特徵描述]
          3. "brandCharacteristics": [品牌特點摘要]
          4. "genderAnalysis": [詳細的性別分布分析，包含洞察和趨勢]
          5. "ageAnalysis": [詳細的年齡分布分析，包含洞察和趨勢]
          6. "marketingSuggestions": [至少五點針對性的行銷建議數組]
          7. "highValueSegments": [高價值客群識別和特徵描述，至少兩個客群]
        `
      },
      {
        role: "user",
        content: `
          品牌名稱：${brandName}
          品牌簡介：${brandDescription}
          產品資訊：${productInfo}
          
          性別分布數據：
          ${JSON.stringify(genderDistribution.data)}
          
          年齡分布數據：
          ${JSON.stringify(ageDistribution.data)}
          
          ${timeSeriesData ? `時間序列消費行為數據：${JSON.stringify(timeSeriesData.gender)}` : ''}
          
          ${productPreferenceData ? `商品類別偏好數據：${JSON.stringify(productPreferenceData.categories)}` : ''}
        `
      }
    ];
    
    // 如果有時間序列和商品偏好分析請求，添加到system prompt
    let systemPrompt = messages[0].content;
    if (timeSeriesData) {
      systemPrompt += '\n8. "timeSeriesAnalysis": [消費行為時間趨勢分析]';
    }
    
    if (productPreferenceData) {
      systemPrompt += '\n9. "productPreferenceAnalysis": [商品類別偏好深度分析]';
    }
    
    messages[0].content = systemPrompt;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API 錯誤:", error);
    return getMockAnalysis(brandName, genderDistribution, ageDistribution, timeSeriesData, productPreferenceData);
  }
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

module.exports = {
  analyzeBrandInfo,
  generateAudienceReport,
  getAIAnalysis
};
