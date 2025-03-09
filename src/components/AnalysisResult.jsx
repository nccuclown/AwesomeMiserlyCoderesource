
import { useEffect } from 'react';

const AnalysisResult = ({ isLoading, result, onAnalyze, brandInfo }) => {
  useEffect(() => {
    if (!result) {
      onAnalyze();
    }
  }, [result, onAnalyze]);

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <h2>正在分析中...</h2>
        <p>我們正在處理您的數據並生成分析結果，請稍候。</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="analysis-result-container">
      <h2>{brandInfo.name} 受眾分析報告</h2>
      
      <div className="analysis-section">
        <h3>品牌基本分析</h3>
        <div className="analysis-content">
          <p><strong>行業類別：</strong> {result.industryCategory}</p>
          <p><strong>目標客群：</strong> {result.targetAudience}</p>
          <p><strong>品牌特點：</strong> {result.brandCharacteristics}</p>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>受眾性別分布</h3>
        <div className="analysis-content">
          <div className="chart-placeholder">
            {/* 在這裡可以添加圖表庫來顯示性別分布圖 */}
            <p>主要性別: {result.genderDistribution.primary}</p>
            <p>性別分布解讀: {result.genderDistribution.analysis}</p>
          </div>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>受眾年齡分布</h3>
        <div className="analysis-content">
          <div className="chart-placeholder">
            {/* 在這裡可以添加圖表庫來顯示年齡分布圖 */}
            <p>主要年齡段: {result.ageDistribution.primaryAgeGroup}</p>
            <p>年齡分布解讀: {result.ageDistribution.analysis}</p>
          </div>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>行銷建議<</h3>
        <div className="analysis-content">
          <ull>
            {result.marketingSuggestionsSuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <button onClick={onAnalyze}>重新分析</button>
    </div>
  );
};

export default AnalysisResult;
import React from 'react';

function AnalysisResult({ isLoading, result, onAnalyze, brandInfo }) {
  if (isLoading) {
    return (
      <div className="loading-spinner">
        <p>分析中，請稍候...</p>
      </div>
    );
  }

  const handleAnalyzeClick = () => {
    if (!result) {
      onAnalyze();
    }
  };

  return (
    <div className="analysis-container">
      {!result ? (
        <div className="pre-analysis">
          <h2>品牌資訊摘要</h2>
          <p><strong>品牌名稱：</strong> {brandInfo.name}</p>
          <p><strong>品牌簡介：</strong> {brandInfo.description}</p>
          <p><strong>產品資訊：</strong> {brandInfo.productInfo}</p>
          <button onClick={handleAnalyzeClick}>開始分析</button>
        </div>
      ) : (
        <div className="analysis-results">
          <h2>分析結果</h2>
          
          <div className="analysis-section">
            <h3>品牌基本分析</h3>
            <p><strong>行業類別：</strong> {result.industryCategory}</p>
            <p><strong>目標受眾：</strong> {result.targetAudience}</p>
            <p><strong>品牌特點：</strong> {result.brandCharacteristics}</p>
          </div>
          
          <div className="analysis-section">
            <h3>性別分布分析</h3>
            <p>{result.genderDistribution.analysis}</p>
            <div className="chart-container">
              {/* 這裡可以未來添加圖表顯示 */}
              <p>主要性別群體：{result.genderDistribution.primary}</p>
            </div>
          </div>
          
          <div className="analysis-section">
            <h3>年齡分布分析</h3>
            <p>{result.ageDistribution.analysis}</p>
            <div className="chart-container">
              {/* 這裡可以未來添加圖表顯示 */}
              <p>主要年齡群體：{result.ageDistribution.primaryAgeGroup}</p>
            </div>
          </div>
          
          <div className="analysis-section">
            <h3>行銷建議</h3>
            <div className="analysis-content">
              <ul>
                {result.marketingSuggestions && result.marketingSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
