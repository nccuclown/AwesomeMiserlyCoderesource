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