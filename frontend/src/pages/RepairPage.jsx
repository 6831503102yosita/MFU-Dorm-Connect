import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { repairsAPI } from '../services/api';
import { StatusBar, Toast } from '../components/Shared';
import { useToast } from '../hooks/useToast';

const CATEGORIES = ['Electrical', 'Plumbing', 'Furniture', 'Internet', 'Other'];
const CAT_ICONS = { Electrical: '⚡', Plumbing: '🚿', Furniture: '🪑', Internet: '📡', Other: '❓' };

export default function RepairPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [category, setCategory] = useState('Electrical');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  function handlePhotos(e) {
    const files = Array.from(e.target.files);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) showToast('Max 3 photos allowed', 'error');
    setPhotos(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  }

  function removePhoto(i) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  function validate() {
    const e = {};
    if (!description.trim()) e.description = t('validation.descriptionRequired');
    else if (description.trim().length < 10) e.description = t('validation.descriptionMin');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('category', category);
      fd.append('description', description.trim());
      photos.forEach(f => fd.append('photos', f));
      const res = await repairsAPI.create(fd);
      setTicket(res.data.repair.ticket_id);
      setDescription('');
      setPhotos([]);
      setPreviews([]);
      setCategory('Electrical');
    } catch (err) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (ticket) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="topnav"><StatusBar dark /><div className="topnav-title">{t('repair.title')}</div></div>
        <div className="scrl">
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #86efac', borderRadius: 'var(--rad)', padding: '28px 24px', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 8 }}>{t('repair.ticketSuccess')}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#166534', letterSpacing: 1, marginBottom: 4 }}>#{ticket}</div>
              <div style={{ fontSize: 13, color: '#15803d' }}>{t('repair.ticketIdLabel')}</div>
            </div>
            <button className="btn btn-red" onClick={() => navigate('/my-repairs')} style={{ marginBottom: 12 }}>{t('repair.viewMyRepairs')}</button>
            <button className="btn btn-ghost" onClick={() => setTicket(null)}>{t('repair.newRepair')}</button>
          </div>
        </div>
        {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={clearToast} />}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topnav">
        <StatusBar dark />
        <div className="topnav-title">{t('repair.title')}</div>
        <div className="topnav-sub">{t('repair.subtitle')}</div>
      </div>
      <div className="scrl">
        <div style={{ padding: '18px 18px 100px' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">{t('repair.categoryLabel')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 4 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    style={{ background: category === cat ? '#FEE2E6' : 'var(--card)', border: `1.5px solid ${category === cat ? 'var(--r)' : 'var(--border)'}`, borderRadius: 'var(--rads)', padding: '11px 6px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
                    <div style={{ fontSize: 21, marginBottom: 3 }}>{CAT_ICONS[cat]}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: category === cat ? 'var(--r)' : 'var(--t2)' }}>{t(`repair.categories.${cat}`)}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('repair.descriptionLabel')}</label>
              <textarea className={`form-input${errors.description ? ' has-error' : ''}`} value={description} onChange={e => { setDescription(e.target.value); setErrors(p => ({...p, description: ''})); }} placeholder={t('repair.descriptionPlaceholder')} rows={4} />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('repair.photoLabel')}</label>
              <div className="photo-zone">
                <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)' }}>{t('repair.photoHint')}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>{t('repair.photoSubHint')}</div>
                {photos.length < 3 && <input type="file" accept="image/*" multiple onChange={handlePhotos} />}
              </div>
              {previews.length > 0 && (
                <div className="photo-previews">
                  {previews.map((src, i) => (
                    <div key={i} className="photo-thumb">
                      <img src={src} alt={`preview ${i}`} />
                      <div className="photo-del" onClick={() => removePhoto(i)}>✕</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-red" type="submit" disabled={submitting}>
              {submitting ? <span className="spinner sm" /> : t('repair.submitButton')}
            </button>
          </form>
        </div>
      </div>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
