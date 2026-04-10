import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Package, Wrench, QrCode, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { to: '/', icon: Home, labelKey: 'nav.home', exact: true },
  { to: '/parcels', icon: Package, labelKey: 'nav.parcels' },
  { to: '/repair', icon: Wrench, labelKey: 'nav.repair' },
  { to: '/qr', icon: QrCode, labelKey: 'nav.qrCode' },
  { to: '/profile', icon: User, labelKey: 'nav.profile' },
];

export default function MobileLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  function isActive(item) {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  }

  return (
    <div className="phone">
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'var(--nav)',
        }}
      >
        <Outlet />
      </div>

      <nav className="bnav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`bnav-item${active ? ' active' : ''}`}
            >
              <div className="bnav-dot" />
              <div className="bnav-icon">
                <Icon
                  size={22}
                  strokeWidth={2}
                  color={active ? '#C40027' : '#7C8594'}
                />
              </div>
              <div className="bnav-label">{t(item.labelKey)}</div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}