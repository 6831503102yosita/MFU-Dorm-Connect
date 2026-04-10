import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Package, Wrench, QrCode, ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { parcelsAPI, notificationsAPI } from '../services/api';
import { Badge } from '../components/Shared';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [parcels, setParcels] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    parcelsAPI
      .list(false)
      .then((r) => setParcels((r.data.parcels || []).slice(0, 2)))
      .catch(() => {});

    notificationsAPI
      .listAnnouncements(user?.dorm_building)
      .then((r) => setAnnouncements((r.data.announcements || []).slice(0, 1)))
      .catch(() => {});

    notificationsAPI
      .list()
      .then((r) => setUnread(r.data.unread_count || 0))
      .catch(() => {});
  }, [user]);

  const firstName = user?.full_name?.split(' ')?.[0] || 'Yosita';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const announcementText = announcements[0]
    ? i18n.language === 'th'
      ? announcements[0].body_th || announcements[0].body_en
      : announcements[0].body_en || announcements[0].body_th
    : 'No announcements';

  const FEATURES = [
    {
      icon: Package,
      title: t('nav.parcels'),
      desc: t('parcels.title'),
      to: '/parcels',
    },
    {
      icon: Wrench,
      title: t('nav.repair'),
      desc: t('repair.subtitle'),
      to: '/repair',
    },
    {
      icon: QrCode,
      title: t('nav.qrCode'),
      desc: t('qr.subtitle'),
      to: '/qr',
    },
    {
      icon: ClipboardList,
      title: t('repair.myRepairsTitle'),
      desc: t('repair.title'),
      to: '/my-repairs',
    },
  ];

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: 24,
    border: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  };

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#F3F4F6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(90deg, #D6002A 0%, #C40027 50%, #B80024 100%)',
          padding: '16px 22px 22px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              {greeting}
            </div>
            <div
              style={{
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {firstName}
            </div>
          </div>

          <button
            onClick={() => navigate('/notifications')}
            style={{
              width: 36,
              height: 36,
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={28} color="#FFFFFF" strokeWidth={2} />
            {unread > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 3,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                }}
              />
            )}
          </button>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.20)',
            borderRadius: 12,
            padding: '12px 16px',
            color: 'rgba(255,255,255,0.88)',
            fontSize: 13,
          }}
        >
          {announcementText}
        </div>
      </div>

      {/* Body */}
      <div className="scrl" style={{ flex: 1 }}>
        <div style={{ padding: '22px 16px 24px' }}>
          {/* Services */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#161616',
              marginBottom: 14,
            }}
          >
            {t('home.services')}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 28,
            }}
          >
            {FEATURES.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  style={{
                    ...cardStyle,
                    minHeight: 140,
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: '#C40027',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={28} color="#FFFFFF" strokeWidth={2} />
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#111111',
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#8A8A8A',
                      lineHeight: 1.45,
                    }}
                  >
                    {item.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recent Parcels */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#161616',
              marginBottom: 14,
            }}
          >
            {t('home.recentParcels')}
          </div>

          <div
            style={{
              ...cardStyle,
              minHeight: parcels.length === 0 ? 64 : 'auto',
              padding: parcels.length === 0 ? '22px 16px' : '8px 14px',
              marginBottom: 20,
              display: parcels.length === 0 ? 'flex' : 'block',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {parcels.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: '#9A9A9A',
                  textAlign: 'center',
                }}
              >
                {t('parcels.noCurrentParcels')}
              </div>
            ) : (
              parcels.map((p, index) => (
                <div
                  key={p.id}
                  onClick={() => navigate('/parcels')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom:
                      index !== parcels.length - 1 ? '1px solid #EEEEEE' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: '#FDE8EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Package size={18} color="#C40027" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#111827',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.tracking_number}
                    </div>
                    <div style={{ fontSize: 11, color: '#7A7A7A' }}>
                      {p.carrier}
                    </div>
                  </div>

                  <Badge status={p.status} />
                </div>
              ))
            )}
          </div>

          {/* Public Parcel Board */}
          <button
            onClick={() => navigate('/public-board')}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 20,
              background: 'linear-gradient(90deg, #173D67 0%, #0A2346 100%)',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ClipboardList size={24} color="#FFFFFF" />
            </div>

            <div>
              <div
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                {t('home.publicBoard')}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: 12,
                }}
              >
                {t('home.publicBoardDesc')}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}