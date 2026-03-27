import { Outlet, NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', labelKey: 'nav.home', exact: true },
  { to: '/parcels', icon: '📦', labelKey: 'nav.parcels' },
  { to: '/repair', icon: '🔧', labelKey: 'nav.repair' },
  { to: '/qr', icon: '📲', labelKey: 'nav.qrCode' },
  { to: '/profile', icon: '👤', labelKey: 'nav.profile' },
];

import { useTranslation } from 'react-i18next';

export default function MobileLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  function isActive(item) {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  }

  return (
    <div className="phone">
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: 'var(--nav)' }}>
        <Outlet />
      </div>
      <nav className="bnav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={`bnav-item${isActive(item) ? ' active' : ''}`}
          >
            <div className="bnav-dot" />
            <div className="bnav-icon">{item.icon}</div>
            <div className="bnav-label">{t(item.labelKey)}</div>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
