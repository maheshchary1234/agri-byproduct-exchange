import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Marketplace from './Marketplace';
import { fetchOrderStatus } from '../services/api';

export default function BuyerDashboard({
  products = [],
  orders = [],
  currentUser,
  onInspectPrice,
  onSubmitPurchaseRequest,
  onPlaceOrder,
  onSendInquiry,
  onRefreshOrders,
  onLogout
}) {
  const { t } = useTranslation();

  // Active Sidebar Tab: 'dashboard' | 'marketplace' | 'my-orders' | 'profile'
  const [sidebarTab, setSidebarTab] = useState('dashboard');

  // Order modal state
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(30);
  const [deliveryAddress, setDeliveryAddress] = useState(
    'GreenTerra Thermal Co-Gen Plant, Gate 3, Sector 60, Greater Noida, UP'
  );

  // ESG Certificate Modal State
  const [activeCertOrder, setActiveCertOrder] = useState(null);

  // Live Order Status Tracking & Verification State
  const [statusSearchId, setStatusSearchId] = useState('');
  const [activeStatusOrder, setActiveStatusOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const handleCheckOrderStatus = async (identifier) => {
    const queryId = identifier || statusSearchId;
    if (!queryId || !String(queryId).trim()) return;

    setStatusLoading(true);
    setStatusError(null);

    const res = await fetchOrderStatus(queryId);
    setStatusLoading(false);

    if (res.success && res.order) {
      setActiveStatusOrder(res.order);
      setStatusError(null);
    } else {
      setActiveStatusOrder(null);
      if (res.notFound) {
        setStatusError({
          type: 'NOT_FOUND',
          title: t('order_status.not_found_title', 'Order Not Found'),
          message: res.error || `No order matching ID or Reference "${queryId}" was found in the database. Please verify the order number and try again.`
        });
      } else if (res.unauthorized) {
        setStatusError({
          type: 'UNAUTHORIZED',
          title: t('order_status.unauthorized_title', 'Access Restricted'),
          message: res.error || `You do not have authorization to view Order "${queryId}". Only the participating buyer or farmer can access this record.`
        });
      } else {
        setStatusError({
          type: 'SERVER_ERROR',
          title: t('order_status.server_error_title', 'Connection Failure'),
          message: res.error || 'Unable to connect to order status service. Please check your network and retry.'
        });
      }
    }
  };

  // Filter buyer's orders
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    const cId = String(currentUser.id || '');
    const cName = (currentUser.name || currentUser.username || '').toLowerCase().trim();
    return orders.filter(o => {
      const oBuyerId = String(o.buyerId || (o.buyer && o.buyer.id) || '');
      const oBuyerName = (o.buyerName || (o.buyer && o.buyer.name) || '').toLowerCase().trim();
      return (oBuyerId && cId && oBuyerId === cId) || (oBuyerName && cName && oBuyerName === cName) || (!o.buyerName && !o.buyerId);
    });
  }, [orders, currentUser]);

  const pendingOrders = useMemo(() => {
    return myOrders.filter(o => (o.orderStatus || '').toUpperCase() === 'PENDING');
  }, [myOrders]);

  const activeOrders = useMemo(() => {
    return myOrders.filter(o => ['APPROVED', 'CONFIRMED', 'DISPATCHED'].includes((o.orderStatus || '').toUpperCase()));
  }, [myOrders]);

  // Total spending based strictly on actual order records
  const totalSpending = useMemo(() => {
    return myOrders
      .filter(o => ['APPROVED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'COMPLETED'].includes((o.orderStatus || '').toUpperCase()))
      .reduce((sum, o) => sum + (o.totalAmount || (o.quantityTons * (o.pricePerTon || 2400))), 0);
  }, [myOrders]);

  // Proximity-matched agricultural by-products (nearby supply lots)
  const proximityMatchedProducts = useMemo(() => {
    return products.slice(0, 4).map((p, index) => {
      const distances = [28, 45, 82, 115];
      return {
        ...p,
        distanceKm: distances[index % distances.length]
      };
    });
  }, [products]);

  const handleOpenOrderModal = (product) => {
    setSelectedProductForOrder(product);
    setOrderQuantity(Math.min(30, product.availableQuantityTons || 30));
  };

  const handleConfirmOrder = () => {
    if (!selectedProductForOrder) return;
    const orderHandler = onSubmitPurchaseRequest || onPlaceOrder;
    if (orderHandler) {
      orderHandler({
        productId: selectedProductForOrder.id,
        productTitle: selectedProductForOrder.title,
        byproductType: selectedProductForOrder.byproductType,
        farmerName: selectedProductForOrder.farmerName || 'Registered Farmer',
        farmerOrg: selectedProductForOrder.farmerOrg || 'Local Farm Collective',
        quantityTons: orderQuantity,
        pricePerTon: selectedProductForOrder.pricePerTon,
        deliveryAddress
      });
    }
    setSelectedProductForOrder(null);
  };

  return (
    <div className="farmer-layout-container">
      
      {/* =========================================================================
          BUYER SIDEBAR
          ========================================================================= */}
      <aside className="farmer-sidebar">
        {/* Buyer Profile summary */}
        <div className="farmer-profile-card-sidebar">
          <div className="farmer-avatar-lg" style={{ background: 'linear-gradient(135deg, #0F766E, #115E59)' }}>
            {(currentUser?.name || 'Dr. Arvinder Mehta').charAt(0)}
          </div>
          <div className="farmer-profile-details">
            <div className="farmer-name-text">
              {currentUser?.name || 'Dr. Arvinder Mehta'}
            </div>
            <div className="farmer-location-text">
              <span>🏭</span>
              <span>{currentUser?.district || 'Greater Noida'}, {currentUser?.state || 'UP'}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Menu Items */}
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
            className={`farmer-menu-btn ${sidebarTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setSidebarTab('marketplace')}
          >
            <span className="menu-icon">🛒</span>
            <span>{t('nav.biomass_market')}</span>
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'my-orders' ? 'active' : ''}`}
            onClick={() => setSidebarTab('my-orders')}
          >
            <span className="menu-icon">📦</span>
            <span>{t('nav.my_orders')}</span>
            {pendingOrders.length > 0 && (
              <span className="menu-badge">{pendingOrders.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`farmer-menu-btn ${sidebarTab === 'profile' ? 'active' : ''}`}
            onClick={() => setSidebarTab('profile')}
          >
            <span className="menu-icon">👤</span>
            <span>{t('nav.profile')}</span>
          </button>

          <div className="sidebar-divider"></div>

          <button
            type="button"
            className="farmer-menu-btn"
            style={{ color: 'var(--red-600)' }}
            onClick={onLogout}
          >
            <span className="menu-icon">🚪</span>
            <span>{t('nav.sign_out')}</span>
          </button>
        </nav>
      </aside>

      {/* =========================================================================
          MAIN DASHBOARD CONTENT
          ========================================================================= */}
      <main className="farmer-main-content">
        
        {/* =====================================================================
            VIEW 1: YOUR DASHBOARD
            ===================================================================== */}
        {sidebarTab === 'dashboard' && (
          <div>
            {/* Top Banner */}
            <div className="farmer-welcome-banner" style={{ background: 'linear-gradient(135deg, #115E59 0%, #0F766E 100%)' }}>
              <div>
                <h1 className="welcome-title-text">
                  {t('buyer_dash.welcome_buyer', { name: currentUser?.name || 'Dr. Arvinder Mehta' })}
                </h1>
                <div className="welcome-meta-sub">
                  <span>🏭 {currentUser?.organizationName || 'GreenTerra BioEnergy 50MW Plant'}</span>
                  <span>•</span>
                  <span>📍 {currentUser?.district || 'Greater Noida'}, {currentUser?.state || 'Uttar Pradesh'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn-hero-primary" 
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
                  onClick={() => setSidebarTab('marketplace')}
                >
                  🛒 {t('buyer_dash.btn_search_products')} →
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-teal)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-teal)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('buyer_dash.kpi_feedstock_lots')}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-900)', margin: '0.35rem 0 0.15rem' }}>
                  {products.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Verified active supply lots</span>
              </div>

              <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--amber-600)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--amber-700)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('buyer_dash.kpi_pending_offers')}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber-700)', margin: '0.35rem 0 0.15rem' }}>
                  {pendingOrders.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Waiting for farmer acceptance</span>
              </div>

              <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid #0284c7' }}>
                <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('buyer_dash.kpi_active_orders')}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0369a1', margin: '0.35rem 0 0.15rem' }}>
                  {activeOrders.length}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Approved and in fulfillment</span>
              </div>

              <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary-emerald)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('buyer_dash.kpi_total_spending')}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-900)', margin: '0.35rem 0 0.15rem' }}>
                  ₹{totalSpending.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Secured in escrow records</span>
              </div>
            </div>

            {/* Proximity-Matched Feedstock Lots */}
            <div className="white-card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--green-900)', fontWeight: 700 }}>
                    📍 {t('buyer_dash.proximity_title')}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '3px' }}>
                    {t('buyer_dash.proximity_subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                  onClick={() => setSidebarTab('marketplace')}
                >
                  View All Marketplace Lots →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {proximityMatchedProducts.map(p => (
                  <div key={p.id} className="product-card-modern" style={{ border: '1px solid var(--border-card)' }}>
                    <div className="card-image-box" style={{ height: '150px' }}>
                      <img src={p.imageUrl} alt={p.title} loading="lazy" />
                      <div className="card-badge-topright" style={{ background: '#0284c7', color: '#fff' }}>
                        📍 {t('buyer_dash.dist_km', { km: p.distanceKm })}
                      </div>
                    </div>

                    <div className="product-card-body" style={{ padding: '1rem' }}>
                      <h4 style={{ fontSize: '0.98rem', color: 'var(--green-900)', fontWeight: 700, marginBottom: '0.3rem' }}>
                        {p.title}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        📍 {p.district}, {p.state} • Producer: <strong>{p.farmerName}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        <span>Available: <strong style={{ color: 'var(--green-800)' }}>{p.availableQuantityTons} MT</strong></span>
                        <strong style={{ color: 'var(--primary-teal)', fontSize: '1.05rem' }}>
                          ₹{p.pricePerTon?.toLocaleString('en-IN')}/MT
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.84rem' }}
                        onClick={() => handleOpenOrderModal(p)}
                      >
                        Request Procurement →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: BIOMASS MARKETPLACE (Directly Embedded in Buyer Dashboard)
            ===================================================================== */}
        {sidebarTab === 'marketplace' && (
          <div style={{ marginTop: '-1rem' }}>
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--green-900)', fontWeight: 800 }}>
                  🛒 {t('nav.biomass_market')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {t('market.subtitle')}
                </p>
              </div>
            </div>

            <Marketplace
              products={products}
              currentUser={currentUser}
              onInspectPrice={onInspectPrice}
              onPlaceOrder={onSubmitPurchaseRequest || onPlaceOrder}
              onSendInquiry={onSendInquiry}
            />
          </div>
        )}

        {/* =====================================================================
            VIEW 3: MY ORDERS & SYNCHRONIZED APPROVAL WORKFLOW
            ===================================================================== */}
        {sidebarTab === 'my-orders' && (
          <div>
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--teal-200)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--green-900)' }}>
              <strong>💡 Synchronized Escrow Workflow:</strong> {t('buyer_dash.order_workflow_notice')}
            </div>

            {/* Live Order Status Search & Tracking Bar */}
            <div className="white-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-teal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--green-900)', fontWeight: 700, margin: 0 }}>
                    🔍 {t('order_status.track_title', 'Check Order Status & Escrow Milestones')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {t('order_status.track_subtitle', 'Query live persisted status directly by Order ID (e.g. 1) or Order Reference (e.g. ORD-202610-8841)')}
                  </p>
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (statusSearchId.trim()) handleCheckOrderStatus(statusSearchId.trim());
                }}
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
              >
                <div style={{ flex: '1 1 320px', position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder={t('order_status.search_placeholder', 'Enter Order ID (e.g. 1, 2) or Reference (e.g. ORD-202610-8841)...')}
                    value={statusSearchId}
                    onChange={(e) => setStatusSearchId(e.target.value)}
                    style={{ fontSize: '0.88rem', padding: '0.55rem 0.85rem' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={statusLoading || !statusSearchId.trim()}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
                >
                  {statusLoading ? '⏳ Checking...' : `🔍 ${t('order_status.btn_check_status', 'Check Status')}`}
                </button>
                {statusSearchId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setStatusSearchId(''); setStatusError(null); }}
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    {t('order_status.btn_clear', 'Clear')}
                  </button>
                )}
              </form>
            </div>

            <div className="white-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--green-900)', fontWeight: 700 }}>
                  📦 {t('buyer_dash.tab_my_orders')} ({myOrders.length})
                </h3>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={onRefreshOrders}
                >
                  🔄 Refresh Sync
                </button>
              </div>

              {myOrders.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {t('buyer_dash.no_buyer_orders')}
                </div>
              ) : (
                <div className="table-responsive-box">
                  <table className="clean-table">
                    <thead>
                      <tr>
                        <th>{t('buyer_dash.col_order_no')}</th>
                        <th>{t('buyer_dash.col_byproduct')}</th>
                        <th>{t('buyer_dash.col_farmer')}</th>
                        <th>{t('buyer_dash.col_qty')}</th>
                        <th>{t('buyer_dash.col_total_cost')}</th>
                        <th>{t('buyer_dash.col_status')}</th>
                        <th>{t('buyer_dash.col_actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map(order => {
                        const statusUpper = (order.orderStatus || 'PENDING').toUpperCase();

                        return (
                          <tr key={order.id || order.orderNumber}>
                            <td><strong>{order.orderNumber || `#ORD-${order.id}`}</strong></td>
                            <td>
                              <strong>{order.productTitle || 'Agricultural By-Product'}</strong>
                            </td>
                            <td>
                              <strong>{order.farmerName || 'Registered Farmer'}</strong>
                              <br/>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {order.farmerOrg || 'Local Farm Collective'}
                              </span>
                            </td>
                            <td><strong>{order.quantityTons} MT</strong></td>
                            <td>
                              <strong style={{ color: 'var(--primary-teal)' }}>
                                ₹{(order.totalAmount || (order.quantityTons * (order.pricePerTon || 2400))).toLocaleString('en-IN')}
                              </strong>
                            </td>
                            <td>
                              <span className={`status-badge ${statusUpper}`}>
                                {statusUpper === 'PENDING' && '⏳ ' + t('farmer_dash.status_pending')}
                                {statusUpper === 'APPROVED' && '✓ ' + t('farmer_dash.status_approved')}
                                {statusUpper === 'REJECTED' && '✕ ' + t('farmer_dash.status_rejected')}
                                {['DELIVERED', 'COMPLETED'].includes(statusUpper) && '🚚 ' + t('farmer_dash.status_completed')}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                  onClick={() => handleCheckOrderStatus(order.orderNumber || order.id)}
                                  title="Check real-time order status from database"
                                >
                                  🔍 {t('order_status.btn_check_status', 'Check Status')}
                                </button>

                                {['DELIVERED', 'COMPLETED'].includes(statusUpper) && (
                                  <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--primary-teal)', borderColor: 'var(--teal-500)' }}
                                    onClick={() => setActiveCertOrder(order)}
                                  >
                                    📜 {t('buyer_dash.btn_esg_cert')}
                                  </button>
                                )}
                              </div>
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
            VIEW 4: BUYER PROFILE
            ===================================================================== */}
        {sidebarTab === 'profile' && (
          <div className="white-card" style={{ padding: '2rem', maxWidth: '850px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="farmer-avatar-lg" style={{ width: '64px', height: '64px', fontSize: '1.6rem', background: 'linear-gradient(135deg, #0F766E, #115E59)' }}>
                {(currentUser?.name || 'Dr. Arvinder Mehta').charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--green-900)' }}>
                  {currentUser?.name || 'Dr. Arvinder Mehta'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                  <span className="status-badge APPROVED">✓ Verified Industrial Buyer</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {currentUser?.organizationName || 'GreenTerra BioEnergy 50MW Plant'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Primary Contact Mobile</span>
                <strong style={{ fontSize: '0.95rem' }}>+91 {currentUser?.phone || '9811067890'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Corporate Email</span>
                <strong style={{ fontSize: '0.95rem' }}>{currentUser?.email || 'mehta@greenterra.com'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Procurement License / Registry</span>
                <strong style={{ fontSize: '0.95rem' }}>MNRE Bio-Gen #BIO-2026-UP-4819</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Receiving Plant Location</span>
                <strong style={{ fontSize: '0.95rem' }}>{currentUser?.district || 'Greater Noida'}, {currentUser?.state || 'Uttar Pradesh'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Industrial Escrow Settlement</span>
                <strong style={{ fontSize: '0.95rem' }}>HDFC Escrow Vault (Ending in •••• 9182)</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Monthly Feedstock Demand</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary-teal)' }}>1,500 MT / Month (Boiler Grade)</strong>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Procurement Request Modal */}
      {selectedProductForOrder && (
        <div className="modal-backdrop-custom" onClick={() => setSelectedProductForOrder(null)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setSelectedProductForOrder(null)}>✕</button>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--green-900)', marginBottom: '1rem' }}>
              Request Agricultural Biomass Procurement
            </h3>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
              <strong>{selectedProductForOrder.title}</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Supplier: {selectedProductForOrder.farmerName} • ₹{selectedProductForOrder.pricePerTon}/MT
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Tonnage Required (MT)</label>
              <input 
                type="number"
                min="5"
                max={selectedProductForOrder.availableQuantityTons}
                className="form-control-custom"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(parseFloat(e.target.value) || 10)}
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

            <div style={{ background: 'var(--green-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--green-900)' }}>
                <span>Total Escrow Lock:</span>
                <span>₹{(orderQuantity * selectedProductForOrder.pricePerTon).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmOrder}>
                Send Purchase Request to Farmer →
              </button>
              <button type="button" className="btn-secondary" onClick={() => setSelectedProductForOrder(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESG Carbon Offset Certificate Modal */}
      {activeCertOrder && (
        <div className="modal-backdrop-custom" onClick={() => setActiveCertOrder(null)}>
          <div className="modal-dialog-custom" style={{ maxWidth: '600px', border: '2px solid var(--primary-teal)' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setActiveCertOrder(null)}>✕</button>

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱</div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--green-900)' }}>
                Certificate of Agricultural Carbon Offset
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 700 }}>
                Verified by AgriConnect Circular Bio-Economy Framework
              </span>

              <div style={{ margin: '1.5rem auto', padding: '1.25rem', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--teal-300)', textAlign: 'left' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Certified Consumer:</span>
                  <div style={{ fontWeight: 700 }}>{currentUser?.organizationName || 'Industrial Biofuel Buyer'}</div>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Agricultural Residue Diverted from Open Fire:</span>
                  <div style={{ fontWeight: 700 }}>{activeCertOrder.quantityTons} Metric Tons ({activeCertOrder.productTitle})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified CO₂ Emissions Offset:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-teal)' }}>
                    ~{(activeCertOrder.quantityTons * 1.35).toFixed(1)} MT CO₂ Equivalent
                  </div>
                </div>
              </div>

              <button type="button" className="btn-primary" onClick={() => setActiveCertOrder(null)}>
                Download ESG Verification PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER STATUS & ESCROW TRACKING MODAL
          ========================================================================= */}
      {(activeStatusOrder || statusError || statusLoading) && (
        <div className="modal-backdrop-custom" onClick={() => { setActiveStatusOrder(null); setStatusError(null); }}>
          <div 
            className="modal-dialog-custom" 
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="modal-close-icon" 
              onClick={() => { setActiveStatusOrder(null); setStatusError(null); }}
            >
              ✕
            </button>

            {statusLoading && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <h3 style={{ color: 'var(--green-900)' }}>Querying MySQL Database...</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Retrieving live order status & escrow state</p>
              </div>
            )}

            {!statusLoading && statusError && (
              <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                  {statusError.type === 'NOT_FOUND' ? '🔍' : statusError.type === 'UNAUTHORIZED' ? '🔒' : '⚠️'}
                </div>
                <h3 style={{ 
                  color: statusError.type === 'NOT_FOUND' ? 'var(--amber-700)' : 'var(--red-600)',
                  fontSize: '1.35rem',
                  marginBottom: '0.5rem'
                }}>
                  {statusError.title}
                </h3>
                <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  {statusError.message}
                </p>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={() => setStatusError(null)}
                  style={{ padding: '0.5rem 1.5rem' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {!statusLoading && activeStatusOrder && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Live Database Order
                    </span>
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--green-900)', margin: '2px 0' }}>
                      {activeStatusOrder.orderNumber || `#ORD-${activeStatusOrder.id}`}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary-teal)', fontWeight: 600 }}>
                      Database ID: #{activeStatusOrder.id} • Date: {activeStatusOrder.date || activeStatusOrder.createdAt}
                    </span>
                  </div>

                  <span className={`status-badge ${(activeStatusOrder.orderStatus || 'PENDING').toUpperCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
                    {activeStatusOrder.orderStatus === 'PENDING' && '⏳ PENDING APPROVAL'}
                    {activeStatusOrder.orderStatus === 'APPROVED' && '✓ ACCEPTED BY FARMER'}
                    {activeStatusOrder.orderStatus === 'REJECTED' && '✕ REJECTED'}
                    {['DELIVERED', 'COMPLETED'].includes(activeStatusOrder.orderStatus) && '🚚 DELIVERED & SETTLED'}
                  </span>
                </div>

                {/* Workflow Stepper */}
                <div style={{ background: 'var(--green-50)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--teal-200)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--green-900)', marginBottom: '0.75rem' }}>
                    Workflow Milestone Tracker:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    <div style={{ padding: '0.4rem', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '0.74rem', fontWeight: 700 }}>
                      1. Submitted ✓
                    </div>
                    <div style={{ 
                      padding: '0.4rem', 
                      borderRadius: '6px', 
                      background: activeStatusOrder.orderStatus === 'REJECTED' ? '#fee2e2' : activeStatusOrder.orderStatus !== 'PENDING' ? '#dcfce7' : '#fef3c7',
                      color: activeStatusOrder.orderStatus === 'REJECTED' ? '#991b1b' : activeStatusOrder.orderStatus !== 'PENDING' ? '#166534' : '#92400e',
                      fontSize: '0.74rem', 
                      fontWeight: 700 
                    }}>
                      {activeStatusOrder.orderStatus === 'REJECTED' ? '2. Rejected ✕' : activeStatusOrder.orderStatus === 'PENDING' ? '2. Reviewing ⏳' : '2. Approved ✓'}
                    </div>
                    <div style={{ 
                      padding: '0.4rem', 
                      borderRadius: '6px', 
                      background: ['DELIVERED', 'COMPLETED', 'DISPATCHED'].includes(activeStatusOrder.orderStatus) ? '#dcfce7' : '#f1f5f9',
                      color: ['DELIVERED', 'COMPLETED', 'DISPATCHED'].includes(activeStatusOrder.orderStatus) ? '#166534' : '#64748b',
                      fontSize: '0.74rem', 
                      fontWeight: 600 
                    }}>
                      3. Dispatch
                    </div>
                    <div style={{ 
                      padding: '0.4rem', 
                      borderRadius: '6px', 
                      background: ['DELIVERED', 'COMPLETED'].includes(activeStatusOrder.orderStatus) ? '#dcfce7' : '#f1f5f9',
                      color: ['DELIVERED', 'COMPLETED'].includes(activeStatusOrder.orderStatus) ? '#166534' : '#64748b',
                      fontSize: '0.74rem', 
                      fontWeight: 600 
                    }}>
                      4. Settlement
                    </div>
                  </div>
                </div>

                {/* Details Table */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Agricultural Commodity:</span>
                    <strong>{activeStatusOrder.productTitle}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Contracted Volume:</span>
                    <strong>{activeStatusOrder.quantityTons} MT</strong> @ ₹{(activeStatusOrder.pricePerTon || 0).toLocaleString('en-IN')}/MT
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Associated Farmer Producer:</span>
                    <strong>{activeStatusOrder.farmerName}</strong> ({activeStatusOrder.farmerOrg || 'Producer Collective'})
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Procuring Industrial Buyer:</span>
                    <strong>{activeStatusOrder.buyerName}</strong> ({activeStatusOrder.buyerOrg || 'Industrial Buyer'})
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Total Escrow Commitment:</span>
                    <strong style={{ color: 'var(--primary-teal)', fontSize: '1rem' }}>
                      ₹{(activeStatusOrder.totalAmount || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Escrow Payout Status:</span>
                    <span className={`status-badge ${(activeStatusOrder.paymentStatus || 'ESCROW_HELD')}`}>
                      {activeStatusOrder.paymentStatus}
                    </span>
                  </div>
                  <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Delivery Receiving Facility:</span>
                    <span>📍 {activeStatusOrder.deliveryAddress}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleCheckOrderStatus(activeStatusOrder.orderNumber || activeStatusOrder.id)}
                    style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
                  >
                    🔄 Re-Check Live Status
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => { setActiveStatusOrder(null); setStatusError(null); }}
                    style={{ padding: '0.45rem 1.25rem', fontSize: '0.84rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
