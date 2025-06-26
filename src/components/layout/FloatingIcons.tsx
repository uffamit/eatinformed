'use client';

import { Package, Cookie, Croissant, Beef, Apple, Lollipop } from 'lucide-react';
import { useMemo } from 'react';

const icons = [
  { Icon: Package, size: 'w-12 h-12' },
  { Icon: Cookie, size: 'w-10 h-10' },
  { Icon: Croissant, size: 'w-14 h-14' },
  { Icon: Beef, size: 'w-12 h-12' },
  { Icon: Apple, size: 'w-10 h-10' },
  { Icon: Lollipop, size: 'w-8 h-8' },
];

const FloatingIcons = () => {
  const iconData = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const component = icons[i % icons.length];
      return {
        ...component,
        style: {
          left: `${Math.random() * 100}vw`,
          animation: `drift ${Math.random() * 20 + 20}s linear ${Math.random() * 20}s infinite`,
        },
      }
    });
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden pointer-events-none">
      {iconData.map(({ Icon, size, style }, i) => (
        <Icon key={i} className={`absolute text-white/5 ${size}`} style={style} />
      ))}
    </div>
  );
};

export default FloatingIcons;
