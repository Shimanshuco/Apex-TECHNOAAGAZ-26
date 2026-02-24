import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CityBuildings,
  AnimatedCar,
  Drone,
  Sidebar,
  SocialBar,
  HeroSection,
} from '../components';
import {
  HomeIcon,
  EventIcon,
  ContactIcon,
  AboutIcon,
  ArtistIcon,
  GalleryIcon,
  WebIcon,
  LinkedInIcon,
  YoutubeIcon,
  InstaIcon,
  MenuIcon,
  CloseIcon,
} from '../icons';

const routeMap: Record<string, string> = {
  home: '/',
  events: '/events',
  artists: '/artists',
  about: '/about',
  contact: '/contact',
  gallery: '/gallery',
  web: '/events',
};

const HomePage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'events', icon: EventIcon, label: 'Events' },
    { id: 'artists', icon: ArtistIcon, label: 'Artists' },
    { id: 'contact', icon: ContactIcon, label: 'Contact' },
    { id: 'gallery', icon: GalleryIcon, label: 'Gallery' },
  ];

  const socialLinks = [
    { icon: LinkedInIcon, href: 'https://www.linkedin.com/school/apex-university/', label: 'LinkedIn', color: 'blue' as const },
    { icon: YoutubeIcon, href: 'https://youtube.com/@sww-apexuniversity?si=AcBMJ236lRkgAksJ', label: 'YouTube', color: 'red' as const },
    { icon: InstaIcon, href: 'https://www.instagram.com/apex_university/', label: 'Instagram', color: 'pink' as const },
    { icon: WebIcon, href: 'https://www.apexuniversity.co.in/', label: 'Website', color: 'cyan' as const },
  ];

  const handleNavChange = (id: string) => {
    if (id === 'home') {
      setActiveNav(id);
      return;
    }
    navigate(routeMap[id] || '/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Background Image — fixed on desktop, scroll-locked on mobile */}
      <div
        className="fixed inset-0 z-0 bg-center bg-no-repeat bg-cover will-change-transform"
        style={{
          backgroundImage: 'url(/Background.png)',
        }}
      />



      {/* Neon Light Beams */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        <div className="absolute top-[30%] left-0 w-full h-0.5 bg-linear-to-r from-transparent via-cyan-400/30 to-transparent animate-beam-scroll" />
        <div className="absolute top-[50%] left-0 w-full h-px bg-linear-to-r from-transparent via-pink-500/20 to-transparent animate-beam-scroll-reverse" />
      </div>

      {/* Animated City Buildings + Road */}
      <CityBuildings />

      {/* Animated Car on Road */}
      <AnimatedCar />

      {/* Animated Drone */}
      <Drone />

      {/* ── Mobile top bar: all 3 logos + auth + toggle on one line ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 py-1.5 md:hidden">
        {/* Apex logo */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg shadow-black/30">
          <img src="/Logo/Apex.png" alt="Apex University" className="h-10 sm:h-12 w-auto" />
        </div>
        {/* Right group: logos + auth + toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-1 shadow-lg shadow-black/30">
            <img src="/Logo/SWW.png" alt="SWW" className="h-8 sm:h-10 w-auto" />
          </div>
          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-1 shadow-lg shadow-black/30">
            <img src="/Logo/ScholarZ.png" alt="ScholarZ" className="h-8 sm:h-10 w-auto" />
          </div>

          {/* Menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* ── Desktop: Apex logo top-left ── */}
      <div className="fixed top-3 left-3 z-50 hidden md:block">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg shadow-black/30">
          <img src="/Logo/Apex.png" alt="Apex University" className="h-25 w-auto" />
        </div>
      </div>

      {/* ── Desktop: right logos + button ── */}
      <div className="fixed top-3 right-4 z-50 hidden md:flex flex-col items-end gap-2">
        <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl px-6 py-1.5 shadow-lg shadow-black/30">
          <img src="/Logo/SWW.png" alt="SWW" className="h-20 w-auto" />

          <div className="mx-6 w-[2px] h-14 bg-black"></div>

          <img src="/Logo/ScholarZ.png" alt="ScholarZ" className="h-10 w-auto" />
        </div>
        {user ? (
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm text-white border-2 border-cyan-500 bg-cyan-500/10 backdrop-blur-sm hover:bg-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
          >
            My Profile
          </button>
        ) : (
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm text-white border-2 border-pink-500 bg-pink-500/10 backdrop-blur-sm hover:bg-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300 hover:scale-105"
          >
            Register Now
          </button>
        )}
      </div>

      {/* Left Sidebar (+ social links inside mobile menu) */}
      <Sidebar navItems={navItems} socialLinks={socialLinks} activeNav={activeNav} onNavChange={handleNavChange} mobileOpen={isMobileMenuOpen} onMobileToggle={setIsMobileMenuOpen} />

      {/* Hero Content */}
      <HeroSection />

      {/* Social Media Icons */}
      <SocialBar links={socialLinks} />
    </div>
  );
};

export default HomePage;
