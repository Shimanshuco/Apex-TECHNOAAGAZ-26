import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import VolunteerSignupPage from './pages/VolunteerSignupPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import EventRegistrationPage from './pages/EventRegistrationPage';
import CreateEventPage from './pages/CreateEventPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import QRVerifyPage from './pages/QRVerifyPage';
import ArtistsPage from './pages/ArtistsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PreviousTechnoPage from './pages/PreviousTechnoPage';
import PageLayout from './components/PageLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<HomePage />} />

        {/* Auth — standalone full-screen pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/volunteer/signup" element={<VolunteerSignupPage />} />

        {/* Public pages inside PageLayout */}
        <Route path="/events" element={<PageLayout><EventsPage /></PageLayout>} />
        <Route path="/events/:id" element={<PageLayout><EventDetailPage /></PageLayout>} />
        <Route path="/artists" element={<PageLayout><ArtistsPage /></PageLayout>} />
        <Route path="/about" element={<PageLayout><AboutPage /></PageLayout>} />
        <Route path="/contact" element={<PageLayout><ContactPage /></PageLayout>} />
        <Route path="/gallery" element={<PageLayout><PreviousTechnoPage /></PageLayout>} />

        {/* Protected — any authenticated user */}
        <Route path="/profile" element={<ProtectedRoute><PageLayout><ProfilePage /></PageLayout></ProtectedRoute>} />
        <Route path="/events/:id/register" element={<ProtectedRoute><EventRegistrationPage /></ProtectedRoute>} />

        {/* Protected — admin only */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><PageLayout><AdminDashboardPage /></PageLayout></ProtectedRoute>} />
        <Route path="/admin/events/new" element={<ProtectedRoute roles={['admin']}><PageLayout><CreateEventPage /></PageLayout></ProtectedRoute>} />
        <Route path="/admin/events/edit/:id" element={<ProtectedRoute roles={['admin']}><PageLayout><CreateEventPage /></PageLayout></ProtectedRoute>} />

        {/* Protected — volunteer / admin */}
        <Route path="/qr/verify" element={<ProtectedRoute roles={['volunteer', 'admin']}><PageLayout><QRVerifyPage /></PageLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;