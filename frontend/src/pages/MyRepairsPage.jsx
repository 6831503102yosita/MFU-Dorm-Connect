import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wrench, House, Trash2 } from 'lucide-react';
import { repairsAPI } from '../services/api';
import { StatusBar, Badge, Toast, ConfirmModal } from '../components/Shared';
import { Spinner } from '../components/Shared';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export function MyRepairsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await repairsAPI.list();
      setRepairs(r.data.repairs);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    try {
      await repairsAPI.delete(id);
      showToast(t('repair.deleteSuccess'), 'success');
      load();
    } catch {
      showToast(t('common.error'), 'error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topnav">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="topnav-title">{t('repair.myRepairsTitle')}</div>
            <div className="topnav-sub">{repairs.length} requests</div>
          </div>
          <button
            className="btn btn-sm btn-red"
            style={{ marginTop: 4 }}
            onClick={() => navigate('/repair')}
          >
            {t('repair.newRequest')}
          </button>
        </div>
      </div>

      <div className="scrl">
        <div style={{ padding: '14px 18px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner />
            </div>
          ) : repairs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t2)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <Wrench size={40} strokeWidth={2} color="currentColor" />
              </div>
              <div>{t('repair.noRepairs')}</div>
            </div>
          ) : (
            repairs.map(r => (
              <div
                key={r.id}
                className="card"
                style={{ padding: 15, marginBottom: 10, display: 'flex', gap: 13 }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: '#FEE2E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Wrench size={20} strokeWidth={2} color="#C8102E" />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                      {r.title || `${r.category} Issue`}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>
                      #{r.ticket_id}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--t2)',
                      marginBottom: 7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <House size={13} strokeWidth={2} color="currentColor" />
                    <span>
                      {r.category} • {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Badge status={r.status} />

                  <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8, lineHeight: 1.4 }}>
                    {r.description}
                  </div>

                  {r.photo_urls?.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                      {r.photo_urls.map((url, i) => (
                        <img
                          key={i}
                          src={`${API_URL}${url}`}
                          alt=""
                          style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setConfirmDelete(r.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--t3)',
                    padding: 4,
                    alignSelf: 'flex-start',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={16} strokeWidth={2} color="currentColor" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        message={t('repair.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={clearToast}
        />
      )}
    </div>
  );
}

export default MyRepairsPage;