import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { StatusBar, Toast, DORM_BUILDINGS } from '../components/Shared';
import { useToast } from '../hooks/useToast';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { toast, showToast, clearToast } = useToast();
  const [form, setForm] = useState({ full_name: '', student_id: '', email: '', password: '', confirm_password: '', dorm_building: 'F3', room_number: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); }

  function validate() {
    const e = {};
    if (!form.full_name.trim()) e.full_name = t('validation.fullNameRequired');
    if (!form.student_id.trim()) e.student_id = t('validation.studentIdRequired');
    if (!form.email.trim()) e.email = t('validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('validation.emailInvalid');
    if (!form.password) e.password = t('validation.passwordRequired');
    else if (form.password.length < 6 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) e.password = t('validation.passwordWeak');
    if (form.password !== form.confirm_password) e.confirm_password = t('validation.passwordMismatch');
    if (!form.room_number.trim()) e.room_number = t('validation.roomRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ full_name: form.full_name, student_id: form.student_id, email: form.email, password: form.password, dorm_building: form.dorm_building, room_number: form.room_number });
    } catch (err) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  const F = (k, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className={`form-input${errors[k] ? ' has-error' : ''}`} type={type} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} />
      {errors[k] && <div className="form-error">{errors[k]}</div>}
    </div>
  );

  return (
    <div className="full-page">
      <div style={{ background: 'linear-gradient(160deg,#C8102E 0%,#9B0C23 40%,#0f172a 100%)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StatusBar light />
        <div style={{ padding: '44px 24px 18px', color: '#fff' }}>
          <Link to="/login" style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>←</Link>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>{t('auth.registerTitle')}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 3 }}>{t('auth.subtitle')}</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: '28px 28px 0 0', padding: '24px 24px 120px', flex: 1, overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} noValidate>
            {F('full_name', t('auth.fullNameLabel'), 'text', t('auth.fullNamePlaceholder'))}
            {F('student_id', t('auth.studentIdLabel'), 'text', t('auth.studentIdPlaceholder'))}
            {F('email', t('auth.emailLabel'), 'email', t('auth.emailPlaceholder'))}
            {F('password', t('auth.passwordLabel'), 'password', t('auth.passwordPlaceholder'))}
            {F('confirm_password', t('auth.confirmPasswordLabel'), 'password', t('auth.confirmPasswordPlaceholder'))}
            <div className="form-group">
              <label className="form-label">{t('auth.dormBuildingLabel')}</label>
              <select className="form-input" value={form.dorm_building} onChange={e => set('dorm_building', e.target.value)}>
                {DORM_BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {F('room_number', t('auth.roomNumberLabel'), 'text', t('auth.roomNumberPlaceholder'))}
            <button className="btn btn-red" type="submit" disabled={loading}>
              {loading ? <span className="spinner sm" /> : t('auth.registerButton')}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--t2)' }}>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" style={{ color: 'var(--r)', fontWeight: 700, textDecoration: 'none' }}>{t('auth.signInLink')}</Link>
          </div>
        </div>
      </div>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
