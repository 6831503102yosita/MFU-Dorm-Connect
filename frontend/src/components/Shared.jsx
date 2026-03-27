import { useEffect, useRef, useState } from 'react';

export function Spinner({ fullscreen, sm }) {
  if (fullscreen) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div className="spinner" />
      </div>
    );
  }
  return <div className={`spinner${sm ? ' sm' : ''}`} />;
}

export function StatusBar({ light }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`status-bar ${light ? 'light' : 'dark'}`} style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 26px 0', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
      <span>{time}</span>
      <span>📶 🔋</span>
    </div>
  );
}

export function Toast({ message, type = 'default', onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 2800);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return (
    <div className={`toast ${visible ? 'show' : ''} ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`}>
      {message}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span>{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, message, confirmText, cancelText }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <p style={{ fontSize: 15, color: 'var(--t1)', marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>{cancelText || 'Cancel'}</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }} style={{ flex: 1 }}>{confirmText || 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    scanned: ['badge-scanned', '📷'],
    notified: ['badge-notified', '🔔'],
    ready: ['badge-ready', '✅'],
    picked: ['badge-picked', '✅'],
    returned: ['badge-returned', '↩️'],
    pending: ['badge-pending', '⏳'],
    progress: ['badge-progress', '🔄'],
    done: ['badge-done', '✅'],
  };
  const [cls] = map[status] || ['badge-pending', '?'];
  const labels = { scanned: '📷 Scanned', notified: '🔔 Notified', ready: '✅ Ready', picked: '✅ Picked Up', returned: '↩️ Returned', pending: '⏳ Pending', progress: '🔄 In Progress', done: '✅ Done' };
  return <span className={`badge ${cls}`}>{labels[status] || status}</span>;
}

export function ParcelStateBar({ status, t }) {
  const states = ['scanned', 'notified', 'ready', 'picked'];
  const idx = states.indexOf(status);
  const labels = { scanned: t('parcels.stateScanned'), notified: t('parcels.stateNotified'), ready: t('parcels.stateReady'), picked: t('parcels.statePicked') };
  return (
    <div className="state-bar">
      {states.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div className="state-dot" key={s}>
            <div className={`state-circle${done ? ' done' : active ? ' active' : ''}`}>{done ? '✓' : i + 1}</div>
            <div className={`state-text${done ? ' done' : active ? ' active' : ''}`}>{labels[s]}</div>
          </div>
        );
      })}
    </div>
  );
}

export const DORM_BUILDINGS = [
  'F1','F2','F3','F4','F5','F6',
  'Lamduan 1','Lamduan 2','Lamduan 3','Lamduan 4','Lamduan 5','Lamduan 6','Lamduan 7',
  'Sakthong 1','Sakthong 2','Sakthong 3',
  'Chinese Dormitory 1','Chinese Dormitory 2','International Dormitory'
];
