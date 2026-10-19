import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_USERS } from '../services/api';

export default function AdminDashboard({ products, orders, onOpenAICalculator }) {
  const { t } = useTranslation();
  const [userList, setUserList] = useState([
    DEMO_USERS.FARMER,
    DEMO_USERS.BUYER,
    {
      id: 3,
      name: 'Ramesh Patil',
      email: 'farmer.patil@agriexchange.org',
      role: 'ROLE_FARMER',
      organizationName: 'Sahyadri Agro Residuaries',
      state: 'Maharashtra',
      isVerified: true
    },
    {
      id: 7,
      name: 'Sunita Deshmukh',
      email: 'buyer.ecopulp@ecopaper.com',
      role: 'ROLE_BUYER',
      organizationName: 'EcoPulp & Packaging Mills',
      state: 'Maharashtra',
      isVerified: true
    },
    {
      id: 8,
      name: 'Karthik Raman',
      email: 'buyer.agrifeed@feedglobal.com',
      role: 'ROLE_BUYER',
      organizationName: 'NutriFeed Cattle & Poultry Organics',
      state: 'Karnataka',
      isVerified: false
    }
  ]);

  const totalBiomassListed = products.reduce((acc, p) => acc + (p.quantityTons || 0), 0);
  const totalGMV = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalCarbonOffset = (totalBiomassListed * 1.35).toFixed(0);

  const toggleVerification = (userId) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isVerified: !u.isVerified };
      }
      return u;
    }));
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', color: 'var(--green-900)', fontWeight: 800 }}>
            🛡️ {t('admin.title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
            {t('admin.subtitle')}
          </p>
        </div>

        <button type="button" className="btn-ai-predict" onClick={onOpenAICalculator}>
          ⚡ {t('admin.sandbox_btn')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--green-600)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--green-800)', fontWeight: 700, textTransform: 'uppercase' }}>
            {t('admin.total_listings')}
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--green-900)', margin: '0.35rem 0 0.15rem' }}>
            {totalBiomassListed} MT
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Across 6 Northern States</span>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
            CO₂ Avoided
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0369a1', margin: '0.35rem 0 0.15rem' }}>
            {totalCarbonOffset} MT
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Certified Open-Burning Reductions</span>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid #b45309' }}>
          <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>
            Gross Platform GMV
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', margin: '0.35rem 0 0.15rem' }}>
            ₹{totalGMV.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Processed Through Escrow</span>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--green-700)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--green-800)', fontWeight: 700, textTransform: 'uppercase' }}>
            {t('admin.active_farmers')}
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--green-900)', margin: '0.35rem 0 0.15rem' }}>
            1,248
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Direct Bank KYC Verified</span>
        </div>
      </div>

      {/* XGBoost Model Telemetry Box */}
      <div className="white-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--green-900)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡</span> {t('admin.telemetry_title')}
          </h3>
          <span className="status-badge APPROVED">
            ● {t('admin.active_healthy')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--green-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-200)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--green-800)', fontWeight: 700 }}>{t('admin.fit_score')}</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-800)', marginTop: '4px' }}>0.9765</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>97.65% Accuracy</span>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('admin.mae')}</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>₹94.56</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mean Absolute Deviation</span>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('admin.rmse')}</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>₹124.42</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Root Mean Square Error</span>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('admin.training_rows')}</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>7,520</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cross-Validated Rows</span>
          </div>
        </div>
      </div>

      {/* KYC Verification Table */}
      <div className="white-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--green-900)', fontWeight: 700, marginBottom: '1.25rem' }}>
          👥 {t('admin.kyc_title')}
        </h3>

        <div className="table-responsive-box">
          <table className="clean-table">
            <thead>
              <tr>
                <th>{t('admin.th_entity_name')}</th>
                <th>{t('admin.th_email')}</th>
                <th>{t('admin.th_role')}</th>
                <th>{t('admin.th_organization')}</th>
                <th>{t('admin.th_state')}</th>
                <th>{t('admin.th_verification_status')}</th>
                <th>{t('admin.th_action')}</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role?.includes('FARMER') ? 'FARMER' : u.role?.includes('BUYER') ? 'BUYER' : 'ADMIN'}`}>
                      {u.role?.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td>{u.organizationName || 'Individual'}</td>
                  <td>{u.state}</td>
                  <td>
                    <span className={`status-badge ${u.isVerified ? 'APPROVED' : 'PENDING'}`}>
                      {u.isVerified ? t('admin.verified_badge') : t('admin.pending_badge')}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`btn-${u.isVerified ? 'secondary' : 'primary'}`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => toggleVerification(u.id)}
                    >
                      {u.isVerified ? t('admin.btn_revoke') : t('admin.btn_approve')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
