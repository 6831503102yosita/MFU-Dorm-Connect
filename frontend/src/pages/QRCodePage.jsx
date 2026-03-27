import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { StatusBar } from '../components/Shared';

function drawQR(canvas, data) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 180;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  let hash = 0;
  for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash = hash & hash; }
  const modules = 21, mod = Math.floor(size / modules), off = Math.floor((size - modules * mod) / 2);
  ctx.fillStyle = '#111827';
  [[0, 0], [14, 0], [0, 14]].forEach(([fx, fy]) => {
    ctx.fillRect(off + fx * mod, off + fy * mod, 7 * mod, 7 * mod);
    ctx.fillStyle = '#fff'; ctx.fillRect(off + (fx + 1) * mod, off + (fy + 1) * mod, 5 * mod, 5 * mod);
    ctx.fillStyle = '#111827'; ctx.fillRect(off + (fx + 2) * mod, off + (fy + 2) * mod, 3 * mod, 3 * mod);
  });
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) continue;
      if (Math.abs(hash * (r * modules + c) * 2654435761) % 3 === 0) {
        ctx.fillRect(off + c * mod + 1, off + r * mod + 1, mod - 1, mod - 1);
      }
    }
  }
}

export default function QRCodePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (user) drawQR(canvasRef.current, `${user.student_id}|${user.dorm_building}-${user.room_number}|${user.full_name}`);
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topnav">
        <StatusBar dark />
        <div className="topnav-title">{t('qr.title')}</div>
        <div className="topnav-sub">{t('qr.subtitle')}</div>
      </div>
      <div className="scrl">
        <div style={{ padding: '20px 22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="card" style={{ padding: '26px 22px', width: '100%', textAlign: 'center', boxShadow: 'var(--sh2)' }}>
            <canvas ref={canvasRef} width={180} height={180} style={{ margin: '0 auto 18px', display: 'block' }} />
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--t1)', marginBottom: 3 }}>{user?.full_name}</div>
            <div style={{ fontSize: 13, color: 'var(--t2)' }}>{t('qr.studentId')}: {user?.student_id}</div>
            <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
            {[['qr.building', user?.dorm_building], ['qr.room', user?.room_number], ['qr.academicYear', '2025–2026']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}>
                <span style={{ color: 'var(--t2)' }}>{t(k)}</span>
                <span style={{ fontWeight: 700, color: 'var(--t1)' }}>{v}</span>
              </div>
            ))}
            <div style={{ background: '#FEF3C7', borderRadius: 'var(--rads)', padding: '13px 15px', marginTop: 18, display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>ℹ️</span>
              <span style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>{t('qr.hint')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
