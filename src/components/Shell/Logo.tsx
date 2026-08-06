import type { FC } from 'react';

interface LogoProps {
  size?: number;
  variant?: 'mark' | 'full';
  className?: string;
}

export const Logo: FC<LogoProps> = ({ size = 32, variant = 'full', className = '' }) => {
  if (variant === 'mark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <rect x="2" y="2" width="28" height="28" rx="4" fill="#1C232E" stroke="#2E3746" strokeWidth="1" />
        <rect x="7" y="7" width="8" height="8" rx="1.5" fill="#E4DDD3" />
        <rect x="17" y="7" width="8" height="8" rx="1.5" fill="#C69A42" />
        <rect x="7" y="17" width="18" height="8" rx="1.5" fill="#E4DDD3" />
        <path d="M15 11H17" stroke="#2E3746" strokeWidth="1" strokeLinecap="round" />
        <path d="M11 15V17" stroke="#2E3746" strokeWidth="1" strokeLinecap="round" />
        <path d="M21 15V17" stroke="#C69A42" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect x="2" y="2" width="28" height="28" rx="4" fill="#1C232E" stroke="#2E3746" strokeWidth="1" />
        <rect x="7" y="7" width="8" height="8" rx="1.5" fill="#E4DDD3" />
        <rect x="17" y="7" width="8" height="8" rx="1.5" fill="#C69A42" />
        <rect x="7" y="17" width="18" height="8" rx="1.5" fill="#E4DDD3" />
        <path d="M15 11H17" stroke="#2E3746" strokeWidth="1" strokeLinecap="round" />
        <path d="M11 15V17" stroke="#2E3746" strokeWidth="1" strokeLinecap="round" />
        <path d="M21 15V17" stroke="#C69A42" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span
            className="font-serif"
            style={{
              fontSize: `${Math.round(size * 0.68)}px`,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#E4DDD3',
            }}
          >
            eunom
          </span>
          <span
            className="font-mono tabular-nums"
            style={{
              fontSize: `${Math.round(size * 0.38)}px`,
              fontWeight: 600,
              color: '#C69A42',
              backgroundColor: 'rgba(59, 74, 63, 0.4)',
              border: '1px solid #2E3746',
              padding: '1px 4px',
              borderRadius: '3px',
              lineHeight: 1,
            }}
          >
            .ia
          </span>
        </div>
      </div>
    </div>
  );
};
