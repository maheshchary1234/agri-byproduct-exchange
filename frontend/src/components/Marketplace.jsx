import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Marketplace({
  products = [],
  currentUser,
  onInspectPrice,
  onPlaceOrder,
  onSendInquiry
}) {
  const { t } = useTranslation();

  // Search & Filter State
  const [searchName, setSearchName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Purchase Request Modal State (for buyers)
  const [purchaseModalProduct, setPurchaseModalProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(25);
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Factory Gate 2, Industrial Bio-Power Complex, Greater Noida, UP'
  );

  const isBuyer = (currentUser?.role || '').toUpperCase().includes('BUYER');

  // Category Tabs matching Section 5
  const categories = [
    { key: 'ALL', label: t('market.cat_all') },
    { key: 'Crop Residue', label: t('market.cat_crop_residue') },
    { key: 'Husks and Shells', label: t('market.cat_husks_shells') },
    { key: 'Stalks and Stems', label: t('market.cat_stalks_stems') },
    { key: 'Mill Residue', label: t('market.cat_mill_residue') },
    { key: 'Plant Fiber', label: t('market.cat_plant_fiber') },
    { key: 'Wood Residue', label: t('market.cat_wood_residue') }
  ];

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    // 1. Search by name
    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchType = (p.byproductType || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchType && !matchDesc) return false;
    }

    // 2. Filter by region / state
    if (selectedRegion !== 'ALL') {
      if (p.state !== selectedRegion) return false;
    }

    // 3. Filter by category
    if (selectedCategory !== 'ALL') {
      // normalize category
      const pCat = p.categoryName || '';
      const bType = p.byproductType || '';

      if (selectedCategory === 'Crop Residue') {
        if (!pCat.includes('Crop') && !pCat.includes('Straw') && !bType.includes('straw')) return false;
      } else if (selectedCategory === 'Husks and Shells') {
        if (!pCat.includes('Husk') && !pCat.includes('Shell') && !bType.includes('cob') && !bType.includes('husk')) return false;
      } else if (selectedCategory === 'Stalks and Stems') {
        if (!pCat.includes('Stalk') && !bType.includes('stalk')) return false;
      } else if (selectedCategory === 'Mill Residue') {
        if (!pCat.includes('Mill') && !bType.includes('bagasse')) return false;
      } else if (selectedCategory === 'Plant Fiber') {
        if (!pCat.includes('Fiber') && !bType.includes('pith') && !bType.includes('coir')) return false;
      } else if (selectedCategory === 'Wood Residue') {
        if (!pCat.includes('Wood') && !bType.includes('bamboo')) return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return (a.pricePerTon || 0) - (b.pricePerTon || 0);
    } else if (sortBy === 'price_desc') {
      return (b.pricePerTon || 0) - (a.pricePerTon || 0);
    } else if (sortBy === 'qty_desc') {
      return (b.availableQuantityTons || 0) - (a.availableQuantityTons || 0);
    }
    return 0; // relevance / default
  });

  // Modal open
  const handleOpenPurchaseModal = (product) => {
    setPurchaseModalProduct(product);
    setOrderQuantity(Math.min(25, product.availableQuantityTons || 25));
  };

  // Submit order request
  const handleConfirmPurchase = () => {
    if (!purchaseModalProduct || !onPlaceOrder) return;
    onPlaceOrder({
      productId: purchaseModalProduct.id,
      productTitle: purchaseModalProduct.title,
      byproductType: purchaseModalProduct.byproductType,
      farmerName: purchaseModalProduct.farmerName || 'Registered Farmer',
      farmerOrg: purchaseModalProduct.farmerOrg || 'Local Farm Collective',
      quantityTons: orderQuantity,
      pricePerTon: purchaseModalProduct.pricePerTon,
      deliveryAddress
    });
    setPurchaseModalProduct(null);
  };

  return (
    <div className="marketplace-container">
      
      {/* Header Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.85rem', color: 'var(--green-900)', fontWeight: 800 }}>
          🛒 {t('market.title')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          {t('market.subtitle')}
        </p>
      </div>

      {/* =========================================================================
          SEARCH & FILTER TOOLBAR (Section 5)
          ========================================================================= */}
      <div className="market-toolbar">
        <div className="search-filters-row">
          {/* Search by Name */}
          <div>
            <label className="form-label-custom" style={{ fontSize: '0.8rem' }}>
              Search By-Product
            </label>
            <input 
              type="text" 
              className="form-control-custom"
              placeholder={t('market.search_placeholder')}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          {/* Filter by Region */}
          <div>
            <label className="form-label-custom" style={{ fontSize: '0.8rem' }}>
              {t('market.filter_region')}
            </label>
            <select 
              className="form-control-custom"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="ALL">{t('market.all_regions')}</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="form-label-custom" style={{ fontSize: '0.8rem' }}>
              {t('market.sort_by')}
            </label>
            <select 
              className="form-control-custom"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">{t('market.sort_relevance')}</option>
              <option value="price_asc">{t('market.sort_price_asc')}</option>
              <option value="price_desc">{t('market.sort_price_desc')}</option>
              <option value="qty_desc">{t('market.sort_qty_desc')}</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="market-category-pills">
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--green-900)', marginRight: '0.5rem' }}>
            Categories:
          </span>
          {categories.map(cat => (
            <button
              key={cat.key}
              type="button"
              className={`cat-pill-btn ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          THREE-COLUMN PRODUCT GRID ON DESKTOP (Section 5)
          ========================================================================= */}
      {sortedProducts.length === 0 ? (
        <div className="white-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '2.5rem' }}>🔍</span>
          <h3 style={{ color: 'var(--green-900)', marginTop: '0.75rem' }}>{t('market.no_products_found')}</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Try broadening your search term or switching the category filter to "All Categories".
          </p>
        </div>
      ) : (
        <div className="products-grid-3col">
          {sortedProducts.map(product => {
            const hasAIPrediction = Boolean(product.estimatedMarketPrice);
            const statusUpper = (product.status || 'AVAILABLE').toUpperCase();

            return (
              <div key={product.id} className="product-card-modern">
                
                {/* Product Image */}
                <div className="card-image-box">
                  <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'} 
                    alt={product.title}
                    loading="lazy"
                  />
                  <div className="card-badge-topright">
                    💧 {product.moistureContentPercent}% Moisture
                  </div>
                </div>

                {/* Card Body */}
                <div className="product-card-body">
                  <h3 className="product-card-title">{product.title}</h3>

                  <div className="product-meta-row">
                    <span>{t('market.farmer_label')}</span>
                    <strong style={{ color: 'var(--text-main)' }}>{product.farmerName || 'Verified Producer'}</strong>
                  </div>

                  <div className="product-meta-row">
                    <span>{t('market.location_label')}</span>
                    <span>📍 {product.district}, {product.state}</span>
                  </div>

                  <div className="product-meta-row">
                    <span>{t('market.available_qty')}</span>
                    <strong style={{ color: 'var(--green-800)' }}>{product.availableQuantityTons} MT</strong>
                  </div>

                  {/* Pricing Strip */}
                  <div className="product-pricing-strip">
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t('market.market_price')}</div>
                      <div className="price-bold-green">
                        ₹{(product.pricePerTon || 2450).toLocaleString('en-IN')}
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}> / MT</span>
                      </div>
                    </div>

                    {hasAIPrediction && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('market.ai_predicted_price')}</div>
                        <span className="ai-predicted-badge">
                          ₹{(product.estimatedMarketPrice).toLocaleString('en-IN')} / MT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions according to role */}
                  <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span className={`status-badge ${statusUpper}`}>
                      {statusUpper === 'AVAILABLE' ? '✓ ' + t('market.status_available') : statusUpper}
                    </span>

                    {/* Buyer-specific purchase request action */}
                    {isBuyer ? (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => handleOpenPurchaseModal(product)}
                      >
                        {t('market.btn_request_purchase')} →
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        onClick={() => onInspectPrice && onInspectPrice({
                          byproductType: product.byproductType,
                          moistureContentPercent: product.moistureContentPercent,
                          quantityTons: product.availableQuantityTons,
                          state: product.state
                        })}
                      >
                        ⚡ Inspect AI Price
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          PURCHASE REQUEST MODAL (For Buyers - Section 5 & 10)
          ========================================================================= */}
      {purchaseModalProduct && (
        <div className="modal-backdrop-custom" onClick={() => setPurchaseModalProduct(null)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setPurchaseModalProduct(null)}>✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🔒</span>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--green-900)' }}>
                  Submit Purchase Request (Escrow-Protected)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Order status will be PENDING until accepted by the farmer.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--green-900)', display: 'block' }}>
                {purchaseModalProduct.title}
              </strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Producer: <strong>{purchaseModalProduct.farmerName}</strong> • {purchaseModalProduct.district}, {purchaseModalProduct.state}
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">
                Required Quantity (Max Available: {purchaseModalProduct.availableQuantityTons} MT)
              </label>
              <input 
                type="number" 
                min="5" 
                max={purchaseModalProduct.availableQuantityTons} 
                className="form-control-custom"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(parseFloat(e.target.value) || 5)}
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Delivery Gate Destination</label>
              <input 
                type="text" 
                className="form-control-custom"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>

            {/* Escrow Breakdown */}
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-sm)', padding: '1rem', margin: '1.25rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                <span>Biomass Cost ({orderQuantity} MT @ ₹{purchaseModalProduct.pricePerTon}/MT):</span>
                <strong>₹{(orderQuantity * purchaseModalProduct.pricePerTon).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                <span>Estimated Freight & Logistics:</span>
                <span>₹{(orderQuantity * 320).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--green-800)', borderTop: '1px solid var(--green-200)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Total Escrow Deposit:</span>
                <span>₹{(orderQuantity * (purchaseModalProduct.pricePerTon + 320)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 1 }}
                onClick={handleConfirmPurchase}
              >
                Confirm & Lock in Escrow →
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setPurchaseModalProduct(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
