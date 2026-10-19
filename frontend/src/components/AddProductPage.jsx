import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getXGBoostPrediction } from '../services/api';

export default function AddProductPage({ currentUser, onCreateProduct, onNavigateBack }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    cropType: 'Paddy Rice',
    byproductType: 'rice_straw',
    categoryName: 'Crop Residue',
    description: '',
    quantityTons: 50,
    unit: 'Tons',
    expectedPrice: 2450,
    state: currentUser?.state || 'Punjab',
    district: currentUser?.district || 'Ludhiana',
    moistureContentPercent: 12.0,
    organicMatterPercent: 84.5,
    packagingType: 'Square Bales (25kg)',
    storageType: 'Covered Tarpaulin Shed',
    harvestSeason: 'Kharif',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
  });

  const [aiValuation, setAiValuation] = useState({
    fairPricePerTon: 2400,
    loading: false
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch real-time AI valuation guidance as inputs change
  useEffect(() => {
    let isCancelled = false;
    async function updateAIValuation() {
      setAiValuation(prev => ({ ...prev, loading: true }));
      try {
        const pred = await getXGBoostPrediction({
          byproductType: formData.byproductType,
          moistureContentPercent: formData.moistureContentPercent,
          organicMatterPercent: formData.organicMatterPercent,
          quantityTons: formData.quantityTons,
          state: formData.state,
          season: formData.harvestSeason,
          transportDistanceKm: 60
        });
        if (!isCancelled && pred && pred.predictedPricePerTon) {
          setAiValuation({
            fairPricePerTon: pred.predictedPricePerTon,
            loading: false
          });
        }
      } catch (err) {
        if (!isCancelled) {
          setAiValuation(prev => ({ ...prev, loading: false }));
        }
      }
    }

    const timer = setTimeout(updateAIValuation, 400);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    formData.byproductType,
    formData.moistureContentPercent,
    formData.quantityTons,
    formData.state,
    formData.harvestSeason
  ]);

  // Adjust crop type mapping
  const handleCropChange = (e) => {
    const val = e.target.value;
    let bType = 'rice_straw';
    let cat = 'Crop Residue';

    switch (val) {
      case 'Wheat':
        bType = 'wheat_straw';
        cat = 'Crop Residue';
        break;
      case 'Sugarcane':
        bType = 'sugarcane_bagasse';
        cat = 'Mill Residue';
        break;
      case 'Corn / Maize':
        bType = 'corn_cob';
        cat = 'Husks and Shells';
        break;
      case 'Cotton':
        bType = 'cotton_stalk';
        cat = 'Stalks and Stems';
        break;
      case 'Coconut':
        bType = 'coir_pith';
        cat = 'Plant Fiber';
        break;
      case 'Bamboo':
        bType = 'bamboo_chippings';
        cat = 'Wood Residue';
        break;
      case 'Mustard':
        bType = 'mustard_husk';
        cat = 'Stalks and Stems';
        break;
      default:
        bType = 'rice_straw';
        cat = 'Crop Residue';
    }

    setFormData(prev => ({
      ...prev,
      cropType: val,
      byproductType: bType,
      categoryName: cat
    }));
  };

  const calculateUnitConvertedPrice = () => {
    const perTon = aiValuation.fairPricePerTon;
    if (formData.unit === 'Quintals') {
      return (perTon / 10).toFixed(1);
    } else if (formData.unit === 'Kilograms') {
      return (perTon / 1000).toFixed(2);
    }
    return perTon.toLocaleString('en-IN');
  };

  const getPriceComparisonStatus = () => {
    const diff = formData.expectedPrice - aiValuation.fairPricePerTon;
    const pct = Math.abs((diff / aiValuation.fairPricePerTon) * 100);

    if (pct <= 4) {
      return {
        type: 'fair',
        text: t('add_product.ai_comparison_fair'),
        color: 'var(--green-700)'
      };
    } else if (diff > 0) {
      return {
        type: 'high',
        text: t('add_product.ai_comparison_high'),
        color: '#d97706'
      };
    } else {
      return {
        type: 'low',
        text: t('add_product.ai_comparison_low'),
        color: '#0284c7'
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Please enter a descriptive product title.');
      return;
    }
    if (formData.quantityTons <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }
    if (formData.expectedPrice <= 0) {
      setErrorMsg('Expected price must be positive.');
      return;
    }

    setErrorMsg('');
    if (onCreateProduct) {
      const res = await onCreateProduct({
        title: formData.title,
        byproductType: formData.byproductType,
        categoryName: formData.categoryName,
        description: formData.description || 'Quality agricultural residue ready for industrial collection.',
        quantityTons: formData.quantityTons,
        availableQuantityTons: formData.quantityTons,
        moistureContentPercent: formData.moistureContentPercent,
        organicMatterPercent: formData.organicMatterPercent,
        pricePerTon: formData.expectedPrice,
        estimatedMarketPrice: aiValuation.fairPricePerTon,
        packagingType: formData.packagingType,
        storageType: formData.storageType,
        harvestSeason: formData.harvestSeason,
        state: formData.state,
        district: formData.district,
        farmerId: currentUser?.id || 2,
        farmerName: currentUser?.name || 'Gurpreet Singh',
        farmerOrg: currentUser?.organizationName || 'Kisan Samriddhi Farms',
        imageUrl: formData.imageUrl,
        status: 'AVAILABLE'
      });

      if (res && res.success === false) {
        setErrorMsg(res.error || 'Failed to list product lot.');
        return;
      }
    }

    setSuccessMsg('✅ Agricultural by-product lot successfully listed on the National Marketplace!');
    setTimeout(() => {
      if (onNavigateBack) onNavigateBack();
    }, 1200);
  };

  const comparison = getPriceComparisonStatus();

  return (
    <div className="add-product-wrapper">
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--green-900)', fontWeight: 800 }}>
          ➕ {t('add_product.page_title')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          {t('add_product.page_subtitle')}
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'var(--green-100)', color: 'var(--green-900)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontWeight: 700 }}>
          {successMsg}
        </div>
      )}

      {/* Two-Column Form & AI Guidance Layout (Section 6) */}
      <div className="add-product-layout">
        
        {/* Left Side: Product Form */}
        <div className="white-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group-custom">
              <label className="form-label-custom">{t('add_product.field_title')} *</label>
              <input 
                type="text"
                required
                className="form-control-custom"
                placeholder={t('add_product.field_title_placeholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Crop Type & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_crop_type')}</label>
                <select 
                  className="form-control-custom"
                  value={formData.cropType}
                  onChange={handleCropChange}
                >
                  <option value="Paddy Rice">Paddy / Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Corn / Maize">Corn / Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Coconut">Coconut</option>
                  <option value="Bamboo">Bamboo</option>
                  <option value="Mustard">Mustard</option>
                </select>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_category')}</label>
                <select 
                  className="form-control-custom"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                >
                  <option value="Crop Residue">Crop Residue</option>
                  <option value="Husks and Shells">Husks and Shells</option>
                  <option value="Stalks and Stems">Stalks and Stems</option>
                  <option value="Mill Residue">Mill Residue</option>
                  <option value="Plant Fiber">Plant Fiber</option>
                  <option value="Wood Residue">Wood Residue</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group-custom">
              <label className="form-label-custom">{t('add_product.field_description')}</label>
              <textarea 
                rows="3"
                className="form-control-custom"
                placeholder={t('add_product.field_description_placeholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            {/* Quantity & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_quantity')} *</label>
                <input 
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  className="form-control-custom"
                  value={formData.quantityTons}
                  onChange={(e) => setFormData({ ...formData, quantityTons: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_unit')}</label>
                <select 
                  className="form-control-custom"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="Tons">{t('add_product.unit_tons')}</option>
                  <option value="Quintals">{t('add_product.unit_quintals')}</option>
                  <option value="Kilograms">{t('add_product.unit_kg')}</option>
                </select>
              </div>
            </div>

            {/* Expected Price & Moisture */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group-custom">
                <label className="form-label-custom">
                  {t('add_product.field_expected_price')} (₹/{formData.unit === 'Quintals' ? 'Qtl' : formData.unit === 'Kilograms' ? 'kg' : 'MT'}) *
                </label>
                <input 
                  type="number"
                  min="1"
                  step="10"
                  required
                  className="form-control-custom"
                  value={formData.expectedPrice}
                  onChange={(e) => setFormData({ ...formData, expectedPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_moisture')} (%)</label>
                <input 
                  type="number"
                  min="5"
                  max="40"
                  step="0.5"
                  className="form-control-custom"
                  value={formData.moistureContentPercent}
                  onChange={(e) => setFormData({ ...formData, moistureContentPercent: parseFloat(e.target.value) || 12 })}
                />
              </div>
            </div>

            {/* State & City/District */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_state')}</label>
                <select 
                  className="form-control-custom"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_district')}</label>
                <input 
                  type="text"
                  required
                  className="form-control-custom"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            {/* Additional details: Packaging, Storage, Season */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_packaging')}</label>
                <select 
                  className="form-control-custom"
                  value={formData.packagingType}
                  onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })}
                >
                  <option value="Square Bales (25kg)">Square Bales (25kg)</option>
                  <option value="Round Bales (400kg)">Round Bales (400kg)</option>
                  <option value="Loose Bulk In Tiplers">Loose Bulk In Tiplers</option>
                  <option value="PP Woven Sacks (40kg)">PP Woven Sacks (40kg)</option>
                </select>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_storage')}</label>
                <select 
                  className="form-control-custom"
                  value={formData.storageType}
                  onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                >
                  <option value="Covered Tarpaulin Shed">Covered Shed</option>
                  <option value="Open Yard (Elevated Dry Soil)">Open Yard</option>
                  <option value="Concrete Industrial Silo">Concrete Silo</option>
                </select>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">{t('add_product.field_season')}</label>
                <select 
                  className="form-control-custom"
                  value={formData.harvestSeason}
                  onChange={(e) => setFormData({ ...formData, harvestSeason: e.target.value })}
                >
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Zaid">Zaid</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                🚀 {t('add_product.btn_submit_product')}
              </button>
              {onNavigateBack && (
                <button type="button" className="btn-secondary" onClick={onNavigateBack}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: AI Price Guidance Card (Section 6) */}
        <div>
          <div className="ai-guidance-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--green-900)' }}>
                {t('add_product.ai_guidance_title')}
              </h3>
            </div>

            {/* Fair Value Metric */}
            <div className="guidance-metric-highlight">
              <span style={{ fontSize: '0.78rem', color: 'var(--green-800)', fontWeight: 700, textTransform: 'uppercase' }}>
                {t('add_product.ai_fair_value')}
              </span>
              <div className="fair-val-amount">
                ₹{calculateUnitConvertedPrice()}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('add_product.ai_price_per_unit')}: ₹{calculateUnitConvertedPrice()} per {formData.unit}
              </span>
            </div>

            {/* Price Comparison */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', borderLeft: `4px solid ${comparison.color}` }}>
              <strong style={{ display: 'block', fontSize: '0.88rem', color: comparison.color, marginBottom: '0.25rem' }}>
                {t('add_product.ai_comparison')}:
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                {comparison.text}
              </p>
            </div>

            {/* Explanation of Estimate */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.92rem', color: 'var(--green-900)', marginBottom: '0.35rem' }}>
                {t('add_product.ai_explanation_title')}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                {t('add_product.ai_explanation_text')}
              </p>
            </div>

            {/* Recommended Industrial Utilization Pathways */}
            <div>
              <h4 style={{ fontSize: '0.92rem', color: 'var(--green-900)', marginBottom: '0.75rem' }}>
                {t('add_product.ai_pathways_title')}
              </h4>

              <div className="pathway-item-box">
                <div className="pathway-title">1. {t('add_product.pathway_1')}</div>
                <div className="pathway-desc">{t('add_product.pathway_1_desc')}</div>
              </div>

              <div className="pathway-item-box">
                <div className="pathway-title">2. {t('add_product.pathway_2')}</div>
                <div className="pathway-desc">{t('add_product.pathway_2_desc')}</div>
              </div>

              <div className="pathway-item-box">
                <div className="pathway-title">3. {t('add_product.pathway_3')}</div>
                <div className="pathway-desc">{t('add_product.pathway_3_desc')}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
