import type { SVGProps } from 'react';

export function NutriScanLogo(props: SVGProps<SVGSVGElement>) {
  const { width = 40, height = 40, ...restProps } = props; // Default icon size

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      aria-label="NutriScan Icon"
      width={width}
      height={height}
      {...restProps}
    >
      {/* Leaf (using a green color) */}
      <path
        d="M32,5 C18,18 16,35 32,59 C48,35 46,18 32,5 Z" // A simple, stylized leaf shape
        fill="#4ADE80" // Green color (inspired by Tailwind green-400)
      />

      {/* Magnifying Glass (dark gray stroke, transparent fill for the lens part to show leaf through) */}
      <g stroke="#374151" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Lens circle */}
        <circle cx="26" cy="24" r="11" fill="none" />
        {/* Handle */}
        <line x1="35" y1="33" x2="45" y2="43" />
      </g>
    </svg>
  );
}
