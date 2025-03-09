
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
        <h3>行銷建議</h3>
        <div className="analysis-content">
          <ul>
            {result.marketingSuggestions.map((suggestion, index) => (
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
