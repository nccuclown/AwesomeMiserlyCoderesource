
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
