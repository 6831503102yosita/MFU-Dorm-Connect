import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ParcelsPage from './pages/ParcelsPage';
import RepairPage from './pages/RepairPage';
import MyRepairsPage from './pages/MyRepairsPage';
import QRCodePage from './pages/QRCodePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import PublicBoardPage from './pages/PublicBoardPage';
import MobileLayout from './components/MobileLayout';
import Spinner from './components/Spinner';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullscreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/public-board" element={<PublicBoardPage />} />
        <Route path="/" element={<PrivateRoute><MobileLayout /></PrivateRoute>}>
          <Route index element={<HomePage />} />
          <Route path="parcels" element={<ParcelsPage />} />
          <Route path="repair" element={<RepairPage />} />
          <Route path="my-repairs" element={<MyRepairsPage />} />
          <Route path="qr" element={<QRCodePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
