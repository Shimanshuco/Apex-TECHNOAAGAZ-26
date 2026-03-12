import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PageLayout from './components/PageLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load non-critical pages for faster initial load
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const VolunteerSignupPage = lazy(() => import('./pages/VolunteerSignupPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventRegistrationPage = lazy(() => import('./pages/EventRegistrationPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const QRVerifyPage = lazy(() => import('./pages/QRVerifyPage'));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PreviousTechnoPage = lazy(() => import('./pages/PreviousTechnoPage'));
const WalkInRegisterPage = lazy(() => import('./pages/WalkInRegisterPage'));
const TribeNightRegistrationPage = lazy(() => import('./pages/TribeNightRegistrationPage'));
const TribeNightStatusPage = lazy(() => import('./pages/TribeNightStatusPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Landing */}
        <Route path="/" element={<HomePage />} />

        {/* Auth — standalone full-screen pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/volunteer/signup" element={<VolunteerSignupPage />} />
        <Route path="/walkin-register" element={<WalkInRegisterPage />} />
        <Route path="/tribe-night" element={<TribeNightRegistrationPage />} />
        <Route path="/tribe-night/status" element={<TribeNightStatusPage />} />

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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;