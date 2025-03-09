
import { useState } from 'react';

function FileUpload({ onUpload }) {
  const [genderFile, setGenderFile] = useState(null);
  const [ageFile, setAgeFile] = useState(null);
  const [productPrefFile, setProductPrefFile] = useState(null);
  const [timeSeriesGenderFile, setTimeSeriesGenderFile] = useState(null);
  const [timeSeriesAgeFile, setTimeSeriesAgeFile] = useState(null);
  const [validation, setValidation] = useState({
    genderFile: true,
    ageFile: true,
    fileFormat: true
  });
  const [formatErrors, setFormatErrors] = useState([]);

  // 檢查CSV格式是否符合預期
  const validateCSVFile = (file, type) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        
        if (lines.length < 2) {
          reject(`${type} 文件格式錯誤：文件至少需要包含標題行和一行數據`);
          return;
        }
        
        const headers = lines[0].toLowerCase().trim().split(',');
        
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
        
        console.log(`[檢查點] ${type} 文件格式驗證通過`);
        resolve(true);
      };
      
      reader.onerror = () => {
        reject(`讀取 ${type} 文件時發生錯誤`);
      };
      
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await validateCSVFile(file, type);
      
      // 如果驗證通過，設置文件
      switch(type) {
        case 'gender':
          setGenderFile(file);
          break;
        case 'age':
          setAgeFile(file);
          break;
        case 'productPref':
          setProductPrefFile(file);
          break;
        case 'timeSeriesGender':
          setTimeSeriesGenderFile(file);
          break;
        case 'timeSeriesAge':
          setTimeSeriesAgeFile(file);
          break;
      }
      
      // 重置該類型的驗證錯誤
      setValidation(prev => ({...prev, fileFormat: true}));
      setFormatErrors(prev => prev.filter(err => !err.includes(type)));
      
    } catch (error) {
      console.error(`[檢查點] 文件驗證失敗: ${error}`);
      // 設置驗證錯誤
      setFormatErrors(prev => [...prev.filter(err => !err.includes(type)), error]);
      setValidation(prev => ({...prev, fileFormat: false}));
      
      // 清除該類型的文件
      switch(type) {
        case 'gender':
          setGenderFile(null);
          break;
        case 'age':
          setAgeFile(null);
          break;
        case 'productPref':
          setProductPrefFile(null);
          break;
        case 'timeSeriesGender':
          setTimeSeriesGenderFile(null);
          break;
        case 'timeSeriesAge':
          setTimeSeriesAgeFile(null);
          break;
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 基本驗證 - 確保至少上傳了性別或年齡數據文件
    if (!genderFile && !ageFile) {
      setValidation({
        genderFile: !!genderFile,
        ageFile: !!ageFile,
        fileFormat: validation.fileFormat
      });
      return;
    }
    
    // 如果有文件格式錯誤，不提交
    if (!validation.fileFormat) {
      console.error('[檢查點] 提交失敗: 文件格式錯誤');
      return;
    }
    
    console.log('[檢查點] 所有文件驗證通過，準備上傳數據分析');
    console.log(`[檢查點] 上傳文件概況: 
      - 性別數據: ${genderFile ? '已上傳' : '未上傳'}
      - 年齡數據: ${ageFile ? '已上傳' : '未上傳'}
      - 商品偏好: ${productPrefFile ? '已上傳' : '未上傳'}
      - 性別時間序列: ${timeSeriesGenderFile ? '已上傳' : '未上傳'}
      - 年齡時間序列: ${timeSeriesAgeFile ? '已上傳' : '未上傳'}`);

    // 將數據傳遞給父元件
    onUpload({
      gender: genderFile,
      age: ageFile,
      productPref: productPrefFile,
      timeSeriesGender: timeSeriesGenderFile,
      timeSeriesAge: timeSeriesAgeFile
    });
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
      
      <form onSubmit={handleSubmit}>
        <div className="file-input-group">
          <div className="file-input-container">
            <label className={`file-input-label ${!validation.genderFile ? 'invalid' : ''}`}>
              <span>上傳性別分佈數據</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileChange(e, 'gender')}
                className="file-input"
              />
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              {genderFile && <div className="file-name">{genderFile.name}</div>}
            </label>
            {!validation.genderFile && !validation.ageFile && <p className="validation-error">請上傳至少一個數據文件</p>}
          </div>
          
          <div className="file-input-container">
            <label className={`file-input-label ${!validation.ageFile ? 'invalid' : ''}`}>
              <span>上傳年齡分佈數據</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileChange(e, 'age')}
                className="file-input"
              />
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              {ageFile && <div className="file-name">{ageFile.name}</div>}
            </label>
            {!validation.ageFile && !validation.genderFile && <p className="validation-error">請上傳至少一個數據文件</p>}
          </div>
        </div>
        
        <div className="file-input-group">
          <div className="file-input-container">
            <label className="file-input-label">
              <span>上傳產品偏好數據（選填）</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileChange(e, 'productPref')}
                className="file-input"
              />
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              {productPrefFile && <div className="file-name">{productPrefFile.name}</div>}
            </label>
          </div>
        </div>
        
        <div className="file-input-group">
          <div className="file-input-container">
            <label className="file-input-label">
              <span>上傳性別時間序列數據（選填）</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileChange(e, 'timeSeriesGender')}
                className="file-input"
              />
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              {timeSeriesGenderFile && <div className="file-name">{timeSeriesGenderFile.name}</div>}
            </label>
          </div>
          
          <div className="file-input-container">
            <label className="file-input-label">
              <span>上傳年齡時間序列數據（選填）</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileChange(e, 'timeSeriesAge')}
                className="file-input"
              />
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              {timeSeriesAgeFile && <div className="file-name">{timeSeriesAgeFile.name}</div>}
            </label>
          </div>
        </div>
        
        <div className="submit-container">
          <button 
            type="submit" 
            className="submit-button"
            disabled={(!genderFile && !ageFile) || !validation.fileFormat}
          >
            開始分析
          </button>
        </div>
      </form>
    </div>
  );
}

export default FileUpload;
