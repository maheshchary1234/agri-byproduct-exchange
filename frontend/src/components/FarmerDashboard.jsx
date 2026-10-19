import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AddProductPage from './AddProductPage';
import PricePredictionDashboard from './PricePredictionDashboard';
import AIRecommendations from './AIRecommendations';
import Marketplace from './Marketplace';

export default function FarmerDashboard({
  products = [],
  orders = [],
  inquiries = [],
  currentUser,
  onCreateProduct,
  onAcceptOrder,
  onRejectOrder,
  onConfirmDispatch,
  onUpdateOrderStatus,
  onLogout,
  onInspectPrice,
  onPlaceOrder,
  onSendInquiry
}) {
  const { t, i18n } = useTranslation();

  // Active Sidebar Tab:
  // 'dashboard', 'marketplace', 'add-product', 'my-products', 'price-prediction',
  // 'ai-recommendations', 'sales-history', 'profile'
  const [sidebarTab, setSidebarTab] = useState('dashboard');

  // Government Welfare Schemes Modal
  const [showSchemesModal, setShowSchemesModal] = useState(false);

  // Sales History Filters
  const [salesMonthFilter, setSalesMonthFilter] = useState('ALL');
  const [salesYearFilter, setSalesYearFilter] = useState('ALL');
  const [salesProductFilter, setSalesProductFilter] = useState('ALL');

  // Loading state for order actions
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const handleApproveClick = async (orderRef) => {
    if (!onAcceptOrder || processingOrderId) return;
    setProcessingOrderId(orderRef);
    try {
      await onAcceptOrder(orderRef);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectClick = async (orderRef) => {
    if (!onRejectOrder || processingOrderId) return;
    setProcessingOrderId(orderRef);
    try {
      await onRejectOrder(orderRef);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Filter products belonging to current farmer
  const myProducts = useMemo(() => {
    if (!currentUser) return [];
    const cId = String(currentUser.id || '');
    const cName = (currentUser.name || currentUser.username || '').toLowerCase().trim();
    return products.filter(p => {
      const pFarmerId = String(p.farmerId || (p.farmer && p.farmer.id) || '');
      const pFarmerName = (p.farmerName || (p.farmer && p.farmer.name) || '').toLowerCase().trim();
      return (pFarmerId && cId && pFarmerId === cId) || (pFarmerName && cName && pFarmerName === cName);
    });
  }, [products, currentUser]);

  // Filter orders for current farmer
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    const cId = String(currentUser.id || '');
    const cName = (currentUser.name || currentUser.username || '').toLowerCase().trim();
    const cEmail = (currentUser.email || '').toLowerCase().trim();
    return orders.filter(o => {
      const oFarmerId = String(o.farmerId || (o.farmer && o.farmer.id) || '');
      const oFarmerName = (o.farmerName || (o.farmer && o.farmer.name) || '').toLowerCase().trim();
      const oFarmerEmail = (o.farmerEmail || (o.farmer && o.farmer.email) || '').toLowerCase().trim();
      return (oFarmerId && cId && oFarmerId === cId) || 
             (oFarmerName && cName && oFarmerName === cName) ||
             (oFarmerEmail && cEmail && oFarmerEmail === cEmail);
    });
  }, [orders, currentUser]);

  // Pending order requests
  const pendingRequests = useMemo(() => {
    return myOrders.filter(o => (o.orderStatus || '').toUpperCase() === 'PENDING');
  }, [myOrders]);

  // Completed sales strictly (DELIVERED or COMPLETED status)
  const completedOrders = useMemo(() => {
    return myOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes((o.orderStatus || '').toUpperCase()));
  }, [myOrders]);

  // Formatted Current Date
  const formattedToday = useMemo(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString(i18n.language === 'te' ? 'te-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', options);
  }, [i18n.language]);

  // =========================================================================
  // SALES HISTORY & MONTHLY REVENUE CALCULATIONS (Section 9)
  // Exclude pending, rejected, and cancelled orders from completed-sales revenue!
  // =========================================================================
  const salesAnalytics = useMemo(() => {
    const months = [
      { key: '2025-11', short: 'Nov', year: '2025', full: 'November 2025' },
      { key: '2025-12', short: 'Dec', year: '2025', full: 'December 2025' },
      { key: '2026-01', short: 'Jan', year: '2026', full: 'January 2026' },
      { key: '2026-02', short: 'Feb', year: '2026', full: 'February 2026' },
      { key: '2026-03', short: 'Mar', year: '2026', full: 'March 2026' },
      { key: '2026-04', short: 'Apr', year: '2026', full: 'April 2026' },
      { key: '2026-05', short: 'May', year: '2026', full: 'May 2026' },
      { key: '2026-06', short: 'Jun', year: '2026', full: 'June 2026' },
      { key: '2026-07', short: 'Jul', year: '2026', full: 'July 2026' },
      { key: '2026-08', short: 'Aug', year: '2026', full: 'August 2026' },
      { key: '2026-09', short: 'Sep', year: '2026', full: 'September 2026' },
      { key: '2026-10', short: 'Oct', year: '2026', full: 'October 2026' }
    ];

    const monthlyMap = {};
    months.forEach(m => {
      monthlyMap[m.key] = {
        key: m.key,
        short: m.short,
        full: m.full,
        revenue: 0,
        qty: 0,
        count: 0
      };
    });

    let totalCompletedSales = 0;
    let totalQuantitySold = 0;
    let totalRevenueGenerated = 0;

    // Apply filters
    const filteredOrders = myOrders.filter(o => {
      const orderDate = o.date || '2026-10-15';
      const orderYear = orderDate.slice(0, 4);
      const orderMonth = orderDate.slice(0, 7);

      if (salesMonthFilter !== 'ALL' && orderMonth !== salesMonthFilter) return false;
      if (salesYearFilter !== 'ALL' && orderYear !== salesYearFilter) return false;
      if (salesProductFilter !== 'ALL' && o.productTitle !== salesProductFilter) return false;
      return true;
    });

    // Compute metrics exclusively from COMPLETED / DELIVERED orders
    myOrders.forEach(o => {
      const isCompleted = ['DELIVERED', 'COMPLETED'].includes((o.orderStatus || '').toUpperCase());
      if (isCompleted) {
        totalCompletedSales++;
        const net = o.subtotalAmount || (o.totalAmount ? o.totalAmount * 0.95 : (o.quantityTons * (o.pricePerTon || 2400)));
        const qty = o.quantityTons || 0;

        totalRevenueGenerated += net;
        totalQuantitySold += qty;

        const ym = (o.date || '2026-10').slice(0, 7);
        if (monthlyMap[ym]) {
          monthlyMap[ym].revenue += net;
          monthlyMap[ym].qty += qty;
          monthlyMap[ym].count += 1;
        }
      }
    });

    const monthlyArray = Object.values(monthlyMap);
    const maxMonthRev = Math.max(...monthlyArray.map(m => m.revenue), 1);
    const maxMonthQty = Math.max(...monthlyArray.map(m => m.qty), 1);

    // List of distinct products for filter
    const distinctProducts = Array.from(new Set(myOrders.map(o => o.productTitle).filter(Boolean)));

    return {
      totalCompletedSales,
      totalQuantitySold: Math.round(totalQuantitySold * 10) / 10,
      totalRevenueGenerated: Math.round(totalRevenueGenerated),
      pendingOrdersCount: pendingRequests.length,
      monthlyArray,
      maxMonthRev,
      maxMonthQty,
      filteredOrders,
      distinctProducts,
      months
    };
  }, [myOrders, pendingRequests, salesMonthFilter, salesYearFilter, salesProductFilter]);

  // Handle Logout
  const handleSidebarLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="farmer-layout-container">
      
      {/* =========================================================================
          LEFT SIDEBAR (Section 4)
          ========================================================================= */}
      <aside className="farmer-sidebar">
        
        {/* Farmer Profile with avatar, name, and location */}
        <div className="farmer-profile-card-sidebar">
          <div className="farmer-avatar-lg">
            {(currentUser?.name || 'Gurpreet Singh').charAt(0)}
          </div>
          <div className="farmer-profile-details">
            <div className="farmer-name-text">
              {currentUser?.name || 'Gurpreet Singh'}
            </div>
            <div className="farmer-location-text">
              <span>📍</span>
              <span>{currentUser?.district || 'Ludhiana'}, {currentUser?.state || 'Punjab'}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Menu Items: Highlight selected item with green background & white text */}
        <nav className="farmer-menu-nav">
          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setSidebarTab('dashboard')}
          >
            <span className="menu-icon">🌾</span>
            <span>{t('farmer_sidebar.dashboard')}</span>
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'add-product' ? 'active' : ''}`}
            onClick={() => setSidebarTab('add-product')}
          >
            <span className="menu-icon">➕</span>
            <span>{t('farmer_sidebar.add_product')}</span>
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'my-products' ? 'active' : ''}`}
            onClick={() => setSidebarTab('my-products')}
          >
            <span className="menu-icon">📦</span>
            <span>{t('farmer_sidebar.my_products')}</span>
            <span className="menu-badge">{myProducts.length}</span>
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'price-prediction' ? 'active' : ''}`}
            onClick={() => setSidebarTab('price-prediction')}
          >
            <span className="menu-icon">⚡</span>
            <span>{t('farmer_sidebar.price_prediction')}</span>
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'ai-recommendations' ? 'active' : ''}`}
            onClick={() => setSidebarTab('ai-recommendations')}
          >
            <span className="menu-icon">🧬</span>
            <span>{t('farmer_sidebar.ai_recommendations')}</span>
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'sales-history' ? 'active' : ''}`}
            onClick={() => setSidebarTab('sales-history')}
          >
            <span className="menu-icon">📊</span>
            <span>{t('farmer_sidebar.sales_history')}</span>
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'profile' ? 'active' : ''}`}
            onClick={() => setSidebarTab('profile')}
          >
            <span className="menu-icon">👤</span>
            <span>{t('farmer_sidebar.profile')}</span>
          </button>

          <div className="sidebar-divider"></div>

          <button
            type="button"
            className="farmer-menu-btn"
            style={{ color: 'var(--red-600)' }}
            onClick={handleSidebarLogout}
          >
            <span className="menu-icon">🚪</span>
            <span>{t('farmer_sidebar.logout')}</span>
          </button>
        </nav>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA (Right Column)
          ========================================================================= */}
      <main className="farmer-main-content">
        
        {/* =====================================================================
            VIEW 1: YOUR DASHBOARD (Section 4 Main Dashboard)
            ===================================================================== */}
        {sidebarTab === 'dashboard' && (
          <div>
            {/* Top Green Welcome Banner */}
            <div className="farmer-welcome-banner">
              <div>
                <h1 className="welcome-title-text">
                  {t('farmer_dash.welcome_banner', { name: currentUser?.name || 'Gurpreet Singh' })}
                </h1>
                <div className="welcome-meta-sub">
                  <span>📍 {t('farmer_dash.location', { district: currentUser?.district || 'Ludhiana', state: currentUser?.state || 'Punjab' })}</span>
                  <span>•</span>
                  <span>📅 {t('farmer_dash.today', { date: formattedToday })}</span>
                </div>
              </div>

              <div className="banner-pill-active">
                🌱 {t('farmer_dash.active_listings_count', { count: myProducts.length })}
              </div>
            </div>

            {/* Below Banner: Two Cards (AI Price Forecast & Eligible Schemes) */}
            <div className="two-cards-grid">
              
              {/* Card 1: AI Price Forecast */}
              <div className="dashboard-card-highlight forecast-border">
                <div className="card-header-styled">
                  <h3 className="card-title-styled">
                    <span>⚡</span> {t('farmer_dash.forecast_card_title')}
                  </h3>
                  <span className="role-badge FARMER">XGBoost v1.2</span>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-body)' }}>
                  {t('farmer_dash.product_name', { name: 'Paddy Rice Straw Bales' })}
                </div>

                <div className="forecast-price-display">
                  ₹2,450 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ MT</span>
                </div>

                <div>
                  <span className="forecast-change-pill">
                    📈 {t('farmer_dash.price_change', { change: '+8.4%' })}
                  </span>
                </div>

                <div className="forecast-insight-box">
                  {t('farmer_dash.market_insight')}
                </div>

                <button 
                  type="button" 
                  className="card-link-action"
                  onClick={() => setSidebarTab('price-prediction')}
                >
                  {t('farmer_dash.link_price_pred')}
                </button>
              </div>

              {/* Card 2: Eligible Welfare and Industrial Schemes */}
              <div className="dashboard-card-highlight schemes-border">
                <div className="card-header-styled">
                  <h3 className="card-title-styled">
                    <span>📜</span> {t('farmer_dash.schemes_card_title')}
                  </h3>
                  <span className="role-badge ADMIN">Subsidies</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '0.75rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--green-900)', display: 'block' }}>
                      {t('farmer_dash.scheme1_title')}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t('farmer_dash.scheme1_desc')}
                    </span>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--green-600)', paddingLeft: '0.75rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--green-900)', display: 'block' }}>
                      {t('farmer_dash.scheme2_title')}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t('farmer_dash.scheme2_desc')}
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="card-link-action"
                  onClick={() => setShowSchemesModal(true)}
                >
                  {t('farmer_dash.view_all_schemes')}
                </button>
              </div>
            </div>

            {/* Quick Actions (4 Clickable Cards) */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--green-900)', fontWeight: 700, marginBottom: '0.85rem' }}>
                ⚡ {t('farmer_dash.quick_actions_title')}
              </h3>

              <div className="quick-actions-row">
                <div className="quick-action-card" onClick={() => setSidebarTab('add-product')}>
                  <div className="qa-icon-circle">➕</div>
                  <div>
                    <div className="qa-title">{t('farmer_dash.qa_add_product')}</div>
                    <div className="qa-desc">{t('farmer_dash.qa_add_product_desc')}</div>
                  </div>
                </div>

                <div className="quick-action-card" onClick={() => setSidebarTab('price-prediction')}>
                  <div className="qa-icon-circle">📈</div>
                  <div>
                    <div className="qa-title">{t('farmer_dash.qa_price_prediction')}</div>
                    <div className="qa-desc">{t('farmer_dash.qa_price_pred_desc')}</div>
                  </div>
                </div>

                <div className="quick-action-card" onClick={() => setSidebarTab('profile')}>
                  <div className="qa-icon-circle">👤</div>
                  <div>
                    <div className="qa-title">{t('farmer_dash.qa_manage_profile')}</div>
                    <div className="qa-desc">{t('farmer_dash.qa_profile_desc')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Buyer Offers and Requests (Table with accurate order states) */}
            <div className="white-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--green-900)', fontWeight: 700 }}>
                  📋 {t('farmer_dash.recent_offers_title')} ({myOrders.length})
                </h3>
                {pendingRequests.length > 0 && (
                  <span className="status-badge PENDING">
                    ⏳ {pendingRequests.length} Awaiting Decision
                  </span>
                )}
              </div>

              {myOrders.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {t('farmer_dash.no_recent_offers')}
                </div>
              ) : (
                <div className="table-responsive-box">
                  <table className="clean-table">
                    <thead>
                      <tr>
                        <th>{t('farmer_dash.col_product')}</th>
                        <th>{t('farmer_dash.col_buyer')}</th>
                        <th>{t('farmer_dash.col_offered_price')}</th>
                        <th>{t('farmer_dash.col_quantity')}</th>
                        <th>{t('farmer_dash.col_order_status')}</th>
                        <th>{t('farmer_dash.col_action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map(order => {
                        const statusUpper = (order.orderStatus || 'PENDING').toUpperCase();

                        return (
                          <tr key={order.id || order.orderNumber}>
                            <td>
                              <strong>{order.productTitle || 'Paddy Rice Straw Bales'}</strong>
                              <br/>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                Ref: {order.orderNumber || `#ORD-${order.id}`}
                              </span>
                            </td>
                            <td>
                              <strong>{order.buyerName || 'GreenTerra BioEnergy'}</strong>
                              <br/>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {order.buyerOrg || 'Industrial Biofuel Buyer'}
                              </span>
                            </td>
                            <td>
                              <strong>₹{(order.pricePerTon || 2450).toLocaleString('en-IN')}</strong> / MT
                              <br/>
                              <span style={{ fontSize: '0.74rem', color: 'var(--green-700)', fontWeight: 600 }}>
                                Total: ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td>
                              <strong>{order.quantityTons} MT</strong>
                            </td>
                            <td>
                              <span className={`status-badge ${statusUpper}`}>
                                {statusUpper === 'PENDING' && '⏳ ' + t('farmer_dash.status_pending', 'Pending')}
                                {statusUpper === 'APPROVED' && '✓ ' + t('farmer_dash.status_approved', 'Approved')}
                                {statusUpper === 'DISPATCHED' && '🚚 ' + t('farmer_dash.status_dispatched', 'Dispatched')}
                                {statusUpper === 'REJECTED' && '✕ ' + t('farmer_dash.status_rejected', 'Rejected')}
                                {['DELIVERED', 'COMPLETED'].includes(statusUpper) && '✅ ' + t('farmer_dash.status_completed', 'Delivered')}
                              </span>
                            </td>
                            <td>
                              {statusUpper === 'PENDING' ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    id={`btn-approve-${order.id || order.orderNumber}`}
                                    className="btn-primary"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', opacity: processingOrderId ? 0.7 : 1 }}
                                    disabled={Boolean(processingOrderId)}
                                    onClick={() => handleApproveClick(order.orderNumber || order.id)}
                                  >
                                    {processingOrderId === (order.orderNumber || order.id) ? '⏳ Approving...' : `✓ ${t('farmer_dash.btn_approve', 'Approve')}`}
                                  </button>
                                  <button
                                    type="button"
                                    id={`btn-reject-${order.id || order.orderNumber}`}
                                    className="btn-secondary"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--red-600)', borderColor: '#fca5a5', opacity: processingOrderId ? 0.7 : 1 }}
                                    disabled={Boolean(processingOrderId)}
                                    onClick={() => handleRejectClick(order.orderNumber || order.id)}
                                  >
                                    {processingOrderId === (order.orderNumber || order.id) ? '⏳ Rejecting...' : `✕ ${t('farmer_dash.btn_reject', 'Reject')}`}
                                  </button>
                                </div>
                              ) : statusUpper === 'APPROVED' ? (
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--green-800)', borderColor: 'var(--green-500)', fontWeight: 600, background: '#f0fdf4' }}
                                  onClick={() => onConfirmDispatch ? onConfirmDispatch(order.orderNumber || order.id) : (onUpdateOrderStatus && onUpdateOrderStatus(order.id, 'DISPATCHED'))}
                                >
                                  Confirm Dispatch 🚚
                                </button>
                              ) : statusUpper === 'DISPATCHED' ? (
                                <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  🚚 In Transit (Dispatched)
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  Settled in Escrow
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: ADD AGRICULTURAL BY-PRODUCT (Section 6)
            ===================================================================== */}
        {sidebarTab === 'add-product' && (
          <AddProductPage
            currentUser={currentUser}
            onCreateProduct={async (prod) => {
              if (onCreateProduct) {
                const res = await onCreateProduct(prod);
                if (res && res.success) {
                  setSidebarTab('my-products');
                }
                return res;
              }
            }}
            onNavigateBack={() => setSidebarTab('dashboard')}
          />
        )}

        {/* =====================================================================
            VIEW 4: MY PRODUCTS
            ===================================================================== */}
        {sidebarTab === 'my-products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--green-900)', fontWeight: 800 }}>
                  📦 My Agricultural By-Product Listings ({myProducts.length})
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  Manage active lots indexed with real-time XGBoost price benchmarks.
                </p>
              </div>

              <button 
                type="button" 
                className="btn-primary"
                onClick={() => setSidebarTab('add-product')}
              >
                ➕ Add New By-Product Lot
              </button>
            </div>

            <div className="white-card" style={{ padding: '1.5rem' }}>
              <div className="table-responsive-box">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Available Quantity</th>
                      <th>Moisture %</th>
                      <th>Asking Price</th>
                      <th>AI Benchmark</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.title}</strong></td>
                        <td>
                          <span className="role-badge FARMER">{p.categoryName || p.byproductType}</span>
                        </td>
                        <td><strong>{p.availableQuantityTons} MT</strong></td>
                        <td>
                          <span style={{ color: p.moistureContentPercent <= 13 ? 'var(--green-700)' : '#d97706', fontWeight: 700 }}>
                            {p.moistureContentPercent}%
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--green-800)' }}>
                            ₹{p.pricePerTon?.toLocaleString('en-IN')} / MT
                          </strong>
                        </td>
                        <td>
                          <span className="ai-predicted-badge">
                            ₹{(p.estimatedMarketPrice || p.pricePerTon)?.toLocaleString('en-IN')} / MT
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${p.status || 'AVAILABLE'}`}>{p.status || 'AVAILABLE'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 5: PRICE PREDICTION DASHBOARD (Section 7)
            ===================================================================== */}
        {sidebarTab === 'price-prediction' && (
          <PricePredictionDashboard />
        )}

        {/* =====================================================================
            VIEW 6: AI RECOMMENDATIONS (Section 8)
            ===================================================================== */}
        {sidebarTab === 'ai-recommendations' && (
          <AIRecommendations />
        )}

        {/* =====================================================================
            VIEW 7: SALES HISTORY & MONTHLY REVENUE (Section 9)
            ===================================================================== */}
        {sidebarTab === 'sales-history' && (
          <div className="sales-history-view-wrapper">
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--green-900)', fontWeight: 800 }}>
                📊 {t('sales_history.title')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                {t('sales_history.subtitle')}
              </p>
            </div>

            {/* Summary KPI Cards (Section 9) */}
            <div className="sales-kpi-grid">
              <div className="sales-kpi-card green-accent">
                <span style={{ fontSize: '0.78rem', color: 'var(--green-800)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('sales_history.kpi_revenue_generated')}
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--green-800)', margin: '0.35rem 0 0.15rem' }}>
                  ₹{salesAnalytics.totalRevenueGenerated.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Released from platform escrow
                </span>
              </div>

              <div className="sales-kpi-card blue-accent">
                <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('sales_history.kpi_quantity_sold')}
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0369a1', margin: '0.35rem 0 0.15rem' }}>
                  {salesAnalytics.totalQuantitySold} MT
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Physical delivered residue
                </span>
              </div>

              <div className="sales-kpi-card amber-accent">
                <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('sales_history.kpi_completed_sales')}
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', margin: '0.35rem 0 0.15rem' }}>
                  {salesAnalytics.totalCompletedSales}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  100% fulfilled contracts
                </span>
              </div>

              <div className="sales-kpi-card sky-accent">
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('sales_history.kpi_pending_orders')}
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', margin: '0.35rem 0 0.15rem' }}>
                  {salesAnalytics.pendingOrdersCount}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Awaiting acceptance (excluded from revenue)
                </span>
              </div>
            </div>

            {/* Monthly Revenue & Quantity Charts (Covering last 12 months) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Monthly Revenue Chart */}
              <div className="white-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--green-900)', fontWeight: 700 }}>
                    💰 {t('sales_history.chart_rev_title')}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--green-700)', fontWeight: 700 }}>₹ INR Payout</span>
                </div>

                <div className="chart-container-12m" style={{ height: '180px' }}>
                  <div className="chart-bars-wrap">
                    {salesAnalytics.monthlyArray.map((m, idx) => {
                      const hPct = salesAnalytics.maxMonthRev > 0 ? (m.revenue / salesAnalytics.maxMonthRev) * 100 : 0;
                      return (
                        <div key={idx} className="chart-bar-col" title={`${m.full}: ₹${m.revenue.toLocaleString('en-IN')}`}>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(0)}k` : '0'}
                          </span>
                          <div 
                            className="chart-bar-fill"
                            style={{ height: `${Math.max(6, hPct)}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="chart-x-labels">
                    {salesAnalytics.monthlyArray.map((m, idx) => (
                      <div key={idx} className="chart-x-item">{m.short}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Quantity Sold Chart */}
              <div className="white-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--green-900)', fontWeight: 700 }}>
                    ⚖️ {t('sales_history.chart_qty_title')}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>Metric Tons (MT)</span>
                </div>

                <div className="chart-container-12m" style={{ height: '180px' }}>
                  <div className="chart-bars-wrap">
                    {salesAnalytics.monthlyArray.map((m, idx) => {
                      const hPct = salesAnalytics.maxMonthQty > 0 ? (m.qty / salesAnalytics.maxMonthQty) * 100 : 0;
                      return (
                        <div key={idx} className="chart-bar-col" title={`${m.full}: ${m.qty} MT`}>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {m.qty > 0 ? `${m.qty}T` : '0'}
                          </span>
                          <div 
                            className="chart-bar-fill peak"
                            style={{ height: `${Math.max(6, hPct)}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="chart-x-labels">
                    {salesAnalytics.monthlyArray.map((m, idx) => (
                      <div key={idx} className="chart-x-item">{m.short}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Toolbar: Filter by Month, Year, and Product (Section 9) */}
            <div className="white-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label className="form-label-custom" style={{ fontSize: '0.8rem' }}>{t('sales_history.filter_month')}</label>
                  <select 
                    className="form-control-custom"
                    value={salesMonthFilter}
                    onChange={(e) => setSalesMonthFilter(e.target.value)}
                  >
                    <option value="ALL">{t('sales_history.all_months')}</option>
                    {salesAnalytics.months.map(m => (
                      <option key={m.key} value={m.key}>{m.full}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label-custom" style={{ fontSize: '0.8rem' }}>{t('sales_history.filter_year')}</label>
                  <select 
                    className="form-control-custom"
                    value={salesYearFilter}
                    onChange={(e) => setSalesYearFilter(e.target.value)}
                  >
                    <option value="ALL">{t('sales_history.all_years')}</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>

                <div>
                  <label className="form-label-custom" style={{ fontSize: '0.8rem' }}>{t('sales_history.filter_product')}</label>
                  <select 
                    className="form-control-custom"
                    value={salesProductFilter}
                    onChange={(e) => setSalesProductFilter(e.target.value)}
                  >
                    <option value="ALL">{t('sales_history.all_products')}</option>
                    {salesAnalytics.distinctProducts.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sales Records Table */}
            <div className="white-card" style={{ padding: '1.5rem' }}>
              <div className="table-responsive-box">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>{t('sales_history.col_order_id')}</th>
                      <th>{t('sales_history.col_product_name')}</th>
                      <th>{t('sales_history.col_buyer_name')}</th>
                      <th>{t('sales_history.col_quantity')}</th>
                      <th>{t('sales_history.col_price_unit')}</th>
                      <th>{t('sales_history.col_total_amount')}</th>
                      <th>{t('sales_history.col_sale_date')}</th>
                      <th>{t('sales_history.col_payment_status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesAnalytics.filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          {t('sales_history.no_sales_records')}
                        </td>
                      </tr>
                    ) : (
                      salesAnalytics.filteredOrders.map(o => (
                        <tr key={o.id || o.orderNumber}>
                          <td><strong>{o.orderNumber || `#ORD-${o.id}`}</strong></td>
                          <td><strong>{o.productTitle || 'Residue Lot'}</strong></td>
                          <td>{o.buyerName || 'Industrial Buyer'}</td>
                          <td><strong>{o.quantityTons} MT</strong></td>
                          <td>₹{(o.pricePerTon || 2400).toLocaleString('en-IN')}</td>
                          <td>
                            <strong style={{ color: 'var(--green-800)' }}>
                              ₹{(o.totalAmount || 0).toLocaleString('en-IN')}
                            </strong>
                          </td>
                          <td>{o.date || '2026-10-14'}</td>
                          <td>
                            <span className="status-badge APPROVED">
                              ✓ {t('sales_history.payment_released')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 8: FARMER PROFILE
            ===================================================================== */}
        {sidebarTab === 'profile' && (
          <div className="white-card" style={{ padding: '2rem', maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="farmer-avatar-lg" style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}>
                {(currentUser?.name || 'G').charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--green-900)' }}>
                  {currentUser?.name || 'Gurpreet Singh'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                  <span className="status-badge APPROVED">✓ Verified Producer</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {currentUser?.organizationName || 'Kisan Samriddhi Farms'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Mobile Number</span>
                <strong style={{ fontSize: '0.95rem' }}>+91 {currentUser?.phone || '9814123456'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                <strong style={{ fontSize: '0.95rem' }}>{currentUser?.email || 'farmer.gurpreet@agriexchange.org'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Cultivated Land Area</span>
                <strong style={{ fontSize: '0.95rem' }}>{currentUser?.landAreaAcres || 28.5} Acres</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Location</span>
                <strong style={{ fontSize: '0.95rem' }}>{currentUser?.district || 'Ludhiana'}, {currentUser?.state || 'Punjab'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Escrow Payout Account</span>
                <strong style={{ fontSize: '0.95rem' }}>State Bank of India (Ending in •••• 4812)</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Farmer Rating</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--green-700)' }}>★ 4.85 / 5.0 (Top Verified Producer)</strong>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          WELFARE SCHEMES DIRECTORY MODAL
          ========================================================================= */}
      {showSchemesModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowSchemesModal(false)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setShowSchemesModal(false)}>✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.6rem' }}>📜</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--green-900)' }}>
                  {t('schemes_modal.title')}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {t('schemes_modal.subtitle')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--green-600)' }}>
                <h4 style={{ color: 'var(--green-900)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  1. {t('schemes_modal.scheme1_name')}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                  {t('schemes_modal.scheme1_body')}
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #0284c7' }}>
                <h4 style={{ color: '#0369a1', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  2. {t('schemes_modal.scheme2_name')}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                  {t('schemes_modal.scheme2_body')}
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #d97706' }}>
                <h4 style={{ color: '#b45309', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  3. {t('schemes_modal.scheme3_name')}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                  {t('schemes_modal.scheme3_body')}
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #7c3aed' }}>
                <h4 style={{ color: '#6d28d9', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  4. {t('schemes_modal.scheme4_name')}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                  {t('schemes_modal.scheme4_body')}
                </p>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => setShowSchemesModal(false)}
            >
              {t('schemes_modal.btn_close')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
