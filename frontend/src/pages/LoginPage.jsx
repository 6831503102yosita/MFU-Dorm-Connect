import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { StatusBar, Toast } from '../components/Shared';
import { useToast } from '../hooks/useToast';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!email.trim()) e.email = t('validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('validation.emailInvalid');
    if (!password) e.password = t('validation.passwordRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
  await login(email, password);
  navigate('/');
} catch (err) {
  console.log('LOGIN ERROR:', err);
showToast(
  err.response?.data?.error ||
  err.message ||
  'Login failed',
  'error'
);
} finally {
  setLoading(false);
}
  }

  function switchLang(l) {
    i18n.changeLanguage(l);
    localStorage.setItem('mfu_lang', l);
  }

  return (
    <div className="full-page" style={{ maxWidth: '100%' }}>
      <div style={{ background: 'linear-gradient(160deg,#C8102E 0%,#9B0C23 48%,#0f172a 100%)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '48px 32px 24px', textAlign: 'center' }}>
          <div style={{ width: 68, height: 68, background: 'rgba(255,255,255,.15)', borderRadius: 22, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, border: '1px solid rgba(255,255,255,.25)' }}>🏠</div>
          <div style={{ color: '#fff', fontSize: 25, fontWeight: 800 }}>{t('common.appName')}</div>
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 3 }}>{t('auth.subtitle')}</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: '28px 28px 0 0', padding: '28px 24px 40px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div className="lang-toggle">
              <button className={`lang-btn${i18n.language === 'en' ? ' active' : ''}`} onClick={() => switchLang('en')}>🇬🇧 EN</button>
              <button className={`lang-btn${i18n.language === 'th' ? ' active' : ''}`} onClick={() => switchLang('th')}>🇹🇭 TH</button>
            </div>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">{t('auth.emailLabel')}</label>
              <input className={`form-input${errors.email ? ' has-error' : ''}`} type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} placeholder={t('auth.emailPlaceholder')} autoComplete="email" />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.passwordLabel')}</label>
              <input className={`form-input${errors.password ? ' has-error' : ''}`} type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} placeholder={t('auth.passwordPlaceholder')} autoComplete="current-password" />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>
            <button className="btn btn-red" type="submit" disabled={loading}>
              {loading ? <span className="spinner sm" /> : t('auth.loginButton')}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--t2)' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={{ color: 'var(--r)', fontWeight: 700, textDecoration: 'none' }}>{t('auth.signUpLink')}</Link>
          </div>
        </div>
      </div>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
