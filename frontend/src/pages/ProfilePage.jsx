import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  ImagePlus,
  PencilLine,
  Lock,
  Globe,
  Bell,
  FileText,
  Info,
  LogOut,
  Building2,
  DoorOpen,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { StatusBar, Modal, Toast, DORM_BUILDINGS } from '../components/Shared';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: '',
    dorm_building: '',
    room_number: '',
    email: '',
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passErrors, setPassErrors] = useState({});
  const [passLoading, setPassLoading] = useState(false);

  const [notifToggles, setNotifToggles] = useState({
    parcels: true,
    repairs: true,
    announcements: true,
  });

  function openEdit() {
    setEditForm({
      full_name: user?.full_name || '',
      dorm_building: user?.dorm_building || 'F3',
      room_number: user?.room_number || '',
      email: user?.email || '',
    });
    setEditErrors({});
    setEditOpen(true);
  }

  function validateEdit() {
    const e = {};
    if (!editForm.full_name.trim()) e.full_name = t('validation.fullNameRequired');
    if (!editForm.email.trim()) e.email = t('validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) e.email = t('validation.emailInvalid');
    if (!editForm.room_number.trim()) e.room_number = t('validation.roomRequired');
    setEditErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSaveProfile(ev) {
    ev.preventDefault();
    if (!validateEdit()) return;
    setEditLoading(true);
    try {
      const res = await authAPI.updateProfile(editForm);
      updateUser(res.data.user);
      setEditOpen(false);
      showToast(t('profile.updateSuccess'), 'success');
    } catch (err) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setEditLoading(false);
    }
  }

  function validatePass() {
    const e = {};
    if (!passForm.current_password) e.current_password = t('validation.currentPasswordRequired');
    if (!passForm.new_password) e.new_password = t('validation.newPasswordRequired');
    else if (
      passForm.new_password.length < 6 ||
      !/[A-Z]/.test(passForm.new_password) ||
      !/[a-z]/.test(passForm.new_password) ||
      !/[0-9]/.test(passForm.new_password)
    ) {
      e.new_password = t('validation.passwordWeak');
    }
    if (passForm.new_password !== passForm.confirm_password) e.confirm_password = t('validation.passwordMismatch');
    setPassErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleChangePass(ev) {
    ev.preventDefault();
    if (!validatePass()) return;
    setPassLoading(true);
    try {
      await authAPI.changePassword({
        current_password: passForm.current_password,
        new_password: passForm.new_password,
      });
      setPassOpen(false);
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
      showToast(t('profile.passwordSuccess'), 'success');
    } catch (err) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setPassLoading(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await authAPI.uploadAvatar(fd);
      updateUser({ ...user, avatar_url: res.data.avatar_url });
      showToast(t('profile.avatarSuccess'), 'success');
    } catch (err) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    }
    e.target.value = '';
  }

  async function switchLang(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('mfu_lang', lang);
    setLangOpen(false);
    try {
      await authAPI.updateProfile({ language: lang });
      updateUser({ ...user, language: lang });
    } catch {}
  }

  const avatarSrc = user?.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${import.meta.env.VITE_API_URL}${user.avatar_url}`
    : '';

  const SETTINGS_SECTIONS = [
    {
      label: t('settings.account'),
      items: [
        {
          icon: PencilLine,
          bg: 'si-blue',
          label: t('settings.editProfile'),
          desc: t('settings.editProfileDesc'),
          action: openEdit,
        },
        {
          icon: Lock,
          bg: 'si-green',
          label: t('settings.changePassword'),
          desc: t('settings.changePasswordDesc'),
          action: () => {
            setPassForm({ current_password: '', new_password: '', confirm_password: '' });
            setPassErrors({});
            setPassOpen(true);
          },
        },
      ],
    },
    {
      label: t('settings.preferences'),
      items: [
        {
          icon: Globe,
          bg: 'si-gold',
          label: t('settings.language'),
          desc: i18n.language === 'th' ? 'ภาษาไทย' : 'English',
          action: () => setLangOpen(true),
        },
        {
          icon: Bell,
          bg: 'si-red',
          label: t('settings.notifications'),
          desc: t('settings.notificationsDesc'),
          action: () => setNotifOpen(true),
        },
      ],
    },
    {
      label: t('settings.other'),
      items: [
        {
          icon: FileText,
          bg: 'si-gray',
          label: t('settings.privacyPolicy'),
          desc: t('settings.pdpaCompliant'),
          action: () => setPrivacyOpen(true),
        },
        {
          icon: Info,
          bg: 'si-gray',
          label: t('settings.aboutApp'),
          action: () => setAboutOpen(true),
        },
        {
          icon: LogOut,
          bg: 'si-red',
          label: t('settings.logout'),
          action: () => setLogoutConfirm(true),
          danger: true,
        },
      ],
    },
  ];

  const INFO_ITEMS = [
    { icon: Building2, label: t('profile.dormitory'), val: user?.dorm_building },
    { icon: DoorOpen, label: t('profile.room'), val: user?.room_number },
    { icon: Mail, label: t('profile.email'), val: user?.email },
    { icon: ShieldCheck, label: t('profile.authMethod'), val: t('profile.emailAuth') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#C8102E,#9B0C23)',
          padding: '20px 22px 56px',
          textAlign: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div className="avatar-wrap">
          <div className="avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" />
            ) : (
              <User size={40} strokeWidth={1.8} color="#A5B4C3" />
            )}
          </div>

          <div className="avatar-edit">
            <ImagePlus size={14} strokeWidth={1.8} color="#B13A2E" />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} />
          </div>
        </div>

        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginTop: 10 }}>
          {user?.full_name}
        </div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, marginTop: 2 }}>
          ID: {user?.student_id}
        </div>
      </div>

      <div className="scrl">
        <div
          className="card"
          style={{
            margin: '36px 18px 14px',
            padding: 16,
            position: 'relative',
            zIndex: 2,
            boxShadow: 'var(--sh2)',
          }}
        >
          {INFO_ITEMS.map(({ icon: Icon, label, val }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}
              className="last-no-border"
            >
              <span
                style={{
                  width: 22,
                  textAlign: 'center',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={16} strokeWidth={1.8} color="#B13A2E" />
              </span>

              <div>
                <div style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 600 }}>{label}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--t1)',
                    wordBreak: 'break-all',
                  }}
                >
                  {val}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 20px 100px' }}>
          {SETTINGS_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--t3)',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: 7,
                  paddingLeft: 4,
                }}
              >
                {section.label}
              </div>

              <div className="settings-card">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      className={`settings-item${item.danger ? ' danger' : ''}`}
                      onClick={item.action}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      <div className={`settings-icon ${item.bg}`}>
                        <Icon
                          size={20}
                          strokeWidth={1.8}
                          color={item.danger ? '#DC2626' : '#B13A2E'}
                        />
                      </div>

                      <div className="si-txt" style={{ flex: 1 }}>
                        <div
                          className="settings-label"
                          style={{ color: item.danger ? '#DC2626' : 'var(--t1)' }}
                        >
                          {item.label}
                        </div>
                        {item.desc && <div className="settings-desc">{item.desc}</div>}
                      </div>

                      <span className="settings-chevron">›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('profile.editTitle')}>
        <form onSubmit={handleSaveProfile} noValidate>
          {[
            { key: 'full_name', label: t('auth.fullNameLabel'), type: 'text' },
            { key: 'email', label: t('auth.emailLabel'), type: 'email' },
            { key: 'room_number', label: t('auth.roomNumberLabel'), type: 'text' },
          ].map(({ key, label, type }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input
                className={`form-input${editErrors[key] ? ' has-error' : ''}`}
                type={type}
                value={editForm[key]}
                onChange={e => {
                  setEditForm(p => ({ ...p, [key]: e.target.value }));
                  setEditErrors(p => ({ ...p, [key]: '' }));
                }}
              />
              {editErrors[key] && <div className="form-error">{editErrors[key]}</div>}
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">{t('auth.dormBuildingLabel')}</label>
            <select
              className="form-input"
              value={editForm.dorm_building}
              onChange={e => setEditForm(p => ({ ...p, dorm_building: e.target.value }))}
            >
              {DORM_BUILDINGS.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-red" type="submit" disabled={editLoading}>
            {editLoading ? <span className="spinner sm" /> : t('common.save')}
          </button>
        </form>
      </Modal>

      <Modal
        open={passOpen}
        onClose={() => setPassOpen(false)}
        title={t('profile.changePasswordTitle')}
      >
        <form onSubmit={handleChangePass} noValidate>
          {[
            { key: 'current_password', label: t('profile.currentPassword') },
            { key: 'new_password', label: t('profile.newPassword') },
            { key: 'confirm_password', label: t('profile.confirmNewPassword') },
          ].map(({ key, label }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input
                className={`form-input${passErrors[key] ? ' has-error' : ''}`}
                type="password"
                value={passForm[key]}
                onChange={e => {
                  setPassForm(p => ({ ...p, [key]: e.target.value }));
                  setPassErrors(p => ({ ...p, [key]: '' }));
                }}
                placeholder="••••••••"
              />
              {passErrors[key] && <div className="form-error">{passErrors[key]}</div>}
            </div>
          ))}

          <button className="btn btn-red" type="submit" disabled={passLoading}>
            {passLoading ? <span className="spinner sm" /> : t('profile.changePasswordButton')}
          </button>
        </form>
      </Modal>

      <Modal open={langOpen} onClose={() => setLangOpen(false)} title={t('settings.language')}>
        <div className="settings-card">
          {[{ code: 'en', name: 'English' }, { code: 'th', name: 'ภาษาไทย' }].map(l => (
            <button
              key={l.code}
              className="settings-item"
              onClick={() => switchLang(l.code)}
              style={{
                width: '100%',
                border: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer',
                background: 'none',
              }}
            >
              <Globe size={20} strokeWidth={1.8} color="#B13A2E" />
              <div className="si-txt" style={{ flex: 1 }}>
                <div className="settings-label">{l.name}</div>
              </div>
              {i18n.language === l.code && (
                <span style={{ color: 'var(--r)', fontWeight: 800, fontSize: 16 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title={t('settings.notifications')}
      >
        <div className="settings-card">
          {[
            { key: 'parcels', label: t('settings.notifParcels'), desc: t('settings.notifParcelsDesc') },
            { key: 'repairs', label: t('settings.notifRepairs'), desc: t('settings.notifRepairsDesc') },
            { key: 'announcements', label: t('settings.notifAnnouncements'), desc: t('settings.notifAnnouncementsDesc') },
          ].map(item => (
            <div key={item.key} className="switch-row">
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>{item.desc}</div>
              </div>
              <div
                className={`switch${notifToggles[item.key] ? ' on' : ''}`}
                onClick={() => setNotifToggles(p => ({ ...p, [item.key]: !p[item.key] }))}
              />
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title={t('privacy.title')}>
        <div
          style={{
            background: '#FEF3C7',
            borderRadius: 'var(--rads)',
            padding: '12px 14px',
            marginBottom: 16,
            display: 'flex',
            gap: 8,
          }}
        >
          <Lock size={16} strokeWidth={1.8} color="#92400E" />
          <div style={{ fontSize: 12, color: '#92400E', fontWeight: 600, lineHeight: 1.5 }}>
            {t('privacy.pdpaDesc')}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>
            {t('common.appName')} — {t('privacy.title')}
          </p>
          <p>{t('privacy.body')}</p>
        </div>
      </Modal>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title={t('about.title')}>
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <Building2 size={50} strokeWidth={1.8} color="#B13A2E" />
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginTop: 12 }}>
            {t('common.appName')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{t('about.version')}</div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 16, lineHeight: 1.7 }}>
            {t('about.description')}
            <br />
            {t('about.copyright')}
          </div>
        </div>
      </Modal>

      {logoutConfirm && (
        <div className="modal-overlay" onClick={() => setLogoutConfirm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 15, color: 'var(--t1)', marginBottom: 20, lineHeight: 1.5 }}>
              {t('auth.logoutConfirm')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setLogoutConfirm(false)} style={{ flex: 1 }}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-danger" onClick={logout} style={{ flex: 1 }}>
                {t('auth.logoutButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={clearToast} />}

      <style>{`.last-no-border:last-child { border-bottom: none !important; }`}</style>
    </div>
  );
}