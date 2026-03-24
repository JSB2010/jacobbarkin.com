"use client";

import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa6';

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SocialIcon = ({ 
  href, 
  icon, 
  label, 
  external = true,
  size = 'md',
  className = ''
}: SocialIconProps) => {
  // Size mappings
  const sizeClasses = {
    sm: 'p-1.5 h-8 w-8',
    md: 'p-2 h-10 w-10',
    lg: 'p-2.5 h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7'
  };

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${sizeClasses[size]} rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all flex items-center justify-center ${className}`}
      aria-label={label}
    >
      <div className="flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement<{ className?: string; 'aria-hidden'?: string }>, {
          className: iconSizes[size],
          'aria-hidden': 'true'
        })}
      </div>
      <span className="sr-only">{label}</span>
    </Link>
  );
};

type SpecificIconProps = Omit<SocialIconProps, 'icon' | 'label' | 'href'> & { href?: string };

export const GitHubIcon = ({ href, ...props }: SpecificIconProps) => (
  <SocialIcon
    href={href || "https://github.com/JSB2010"}
    icon={<FaGithub />}
    label="GitHub"
    {...props}
  />
);

export const LinkedInIcon = ({ href, ...props }: SpecificIconProps) => (
  <SocialIcon
    href={href || "https://www.linkedin.com/in/jacob-barkin/"}
    icon={<FaLinkedinIn />}
    label="LinkedIn"
    {...props}
  />
);

export const EmailIcon = ({ href, external, ...props }: SpecificIconProps) => (
  <SocialIcon
    href={href || "/contact"}
    icon={<Mail />}
    label="Contact"
    external={external ?? false}
    {...props}
  />
);

export const SocialIcons = ({ 
  size = 'md', 
  className = '',
  iconClassName = '',
  showGitHub = true,
  showLinkedIn = true,
  showEmail = true,
  direction = 'row'
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconClassName?: string;
  showGitHub?: boolean;
  showLinkedIn?: boolean;
  showEmail?: boolean;
  direction?: 'row' | 'col';
}) => {
  return (
    <div className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'} gap-3 ${className}`}>
      {showGitHub && <GitHubIcon size={size} className={iconClassName} />}
      {showLinkedIn && <LinkedInIcon size={size} className={iconClassName} />}
      {showEmail && <EmailIcon size={size} className={iconClassName} />}
    </div>
  );
};
