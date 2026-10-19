import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import Marketplace from './components/Marketplace';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import AdminDashboard from './components/AdminDashboard';
import XGBoostModal from './components/XGBoostModal';
import LoginPage from './components/LoginPage';
import FarmerRegisterPage from './components/FarmerRegisterPage';
import BuyerRegisterPage from './components/BuyerRegisterPage';
import { 
  DEMO_USERS, 
  INITIAL_PRODUCTS, 
  getMarketplaceProducts,
  loginUser,
  switchDemoRole,
  registerFarmer,
  registerBuyer,
  getStoredSession,
  clearSession,
  getStoredOrders,
  saveStoredOrders,
  submitBuyerPurchaseRequest,
  acceptPurchaseOrder,
  rejectPurchaseOrder,
  dispatchPurchaseOrder,
  updateOrderStatus,
  fetchUserOrders,
  normalizeOrder,
  createMarketplaceProduct,
  normalizeProduct
} from './services/api';

export default function App() {
  // Restore session from localStorage or default to null
  const [currentUser, setCurrentUser] = useState(() => getStoredSession() || null);

  // Default entry point: starting page is Login/Register for unauthenticated visitors
  const [activeTab, setActiveTab] = useState(() => {
    const session = getStoredSession();
    if (session && session.role) {
      const role = session.role.toUpperCase();
      if (role.includes('FARMER')) return 'farmer';
      if (role.includes('BUYER')) return 'buyer';
      if (role.includes('ADMIN')) return 'admin';
    }
    return 'login';
  });

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [inquiries, setInquiries] = useState([
    {
      id: 1,
      productTitle: 'Premium High-Density Paddy Rice Straw Bales',
      buyerName: 'Dr. Arvinder Mehta',
      farmerName: 'Gurpreet Singh',
      offeredPricePerTon: 2380,
      requestedQuantityTons: 50,
      message: 'Can you supply 50 MT delivered to Greater Noida by next Wednesday? We have consistent monthly boiler requirements.',
      status: 'ACCEPTED'
    }
  ]);

  // Standalone AI Modal State
  const [isAICalculatorOpen, setIsAICalculatorOpen] = useState(false);
  const [aiModalParams, setAiModalParams] = useState({});

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  // Route protection guard: enforce unauthenticated visitors to auth pages
  // and authenticated users strictly to their role dashboard
  useEffect(() => {
    if (!currentUser) {
      if (!['login', 'register-farmer', 'register-buyer'].includes(activeTab)) {
        setActiveTab('login');
      }
    } else {
      const role = (currentUser.role || '').toUpperCase();
      if (role.includes('FARMER')) {
        if (['login', 'register-farmer', 'register-buyer', 'buyer', 'admin', 'home', 'about', 'features', 'contact', 'marketplace'].includes(activeTab)) {
          setActiveTab('farmer');
        }
      } else if (role.includes('BUYER')) {
        if (['login', 'register-farmer', 'register-buyer', 'farmer', 'admin', 'home', 'about', 'features', 'contact', 'marketplace'].includes(activeTab)) {
          setActiveTab('buyer');
        }
      } else if (role.includes('ADMIN')) {
        if (['login', 'register-farmer', 'register-buyer', 'farmer', 'buyer', 'home', 'about', 'features', 'contact', 'marketplace'].includes(activeTab)) {
          setActiveTab('admin');
        }
      }
    }
  }, [currentUser, activeTab]);

  // Synchronize orders with backend REST API and persistent storage
  const refreshOrders = async () => {
    try {
      const liveOrders = await fetchUserOrders();
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
        saveStoredOrders(liveOrders);
      }
    } catch (err) {
      console.warn('Failed to refresh orders from backend:', err);
    }
  };

  // Synchronize marketplace products with Spring Boot MySQL backend
  const refreshProducts = async () => {
    try {
      const liveProds = await getMarketplaceProducts();
      if (liveProds && liveProds.length > 0) {
        setProducts(liveProds);
      }
    } catch (err) {
      console.warn('Failed to refresh products from backend:', err);
    }
  };

  // Sync products and orders on mount & attach cross-tab storage listener
  useEffect(() => {
    async function loadData() {
      await refreshProducts();
      await refreshOrders();
    }
    loadData();

    // Cross-tab synchronization so changes in farmer tab reflect in buyer tab immediately
    const handleStorageChange = (e) => {
      if (e.key === 'agri_exchange_orders') {
        const stored = getStoredOrders();
        if (stored && stored.length > 0) {
          setOrders(stored);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Refresh orders when switching dashboards & poll periodically for live synchronization
  useEffect(() => {
    refreshOrders();
    const interval = setInterval(() => {
      refreshOrders();
    }, 3500);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle Switch Role with authentic backend authentication
  const handleSwitchRole = async (roleKey) => {
    const authedUser = await switchDemoRole(roleKey);
    setCurrentUser(authedUser);
    const targetTab = roleKey.toLowerCase();
    setActiveTab(targetTab);
    await refreshOrders();
    showToast(`✅ Active role switched to ${authedUser.name || roleKey} (${roleKey}). JWT session verified.`);
  };

  // Handle Inspecting Price for a specific product
  const handleInspectPrice = (params) => {
    setAiModalParams(params);
    setIsAICalculatorOpen(true);
  };

  // Handle Login
  const handleLogin = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      const userRole = (res.user.role || '').toUpperCase();
      showToast(`🎉 Welcome back, ${res.user.name || res.user.username}! Signed in as ${userRole.replace('ROLE_', '')}.`);
      
      // Auto route to appropriate role workspace
      if (userRole.includes('FARMER')) {
        setActiveTab('farmer');
      } else if (userRole.includes('BUYER')) {
        setActiveTab('buyer');
      } else if (userRole.includes('ADMIN')) {
        setActiveTab('admin');
      } else {
        setActiveTab('marketplace');
      }
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handle Farmer Registration
  const handleFarmerRegister = async (farmerData) => {
    const res = await registerFarmer(farmerData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast(`🌾 Farmer registration successful! Welcome, ${res.user.name} (${res.user.landAreaAcres} Acres registered).`);
      setActiveTab('farmer');
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handle Buyer Registration
  const handleBuyerRegister = async (buyerData) => {
    const res = await registerBuyer(buyerData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast(`🏭 Industrial Buyer registered! Welcome, ${res.user.name}.`);
      setActiveTab('buyer');
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handle Logout
  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    showToast('👋 You have been securely signed out.');
    setActiveTab('login');
  };

  // Handle Purchase Request Submission (Status = PENDING until Farmer accepts)
  const handleBuyerPurchaseRequest = async (orderData) => {
    const buyerName = currentUser ? currentUser.name : 'Verified Biomass Consumer';
    const buyerOrg = currentUser ? currentUser.organizationName : 'Commercial Bioenergy Buyer';

    const payload = {
      ...orderData,
      buyerName,
      buyerOrg
    };

    const res = await submitBuyerPurchaseRequest(payload);
    if (res.success && res.order) {
      const newOrder = normalizeOrder(res.order);
      setOrders(prev => {
        // Prevent duplicate orders
        const exists = prev.some(o => o.id === newOrder.id || o.orderNumber === newOrder.orderNumber);
        const next = exists 
          ? prev.map(o => (o.id === newOrder.id || o.orderNumber === newOrder.orderNumber) ? newOrder : o)
          : [newOrder, ...prev];
        saveStoredOrders(next);
        return next;
      });


      showToast(`✅ Purchase request ${newOrder.orderNumber} sent to farmer (${orderData.farmerName})! Status: PENDING.`);
      refreshOrders();
    } else {
      showToast(`⚠️ ${res.error || 'Failed to submit purchase request. Please verify available stock.'}`);
    }
  };

  // Handle Farmer Accepting Order (Transitions PENDING -> APPROVED)
  const handleAcceptOrder = async (orderId) => {
    const res = await acceptPurchaseOrder(orderId);
    if (res.success && res.order) {
      const accepted = normalizeOrder(res.order);
      setOrders(prev => {
        // Update existing order in-place without duplicating
        const next = prev.map(o => (
          String(o.id) === String(orderId) || 
          o.orderNumber === orderId || 
          (accepted && (o.orderNumber === accepted.orderNumber || String(o.id) === String(accepted.id)))
        ) 
          ? { ...o, ...accepted, orderStatus: 'APPROVED' } 
          : o
        );
        saveStoredOrders(next);
        return next;
      });
      showToast(`✅ Order ${accepted.orderNumber} approved! Status updated to APPROVED in buyer dashboard.`);
      refreshOrders();
    } else {
      showToast(`⚠️ ${res.error || 'Failed to approve order.'}`);
    }
  };

  // Handle Farmer Rejecting Order (Transitions PENDING -> REJECTED)
  const handleRejectOrder = async (orderId) => {
    const targetOrder = orders.find(o => String(o.id) === String(orderId) || o.orderNumber === orderId);
    const res = await rejectPurchaseOrder(orderId);
    if (res.success) {
      const rejected = res.order ? normalizeOrder(res.order) : null;
      setOrders(prev => {
        const next = prev.map(o => (
          String(o.id) === String(orderId) || 
          o.orderNumber === orderId || 
          (rejected && (o.orderNumber === rejected.orderNumber || String(o.id) === String(rejected.id)))
        ) 
          ? { ...o, ...(rejected || {}), orderStatus: 'REJECTED', paymentStatus: 'REFUNDED' } 
          : o
        );
        saveStoredOrders(next);
        return next;
      });

      // Restore product quantity if it was already dispatched
      if (targetOrder && targetOrder.orderStatus === 'DISPATCHED') {
        setProducts(prev => prev.map(p => {
          if (p.title === targetOrder.productTitle || p.id === targetOrder.productId) {
            return { 
              ...p, 
              availableQuantityTons: (p.availableQuantityTons || 0) + (targetOrder.quantityTons || 0),
              status: 'AVAILABLE'
            };
          }
          return p;
        }));
      }

      showToast(`❌ Order request rejected. Status updated to REJECTED in buyer dashboard.`);
      refreshOrders();
    } else {
      showToast(`⚠️ ${res.error || 'Failed to reject order.'}`);
    }
  };

  // Handle Farmer Creating Product (Persisted in MySQL via Spring Boot API)
  const handleCreateProduct = async (productData) => {
    const res = await createMarketplaceProduct(productData);
    if (res.success && res.product) {
      const saved = res.product;
      setProducts(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
      showToast(`🌾 By-product lot "${saved.title}" (ID: #${saved.id}) published live to national market!`);
      await refreshProducts();
      return { success: true, product: saved };
    } else {
      showToast(`⚠️ ${res.error || 'Failed to publish by-product lot.'}`);
      return { success: false, error: res.error };
    }
  };

  // Handle Farmer Confirming Dispatch (Strict Workflow: PENDING -> APPROVED -> DISPATCHED)
  const handleConfirmDispatch = async (orderId) => {
    const res = await dispatchPurchaseOrder(orderId);
    if (res.success && res.order) {
      const dispatched = normalizeOrder(res.order);
      setOrders(prev => {
        const next = prev.map(o => (
          String(o.id) === String(orderId) || 
          o.orderNumber === orderId || 
          (dispatched && (o.orderNumber === dispatched.orderNumber || String(o.id) === String(dispatched.id)))
        ) ? { ...o, ...dispatched, orderStatus: 'DISPATCHED' } : o);
        saveStoredOrders(next);
        return next;
      });

      // Synchronize product state locally
      setProducts(prev => prev.map(p => {
        if (p.id === dispatched.productId || p.title === dispatched.productTitle) {
          const currentAvailable = p.availableQuantityTons != null ? p.availableQuantityTons : p.quantityTons;
          const remaining = Math.max(0, currentAvailable - (dispatched.quantityTons || 0));
          return {
            ...p,
            availableQuantityTons: remaining,
            status: remaining <= 0 ? 'SOLD' : 'AVAILABLE'
          };
        }
        return p;
      }));

      showToast(`🚚 Order ${dispatched.orderNumber || orderId} confirmed as DISPATCHED! Inventory synchronized.`);
      await refreshProducts();
      await refreshOrders();
      return { success: true, order: dispatched };
    } else {
      showToast(`⚠️ ${res.error || 'Failed to confirm dispatch. Please verify order status.'}`);
      return { success: false, error: res.error };
    }
  };

  // Handle Order Status Transitions (e.g. DISPATCHED, DELIVERED)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'DISPATCHED') {
      return handleConfirmDispatch(orderId);
    }
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success && res.order) {
      const updated = normalizeOrder(res.order);
      setOrders(prev => {
        const next = prev.map(o => (
          String(o.id) === String(orderId) || 
          o.orderNumber === orderId || 
          (updated && (o.orderNumber === updated.orderNumber || String(o.id) === String(updated.id)))
        ) ? { ...o, ...updated } : o);
        saveStoredOrders(next);
        return next;
      });
      if (newStatus === 'DELIVERED' || newStatus === 'COMPLETED') {
        showToast(`🚚 Delivery verified! Escrow payout released to farmer.`);
      } else {
        showToast(`📦 Order status updated to: ${newStatus}`);
      }
      await refreshOrders();
    } else {
      showToast(`⚠️ ${res.error || 'Failed to update order status.'}`);
    }
  };

  // Handle Negotiation Offer / Inquiry
  const handleSendInquiry = (inquiryData) => {
    const senderName = currentUser ? currentUser.name : 'Prospective Buyer';
    const newInquiry = {
      id: Date.now(),
      productTitle: inquiryData.productTitle,
      buyerName: senderName,
      offeredPricePerTon: inquiryData.offeredPricePerTon,
      requestedQuantityTons: inquiryData.requestedQuantityTons,
      message: inquiryData.message,
      status: 'PENDING'
    };
    setInquiries(prev => [newInquiry, ...prev]);
    showToast(`📨 Negotiation offer submitted to farmer at ₹${inquiryData.offeredPricePerTon}/MT.`);
  };

  const isPublicPage = ['home', 'about', 'features', 'contact'].includes(activeTab);

  return (
    <div className="app-container">
      {/* Top Header - Section 2 */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onOpenAICalculator={() => {
          setAiModalParams({});
          setIsAICalculatorOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        
        {/* 1. Home Page (Section 3: Hero, features, benefits, about, contact) */}
        {isPublicPage && (
          <HomePage 
            onGetStarted={() => {
              if (currentUser) {
                const role = (currentUser.role || '').toUpperCase();
                if (role.includes('FARMER')) setActiveTab('farmer');
                else if (role.includes('BUYER')) setActiveTab('buyer');
                else setActiveTab('admin');
              } else {
                setActiveTab('register-farmer');
              }
            }}
            onNavigateToMarketplace={() => setActiveTab('marketplace')}
            onOpenAICalculator={() => {
              setAiModalParams({});
              setIsAICalculatorOpen(true);
            }}
          />
        )}

        {/* 2. Login Page */}
        {activeTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLogin}
            onNavigateToFarmerRegister={() => setActiveTab('register-farmer')}
            onNavigateToBuyerRegister={() => setActiveTab('register-buyer')}
            onNavigateToMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {/* 3. Farmer Registration Page */}
        {activeTab === 'register-farmer' && (
          <FarmerRegisterPage
            onRegisterSuccess={handleFarmerRegister}
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToBuyerRegister={() => setActiveTab('register-buyer')}
          />
        )}

        {/* 4. Buyer Registration Page */}
        {activeTab === 'register-buyer' && (
          <BuyerRegisterPage
            onRegisterSuccess={handleBuyerRegister}
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToFarmerRegister={() => setActiveTab('register-farmer')}
          />
        )}

        {/* 5. Biomass Marketplace View (Section 5) */}
        {activeTab === 'marketplace' && (
          <Marketplace 
            products={products}
            currentUser={currentUser || DEMO_USERS.BUYER}
            onInspectPrice={handleInspectPrice}
            onPlaceOrder={handleBuyerPurchaseRequest}
            onSendInquiry={handleSendInquiry}
          />
        )}

        {/* 6. Farmer Hub & Dashboard (Section 4, 6, 7, 8, 9) */}
        {activeTab === 'farmer' && (
          <FarmerDashboard 
            products={products}
            orders={orders}
            inquiries={inquiries}
            currentUser={currentUser || DEMO_USERS.FARMER}
            onCreateProduct={handleCreateProduct}
            onAcceptOrder={handleAcceptOrder}
            onRejectOrder={handleRejectOrder}
            onConfirmDispatch={handleConfirmDispatch}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefreshOrders={refreshOrders}
            onRefreshProducts={refreshProducts}
            onLogout={handleLogout}
            onInspectPrice={handleInspectPrice}
            onPlaceOrder={handleBuyerPurchaseRequest}
            onSendInquiry={handleSendInquiry}
          />
        )}

        {/* 7. Buyer Dashboard (Section 10) */}
        {activeTab === 'buyer' && (
          <BuyerDashboard 
            products={products}
            orders={orders}
            currentUser={currentUser || DEMO_USERS.BUYER}
            onInspectPrice={handleInspectPrice}
            onSubmitPurchaseRequest={handleBuyerPurchaseRequest}
            onPlaceOrder={handleBuyerPurchaseRequest}
            onSendInquiry={handleSendInquiry}
            onRefreshOrders={refreshOrders}
            onLogout={handleLogout}
            onNavigateToMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {/* 8. Admin Dashboard (Section 12) */}
        {activeTab === 'admin' && (
          <AdminDashboard 
            products={products}
            orders={orders}
            onOpenAICalculator={() => {
              setAiModalParams({});
              setIsAICalculatorOpen(true);
            }}
          />
        )}
      </main>

      {/* Standalone XGBoost Price Prediction Modal */}
      <XGBoostModal 
        isOpen={isAICalculatorOpen}
        onClose={() => setIsAICalculatorOpen(false)}
        initialParams={aiModalParams}
      />

      {/* Toast Feedback */}
      {toast && (
        <div className="toast-bar">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
