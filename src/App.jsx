
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
        throw new Error('分析請求失敗');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('分析過程發生錯誤:', error);
      alert('分析失敗，請重試。');
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
