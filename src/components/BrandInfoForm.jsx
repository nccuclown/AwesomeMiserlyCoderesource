
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
