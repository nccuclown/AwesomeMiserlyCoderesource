import { useState } from 'react';

function BrandInfoForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productInfo: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    productInfo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // 清除對應的錯誤提示
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { name: '', description: '', productInfo: '' };

    if (!formData.name.trim()) {
      newErrors.name = '請輸入品牌名稱';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = '請輸入品牌簡介';
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = '品牌簡介至少需要10個字';
      isValid = false;
    }

    if (!formData.productInfo.trim()) {
      newErrors.productInfo = '請輸入產品資訊';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="brand-info-form">
      <h2>品牌基本資訊</h2>
      <p className="form-instructions">請提供您的品牌基本資訊，這將幫助我們更好地分析受眾數據。</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">品牌名稱</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例如：ABC 咖啡"
            className={errors.name ? 'error' : ''}
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
            placeholder="請描述您的品牌理念、定位和歷史等基本信息"
            rows="4"
            className={errors.description ? 'error' : ''}
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
            placeholder="請描述您的主要產品或服務種類、特點和價格區間等"
            rows="4"
            className={errors.productInfo ? 'error' : ''}
          ></textarea>
          {errors.productInfo && <div className="error-message">{errors.productInfo}</div>}
        </div>

        <div className="form-actions">
          <button type="submit">下一步：上傳數據</button>
        </div>
      </form>

      <div className="form-tips">
        <h4>填寫建議</h4>
        <ul>
          <li>品牌簡介應該包含您的品牌理念、市場定位和目標客戶群</li>
          <li>產品資訊越詳細，分析結果會越精準</li>
          <li>如果您的品牌有獨特之處，請務必在簡介中提及</li>
        </ul>
      </div>
    </div>
  );
}

export default BrandInfoForm;