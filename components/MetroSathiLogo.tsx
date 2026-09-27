import React from 'react';

interface MetroSathiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'light';
  className?: string;
  style?: React.CSSProperties;
}

export default function MetroSathiLogo({
  size = 'md',
  variant = 'full',
  className = '',
  style = {},
}: MetroSathiLogoProps) {
  // Dimensions map
  const dimensions = {
    sm: { height: 32, iconSize: 28, fontSize: '1.1rem', badgeSize: '0.65rem' },
    md: { height: 42, iconSize: 36, fontSize: '1.4rem', badgeSize: '0.72rem' },
    lg: { height: 56, iconSize: 48, fontSize: '1.8rem', badgeSize: '0.8rem' },
    xl: { height: 80, iconSize: 72, fontSize: '2.5rem', badgeSize: '0.95rem' },
  }[size];

  const textColor = variant === 'light' ? '#FFFFFF' : '#0B1F3A';
  const accentColor = '#0057B8';
  const redColor = '#E53935';

  return (
    <div
      className={`metrosathi-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : '12px',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* SVG Icon Emblem */}
      <svg
        width={dimensions.iconSize}
        height={dimensions.iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer Transit Ring */}
        <circle cx="50" cy="50" r="46" stroke="#0057B8" strokeWidth="8" fill="#0B1F3A" />
        <circle cx="50" cy="50" r="38" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

        {/* Metro Track Lines */}
        <path d="M 22 72 L 40 38 L 60 38 L 78 72" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        <line x1="30" y1="56" x2="70" y2="56" stroke="#0057B8" strokeWidth="4" />
        <line x1="24" y1="68" x2="76" y2="68" stroke="#FFFFFF" strokeWidth="4" />

        {/* Central Geometric Train Nose */}
        <path d="M 38 34 L 50 18 L 62 34 Z" fill="#E53935" />

        {/* Metro Headlight Dots */}
        <circle cx="42" cy="50" r="4" fill="#F9C80E" />
        <circle cx="58" cy="50" r="4" fill="#F9C80E" />

        {/* Speed Arc */}
        <path d="M 14 50 A 36 36 0 0 1 50 14" stroke="#E53935" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Wordmark (if not icon-only) */}
      {variant !== 'icon-only' && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: dimensions.fontSize, color: accentColor, letterSpacing: '-0.02em' }}>
              Metro
            </span>
            <span style={{ fontWeight: 800, fontSize: dimensions.fontSize, color: textColor, letterSpacing: '-0.01em' }}>
              Sathi
            </span>
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: redColor,
                borderRadius: '50%',
                display: 'inline-block',
                marginLeft: '3px',
                marginBottom: '4px',
              }}
            />
          </div>
          <span
            style={{
              fontSize: dimensions.badgeSize,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: variant === 'light' ? 'rgba(255,255,255,0.7)' : '#64748B',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            AI Metro Navigation
          </span>
        </div>
      )}
    </div>
  );
}
