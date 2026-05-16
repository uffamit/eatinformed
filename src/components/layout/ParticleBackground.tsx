'use client';

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const ParticleBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (_container?: Container): Promise<void> => {
    // Container is available for debugging or additional configuration if needed
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120, // Increase FPS limit for smoother animation
      interactivity: {
        events: {
          onHover: {
            enable: true, // Enable mouse interaction
            mode: "repulse", // Change to repulse instead of grab
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#22c55e", // Use primary green color
        },
        links: {
          enable: false, // Disable links as requested
        },
        move: {
          direction: "bottom", // Make them fall
          enable: true,
          outModes: {
            default: "out", // Let them fall out of the screen
          },
          random: true,
          speed: 1, // slightly faster falling
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 150, // Increase number since links are gone
        },
        opacity: {
          value: { min: 0.1, max: 0.6 },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 4 },
          animation: {
            enable: true,
            speed: 2,
            sync: false,
          }
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
    );
  }

  return <></>;
};

export default ParticleBackground;
