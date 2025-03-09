
import { useState } from 'react'
import './App.css'
import BrandInfoForm from './components/BrandInfoForm'
import FileUpload from './components/FileUpload'
import AnalysisResult from './components/AnalysisResult'

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [brandInfo, setBrandInfo] = useState({
    name: '',
    description: '',
    productInfo: ''
  });
  const [files, setFiles] = useState({
    gender: null,
    age: null
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBrandInfoSubmit = (info) => {
    setBrandInfo(info);
    setCurrentStep(2);
  };

  const handleFileUpload = (uploadedFiles) => {
    setFiles(uploadedFiles);
    setCurrentStep(3);
  };

  const performAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('brandName', brandInfo.name);
      formData.append('brandDescription', brandInfo.description);
      formData.append('productInfo', brandInfo.productInfo);
      
      // 添加必要的文件
      if (files.gender) {
        formData.append('genderFile', files.gender);
      }
      
      if (files.age) {
        formData.append('ageFile', files.age);
      }
      
      // 添加選填的文件
      if (files.productPref) {
        formData.append('productPrefFile', files.productPref);
      }
      
      if (files.timeSeriesGender) {
        formData.append('timeSeriesGenderFile', files.timeSeriesGender);
      }
      
      if (files.timeSeriesAge) {
        formData.append('timeSeriesAgeFile', files.timeSeriesAge);
      }

      // 發送請求
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.error('服务器返回状态码:', response.status);
        
        let errorText;
        try {
          errorText = await response.text();
          console.error('伺服器錯誤回應 (原始文本):', errorText);
        } catch (e) {
          console.error('讀取錯誤響應失敗:', e);
          errorText = '无法获取错误响应内容';
        }
        
        let errorMessage = `服务器错误 (${response.status})`;
        
        if (errorText && errorText.trim()) {
          try {
            // 嘗試解析 JSON 錯誤訊息
            const errorJson = JSON.parse(errorText);
            console.error('伺服器錯誤詳情 (JSON):', errorJson);
            
            // 從 JSON 中提取錯誤信息
            errorMessage = errorJson.error || errorJson.message || '分析請求失敗';
            
            if (errorJson.type === 'OpenAIError') {
              errorMessage = `OpenAI API 錯誤: ${errorJson.details || errorMessage}`;
            }
          } catch (parseError) {
            // 如果不是 JSON，則顯示原始錯誤文本
            console.error('無法解析錯誤回應為 JSON:', parseError);
            console.log('原始錯誤內容長度:', errorText ? errorText.length : 0);
            
            // 截取合理長度的錯誤信息
            if (errorText && errorText.length > 0) {
              errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`;
            }
          }
        }
        
        // 拋出帶有處理後信息的錯誤
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('分析成功，結果:', result);
      setAnalysisResult(result);
    } catch (error) {
      console.error('分析過程發生錯誤:', error);
      
      // 設置更具體的錯誤訊息
      let errorMessage = '分析請求失敗';
      
      if (error.message.includes('OpenAI')) {
        errorMessage = 'OpenAI API錯誤: 請檢查API金鑰設定';
      } else if (error.message.includes('CSV')) {
        errorMessage = 'CSV文件格式錯誤: 請確保上傳的文件符合要求格式';
      } else if (error.message.includes('500')) {
        errorMessage = '伺服器內部錯誤: 請檢查伺服器日誌';
      }
      
      alert(`分析失敗: ${errorMessage}`);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BrandInfoForm onSubmit={handleBrandInfoSubmit} />;
      case 2:
        return <FileUpload onUpload={handleFileUpload} />;
      case 3:
        return (
          <AnalysisResult 
            isLoading={isLoading} 
            result={analysisResult} 
            onAnalyze={performAnalysis} 
            brandInfo={brandInfo}
          />
        );
      default:
        return <BrandInfoForm onSubmit={handleBrandInfoSubmit} />;
    }
  };

  return (
    <main className="app-container">
      <h1>品牌受眾分析工具</h1>
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-circle">1</div>
          <div className="step-label">品牌資訊</div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-circle">2</div>
          <div className="step-label">上傳數據</div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <div className="step-label">分析結果</div>
        </div>
      </div>
      {renderStep()}
    </main>
  )
}
