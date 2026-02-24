import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavItem, SocialIcon } from '../components';
import { MenuIcon, CloseIcon, type IconProps } from '../icons';

export interface SidebarProps {
  navItems: Array<{
    id: string;
    icon: React.FC<IconProps>;
    label: string;
  }>;
  socialLinks?: Array<{
    icon: React.FC<IconProps>;
    href: string;
    label: string;
    color: 'cyan' | 'pink' | 'purple' | 'red' | 'blue';
  }>;
  activeNav: string;
  onNavChange: (id: string) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, socialLinks = [], activeNav, onNavChange, className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Menu Button — top-right corner */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 right-4 z-50 p-3 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white md:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Desktop Sidebar — left strip */}
      <nav className={`
        fixed left-0 top-0 h-full z-40
        bg-transparent
        hidden md:flex
        w-28 py-6 pt-16 px-2
        flex-col items-center justify-center
        ${className}
      `}>
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeNav === item.id}
              onClick={() => onNavChange(item.id)}
            />
          ))}
        </div>
      </nav>

      {/* Mobile slide-in menu — transparent panel from right */}
      <div
        className={`
          fixed inset-y-0 right-0 z-40 w-64
          bg-transparent backdrop-blur-sm
          border-l border-white/5
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col pt-20 px-5 pb-8
          md:hidden
        `}
      >
        {/* Nav items */}
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeNav === item.id}
              onClick={() => {
                onNavChange(item.id);
                setIsMobileMenuOpen(false);
              }}
            />
          ))}
        </div>

        {/* Auth button in mobile menu — Profile or Register */}
        {user ? (
          <button
            className="mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/25 transition-all duration-300 text-center"
            onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
          >
            My Profile
          </button>
        ) : (
          <button
            className="mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white border-2 border-pink-500 bg-pink-500/10 hover:bg-pink-500/25 transition-all duration-300 text-center"
            onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
          >
            Register Now
          </button>
        )}

        {/* Divider */}
        {socialLinks.length > 0 && (
          <div className="my-4 h-px bg-white/10" />
        )}

        {/* Social links inside mobile menu */}
        {socialLinks.length > 0 && (
          <div className="flex gap-3 justify-center">
            {socialLinks.map((s) => (
              <SocialIcon
                key={s.label}
                icon={s.icon}
                href={s.href}
                label={s.label}
                color={s.color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
