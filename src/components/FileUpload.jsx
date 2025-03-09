
import React, { useState, useEffect } from 'react';

function FileUpload({ onUpload }) {
  const [files, setFiles] = useState({
    gender: null,
    age: null,
    productPref: null,
    timeSeriesGender: null,
    timeSeriesAge: null
  });
  
  const [fileStatus, setFileStatus] = useState({
    gender: { status: 'pending', message: '未上傳' },
    age: { status: 'pending', message: '未上傳' },
    productPref: { status: 'pending', message: '未上傳 (選填)' },
    timeSeriesGender: { status: 'pending', message: '未上傳 (選填)' },
    timeSeriesAge: { status: 'pending', message: '未上傳 (選填)' }
  });
  
  const [isValid, setIsValid] = useState(false);
  const [formatErrors, setFormatErrors] = useState([]);

  // 當文件狀態改變時，檢查整體表單是否有效
  useEffect(() => {
    // 檢查必填項：至少需要性別或年齡數據
    const hasRequiredFiles = fileStatus.gender.status === 'success' || fileStatus.age.status === 'success';
    
    // 檢查是否有任何文件驗證失敗
    const hasErrors = Object.values(fileStatus).some(item => item.status === 'error');
    
    setIsValid(hasRequiredFiles && !hasErrors);
  }, [fileStatus]);

  // 驗證CSV文件格式
  const validateCSVFile = (file, type) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        console.log(`[檢查點] 開始驗證 ${type} 文件: ${file.name}`);
        const content = e.target.result;
        const lines = content.split('\n');
        
        if (lines.length < 2) {
          reject(`${type} 文件格式錯誤：文件至少需要包含標題行和一行數據`);
          return;
        }
        
        // 取得標題行並轉為小寫
        const headers = lines[0].toLowerCase().trim().split(',');
        console.log(`[檢查點] ${type} 文件標題行: ${headers.join(', ')}`);
        
        // 根據不同類型檢查所需欄位
        let requiredHeaders = [];
        
        switch(type) {
          case 'gender':
            requiredHeaders = ['性別', '比例'];
            break;
          case 'age':
            requiredHeaders = ['年齡', '比例'];
            break;
          case 'productPref':
            requiredHeaders = ['商品類別', '權重分數'];
            break;
          case 'timeSeriesGender':
          case 'timeSeriesAge':
            requiredHeaders = ['日期'];
            if (type === 'timeSeriesGender') {
              requiredHeaders.push('性別');
            } else {
              requiredHeaders.push('年齡');
            }
            requiredHeaders.push('平均訂單金額');
            break;
        }
        
        // 檢查所需欄位是否存在
        const missingHeaders = requiredHeaders.filter(
          header => !headers.some(h => h.includes(header.toLowerCase()))
        );
        
        if (missingHeaders.length > 0) {
          reject(`${type} 文件缺少必要欄位: ${missingHeaders.join(', ')}`);
          return;
        }
        
        // 顯示數據樣本進行確認
        const sampleData = lines.slice(1, 3).map(line => {
          const values = line.split(',');
          const sample = {};
          headers.forEach((header, index) => {
            if (index < values.length) {
              sample[header.trim()] = values[index].trim();
            }
          });
          return sample;
        });
        
        console.log(`[檢查點] ${type} 文件數據樣本:`, sampleData);
        resolve(sampleData);
      };
      
      reader.onerror = () => {
        reject(`讀取 ${type} 文件時發生錯誤`);
      };
      
      reader.readAsText(file);
    });
  };

  // 處理文件上傳
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 先更新狀態為處理中
    setFileStatus(prev => ({
      ...prev,
      [type]: { status: 'processing', message: '正在驗證...' }
    }));
    
    try {
      // 驗證文件格式
      const sampleData = await validateCSVFile(file, type);
      
      // 更新文件和狀態
      setFiles(prev => ({ ...prev, [type]: file }));
      setFileStatus(prev => ({
        ...prev,
        [type]: { 
          status: 'success', 
          message: `已上傳 (${file.name})`,
          sample: sampleData 
        }
      }));
      
      // 移除相關錯誤（如果有）
      setFormatErrors(prev => prev.filter(err => !err.includes(type)));
      
    } catch (error) {
      console.error(`[檢查點] 文件驗證失敗: ${error}`);
      
      // 更新錯誤狀態
      setFileStatus(prev => ({
        ...prev,
        [type]: { status: 'error', message: error }
      }));
      setFormatErrors(prev => [...prev.filter(err => !err.includes(type)), error]);
      
      // 清除該文件
      setFiles(prev => ({ ...prev, [type]: null }));
    }
  };

  // 處理表單提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 再次檢查表單有效性
    if (!isValid) {
      console.error('[檢查點] 提交失敗: 表單驗證未通過');
      return;
    }
    
    console.log('[檢查點] 所有文件驗證通過，準備上傳數據分析');
    console.log(`[檢查點] 上傳文件概況:
      - 性別數據: ${files.gender ? '已上傳' : '未上傳'}
      - 年齡數據: ${files.age ? '已上傳' : '未上傳'}
      - 商品偏好: ${files.productPref ? '已上傳' : '未上傳'}
      - 性別時間序列: ${files.timeSeriesGender ? '已上傳' : '未上傳'}
      - 年齡時間序列: ${files.timeSeriesAge ? '已上傳' : '未上傳'}`);

    // 將數據傳遞給父元件
    onUpload({
      gender: files.gender,
      age: files.age,
      productPref: files.productPref,
      timeSeriesGender: files.timeSeriesGender,
      timeSeriesAge: files.timeSeriesAge
    });
  };

  // 渲染文件狀態圖標
  const renderStatusIcon = (status) => {
    switch(status) {
      case 'success':
        return (
          <span className="status-icon success">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        );
      case 'error':
        return (
          <span className="status-icon error">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </span>
        );
      case 'processing':
        return (
          <span className="status-icon processing">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
        );
      default:
        return (
          <span className="status-icon pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </span>
        );
    }
  };

  return (
    <div className="file-upload-container">
      <h2>上傳受眾數據</h2>
      <p className="upload-instruction">請上傳您的受眾數據CSV文件（至少需要性別或年齡數據）</p>
      
      {formatErrors.length > 0 && (
        <div className="format-errors">
          <h3>檔案格式錯誤:</h3>
          <ul>
            {formatErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="file-upload-list">
        {/* 必要數據上傳 */}
        <div className="file-list-section">
          <h3>必要數據</h3>
          
          {/* 性別數據 */}
          <div className={`file-upload-item ${fileStatus.gender.status}`}>
            <div className="file-item-info">
              {renderStatusIcon(fileStatus.gender.status)}
              <div className="file-label">性別分佈數據</div>
              <div className="file-status-message">{fileStatus.gender.message}</div>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileChange(e, 'gender')}
                  className="file-input"
                />
                上傳文件
              </label>
            </div>
          </div>
          
          {/* 年齡數據 */}
          <div className={`file-upload-item ${fileStatus.age.status}`}>
            <div className="file-item-info">
              {renderStatusIcon(fileStatus.age.status)}
              <div className="file-label">年齡分佈數據</div>
              <div className="file-status-message">{fileStatus.age.message}</div>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileChange(e, 'age')}
                  className="file-input"
                />
                上傳文件
              </label>
            </div>
          </div>
        </div>
        
        {/* 選填數據上傳 */}
        <div className="file-list-section">
          <h3>選填數據</h3>
          
          {/* 產品偏好數據 */}
          <div className={`file-upload-item ${fileStatus.productPref.status}`}>
            <div className="file-item-info">
              {renderStatusIcon(fileStatus.productPref.status)}
              <div className="file-label">產品偏好數據</div>
              <div className="file-status-message">{fileStatus.productPref.message}</div>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileChange(e, 'productPref')}
                  className="file-input"
                />
                上傳文件
              </label>
            </div>
          </div>
          
          {/* 性別時間序列數據 */}
          <div className={`file-upload-item ${fileStatus.timeSeriesGender.status}`}>
            <div className="file-item-info">
              {renderStatusIcon(fileStatus.timeSeriesGender.status)}
              <div className="file-label">性別時間序列數據</div>
              <div className="file-status-message">{fileStatus.timeSeriesGender.message}</div>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileChange(e, 'timeSeriesGender')}
                  className="file-input"
                />
                上傳文件
              </label>
            </div>
          </div>
          
          {/* 年齡時間序列數據 */}
          <div className={`file-upload-item ${fileStatus.timeSeriesAge.status}`}>
            <div className="file-item-info">
              {renderStatusIcon(fileStatus.timeSeriesAge.status)}
              <div className="file-label">年齡時間序列數據</div>
              <div className="file-status-message">{fileStatus.timeSeriesAge.message}</div>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileChange(e, 'timeSeriesAge')}
                  className="file-input"
                />
                上傳文件
              </label>
            </div>
          </div>
        </div>
        
        {/* 已上傳數據預覽 */}
        {Object.entries(fileStatus).some(([key, value]) => value.status === 'success' && value.sample) && (
          <div className="data-preview-section">
            <h3>已上傳數據預覽</h3>
            {Object.entries(fileStatus).map(([key, value]) => {
              if (value.status === 'success' && value.sample) {
                return (
                  <div key={key} className="data-preview-item">
                    <h4>{(() => {
                      switch(key) {
                        case 'gender': return '性別分佈數據';
                        case 'age': return '年齡分佈數據';
                        case 'productPref': return '產品偏好數據';
                        case 'timeSeriesGender': return '性別時間序列數據';
                        case 'timeSeriesAge': return '年齡時間序列數據';
                        default: return key;
                      }
                    })()}</h4>
                    <div className="data-sample">
                      <pre>{JSON.stringify(value.sample, null, 2)}</pre>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        
        {/* 提交按鈕 */}
        <div className="submit-section">
          <button 
            type="submit" 
            className="submit-button" 
            disabled={!isValid}
          >
            開始分析
          </button>
          {!isValid && !(fileStatus.gender.status === 'success' || fileStatus.age.status === 'success') && (
            <p className="validation-message">請至少上傳一項必要數據（性別或年齡）</p>
          )}
          {!isValid && Object.values(fileStatus).some(item => item.status === 'error') && (
            <p className="validation-message">請修正文件錯誤後再嘗試</p>
          )}
        </div>
      </form>
      
      {/* 格式說明 */}
      <div className="file-format-help">
        <h3>CSV文件格式說明</h3>
        <div className="format-examples">
          <div className="format-example">
            <h4>性別分佈數據</h4>
            <pre>性別,比例
男,0.45
女,0.55</pre>
          </div>
          <div className="format-example">
            <h4>年齡分佈數據</h4>
            <pre>年齡,比例
18-24,0.15
25-34,0.35
35-44,0.25
45-54,0.15
55+,0.1</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
