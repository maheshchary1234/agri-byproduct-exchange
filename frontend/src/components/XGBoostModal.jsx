import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getXGBoostPrediction } from '../services/api';

export default function XGBoostModal({ isOpen, onClose, initialParams = {}, onApplyPrice }) {
  const { t } = useTranslation();
  const [params, setParams] = useState({
    byproductType: initialParams.byproductType || 'rice_straw',
    moistureContentPercent: initialParams.moistureContentPercent || 12.0,
    organicMatterPercent: initialParams.organicMatterPercent || 84.0,
    quantityTons: initialParams.quantityTons || 50,
    state: initialParams.state || 'Punjab',
    season: initialParams.season || 'Kharif',
    transportDistanceKm: initialParams.transportDistanceKm || 60
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      handlePredict(params);
    }
  }, [isOpen]);

  const handlePredict = async (currentParams) => {
    setLoading(true);
    try {
      const pred = await getXGBoostPrediction(currentParams);
      setResult(pred);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, val) => {
    const updated = { ...params, [field]: val };
    setParams(updated);
    handlePredict(updated);
  };

  if (!isOpen) return null;

  const totalLotPrice = result ? Math.round(result.predictedPricePerTon * params.quantityTons) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.8rem', background: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem 0.6rem', borderRadius: '10px' }}>
            ⚡
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{t('xgboost.modal_title')}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('xgboost.subtitle')}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
          {/* Inputs Section */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--emerald-400)' }}>
              {t('xgboost.section_params')}
            </h4>

            <div className="form-group">
              <label className="form-label">{t('xgboost.residue_type')}</label>
              <select 
                className="form-select" 
                value={params.byproductType}
                onChange={(e) => handleChange('byproductType', e.target.value)}>
                <option value="rice_straw">Paddy Rice Straw (Stubble / CBG)</option>
                <option value="wheat_straw">Golden Wheat Straw (Fodder & Paper)</option>
                <option value="sugarcane_bagasse">Sugarcane Bagasse (Boiler & Pulp)</option>
                <option value="corn_cob">De-shelled Corn Cobs (Bio-Ethanol / Furfural)</option>
                <option value="cotton_stalk">Cotton Stalks (Biomass Pellets)</option>
                <option value="coir_pith">Coconut Coir Pith (Hydroponics / Briquettes)</option>
                <option value="mustard_husk">Mustard Stalks & Husk</option>
                <option value="poultry_litter">Enriched Poultry Bedding / Manure</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">{t('xgboost.moisture_pct')}</label>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: params.moistureContentPercent > 18 ? '#f59e0b' : '#34d399' }}>
                  {params.moistureContentPercent}%
                </span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min="5" 
                max="35" 
                step="0.5"
                value={params.moistureContentPercent}
                onChange={(e) => handleChange('moistureContentPercent', parseFloat(e.target.value))}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {t('xgboost.moisture_target')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{t('xgboost.quantity')}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={params.quantityTons}
                  onChange={(e) => handleChange('quantityTons', parseFloat(e.target.value) || 1)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('xgboost.distance')}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={params.transportDistanceKm}
                  onChange={(e) => handleChange('transportDistanceKm', parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{t('xgboost.harvest_region')}</label>
                <select 
                  className="form-select"
                  value={params.state}
                  onChange={(e) => handleChange('state', e.target.value)}>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('xgboost.season_cycle')}</label>
                <select 
                  className="form-select"
                  value={params.season}
                  onChange={(e) => handleChange('season', e.target.value)}>
                  <option value="Kharif">Kharif (Monsoon Harvest)</option>
                  <option value="Rabi">Rabi (Winter Harvest)</option>
                  <option value="Zaid">Zaid (Summer)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Output Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))', border: '1px solid var(--emerald-500)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                {t('xgboost.fair_valuation')}
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#fff', margin: '0.35rem 0' }}>
                {loading ? t('xgboost.estimating') : `₹${result?.predictedPricePerTon?.toLocaleString('en-IN')}`}
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}> {t('xgboost.per_ton')}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {t('xgboost.total_lot_val')} ({params.quantityTons} MT): <strong>₹{totalLotPrice.toLocaleString('en-IN')}</strong>
              </div>

              {result?.confidenceInterval && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.6rem', borderRadius: '6px', display: 'inline-block' }}>
                  {t('xgboost.confidence_band')}: <strong>₹{result.confidenceInterval.lower}</strong> – <strong>₹{result.confidenceInterval.upper}</strong>
                </div>
              )}
            </div>

            {/* Quality & Guidance Cards */}
            {result && (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('xgboost.moisture_rating')}:</span>
                  <span style={{ fontWeight: '700', color: '#34d399' }}>{result.qualityAnalysis?.moisture_rating}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('xgboost.optimal_benchmark')}:</span>
                  <span style={{ fontWeight: '600' }}>{result.qualityAnalysis?.optimal_moisture_benchmark}%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('xgboost.farmer_ask')}:</span>
                  <span style={{ fontWeight: '700', color: '#34d399' }}>₹{result.recommendedPricing?.farmer_suggested_ask_price} / ton</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('xgboost.buyer_bid')}:</span>
                  <span style={{ fontWeight: '700', color: '#fbbf24' }}>₹{result.recommendedPricing?.buyer_suggested_bid_price} / ton</span>
                </div>

                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  💡 <strong>{t('xgboost.market_insight')}:</strong> {result.seasonalCommentary}
                </div>
              </div>
            )}

            {onApplyPrice && result && (
              <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => { onApplyPrice(result.predictedPricePerTon); onClose(); }}>
                {t('xgboost.apply_price', { price: result.predictedPricePerTon })}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
