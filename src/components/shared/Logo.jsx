import React from 'react';

export default function Logo({ size = 'medium', className = '' }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  const svgSize = isSmall ? 18 : isLarge ? 32 : 24;
  const fontSize = isSmall ? '1.1rem' : isLarge ? '2.1rem' : '1.45rem';
  const strokeWidth = isSmall ? 16 : isLarge ? 12 : 14;
  const innerStroke = isSmall ? 6 : isLarge ? 5 : 6;
  const spacing = isSmall ? '1px' : isLarge ? '2px' : '1.5px';

  return (
    <div 
      className={`oncosight-logo ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        fontWeight: 800, 
        fontFamily: "'Space Grotesk', 'Rajdhani', sans-serif",
        fontSize: fontSize,
        letterSpacing: spacing,
        color: '#ffffff',
        userSelect: 'none'
      }}
    >
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox="0 0 100 100" 
        style={{ 
          marginRight: '3px', 
          marginLeft: '3px',
          display: 'inline-block',
          verticalAlign: 'middle',
          filter: 'drop-shadow(0 0 8px rgba(0, 255, 178, 0.5)) drop-shadow(0 0 2px rgba(0, 229, 255, 0.7))'
        }}
      >
        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#logo-portal-grad)" strokeWidth={strokeWidth} />
        <circle cx="50" cy="50" r="18" fill="none" stroke="#00E5FF" strokeWidth={innerStroke} strokeDasharray="10 5" className="logo-portal-inner" />
        <defs>
          <linearGradient id="logo-portal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFB2" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{ 
        background: 'linear-gradient(90deg, #ffffff, #00FFB2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 900
      }}>ncoSight</span>
    </div>
  );
}
