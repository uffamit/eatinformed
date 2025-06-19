import type { SVGProps } from 'react';

export function EatInformedLogo(props: SVGProps<SVGSVGElement>) {
  const { width = 40, height = 40, ...restProps } = props; // Default icon size

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64" // A 64x64 coordinate system for the SVG
      aria-label="EatInformed Icon"
      width={width}
      height={height}
      {...restProps}
    >
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          {/* Using Tailwind-like green-400 and blue-400 for the gradient */}
          <stop offset="0%" stopColor="#4ADE80" /> {/* Greenish */}
          <stop offset="100%" stopColor="#60A5FA" /> {/* Bluish */}
        </linearGradient>
      </defs>
      
      {/* Limbs - thick strokes with round caps create a node-like feel at ends */}
      <g fill="none" stroke="url(#iconGrad)" strokeWidth="9" strokeLinecap="round">
        {/* Central Point approximately at 32,43 */}
        {/* Left Arm: from approx (18,30) to (30,40) (upper part of central body) */}
        <line x1="18" y1="30" x2="30" y2="40" />
        {/* Right Arm: from approx (46,30) to (34,40) (upper part of central body) */}
        <line x1="46" y1="30" x2="34" y2="40" />
        {/* Vertical Body element: from (32,38) (neck area) to (32,48) (hip area) */}
        <line x1="32" y1="38" x2="32" y2="48" />
        {/* Left Leg: from (30,48) (lower part of central body) to (18,60) */}
        <line x1="30" y1="48" x2="18" y2="60" />
        {/* Right Leg: from (34,48) (lower part of central body) to (46,60) */}
        <line x1="34" y1="48" x2="46" y2="60" />
      </g>

      {/* Head */}
      {/* Using a Tailwind-like red-400 for the head */}
      <circle cx="32" cy="22" r="8" fill="#F87171" /> 
    </svg>
  );
}
