
import { useState } from 'react';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer 
} from 'recharts';

function AnalysisResult({ isLoading, result, onAnalyze, brandInfo }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <p>分析中，請稍候...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  const handleAnalyzeClick = () => {
    if (!result) {
      onAnalyze();
    }
  };

  const renderGenderChart = () => {
    if (!result || !result.genderDistribution || !result.genderDistribution.data) {
      return <p>沒有可用的性別數據</p>;
    }

    const data = result.genderDistribution.data.map(item => ({
      name: item.性別,
      value: parseFloat(item.比例)
    }));

    const COLORS = ['#0088FE', '#FF8042', '#FFBB28'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderAgeChart = () => {
    if (!result || !result.ageDistribution || !result.ageDistribution.data) {
      return <p>沒有可用的年齡數據</p>;
    }

    const data = result.ageDistribution.data.map(item => ({
      name: item.年齡,
      比例: parseFloat(item.比例)
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
          <Legend />
          <Bar dataKey="比例" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderConsumptionTrendChart = () => {
    // 這裡是模擬的消費趨勢數據，實際應用應該從API獲取
    const data = [
      { name: '1月', 男性: 400, 女性: 240 },
      { name: '2月', 男性: 300, 女性: 290 },
      { name: '3月', 男性: 200, 女性: 320 },
      { name: '4月', 男性: 280, 女性: 400 },
      { name: '5月', 男性: 380, 女性: 410 },
      { name: '6月', 男性: 450, 女性: 380 },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="男性" stroke="#8884d8" />
          <Line type="monotone" dataKey="女性" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderProductPreferenceChart = () => {
    // 這裡是模擬的產品偏好數據，實際應用應該從API獲取
    const data = [
      { category: '品質', A: 120, fullMark: 150 },
      { category: '價格', A: 80, fullMark: 150 },
      { category: '服務', A: 98, fullMark: 150 },
      { category: '設計', A: 130, fullMark: 150 },
      { category: '創新', A: 100, fullMark: 150 },
      { category: '便利性', A: 65, fullMark: 150 },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart outerRadius={90} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis />
          <Radar dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderAudienceProfile = () => {
    if (!result) return <p>分析結果不可用</p>;

    return (
      <div className="audience-profile">
        <h3>受眾畫像</h3>
        <div className="profile-card">
          <div className="profile-section">
            <h4>主要人口統計</h4>
            <p><strong>主要性別:</strong> {result.genderDistribution?.primary || '未知'}</p>
            <p><strong>主要年齡層:</strong> {result.ageDistribution?.primaryAgeGroup || '未知'}</p>
            <p><strong>消費能力:</strong> 中高</p>
          </div>
          
          <div className="profile-section">
            <h4>行為特徵</h4>
            <p><strong>購買頻率:</strong> 月均2-3次</p>
            <p><strong>偏好購物渠道:</strong> 線上電商</p>
            <p><strong>品牌忠誠度:</strong> 中等</p>
          </div>
          
          <div className="profile-section">
            <h4>興趣偏好</h4>
            <ul>
              <li>科技產品</li>
              <li>生活品質提升</li>
              <li>社交媒體活躍度高</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderHighValueSegment = () => {
    return (
      <div className="high-value-segment">
        <h3>高價值客群識別</h3>
        <div className="segment-card">
          <div className="segment-header">
            <h4>黃金客群</h4>
            <span className="segment-badge">占總體客戶的18%</span>
          </div>
          <p className="segment-description">
            25-34歲的女性消費者，月均消費金額超過3000元，購買頻率高，對品牌忠誠度強。
          </p>
          <div className="segment-stats">
            <div className="stat-item">
              <div className="stat-value">¥4,200</div>
              <div className="stat-label">平均客單價</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">3.5次</div>
              <div className="stat-label">月均購買頻次</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">85%</div>
              <div className="stat-label">回購率</div>
            </div>
          </div>
        </div>
        
        <div className="segment-card">
          <div className="segment-header">
            <h4>新興消費力</h4>
            <span className="segment-badge">占總體客戶的12%</span>
          </div>
          <p className="segment-description">
            18-24歲的年輕消費者，對新品嘗試意願高，社交媒體影響力大，平均客單價中等但增長迅速。
          </p>
          <div className="segment-stats">
            <div className="stat-item">
              <div className="stat-value">¥2,100</div>
              <div className="stat-label">平均客單價</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">2.8次</div>
              <div className="stat-label">月均購買頻次</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">65%</div>
              <div className="stat-label">回購率</div>
            </div>
          </div>
        </div>
      </div>
    );
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
          
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                概覽
              </button>
              <button 
                className={`tab ${activeTab === 'demographics' ? 'active' : ''}`}
                onClick={() => setActiveTab('demographics')}
              >
                人口統計
              </button>
              <button 
                className={`tab ${activeTab === 'behavior' ? 'active' : ''}`}
                onClick={() => setActiveTab('behavior')}
              >
                消費行為
              </button>
              <button 
                className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                受眾畫像
              </button>
              <button 
                className={`tab ${activeTab === 'strategy' ? 'active' : ''}`}
                onClick={() => setActiveTab('strategy')}
              >
                行銷策略
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="tab-pane">
                  <div className="analysis-section">
                    <h3>品牌基本分析</h3>
                    <p><strong>行業類別：</strong> {result.industryCategory}</p>
                    <p><strong>目標受眾：</strong> {result.targetAudience}</p>
                    <p><strong>品牌特點：</strong> {result.brandCharacteristics}</p>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>關鍵數據摘要</h3>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-title">主要性別</div>
                        <div className="stat-value">{result.genderDistribution?.primary || '未知'}</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-title">主要年齡層</div>
                        <div className="stat-value">{result.ageDistribution?.primaryAgeGroup || '未知'}</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-title">客戶忠誠度</div>
                        <div className="stat-value">中等</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-title">增長潛力</div>
                        <div className="stat-value">高</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'demographics' && (
                <div className="tab-pane">
                  <div className="analysis-section">
                    <h3>性別分布分析</h3>
                    <p>{result.genderDistribution.analysis}</p>
                    <div className="chart-container">
                      {renderGenderChart()}
                    </div>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>年齡分布分析</h3>
                    <p>{result.ageDistribution.analysis}</p>
                    <div className="chart-container">
                      {renderAgeChart()}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'behavior' && (
                <div className="tab-pane">
                  <div className="analysis-section">
                    <h3>消費趨勢</h3>
                    <p>過去6個月各性別消費金額變化趨勢:</p>
                    <div className="chart-container">
                      {renderConsumptionTrendChart()}
                    </div>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>產品偏好</h3>
                    <p>消費者對產品各方面的評價雷達圖:</p>
                    <div className="chart-container">
                      {renderProductPreferenceChart()}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div className="tab-pane">
                  {renderAudienceProfile()}
                  {renderHighValueSegment()}
                </div>
              )}
              
              {activeTab === 'strategy' && (
                <div className="tab-pane">
                  <div className="analysis-section">
                    <h3>行銷策略建議</h3>
                    <div className="strategy-cards">
                      {result.marketingSuggestions && result.marketingSuggestions.map((suggestion, index) => (
                        <div className="strategy-card" key={index}>
                          <div className="strategy-number">{index + 1}</div>
                          <div className="strategy-content">{suggestion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>渠道策略</h3>
                    <div className="channel-grid">
                      <div className="channel-item">
                        <h4>社交媒體</h4>
                        <p>Instagram、TikTok為主要推廣渠道，著重視覺化內容</p>
                        <div className="priority-badge high">高優先級</div>
                      </div>
                      <div className="channel-item">
                        <h4>內容行銷</h4>
                        <p>打造品牌故事和生活風格內容，增強品牌連結</p>
                        <div className="priority-badge medium">中優先級</div>
                      </div>
                      <div className="channel-item">
                        <h4>KOL合作</h4>
                        <p>與目標受眾重合度高的KOL合作，提升品牌曝光</p>
                        <div className="priority-badge high">高優先級</div>
                      </div>
                      <div className="channel-item">
                        <h4>會員計劃</h4>
                        <p>建立會員體系，增強高價值客戶黏性</p>
                        <div className="priority-badge medium">中優先級</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
