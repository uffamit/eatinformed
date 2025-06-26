'use client';

import { Package, Cookie, Croissant, Beef, Apple, Lollipop } from 'lucide-react';
import { useEffect, useState } from 'react';

const iconComponents = [
  { Icon: Package, size: 'w-12 h-12' },
  { Icon: Cookie, size: 'w-10 h-10' },
  { Icon: Croissant, size: 'w-14 h-14' },
  { Icon: Beef, size: 'w-12 h-12' },
  { Icon: Apple, size: 'w-10 h-10' },
  { Icon: Lollipop, size: 'w-8 h-8' },
];

const FloatingIcons = () => {
  const [iconData, setIconData] = useState<any[]>([]);

  useEffect(() => {
    // This code now runs only on the client, after the initial render.
    // This avoids the server/client mismatch.
    const generatedIcons = Array.from({ length: 15 }).map((_, i) => {
      const component = iconComponents[i % iconComponents.length];
      return {
        ...component,
        style: {
          left: `${Math.random() * 100}vw`,
          animation: `drift ${Math.random() * 20 + 20}s linear ${Math.random() * 20}s infinite`,
        },
      };
    });
    setIconData(generatedIcons);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden pointer-events-none">
      {iconData.map(({ Icon, size, style }, i) => (
        <Icon key={i} className={`absolute text-white/5 ${size}`} style={style} />
      ))}
    </div>
  );
};

export default FloatingIcons;
