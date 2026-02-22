import React from 'react';

export interface CityBuildingsProps {
  className?: string;
}

/* ─── colour palette (cyberpunk neon) ─── */
const NEON = ['#ff0080', '#00ffff', '#a000ff', '#ff4444', '#00ff88'];
const GLASS = [
  'rgba(0,255,255,0.55)',
  'rgba(255,0,128,0.45)',
  'rgba(255,220,80,0.4)',
  'rgba(0,255,136,0.35)',
];
const DIM = 'rgba(20,20,40,0.35)';

/* ─── helpers ─── */
const hash = (a: number, b: number) => ((a * 2654435761 + b) >>> 0) % 100;

/* ─── building definitions ───
   Each building has realistic proportions: wider bases, antenna/spire on some,
   rooftop accent stripe, window columns proportional to width.                */
const mkBack = () =>
  Array.from({ length: 28 }, (_, i) => {
    const w = 32 + (hash(i, 1) % 7) * 12;               // 32-116 px wide
    const h = 100 + (hash(i, 2) % 16) * 22;              // 100-452 px tall
    const neon = NEON[i % NEON.length];
    const cols = Math.max(2, Math.round(w / 16));         // window columns scale with width
    const rows = Math.max(4, Math.round(h / 24));
    const hasAntenna = hash(i, 3) > 65;
    const hasSetback = hash(i, 4) > 72 && w > 60;        // wide buildings get a setback top
    const setbackH = hasSetback ? Math.round(h * 0.3) : 0;
    const setbackW = hasSetback ? Math.round(w * 0.55) : 0;
    return { w, h, neon, cols, rows, hasAntenna, hasSetback, setbackH, setbackW,
      mr: 1 + (hash(i, 5) % 4),
      wins: Array.from({ length: cols * rows }, (_, j) => hash(i, j + 10) > 38),
    };
  });

const mkFront = () =>
  Array.from({ length: 20 }, (_, i) => ({
    w: 36 + (hash(i, 50) % 6) * 14,
    h: 40 + (hash(i, 51) % 8) * 18,
    mr: 2 + (hash(i, 52) % 6),
    neon: NEON[(i + 2) % NEON.length],
  }));

const bkBuildings = mkBack();
const ftBuildings = mkFront();

