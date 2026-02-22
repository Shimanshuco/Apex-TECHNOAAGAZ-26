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
  WebIcon,
  LinkedInIcon,
  YoutubeIcon,
  InstaIcon,
} from '../icons';

const routeMap: Record<string, string> = {
  home: '/',
  events: '/events',
  artists: '/artists',
  about: '/about',
  contact: '/contact',
  web: '/events',
};

const HomePage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'events', icon: EventIcon, label: 'Events' },
    { id: 'artists', icon: ArtistIcon, label: 'Artists' },
    { id: 'about', icon: AboutIcon, label: 'About' },
    { id: 'contact', icon: ContactIcon, label: 'Contact' },
  ];

  const socialLinks = [
    { icon: LinkedInIcon, href: 'https://linkedin.com', label: 'LinkedIn', color: 'blue' as const },
    { icon: YoutubeIcon, href: 'https://youtube.com', label: 'YouTube', color: 'red' as const },
    { icon: InstaIcon, href: 'https://instagram.com', label: 'Instagram', color: 'pink' as const },
    { icon: WebIcon, href: 'https://apexuniversity.edu.in', label: 'Website', color: 'cyan' as const },
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
      {/* Background Image - Fixed (scales up slightly on mobile for immersion) */}
      <div
        className="fixed inset-0 z-0 scale-110 md:scale-100"
        style={{
          backgroundImage: 'url(/Background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Logo — fixed top-left, part of main layout (not sidebar) */}
      <div className="fixed top-3 left-3 md:top-6 md:left-6 z-50 pointer-events-auto">
        <img
          src="/logo.png"
          alt="TECHNOAAGAZ Logo"
          className="w-16 h-16 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
        />
      </div>

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

      {/* Top-right button — Register or Profile based on login state */}
      {user ? (
        <button
          onClick={() => navigate('/profile')}
          className="fixed top-6 right-6 z-50 hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white border-2 border-cyan-500 bg-cyan-500/10 backdrop-blur-sm hover:bg-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
        >
          My Profile
        </button>
      ) : (
        <button
          onClick={() => navigate('/register')}
          className="fixed top-6 right-6 z-50 hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white border-2 border-pink-500 bg-pink-500/10 backdrop-blur-sm hover:bg-pink-500/25 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300 hover:scale-105"
        >
          Register Now
        </button>
      )}

      {/* Left Sidebar (+ social links inside mobile menu) */}
      <Sidebar navItems={navItems} socialLinks={socialLinks} activeNav={activeNav} onNavChange={handleNavChange} />

      {/* Hero Content */}
      <HeroSection />

      {/* Social Media Icons */}
      <SocialBar links={socialLinks} />
    </div>
  );
};

export default HomePage;
