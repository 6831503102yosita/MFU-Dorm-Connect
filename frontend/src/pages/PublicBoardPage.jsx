import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parcelsAPI } from '../services/api';

export default function PublicBoardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [readyParcels, setReadyParcels] = useState([]);

  useEffect(() => {
    // Public board shows only ready parcels — PDPA: show room + initials only
    const token = localStorage.getItem('mfu_token');
    if (token) {
      parcelsAPI.list(false).then(r => {
        const ready = r.data.parcels.filter(p => p.status === 'ready' || p.status === 'notified');
        setReadyParcels(ready);
      }).catch(() => {});
    }
    const interval = setInterval(() => {
      if (token) {
        parcelsAPI.list(false).then(r => {
          const ready = r.data.parcels.filter(p => p.status === 'ready' || p.status === 'notified');
          setReadyParcels(ready);
        }).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // PDPA: mask full name to initials only
  function maskName(fullName) {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    return parts.map(p => p[0]?.toUpperCase() + '.').join('');
  }

  return (
    <div className="full-page" style={{ background: '#1e3a5f' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#C8102E,#9B0C23)', padding: '16px 20px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 10, fontWeight: 700, letterSpacing: .5, marginBottom: 3 }}>{t('publicBoard.screenLabel')}</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{t('publicBoard.title')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#10B981', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 50, animation: 'pulse 2s infinite' }}>{t('publicBoard.live')}</div>
          <button onClick={() => navigate('/')} style={{ color: 'rgba(255,255,255,.6)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      </div>

      {/* PDPA Notice */}
      <div style={{ background: 'rgba(255,255,255,.07)', padding: '10px 16px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>🔒</span>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4 }}>{t('publicBoard.pdpaNotice')}</div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {readyParcels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,.4)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>{t('publicBoard.noParcels')}</div>
          </div>
        ) : readyParcels.map((p, i) => (
          <div key={p.id} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 'var(--rads)', padding: '14px 16px', marginBottom: 10, border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F5A623', width: 32, textAlign: 'center', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              {/* PDPA: initials only, not full name */}
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{maskName(p.full_name || 'User')}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>Room {p.dorm_building}-{p.room_number}</div>
            </div>
            <div style={{ fontSize: 11, background: 'rgba(245,166,35,.2)', color: '#F5A623', padding: '3px 9px', borderRadius: 50, fontWeight: 700 }}>1 pkg</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: 'rgba(0,0,0,.2)', padding: '12px 16px 20px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>{t('publicBoard.footer')} • มหาวิทยาลัยแม่ฟ้าหลวง</div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
    </div>
  );
}
