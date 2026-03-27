import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationsAPI } from '../services/api';
import { StatusBar, Toast } from '../components/Shared';
import { Spinner } from '../components/Shared';
import { useToast } from '../hooks/useToast';

const TYPE_ICON = { pkg: '📦', rep: '🔧', ann: '📢' };
const TYPE_BG = { pkg: '#D1FAE5', rep: '#DBEAFE', ann: '#FEF3C7' };

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const { toast, showToast, clearToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await notificationsAPI.list(); setNotifications(r.data.notifications); }
    catch { showToast(t('common.error'), 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id) {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  }

  async function markAllRead() {
    try { await notificationsAPI.markAllRead(); setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 }))); }
    catch { showToast(t('common.error'), 'error'); }
  }

  const unread = notifications.filter(n => !n.is_read).length;
  const lang = i18n.language === 'th' ? 'th' : 'en';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topnav">
        <StatusBar dark />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><div className="topnav-title">{t('notifications.title')}</div><div className="topnav-sub">{unread} {t('notifications.newCount')}</div></div>
          {unread > 0 && <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={markAllRead}>{t('notifications.markAllRead')}</button>}
        </div>
      </div>
      <div className="scrl">
        <div style={{ padding: '12px 18px 20px' }}>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t2)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <div>{t('notifications.noNotifications')}</div>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} className="card"
              style={{ padding: '13px 15px', marginBottom: 9, display: 'flex', gap: 12, borderLeft: !n.is_read ? '3px solid var(--r)' : 'none', cursor: !n.is_read ? 'pointer' : 'default', opacity: n.is_read ? .7 : 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: TYPE_BG[n.type] || '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                {TYPE_ICON[n.type] || '📢'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 2 }}>{lang === 'th' ? n.title_th : n.title_en}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.4 }}>{lang === 'th' ? n.body_th : n.body_en}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--r)', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
