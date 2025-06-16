import type { SVGProps } from 'react';

export function NutriScanLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="NutriScan Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="10"
        y="35"
        fontFamily="Inter, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="url(#logoGradient)"
      >
        NutriScan
      </text>
      <path
        d="M175 15 Q180 25 175 35 Q170 25 175 15"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="hsl(var(--primary)/0.3)"
      />
      <circle cx="175" cy="25" r="3" fill="hsl(var(--accent))" />
    </svg>
  );
}
