
import { useState } from 'react';

const FileUpload = ({ onUpload }) => {
  const [files, setFiles] = useState({
    gender: null,
    age: null
  });
  
  const [errors, setErrors] = useState({});

  const validateFile = (file, type) => {
    // 檢查文件是否存在
    if (!file) {
      return `請上傳${type === 'gender' ? '性別' : '年齡'}分布數據文件`;
    }
    
    // 檢查文件類型
    if (file.type !== 'text/csv') {
      return '請上傳CSV格式的文件';
    }
    
    // 檢查文件大小 (限制為2MB)
    if (file.size > 2 * 1024 * 1024) {
      return '文件大小不能超過2MB';
    }
    
    return null;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    
    setFiles(prevFiles => ({
      ...prevFiles,
      [type]: file
    }));
    
    // 清除對應的錯誤信息
    if (errors[type]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [type]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 驗證兩個文件
    const genderError = validateFile(files.gender, 'gender');
    const ageError = validateFile(files.age, 'age');
    
    const newErrors = {
      gender: genderError,
      age: ageError
    };
    
    setErrors(newErrors);
    
    // 如果沒有錯誤，則提交文件
    if (!genderError && !ageError) {
      onUpload(files);
    }
  };

  return (
    <div className="form-container">
      <h2>上傳受眾數據</h2>
      <p>請上傳包含受眾性別和年齡分布的CSV文件。</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="genderFile">性別分布數據 (CSV)</label>
          <p className="file-format-info">CSV格式應包含「性別」和「比例」欄位</p>
          <input
            type="file"
            id="genderFile"
            accept=".csv"
            onChange={(e) => handleFileChange(e, 'gender')}
          />
          {files.gender && (
            <div className="file-info">
              <span>{files.gender.name}</span>
              <span>{(files.gender.size / 1024).toFixed(2)} KB</span>
            </div>
          )}
          {errors.gender && <div className="error-message">{errors.gender}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="ageFile">年齡分布數據 (CSV)</label>
          <p className="file-format-info">CSV格式應包含「年齡」和「比例」欄位</p>
          <input
            type="file"
            id="ageFile"
            accept=".csv"
            onChange={(e) => handleFileChange(e, 'age')}
          />
          {files.age && (
            <div className="file-info">
              <span>{files.age.name}</span>
              <span>{(files.age.size / 1024).toFixed(2)} KB</span>
            </div>
          )}
          {errors.age && <div className="error-message">{errors.age}</div>}
        </div>
        
        <button type="submit">下一步</button>
      </form>
    </div>
  );
};

export default FileUpload;
import { useState } from 'react';

function FileUpload({ onUpload }) {
  const [genderFile, setGenderFile] = useState(null);
  const [ageFile, setAgeFile] = useState(null);
  const [productPrefFile, setProductPrefFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleGenderFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateFile(file, 'gender');
      setGenderFile(file);
    }
  };

  const handleAgeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateFile(file, 'age');
      setAgeFile(file);
    }
  };

  const handleProductPrefFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateFile(file, 'productPref');
      setProductPrefFile(file);
    }
  };

  const validateFile = (file, type) => {
    const newErrors = { ...errors };
    
    // 檢查文件類型
    if (!file.name.endsWith('.csv')) {
      newErrors[type] = '請上傳CSV文件';
    } else {
      delete newErrors[type];
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 檢查是否有至少一個有效的文件
    if (!genderFile && !ageFile) {
      setErrors({
        ...errors,
        general: '請至少上傳性別分布或年齡分布數據文件'
      });
      return;
    }
    
    // 如果沒有錯誤，繼續上傳
    if (Object.keys(errors).length === 0 || (Object.keys(errors).length === 1 && errors.general)) {
      onUpload({
        gender: genderFile,
        age: ageFile,
        productPref: productPrefFile
      });
    }
  };

  return (
    <div className="file-upload">
      <h2>上傳數據文件</h2>
      <p className="upload-instructions">請上傳您的品牌受眾數據CSV文件。必須包含指定的格式和欄位。</p>
      
      <form onSubmit={handleSubmit}>
        <div className="file-types">
          <div className="file-type-card">
            <h3>基本數據文件 (必選)</h3>
            
            <div className="file-input-group">
              <label>性別分布數據</label>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleGenderFileChange}
                  id="gender-file"
                />
                <label htmlFor="gender-file" className="file-upload-label">
                  {genderFile ? genderFile.name : '選擇文件'}
                </label>
              </div>
              {errors.gender && <p className="error-message">{errors.gender}</p>}
              <small>格式: CSV文件，包含「性別」和「比例」欄位</small>
            </div>
            
            <div className="file-input-group">
              <label>年齡分布數據</label>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleAgeFileChange}
                  id="age-file"
                />
                <label htmlFor="age-file" className="file-upload-label">
                  {ageFile ? ageFile.name : '選擇文件'}
                </label>
              </div>
              {errors.age && <p className="error-message">{errors.age}</p>}
              <small>格式: CSV文件，包含「年齡」和「比例」欄位</small>
            </div>
          </div>
          
          <div className="file-type-card">
            <h3>進階數據文件 (選填)</h3>
            
            <div className="file-input-group">
              <label>商品類別偏好數據</label>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleProductPrefFileChange}
                  id="product-pref-file"
                />
                <label htmlFor="product-pref-file" className="file-upload-label">
                  {productPrefFile ? productPrefFile.name : '選擇文件'}
                </label>
              </div>
              {errors.productPref && <p className="error-message">{errors.productPref}</p>}
              <small>格式: CSV文件，包含「商品類別」和「權重分數」欄位</small>
            </div>
          </div>
        </div>
        
        {errors.general && <p className="error-message general-error">{errors.general}</p>}
        
        <div className="upload-actions">
          <button type="submit" className="upload-button">
            繼續
          </button>
        </div>
      </form>
      
      <div className="file-format-help">
        <h3>CSV檔案格式說明</h3>
        <div className="format-examples">
          <div className="format-example">
            <h4>性別分布數據</h4>
            <pre>
性別,比例
男性,45
女性,55
            </pre>
          </div>
          <div className="format-example">
            <h4>年齡分布數據</h4>
            <pre>
年齡,比例
18-24,15
25-34,35
35-44,25
45-54,15
55+,10
            </pre>
          </div>
          <div className="format-example">
            <h4>性別時間序列數據 (選填)</h4>
            <pre>
日期,性別,人數,平均訂單金額
2023-01,男性,120,950
2023-01,女性,150,1200
2023-02,男性,130,980
2023-02,女性,170,1250
            </pre>
          </div>
          <div className="format-example">
            <h4>商品類別偏好數據 (選填)</h4>
            <pre>
商品類別,權重分數
品質,120
價格,80
服務,98
設計,130
創新,100
便利性,65
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
