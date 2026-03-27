import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { parcelsAPI, notificationsAPI } from '../services/api';
import { StatusBar, Badge } from '../components/Shared';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    parcelsAPI.list(false).then(r => setParcels(r.data.parcels.slice(0, 2))).catch(() => {});
    notificationsAPI.listAnnouncements(user?.dorm_building).then(r => setAnnouncements(r.data.announcements.slice(0, 1))).catch(() => {});
    notificationsAPI.list().then(r => setUnread(r.data.unread_count)).catch(() => {});
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('home.greeting') : hour < 18 ? t('home.greeting') : t('home.greeting');

  const FEATURES = [
    { icon: '📦', title: t('nav.parcels'), desc: t('parcels.title'), to: '/parcels', cls: 'red' },
    { icon: '🔧', title: t('nav.repair'), desc: t('repair.subtitle'), to: '/repair', cls: 'gold' },
    { icon: '📲', title: t('nav.qrCode'), desc: t('qr.subtitle'), to: '/qr', cls: 'blue' },
    { icon: '📋', title: t('repair.myRepairsTitle'), desc: t('repair.title'), to: '/my-repairs', cls: 'green' },
  ];

  const iconBg = { red: '#FEE2E6', gold: '#FEF3C7', blue: '#DBEAFE', green: '#D1FAE5' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#C8102E,#9B0C23)', padding: '0 22px 22px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,.06)', borderRadius: '50%' }} />
        <StatusBar light />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 16px', position: 'relative' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 13 }}>{greeting} 👋</div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{user?.full_name?.split(' ')[0]} {user?.full_name?.split(' ')[1]?.[0] ? user.full_name.split(' ')[1][0] + '.' : ''}</div>
          </div>
          <button onClick={() => navigate('/notifications')} style={{ width: 40, height: 40, background: 'rgba(255,255,255,.15)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, position: 'relative', cursor: 'pointer', border: 'none', flexShrink: 0 }}>
            🔔
            {unread > 0 && <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#F5A623', borderRadius: '50%', border: '2px solid #C8102E' }} />}
          </button>
        </div>
        {/* Announcement */}
        {announcements[0] ? (
          <div style={{ background: 'rgba(255,255,255,.14)', borderRadius: 13, padding: '12px 14px', border: '1px solid rgba(255,255,255,.2)', display: 'flex', gap: 10 }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>📢</div>
            <div>
              <div style={{ display: 'inline-block', background: '#F5A623', color: '#7c3a00', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 50, marginBottom: 4 }}>{t('home.announcementLabel')}</div>
              <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.4 }}>{t('lang') === 'th' ? announcements[0].body_th : announcements[0].body_en}</div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 13, padding: '12px 14px', border: '1px solid rgba(255,255,255,.2)' }}>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>{t('announcements.noAnnouncements')}</div>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="scrl">
        <div style={{ padding: '18px 18px 20px' }}>
          {/* Services */}
          <div style={{ marginBottom: 12 }}><div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{t('home.services')}</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 22 }}>
            {FEATURES.map(f => (
              <button key={f.to} onClick={() => navigate(f.to)} style={{ background: 'var(--card)', borderRadius: 'var(--rad)', padding: '18px 15px', boxShadow: 'var(--sh1)', cursor: 'pointer', textAlign: 'left', border: 'none', position: 'relative', overflow: 'hidden', transition: 'transform .15s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(.96)'} onMouseUp={e => e.currentTarget.style.transform = ''} onTouchStart={e => e.currentTarget.style.transform = 'scale(.96)'} onTouchEnd={e => e.currentTarget.style.transform = ''}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: iconBg[f.cls], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, marginBottom: 11 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.4 }}>{f.desc}</div>
              </button>
            ))}
          </div>

          {/* Recent parcels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{t('home.recentParcels')}</div>
            <button onClick={() => navigate('/parcels')} style={{ fontSize: 13, color: 'var(--r)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>{t('common.seeAll')}</button>
          </div>
          <div className="card" style={{ padding: '4px 14px 6px', marginBottom: 14 }}>
            {parcels.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--t2)', fontSize: 13 }}>{t('parcels.noCurrentParcels')}</div>
            ) : parcels.map(p => (
              <div key={p.id} onClick={() => navigate('/parcels')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>📮</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{p.tracking_number}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)' }}>{p.carrier}</div>
                </div>
                <Badge status={p.status} />
              </div>
            ))}
          </div>

          {/* Public board shortcut */}
          <button onClick={() => navigate('/public-board')} style={{ width: '100%', background: 'linear-gradient(135deg,#1e3a5f,#111827)', borderRadius: 'var(--rad)', padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: 'none', textAlign: 'left' }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{t('home.publicBoard')}</div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>{t('home.publicBoardDesc')}</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 16 }}>›</div>
          </button>
        </div>
      </div>
    </div>
  );
}
