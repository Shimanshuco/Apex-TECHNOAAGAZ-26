import React, { useMemo } from "react";

interface AnimatedBackgroundProps {
  /** Color theme: cyan (participant), purple (admin), or green (volunteer) */
  variant?: "cyan" | "purple" | "green";
  /** Whether it's used as a standalone full-screen bg or an overlay inside a container */
  overlay?: boolean;
}

/**
 * Cyberpunk animated background with floating particles, scanning beams,
 * glowing orbs, and an animated grid.
 */
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = "cyan",
  overlay = false,
}) => {
  const colors = {
    cyan: {
      gradient: "radial-gradient(ellipse at top, #0a1628 0%, #000000 70%)",
      gridColor: "rgba(0,255,255,0.12)",
      particleColor: "bg-cyan-400",
      orbFrom: "from-cyan-500/20",
      orbTo: "to-blue-500/10",
      orb2From: "from-purple-500/15",
      orb2To: "to-cyan-500/10",
      beamColor: "from-transparent via-cyan-400/10 to-transparent",
      beam2Color: "from-transparent via-purple-400/5 to-transparent",
    },
    purple: {
      gradient: "radial-gradient(ellipse at top, #0d0a1e 0%, #000000 70%)",
      gridColor: "rgba(168,85,247,0.12)",
      particleColor: "bg-purple-400",
      orbFrom: "from-purple-500/20",
      orbTo: "to-pink-500/10",
      orb2From: "from-pink-500/15",
      orb2To: "to-purple-500/10",
      beamColor: "from-transparent via-purple-400/10 to-transparent",
      beam2Color: "from-transparent via-pink-400/5 to-transparent",
    },
    green: {
      gradient: "radial-gradient(ellipse at top, #051a0e 0%, #000000 70%)",
      gridColor: "rgba(34,197,94,0.12)",
      particleColor: "bg-green-400",
      orbFrom: "from-green-500/20",
      orbTo: "to-cyan-500/10",
      orb2From: "from-cyan-500/15",
      orb2To: "to-green-500/10",
      beamColor: "from-transparent via-green-400/10 to-transparent",
      beam2Color: "from-transparent via-cyan-400/5 to-transparent",
    },
  };

  const c = colors[variant];
  const positionClass = overlay ? "absolute" : "fixed";

  /* Generate random particles once so they stay stable across re-renders */
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 8,
        opacity: Math.random() * 0.5 + 0.2,
      })),
    []
  );

  return (
    <>
      {/* Layer 0 — Animated gradient base */}
      <div
        className={`${positionClass} inset-0 z-0 animated-bg-gradient`}
        style={{ background: c.gradient }}
      />

      {/* Layer 1 — Animated grid */}
      <div
        className={`${positionClass} inset-0 z-0 opacity-[0.06] animated-bg-grid`}
        style={{
          backgroundImage: `linear-gradient(${c.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${c.gridColor} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Layer 2 — Floating particles */}
      <div className={`${positionClass} inset-0 z-0 overflow-hidden pointer-events-none`}>
        {particles.map((p) => (
          <span
            key={p.id}
            className={`absolute rounded-full ${c.particleColor} animated-bg-particle`}
            style={{
              left: p.left,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Layer 3 — Horizontal scanning beam */}
      <div className={`${positionClass} inset-0 z-0 overflow-hidden pointer-events-none`}>
        <div
          className={`absolute inset-y-0 w-[60%] bg-linear-to-r ${c.beamColor} animated-bg-scan`}
        />
      </div>

      {/* Layer 4 — Vertical scanning beam (slower) */}
      <div className={`${positionClass} inset-0 z-0 overflow-hidden pointer-events-none`}>
        <div
          className={`absolute inset-x-0 h-[40%] bg-linear-to-b ${c.beam2Color} animated-bg-scan-v`}
        />
      </div>

      {/* Layer 5 — Glowing orb top-left */}
      <div
        className={`${positionClass} -top-32 -left-32 z-0 w-96 h-96 rounded-full bg-linear-to-br ${c.orbFrom} ${c.orbTo} blur-3xl animated-bg-orb pointer-events-none`}
      />

      {/* Layer 6 — Glowing orb bottom-right */}
      <div
        className={`${positionClass} -bottom-32 -right-32 z-0 w-96 h-96 rounded-full bg-linear-to-tl ${c.orb2From} ${c.orb2To} blur-3xl animated-bg-orb-reverse pointer-events-none`}
      />
    </>
  );
};

export default AnimatedBackground;