/* ─── component ─── */
const CityBuildings: React.FC<CityBuildingsProps> = ({ className = '' }) => {
  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 420,
        zIndex: 10,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Back buildings (slow parallax) ── */}
      <div
        className="animate-city-back"
        style={{
          position: 'absolute',
          bottom: 56,
          left: 0,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {[0, 1].map((set) =>
          bkBuildings.map((b, i) => (
            <div
              key={`bk${set}-${i}`}
              style={{
                flexShrink: 0,
                width: b.w,
                marginRight: b.mr,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* antenna */}
              {b.hasAntenna && (
                <div style={{ width: 2, height: 18, background: b.neon, opacity: 0.6, marginBottom: -1, borderRadius: '1px 1px 0 0' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: b.neon, opacity: 0.9, position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', boxShadow: `0 0 8px ${b.neon}` }} />
                </div>
              )}

              {/* setback (upper narrow section) */}
              {b.hasSetback && (
                <div style={{
                  width: b.setbackW,
                  height: b.setbackH,
                  background: `linear-gradient(180deg, #12122a 0%, #1a1a2e 100%)`,
                  borderTop: `2px solid ${b.neon}`,
                  position: 'relative',
                  boxShadow: `inset 0 0 12px rgba(0,0,0,0.6), 0 0 14px ${b.neon}30`,
                }}>
                  {/* setback windows */}
                  <div style={{
                    position: 'absolute', inset: '5px 4px 4px',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.max(1, Math.round(b.setbackW / 18))}, 1fr)`,
                    gap: '3px 2px',
                  }}>
                    {Array.from({ length: Math.round(b.setbackW / 18) * 4 }, (_, j) => (
                      <div key={j} style={{
                        height: 4, borderRadius: 1,
                        background: hash(i, j + 200) > 45 ? GLASS[j % GLASS.length] : DIM,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* main body */}
              <div style={{
                width: b.w,
                height: b.h - (b.hasSetback ? b.setbackH : 0),
                background: `linear-gradient(180deg, #0e0e22 0%, #161630 40%, #0a0a18 100%)`,
                position: 'relative',
                boxShadow: `inset -4px 0 12px rgba(0,0,0,0.5), inset 4px 0 8px rgba(0,0,0,0.3), 0 0 22px ${b.neon}30`,
              }}>
                {/* neon roof edge */}
                {!b.hasSetback && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: b.neon, opacity: 0.8, boxShadow: `0 0 10px ${b.neon}` }} />
                )}

                {/* subtle vertical edge highlights */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 1, background: `linear-gradient(180deg, ${b.neon}55, transparent 60%)` }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 1, background: `linear-gradient(180deg, ${b.neon}33, transparent 70%)` }} />

                {/* horizontal floor lines (every ~24px) */}
                {Array.from({ length: Math.floor((b.h - (b.hasSetback ? b.setbackH : 0)) / 24) }, (_, fi) => (
                  <div key={`fl${fi}`} style={{
                    position: 'absolute',
                    top: 24 * (fi + 1),
                    left: 2, right: 2,
                    height: 1,
                    background: 'rgba(255,255,255,0.04)',
                  }} />
                ))}

                {/* window grid */}
                <div style={{
                  position: 'absolute',
                  top: 8, left: 4, right: 4, bottom: 6,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${b.cols}, 1fr)`,
                  gap: '4px 3px',
                }}>
                  {b.wins.map((lit, j) => (
                    <div key={j} style={{
                      height: 5,
                      borderRadius: 1,
                      background: lit ? GLASS[j % GLASS.length] : DIM,
                      boxShadow: lit ? `0 0 4px ${GLASS[j % GLASS.length]}` : 'none',
                    }} />
                  ))}
                </div>

                {/* ground-floor accent (door / lobby glow) */}
                {b.w > 50 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: '30%', width: '40%', height: 10,
                    background: `linear-gradient(0deg, ${b.neon}44, transparent)`,
                    borderRadius: '2px 2px 0 0',
                  }} />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Front buildings (faster parallax, darker silhouettes with faint neon) ── */}
      <div
        className="animate-city-front"
        style={{
          position: 'absolute',
          bottom: 56,
          left: 0,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {[0, 1].map((set) =>
          ftBuildings.map((b, i) => (
            <div
              key={`ft${set}-${i}`}
              style={{
                flexShrink: 0,
                width: b.w,
                height: b.h,
                marginRight: b.mr,
                background: 'linear-gradient(180deg, #050510 0%, #0b0b1a 100%)',
                position: 'relative',
                boxShadow: `inset 0 0 6px rgba(0,0,0,0.8)`,
              }}
            >
              {/* faint neon outline on top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: b.neon, opacity: 0.25 }} />
              {/* a few dim windows */}
              <div style={{
                position: 'absolute', top: 4, left: 3, right: 3, bottom: 3,
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.max(2, Math.round(b.w / 18))}, 1fr)`,
                gap: '3px 2px',
              }}>
                {Array.from({ length: Math.round(b.w / 18) * Math.round(b.h / 14) }, (_, j) => (
                  <div key={j} style={{
                    height: 3, borderRadius: 1,
                    background: hash(i + 50, j) > 70 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
                  }} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Road ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56 }}>
        {/* asphalt surface with subtle noise */}
        <div style={{
          position: 'absolute', top: 2, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, #1e1e2a 0%, #14141e 40%, #0e0e16 100%)',
        }}>
          {/* centre lane dashes */}
          <div
            className="animate-road-scroll"
            style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', display: 'flex' }}
          >
            {[0, 1].map((set) =>
              Array.from({ length: 50 }).map((_, k) => (
                <div
                  key={`ln${set}-${k}`}
                  style={{
                    flexShrink: 0,
                    width: 60,
                    height: 3,
                    margin: '0 24px',
                    background: 'rgba(255,200,0,0.8)',
                    boxShadow: '0 0 8px rgba(255,200,0,0.35)',
                    borderRadius: 1,
                  }}
                />
              ))
            )}
          </div>

          {/* edge lane lines */}
          <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* neon glow strip at road top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(to right, rgba(255,0,128,0.4), rgba(0,255,255,0.4), rgba(160,0,255,0.3), rgba(255,0,128,0.4))',
          boxShadow: '0 0 12px rgba(0,255,255,0.2)',
        }} />
      </div>
    </div>
  );
};

export default CityBuildings;
