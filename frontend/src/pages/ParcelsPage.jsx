import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { parcelsAPI } from '../services/api';
import { StatusBar, Badge, ParcelStateBar, Modal, ConfirmModal, Toast } from '../components/Shared';
import { useToast } from '../hooks/useToast';
import { Spinner } from '../components/Shared';

export default function ParcelsPage() {
  const { t } = useTranslation();
  const { toast, showToast, clearToast } = useToast();
  const [tab, setTab] = useState('current');
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ tracking_number: '', carrier: '', location: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, h] = await Promise.all([parcelsAPI.list(false), parcelsAPI.list(true)]);
      setCurrent(c.data.parcels);
      setHistory(h.data.parcels);
    } catch { showToast(t('common.error'), 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function validateForm() {
    const e = {};
    if (!form.tracking_number.trim()) e.tracking_number = t('validation.trackingRequired');
    if (!form.carrier.trim()) e.carrier = t('validation.carrierRequired');
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleAdd(ev) {
    ev.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await parcelsAPI.create(form);
      setAddOpen(false);
      setForm({ tracking_number: '', carrier: '', location: '', notes: '' });
      showToast(t('parcels.addSuccess'), 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    try {
      await parcelsAPI.delete(id);
      showToast(t('parcels.deleteSuccess'), 'success');
      load();
    } catch { showToast(t('common.error'), 'error'); }
  }

  const displayList = tab === 'current' ? current : history;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topnav">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><div className="topnav-title">{t('parcels.title')}</div><div className="topnav-sub">{current.length} {t('parcels.waiting')}</div></div>
          {/* <button className="btn btn-sm btn-red" style={{ marginTop: 4 }} onClick={() => setAddOpen(true)}>+ {t('parcels.addParcel')}</button> */}
        </div>
      </div>
      <div style={{ display: 'flex', background: 'var(--bg)', padding: 3, margin: '14px 20px 0', borderRadius: 'var(--rads)' }}>
        {['current', 'history'].map(tab_ => (
          <button key={tab_} onClick={() => setTab(tab_)} style={{ flex: 1, padding: 9, fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: tab === tab_ ? 'var(--card)' : 'transparent', color: tab === tab_ ? 'var(--r)' : 'var(--t2)', boxShadow: tab === tab_ ? 'var(--sh1)' : 'none', transition: 'all .2s' }}>
            {tab_ === 'current' ? t('parcels.currentTab') : t('parcels.historyTab')}
          </button>
        ))}
      </div>
      <div className="scrl">
        <div style={{ padding: '14px 18px 20px' }}>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          : displayList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t2)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <div>{tab === 'current' ? t('parcels.noCurrentParcels') : t('parcels.noHistory')}</div>
            </div>
          ) : displayList.map(p => (
            <div key={p.id} className="card" style={{ padding: 15, marginBottom: 10, display: 'flex', gap: 13 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: '#FEE2E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📮</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 2 }}>{p.tracking_number}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 7 }}>{p.carrier}</div>
                <Badge status={p.status} />
                <ParcelStateBar status={p.status} t={t} />
                {p.location && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>📍 {p.location}</div>}
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>📅 {new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <button onClick={() => setConfirmDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 16, padding: 4, alignSelf: 'flex-start' }}>🗑</button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Parcel Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('parcels.addParcel')}>
        <form onSubmit={handleAdd} noValidate>
          <div className="form-group">
            <label className="form-label">{t('parcels.trackingNumber')}</label>
            <input className={`form-input${formErrors.tracking_number ? ' has-error' : ''}`} value={form.tracking_number} onChange={e => { setForm(p => ({...p, tracking_number: e.target.value})); setFormErrors(p => ({...p, tracking_number: ''})); }} placeholder={t('parcels.trackingPlaceholder')} />
            {formErrors.tracking_number && <div className="form-error">{formErrors.tracking_number}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('parcels.carrier')}</label>
            <input className={`form-input${formErrors.carrier ? ' has-error' : ''}`} value={form.carrier} onChange={e => { setForm(p => ({...p, carrier: e.target.value})); setFormErrors(p => ({...p, carrier: ''})); }} placeholder={t('parcels.carrierPlaceholder')} />
            {formErrors.carrier && <div className="form-error">{formErrors.carrier}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('parcels.location')} <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--t3)' }}>({t('common.optional')})</span></label>
            <input className="form-input" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder={t('parcels.locationPlaceholder')} />
          </div>
          <button className="btn btn-red" type="submit" disabled={submitting}>
            {submitting ? <span className="spinner sm" /> : t('common.save')}
          </button>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => handleDelete(confirmDelete)} message={t('parcels.deleteConfirm')} confirmText={t('common.delete')} cancelText={t('common.cancel')} />
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
