import { memo, useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, ISourceOptions } from "@tsparticles/engine";
// import { loadAll } from "@tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.


const LightEffect = memo(() => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const xmasTwinkle = useMemo<ISourceOptions>(() => ({
    key: "twinkle",
    name: "Twinkle",
    particles: {
      number: {
        value: 200,
        density: {
          enable: true,
        },
      },
      color: {
        value: ["#ff0000", "#00ff00", "#ffff66"] // rood, groen, goud, wit
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.5,
        },
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      size: {
        value: {
          min: 0.1,
          max: 3,
        },
        animation: {
          enable: true,
          speed: 20,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 0.5,
      },
      twinkle: {
        particles: {
          enable: true,
          color: ["#fff"],
          frequency: 0.2,
          opacity: 1,
        }
      },
    },
  }), [])

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={xmasTwinkle}
      />
    );
  }

  return <></>;
});

export default LightEffect