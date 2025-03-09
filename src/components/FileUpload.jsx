
import { useState } from 'react';

function FileUpload({ onUpload }) {
  const [genderFile, setGenderFile] = useState(null);
  const [ageFile, setAgeFile] = useState(null);
  const [productPrefFile, setProductPrefFile] = useState(null);
  const [timeSeriesGenderFile, setTimeSeriesGenderFile] = useState(null);
  const [timeSeriesAgeFile, setTimeSeriesAgeFile] = useState(null);
  const [uploads, setUploads] = useState({});
  const [validation, setValidation] = useState({
    genderFile: true,
    ageFile: true
  });

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // 將檔案儲存到對應的狀態
    switch (fileType) {
      case 'gender':
        setGenderFile(file);
        setUploads(prev => ({ ...prev, gender: file }));
        break;
      case 'age':
        setAgeFile(file);
        setUploads(prev => ({ ...prev, age: file }));
        break;
      case 'productPref':
        setProductPrefFile(file);
        setUploads(prev => ({ ...prev, productPref: file }));
        break;
      case 'timeSeriesGender':
        setTimeSeriesGenderFile(file);
        setUploads(prev => ({ ...prev, timeSeriesGender: file }));
        break;
      case 'timeSeriesAge':
        setTimeSeriesAgeFile(file);
        setUploads(prev => ({ ...prev, timeSeriesAge: file }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 基本驗證 - 確保至少上傳了性別或年齡數據文件
    if (!genderFile && !ageFile) {
      setValidation({
        genderFile: !!genderFile,
        ageFile: !!ageFile
      });
      return;
    }

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
            {!validation.genderFile && <p className="validation-error">請上傳至少一個數據文件</p>}
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
            {!validation.ageFile && <p className="validation-error">請上傳至少一個數據文件</p>}
          </div>
        </div>
        
        <div className="file-input-group">
          <div className="file-input-container">
            <label className="file-input-label">
              <span>上傳商品類別偏好數據（選填）</span>
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
        
        <div className="button-container">
          <button type="submit" className="submit-button">分析數據</button>
        </div>
      </form>
    </div>
  );
}

export default FileUpload;
