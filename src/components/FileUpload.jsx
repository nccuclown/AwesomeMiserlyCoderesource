
import { useState, useEffect } from 'react';

function FileUpload({ onUpload }) {
  const [files, setFiles] = useState({
    gender: null,
    age: null,
    productPref: null,
    timeSeriesGender: null,
    timeSeriesAge: null
  });
  
  const [fileValidations, setFileValidations] = useState({
    gender: { isValid: false, message: '', data: null },
    age: { isValid: false, message: '', data: null },
    productPref: { isValid: false, message: '', data: null },
    timeSeriesGender: { isValid: false, message: '', data: null },
    timeSeriesAge: { isValid: false, message: '', data: null }
  });
  
  const [allRequiredFilesValid, setAllRequiredFilesValid] = useState(false);
  
  // 驗證所有必需文件
  useEffect(() => {
    const requiredFiles = ['gender', 'age'];
    const allRequired = requiredFiles.every(type => fileValidations[type].isValid);
    setAllRequiredFilesValid(allRequired);
  }, [fileValidations]);
  
  const handleFileChange = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setFiles(prev => ({ ...prev, [fileType]: file }));
    
    // 驗證文件
    try {
      const validation = await validateFile(file, fileType);
      setFileValidations(prev => ({
        ...prev,
        [fileType]: validation
      }));
    } catch (error) {
      console.error(`文件驗證錯誤: ${error.message}`);
      setFileValidations(prev => ({
        ...prev,
        [fileType]: { isValid: false, message: `驗證失敗: ${error.message}`, data: null }
      }));
    }
  };
  
  // 模擬文件驗證
  const validateFile = (file, fileType) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        // 簡單檢查 CSV 格式
        const lines = content.split('\n');
        
        if (lines.length < 2) {
          resolve({ isValid: false, message: '檔案格式有誤: 資料少於2行', data: null });
          return;
        }
        
        const headers = lines[0].split(',');
        
        // 針對不同類型的文件進行特定驗證
        if (fileType === 'gender') {
          if (!headers.includes('性別') || !headers.includes('比例')) {
            resolve({ isValid: false, message: '性別檔案需包含 "性別" 和 "比例" 欄位', data: null });
            return;
          }
          
          // 解析前幾行數據用於預覽
          const data = lines.slice(1, Math.min(4, lines.length))
            .map(line => {
              const values = line.split(',');
              const obj = {};
              headers.forEach((header, i) => obj[header.trim()] = values[i]?.trim());
              return obj;
            });
          
          resolve({ isValid: true, message: '檔案格式正確', data });
        } 
        else if (fileType === 'age') {
          if (!headers.includes('年齡') || !headers.includes('比例')) {
            resolve({ isValid: false, message: '年齡檔案需包含 "年齡" 和 "比例" 欄位', data: null });
            return;
          }
          
          const data = lines.slice(1, Math.min(4, lines.length))
            .map(line => {
              const values = line.split(',');
              const obj = {};
              headers.forEach((header, i) => obj[header.trim()] = values[i]?.trim());
              return obj;
            });
          
          resolve({ isValid: true, message: '檔案格式正確', data });
        }
        else if (fileType === 'productPref') {
          if (!headers.includes('商品類別') || !headers.includes('權重分數')) {
            resolve({ isValid: false, message: '產品偏好檔案需包含 "商品類別" 和 "權重分數" 欄位', data: null });
            return;
          }
          
          const data = lines.slice(1, Math.min(4, lines.length))
            .map(line => {
              const values = line.split(',');
              const obj = {};
              headers.forEach((header, i) => obj[header.trim()] = values[i]?.trim());
              return obj;
            });
          
          resolve({ isValid: true, message: '檔案格式正確', data });
        }
        else if (fileType.includes('timeSeries')) {
          if (!headers.includes('日期')) {
            resolve({ isValid: false, message: '時間序列檔案需包含 "日期" 欄位', data: null });
            return;
          }
          
          const data = lines.slice(1, Math.min(4, lines.length))
            .map(line => {
              const values = line.split(',');
              const obj = {};
              headers.forEach((header, i) => obj[header.trim()] = values[i]?.trim());
              return obj;
            });
          
          resolve({ isValid: true, message: '檔案格式正確', data });
        }
        else {
          resolve({ isValid: true, message: '檔案已上傳', data: null });
        }
      };
      
      reader.onerror = () => {
        resolve({ isValid: false, message: '檔案讀取錯誤', data: null });
      };
      
      reader.readAsText(file);
    });
  };
  
  const handleSubmit = () => {
    onUpload(files);
  };
  
  // 渲染檔案上傳UI
  return (
    <div className="file-upload">
      <h2>上傳受眾數據</h2>
      
      <div className="upload-instructions">
        <strong>使用說明:</strong> 請上傳格式正確的 CSV 檔案。性別分布和年齡分布是必需的，其餘檔案為選填。
        所有檔案將進行格式驗證，確保數據可正確分析。
      </div>
      
      <div className="file-upload-list">
        {/* 必需檔案 */}
        <div className="file-list-section">
          <h3>必需檔案</h3>
          
          {/* 性別分布檔案 */}
          <div className={`file-upload-item ${fileValidations.gender.isValid ? 'success' : files.gender ? (fileValidations.gender.isValid === false ? 'error' : 'processing') : ''}`}>
            <div className="file-item-info">
              <span className={`status-icon ${fileValidations.gender.isValid ? 'success' : (files.gender ? (fileValidations.gender.isValid === false ? 'error' : 'processing') : 'pending')}`}>
                {fileValidations.gender.isValid ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : files.gender && fileValidations.gender.isValid === false ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : files.gender ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
              </span>
              <span className="file-label">性別分布</span>
              <span className="file-status-message">
                {files.gender 
                  ? (fileValidations.gender.isValid 
                      ? `已驗證: ${files.gender.name}` 
                      : (fileValidations.gender.message || '正在驗證...'))
                  : '請上傳性別分布數據 (必需)'}
              </span>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                上傳檔案
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'gender')}
                />
              </label>
            </div>
          </div>
          
          {/* 年齡分布檔案 */}
          <div className={`file-upload-item ${fileValidations.age.isValid ? 'success' : files.age ? (fileValidations.age.isValid === false ? 'error' : 'processing') : ''}`}>
            <div className="file-item-info">
              <span className={`status-icon ${fileValidations.age.isValid ? 'success' : (files.age ? (fileValidations.age.isValid === false ? 'error' : 'processing') : 'pending')}`}>
                {fileValidations.age.isValid ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : files.age && fileValidations.age.isValid === false ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : files.age ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
              </span>
              <span className="file-label">年齡分布</span>
              <span className="file-status-message">
                {files.age 
                  ? (fileValidations.age.isValid 
                      ? `已驗證: ${files.age.name}` 
                      : (fileValidations.age.message || '正在驗證...'))
                  : '請上傳年齡分布數據 (必需)'}
              </span>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                上傳檔案
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'age')}
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* 選填檔案 */}
        <div className="file-list-section">
          <h3>選填檔案</h3>
          
          {/* 產品偏好檔案 */}
          <div className={`file-upload-item ${fileValidations.productPref.isValid ? 'success' : files.productPref ? (fileValidations.productPref.isValid === false ? 'error' : 'processing') : ''}`}>
            <div className="file-item-info">
              <span className={`status-icon ${fileValidations.productPref.isValid ? 'success' : (files.productPref ? (fileValidations.productPref.isValid === false ? 'error' : 'processing') : 'pending')}`}>
                {fileValidations.productPref.isValid ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : files.productPref && fileValidations.productPref.isValid === false ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : files.productPref ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
              </span>
              <span className="file-label">產品偏好</span>
              <span className="file-status-message">
                {files.productPref 
                  ? (fileValidations.productPref.isValid 
                      ? `已驗證: ${files.productPref.name}` 
                      : (fileValidations.productPref.message || '正在驗證...'))
                  : '請上傳產品偏好數據 (選填)'}
              </span>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                上傳檔案
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'productPref')}
                />
              </label>
            </div>
          </div>
          
          {/* 時間序列-性別檔案 */}
          <div className={`file-upload-item ${fileValidations.timeSeriesGender.isValid ? 'success' : files.timeSeriesGender ? (fileValidations.timeSeriesGender.isValid === false ? 'error' : 'processing') : ''}`}>
            <div className="file-item-info">
              <span className={`status-icon ${fileValidations.timeSeriesGender.isValid ? 'success' : (files.timeSeriesGender ? (fileValidations.timeSeriesGender.isValid === false ? 'error' : 'processing') : 'pending')}`}>
                {fileValidations.timeSeriesGender.isValid ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : files.timeSeriesGender && fileValidations.timeSeriesGender.isValid === false ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : files.timeSeriesGender ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
              </span>
              <span className="file-label">時間序列-性別</span>
              <span className="file-status-message">
                {files.timeSeriesGender 
                  ? (fileValidations.timeSeriesGender.isValid 
                      ? `已驗證: ${files.timeSeriesGender.name}` 
                      : (fileValidations.timeSeriesGender.message || '正在驗證...'))
                  : '請上傳時間序列-性別數據 (選填)'}
              </span>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                上傳檔案
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'timeSeriesGender')}
                />
              </label>
            </div>
          </div>
          
          {/* 時間序列-年齡檔案 */}
          <div className={`file-upload-item ${fileValidations.timeSeriesAge.isValid ? 'success' : files.timeSeriesAge ? (fileValidations.timeSeriesAge.isValid === false ? 'error' : 'processing') : ''}`}>
            <div className="file-item-info">
              <span className={`status-icon ${fileValidations.timeSeriesAge.isValid ? 'success' : (files.timeSeriesAge ? (fileValidations.timeSeriesAge.isValid === false ? 'error' : 'processing') : 'pending')}`}>
                {fileValidations.timeSeriesAge.isValid ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : files.timeSeriesAge && fileValidations.timeSeriesAge.isValid === false ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : files.timeSeriesAge ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
              </span>
              <span className="file-label">時間序列-年齡</span>
              <span className="file-status-message">
                {files.timeSeriesAge 
                  ? (fileValidations.timeSeriesAge.isValid 
                      ? `已驗證: ${files.timeSeriesAge.name}` 
                      : (fileValidations.timeSeriesAge.message || '正在驗證...'))
                  : '請上傳時間序列-年齡數據 (選填)'}
              </span>
            </div>
            <div className="file-upload-action">
              <label className="upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                上傳檔案
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'timeSeriesAge')}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* 數據預覽區域 */}
      {Object.values(fileValidations).some(validation => validation.data) && (
        <div className="data-preview-section">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            數據預覽
          </h3>
          
          {fileValidations.gender.data && (
            <div className="data-preview-item">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                性別分布數據
              </h4>
              <div className="data-sample">
                <pre>{JSON.stringify(fileValidations.gender.data, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {fileValidations.age.data && (
            <div className="data-preview-item">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                年齡分布數據
              </h4>
              <div className="data-sample">
                <pre>{JSON.stringify(fileValidations.age.data, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {fileValidations.productPref.data && (
            <div className="data-preview-item">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                產品偏好數據
              </h4>
              <div className="data-sample">
                <pre>{JSON.stringify(fileValidations.productPref.data, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {fileValidations.timeSeriesGender.data && (
            <div className="data-preview-item">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                時間序列-性別數據
              </h4>
              <div className="data-sample">
                <pre>{JSON.stringify(fileValidations.timeSeriesGender.data, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {fileValidations.timeSeriesAge.data && (
            <div className="data-preview-item">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                時間序列-年齡數據
              </h4>
              <div className="data-sample">
                <pre>{JSON.stringify(fileValidations.timeSeriesAge.data, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 提交按鈕 */}
      <div className="submit-section">
        <button 
          className="submit-button" 
          onClick={handleSubmit}
          disabled={!allRequiredFilesValid}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          開始分析
        </button>
        {!allRequiredFilesValid && (
          <div className="validation-message">請上傳並確認所有必需文件格式正確</div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
