
import { useState } from 'react';

const BrandInfoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productInfo: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '請輸入品牌名稱';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '請輸入品牌簡介';
    }
    
    if (!formData.productInfo.trim()) {
      newErrors.productInfo = '請輸入產品資訊';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="form-container">
      <h2>品牌基本資訊</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">品牌名稱</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="請輸入品牌名稱"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">品牌簡介</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="請簡述品牌理念、特色和定位"
          ></textarea>
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="productInfo">產品資訊</label>
          <textarea
            id="productInfo"
            name="productInfo"
            value={formData.productInfo}
            onChange={handleChange}
            placeholder="請描述主要產品或服務以及特點"
          ></textarea>
          {errors.productInfo && <div className="error-message">{errors.productInfo}</div>}
        </div>
        
        <button type="submit">下一步</button>
      </form>
    </div>
  );
};

export default BrandInfoForm;
import { useState } from 'react';

function BrandInfoForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productInfo: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '請輸入品牌名稱';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '請輸入品牌簡介';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = '品牌簡介至少需要10個字符';
    }
    
    if (!formData.productInfo.trim()) {
      newErrors.productInfo = '請輸入產品資訊';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="brand-info-form">
      <h2>品牌基本資訊</h2>
      <p className="form-instructions">
        請提供您的品牌基本資訊，這將幫助我們更準確地分析您的品牌受眾。
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">品牌名稱</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例如：Apple、Nike、MUJI"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">品牌簡介</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="請簡要描述您的品牌理念、歷史和定位..."
            rows={4}
            className={errors.description ? 'error' : ''}
          ></textarea>
          {errors.description && <p className="error-message">{errors.description}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="productInfo">產品資訊</label>
          <textarea
            id="productInfo"
            name="productInfo"
            value={formData.productInfo}
            onChange={handleChange}
            placeholder="請描述您的主要產品或服務，包括特點、價格區間等..."
            rows={4}
            className={errors.productInfo ? 'error' : ''}
          ></textarea>
          {errors.productInfo && <p className="error-message">{errors.productInfo}</p>}
        </div>
        
        <div className="form-actions">
          <button type="submit">繼續</button>
        </div>
      </form>
      
      <div className="form-tips">
        <h4>填寫提示</h4>
        <ul>
          <li>品牌簡介應包括您的品牌故事、理念和市場定位</li>
          <li>產品資訊越詳細，分析結果將越準確</li>
          <li>所有提供的資訊僅用於分析，不會分享給第三方</li>
        </ul>
      </div>
    </div>
  );
}

export default BrandInfoForm;
