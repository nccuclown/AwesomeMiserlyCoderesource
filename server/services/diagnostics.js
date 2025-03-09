
import fs from 'fs';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

// 詳細檢查OpenAI API金鑰
export async function checkOpenAICredentials() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('API KEY 檢查:');
  console.log('API KEY 是否存在:', !!apiKey);
  
  if (!apiKey) {
    return {
      status: 'error',
      message: 'API 金鑰未設置',
      isValid: false
    };
  }
  
  console.log('API KEY 長度:', apiKey.length);
  
  // 檢查API金鑰格式 (sk-...)
  const isValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;
  console.log('API KEY 格式是否正確:', isValidFormat);
  
  if (!isValidFormat) {
    return {
      status: 'error',
      message: 'API 金鑰格式不正確 (應以 sk- 開頭)',
      isValid: false
    };
  }
  
  // 測試 API 連接
  try {
    const openai = new OpenAI({ apiKey });
    
    console.log('正在測試 API 連接...');
    const startTime = Date.now();
    
    const modelResponse = await openai.models.list();
    
    const endTime = Date.now();
    console.log(`API 響應時間: ${endTime - startTime}ms`);
    
    // 將API響應寫入日誌文件作詳細分析
    fs.writeFileSync('openai_test_response.json', JSON.stringify(modelResponse, null, 2));
    
    return {
      status: 'success',
      message: 'API 金鑰有效且能夠成功連接',
      isValid: true,
      models: modelResponse.data.map(model => model.id)
    };
  } catch (error) {
    console.error('API 連接錯誤:');
    console.error('錯誤名稱:', error.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤詳情:', JSON.stringify(error, null, 2));
    
    if (error.response) {
      console.error('API 響應狀態:', error.response.status);
      console.error('API 錯誤訊息:', error.response.data);
    }
    
    let errorMessage = 'API 連接失敗';
    
    // 分析常見錯誤
    if (error.message.includes('authentication')) {
      errorMessage = 'API 金鑰認證失敗';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'API 請求頻率超限';
    } else if (error.message.includes('network')) {
      errorMessage = '網絡連接問題';
    }
    
    return {
      status: 'error',
      message: errorMessage,
      isValid: false,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };
  }
}

// 測試完整的 OpenAI 完成請求
export async function testOpenAICompletion() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      status: 'error',
      message: 'API 金鑰未設置'
    };
  }
  
  try {
    const openai = new OpenAI({ apiKey });
    
    console.log('正在測試 OpenAI 聊天完成 API...');
    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "你是一個測試助手。" },
        { role: "user", content: "請回應 'API 測試成功'" }
      ],
      max_tokens: 20
    });
    
    const endTime = Date.now();
    console.log(`API 完成響應時間: ${endTime - startTime}ms`);
    
    // 記錄完整響應
    fs.writeFileSync('openai_completion_response.json', JSON.stringify(completion, null, 2));
    
    return {
      status: 'success',
      message: '聊天完成 API 呼叫成功',
      responseContent: completion.choices[0]?.message?.content,
      completion: completion
    };
  } catch (error) {
    console.error('API 完成請求錯誤:');
    console.error('錯誤名稱:', error.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤詳情:', JSON.stringify(error, null, 2));
    
    if (error.response) {
      console.error('API 響應狀態:', error.response.status);
      console.error('API 錯誤訊息:', error.response.data);
    }
    
    return {
      status: 'error',
      message: `聊天完成 API 呼叫失敗: ${error.message}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };
  }
}

// 檢查完整的環境配置
export function checkEnvironment() {
  return {
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
    apiKeyExists: !!process.env.OPENAI_API_KEY,
    apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    apiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) + '...' : 'N/A',
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };
}
