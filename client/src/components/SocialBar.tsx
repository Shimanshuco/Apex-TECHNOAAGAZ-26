import React from 'react';
import { SocialIcon } from '../components';
import type { IconProps } from '../icons';

export interface SocialBarProps {
  links: Array<{
    icon: React.FC<IconProps>;
    href: string;
    label: string;
    color: 'cyan' | 'pink' | 'purple' | 'red' | 'blue';
  }>;
  className?: string;
}

const SocialBar: React.FC<SocialBarProps> = ({ links, className = '' }) => {
  return (
    <>
      {/* Desktop - Right side vertical */}
      <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4 ${className}`}>
        {links.map((social) => (
          <SocialIcon
            key={social.label}
            icon={social.icon}
            href={social.href}
            label={social.label}
            color={social.color}
          />
        ))}
      </div>

      {/* Mobile social links are shown inside the Sidebar toggle menu */}
    </>
  );
};

export default SocialBar;
