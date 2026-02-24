import React, { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../lib/api";
import { Music, Sparkles, Star, Loader2, AlertCircle, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface Artist {
  _id: string;
  name: string;
  description: string;
  photo: string;
}

/* ═══════════════════════════════════════════════════════
   FABRIC FOLD HELPERS
   ═══════════════════════════════════════════════════════ */
const FOLD_GRADIENT_LEFT = [
  "repeating-linear-gradient(90deg,",
  "  rgba(255,255,255,0.0)  0px,  rgba(255,255,255,0.04) 8px,",
  "  rgba(0,0,0,0.18) 16px,       rgba(255,255,255,0.06) 24px,",
  "  rgba(0,0,0,0.22) 32px,       rgba(255,255,255,0.03) 40px,",
  "  rgba(0,0,0,0.15) 48px,       rgba(255,255,255,0.05) 56px,",
  "  rgba(0,0,0,0.20) 64px,       rgba(0,0,0,0.0) 72px)",
].join("\n");

const FOLD_GRADIENT_RIGHT = [
  "repeating-linear-gradient(90deg,",
  "  rgba(0,0,0,0.0)  0px,        rgba(0,0,0,0.20) 8px,",
  "  rgba(255,255,255,0.05) 16px,  rgba(0,0,0,0.15) 24px,",
  "  rgba(255,255,255,0.03) 32px,  rgba(0,0,0,0.22) 40px,",
  "  rgba(255,255,255,0.06) 48px,  rgba(0,0,0,0.18) 56px,",
  "  rgba(255,255,255,0.04) 64px,  rgba(0,0,0,0.0) 72px)",
].join("\n");

const FABRIC_BASE = "linear-gradient(180deg, #1e2a4a 0%, #16213e 30%, #152042 60%, #0f1a30 100%)";
const FABRIC_SHEEN = "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)";

/* ═══════════════════════════════════════════════════════
   PHASE 1 — CURTAIN INTRO  (realistic 3-D theater curtain)
   ═══════════════════════════════════════════════════════ */
const CurtainIntro: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState<"waiting" | "opening" | "done">("waiting");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("opening"), 800);
    const t2 = setTimeout(() => {
      setPhase("done");
      onDone();
    }, 3200); // 0.8s wait + 2.4s animation
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  if (phase === "done") return null;

  const isOpening = phase === "opening";

  return (
    <div className="fixed inset-0 z-100 pointer-events-none overflow-hidden">
      {/* ── Top valance / pelmet ───────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-20 curtain-valance"
        style={{
          height: "60px",
          background: `${FOLD_GRADIENT_LEFT}, ${FABRIC_BASE}`,
          boxShadow: "0 8px 30px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)",
          opacity: isOpening ? 0 : 1,
          transition: "opacity 0.8s 1.8s ease-out",
        }}
      >
        {/* Scalloped bottom edge of pelmet */}
        <div className="absolute -bottom-3 left-0 right-0 h-6 overflow-hidden">
          <svg viewBox="0 0 1440 24" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 Q36,24 72,0 Q108,24 144,0 Q180,24 216,0 Q252,24 288,0 Q324,24 360,0 Q396,24 432,0 Q468,24 504,0 Q540,24 576,0 Q612,24 648,0 Q684,24 720,0 Q756,24 792,0 Q828,24 864,0 Q900,24 936,0 Q972,24 1008,0 Q1044,24 1080,0 Q1116,24 1152,0 Q1188,24 1224,0 Q1260,24 1296,0 Q1332,24 1368,0 Q1404,24 1440,0 L1440,24 L0,24 Z" fill="#16213e"/>
          </svg>
        </div>
        {/* Gold trim along pelmet bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-gold/20 via-gold/50 to-gold/20" />
      </div>

      {/* ── Gold curtain rod ──────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30 h-3"
        style={{
          background: "linear-gradient(180deg, #c49a2f 0%, #d4a843 30%, #e0bc5e 50%, #d4a843 70%, #a07a1f 100%)",
          boxShadow: "0 3px 15px rgba(0,0,0,0.5)",
          opacity: isOpening ? 0 : 1,
          transition: "opacity 0.6s 2s ease-out",
        }}
      >
        {/* Rod end caps */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{
          background: "radial-gradient(circle at 35% 35%, #e0bc5e, #a07a1f)",
        }} />
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{
          background: "radial-gradient(circle at 35% 35%, #e0bc5e, #a07a1f)",
        }} />
      </div>

      {/* ── LEFT CURTAIN PANEL ────────────────────── */}
      <div
        className="absolute top-0 left-0 w-1/2 curtain-left"
        style={{
          height: "calc(100% + 40px)",
          transformOrigin: "left top",
          animation: isOpening ? "curtainGatherLeft 2.4s cubic-bezier(.65,0,.35,1) forwards" : "none",
        }}
      >
        {/* Main fabric body with folds */}
        <div className="absolute inset-0" style={{
          background: `${FOLD_GRADIENT_LEFT}, ${FABRIC_SHEEN}, ${FABRIC_BASE}`,
          boxShadow: "inset -20px 0 60px rgba(0,0,0,0.4), inset 10px 0 30px rgba(255,255,255,0.02)",
        }} />

        {/* Large soft vertical fold shadows for 3D depth */}
        {[15, 35, 55, 75, 92].map((pos, i) => (
          <div key={i} className="absolute top-0 h-full" style={{
            left: `${pos}%`,
            width: "12%",
            background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,${0.08 + i * 0.03}) 40%, rgba(0,0,0,${0.12 + i * 0.02}) 60%, transparent 100%)`,
          }} />
        ))}

        {/* Subtle horizontal shading for weight/drape */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 8%, transparent 85%, rgba(0,0,0,0.25) 100%)",
        }} />

        {/* Gold trim right edge */}
        <div className="absolute top-0 right-0 w-1.5 h-full" style={{
          background: "linear-gradient(180deg, #d4a843 0%, #b8912e 40%, #d4a843 60%, #b8912e 100%)",
          boxShadow: "0 0 8px rgba(212,168,67,0.3)",
        }} />

        {/* Tassel & rope decoration */}
        <div className="absolute right-4 sm:right-8" style={{ top: "35%" }}>
          {/* Rope loop */}
          <div className="w-6 h-16 border-2 border-gold/60 rounded-b-full" style={{
            borderTop: "none",
            background: "linear-gradient(180deg, transparent, rgba(212,168,67,0.06))",
          }} />
          {/* Tassel body */}
          <div className="mx-auto w-4 h-12 rounded-b-full" style={{
            background: "linear-gradient(180deg, #d4a843 0%, #b8912e 50%, #8a6b1e 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }} />
          <div className="mx-auto w-5 h-1 -mt-12 rounded-full bg-gold/80" />
        </div>

        {/* Bottom scalloped edge */}
        <div className="absolute -bottom-1 left-0 right-0 h-4 overflow-hidden">
          <svg viewBox="0 0 720 16" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 Q18,16 36,0 Q54,16 72,0 Q90,16 108,0 Q126,16 144,0 Q162,16 180,0 Q198,16 216,0 Q234,16 252,0 Q270,16 288,0 Q306,16 324,0 Q342,16 360,0 Q378,16 396,0 Q414,16 432,0 Q450,16 468,0 Q486,16 504,0 Q522,16 540,0 Q558,16 576,0 Q594,16 612,0 Q630,16 648,0 Q666,16 684,0 Q702,16 720,0 L720,16 L0,16 Z" fill="#0f1a30"/>
          </svg>
        </div>
      </div>

      {/* ── RIGHT CURTAIN PANEL ───────────────────── */}
      <div
        className="absolute top-0 right-0 w-1/2 curtain-right"
        style={{
          height: "calc(100% + 40px)",
          transformOrigin: "right top",
          animation: isOpening ? "curtainGatherRight 2.4s cubic-bezier(.65,0,.35,1) forwards" : "none",
        }}
      >
        {/* Main fabric body with folds (mirrored) */}
        <div className="absolute inset-0" style={{
          background: `${FOLD_GRADIENT_RIGHT}, ${FABRIC_SHEEN}, ${FABRIC_BASE}`,
          boxShadow: "inset 20px 0 60px rgba(0,0,0,0.4), inset -10px 0 30px rgba(255,255,255,0.02)",
        }} />

        {/* Large soft vertical fold shadows (mirrored) */}
        {[8, 25, 45, 65, 85].map((pos, i) => (
          <div key={i} className="absolute top-0 h-full" style={{
            left: `${pos}%`,
            width: "12%",
            background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,${0.08 + i * 0.03}) 40%, rgba(0,0,0,${0.12 + i * 0.02}) 60%, transparent 100%)`,
          }} />
        ))}

        {/* Horizontal weight shading */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 8%, transparent 85%, rgba(0,0,0,0.25) 100%)",
        }} />

        {/* Gold trim left edge */}
        <div className="absolute top-0 left-0 w-1.5 h-full" style={{
          background: "linear-gradient(180deg, #d4a843 0%, #b8912e 40%, #d4a843 60%, #b8912e 100%)",
          boxShadow: "0 0 8px rgba(212,168,67,0.3)",
        }} />

        {/* Tassel & rope decoration */}
        <div className="absolute left-4 sm:left-8" style={{ top: "35%" }}>
          <div className="w-6 h-16 border-2 border-gold/60 rounded-b-full" style={{
            borderTop: "none",
            background: "linear-gradient(180deg, transparent, rgba(212,168,67,0.06))",
          }} />
          <div className="mx-auto w-4 h-12 rounded-b-full" style={{
            background: "linear-gradient(180deg, #d4a843 0%, #b8912e 50%, #8a6b1e 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }} />
          <div className="mx-auto w-5 h-1 -mt-12 rounded-full bg-gold/80" />
        </div>

        {/* Bottom scalloped edge */}
        <div className="absolute -bottom-1 left-0 right-0 h-4 overflow-hidden">
          <svg viewBox="0 0 720 16" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 Q18,16 36,0 Q54,16 72,0 Q90,16 108,0 Q126,16 144,0 Q162,16 180,0 Q198,16 216,0 Q234,16 252,0 Q270,16 288,0 Q306,16 324,0 Q342,16 360,0 Q378,16 396,0 Q414,16 432,0 Q450,16 468,0 Q486,16 504,0 Q522,16 540,0 Q558,16 576,0 Q594,16 612,0 Q630,16 648,0 Q666,16 684,0 Q702,16 720,0 L720,16 L0,16 Z" fill="#0f1a30"/>
          </svg>
        </div>
      </div>

      {/* ── Center title (behind curtains) ─────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{
          opacity: isOpening ? 0 : 1,
          transition: "opacity 0.6s ease-in",
        }}
      >
        <div className="text-center px-4">
          <Sparkles size={28} className="text-gold mx-auto mb-3 animate-pulse" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-widest" style={{
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}>
            ARTIST LINEUP
          </h2>
          <div className="mt-3 h-0.5 w-24 mx-auto bg-linear-to-r from-transparent via-gold to-transparent" />
        </div>
      </div>

      {/* ── Stage spotlight glow (behind curtains) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="w-80 h-80 sm:w-125 sm:h-125 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(212,168,67,0.15) 0%, rgba(212,168,67,0.05) 40%, transparent 70%)",
            opacity: isOpening ? 1 : 0.2,
            transition: "opacity 1.5s ease",
          }}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   PHASE 2 — ARTIST SPOTLIGHT REVEAL  (one by one)
   ═══════════════════════════════════════════════════════ */
const ArtistRevealCard: React.FC<{
  artist: Artist;
  index: number;
  revealedCount: number;
  onClick: () => void;
}> = ({ artist, index, revealedCount, onClick }) => {
  const isRevealed = index < revealedCount;
  const isRevealing = index === revealedCount - 1;

  return (
    <div
      className="reveal-card relative cursor-pointer"
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed
          ? "translateY(0) rotateX(0deg) scale(1)"
          : "translateY(80px) rotateX(15deg) scale(0.85)",
        transition: "all 0.9s cubic-bezier(.34,1.56,.64,1)",
        transitionDelay: "0.1s",
        perspective: "800px",
      }}
      onClick={onClick}
    >
      {/* Spotlight burst on revealing artist */}
      {isRevealing && (
        <div className="absolute -inset-8 z-0 pointer-events-none spotlight-burst" />
      )}

      <div className="relative z-10 group">
        {/* Card shell */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-gold/20 bg-black/50 backdrop-blur-sm shadow-xl shadow-gold/5 hover:shadow-gold/15 hover:border-gold/40 transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-3/4 overflow-hidden">
            <img
              src={artist.photo}
              alt={artist.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Cinematic gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />

            {/* Sparkle corner on hover */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-12">
              <div className="w-9 h-9 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center border border-gold/30">
                <Sparkles size={16} className="text-gold" />
              </div>
            </div>

            {/* Number badge */}
            <div className="absolute top-3 left-3">
              <div className="w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center text-black text-sm font-extrabold shadow-lg shadow-gold/30">
                {index + 1}
              </div>
            </div>

            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg tracking-wide">
                {artist.name}
              </h3>
              <p className="text-gold text-sm mt-1 flex items-center gap-1.5 opacity-80">
                <Music size={14} /> Featured Artist
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 pt-3">
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
              {artist.description}
            </p>
            {/* Gold bar */}
            <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-linear-to-r from-gold via-gold-light to-gold transition-all duration-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════════════════ */
const ArtistModal: React.FC<{ artist: Artist | null; onClose: () => void }> = ({ artist, onClose }) => {
  useEffect(() => {
    if (artist) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [artist]);

  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative z-10 w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-gray-900/95 border border-gold/20 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-gold/10 modal-card flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-gold/40 transition-all"
        >
          <X size={18} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="relative h-48 sm:h-72 md:h-80 overflow-hidden shrink-0">
            <img src={artist.photo} alt={artist.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent" />
            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center backdrop-blur-sm">
                <Star size={18} className="text-gold sm:hidden" />
                <Star size={20} className="text-gold hidden sm:block" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{artist.name}</h2>
                <p className="text-gold/80 text-xs sm:text-sm flex items-center gap-1"><Music size={12} className="sm:hidden" /><Music size={14} className="hidden sm:block" /> Featured Artist</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">{artist.description}</p>
            <div className="mt-4 sm:mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
              <Sparkles size={14} className="text-gold/40" />
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   FLOATING PARTICLES
   ═══════════════════════════════════════════════════════ */
const StageParticles: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <span
        key={i}
        className="absolute rounded-full particle"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${100 + Math.random() * 20}%`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          background: i % 3 === 0 ? "rgba(212,168,67,0.6)" : "rgba(255,255,255,0.3)",
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${4 + Math.random() * 6}s`,
        }}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Artist | null>(null);

  // Animation phases
  const [curtainDone, setCurtainDone] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Fetch artists */
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: Artist[] }>("/artists");
        setArtists(res.data);
      } catch {
        setError("Failed to load artists. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* After curtain done — reveal artists one at a time */
  const handleCurtainDone = useCallback(() => {
    setCurtainDone(true);
  }, []);

  useEffect(() => {
    if (!curtainDone || artists.length === 0) return;

    // Start the sequential reveal
    let count = 0;
    revealTimerRef.current = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= artists.length) {
        if (revealTimerRef.current) clearInterval(revealTimerRef.current);
      }
    }, 700); // 700ms between each artist reveal

    return () => {
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, [curtainDone, artists.length]);

  return (
    <div className="relative min-h-[60vh]">
      <StageParticles />

      {/* ── Curtain overlay (shows on page load) ───── */}
      {!loading && !error && artists.length > 0 && (
        <CurtainIntro onDone={handleCurtainDone} />
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={40} className="text-gold animate-spin" />
          <p className="text-gray-500 text-sm">Preparing the stage…</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="max-w-md mx-auto py-20">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-3 text-red-400">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && artists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-gray-600">
          <Music size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">Artists coming soon</p>
          <p className="text-sm mt-1">Stay tuned — our lineup is being finalized!</p>
        </div>
      )}

      {/* ── Stage hero (appears after curtain) ───── */}
      {curtainDone && artists.length > 0 && (
        <section className="text-center mb-12 stage-hero">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm mb-5">
            <Sparkles size={14} />
            TECHNOAAGAZ 2026
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="bg-linear-to-r from-white via-gold-light to-gold bg-clip-text text-transparent">
              Our Star
            </span>
            <br />
            <span className="bg-linear-to-r from-gold via-gold-light to-white bg-clip-text text-transparent">
              Artists
            </span>
          </h1>
          <p className="mt-4 text-gray-400 max-w-lg mx-auto text-base sm:text-lg">
            Witness the electrifying talent handpicked for TECHNOAAGAZ.
          </p>
          {/* Decorative spotlight glow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
        </section>
      )}

      {/* ── Artist Grid (revealed one by one) ────── */}
      {curtainDone && artists.length > 0 && (
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          style={{ perspective: "1200px" }}
        >
          {artists.map((a, i) => (
            <ArtistRevealCard
              key={a._id}
              artist={a}
              index={i}
              revealedCount={revealedCount}
              onClick={() => setSelected(a)}
            />
          ))}
        </section>
      )}

      {/* ── "All revealed" flourish ──────────────── */}
      {curtainDone && revealedCount >= artists.length && artists.length > 0 && (
        <div className="text-center mt-12 all-revealed">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-16 h-px bg-linear-to-r from-transparent to-gold/40" />
            <Star size={18} className="text-gold" />
            <div className="w-16 h-px bg-linear-to-r from-gold/40 to-transparent" />
          </div>
          <p className="text-gray-500 text-sm">Click any artist to learn more</p>
        </div>
      )}

      {/* ── Detail Modal ─── */}
      <ArtistModal artist={selected} onClose={() => setSelected(null)} />

      {/* ═══ KEYFRAMES ═══ */}
      <style>{`
        /* ── Curtain gathering animation (realistic pull-aside) ── */
        @keyframes curtainGatherLeft {
          0%   { transform: translateX(0) scaleX(1); opacity: 1; }
          60%  { transform: translateX(-65%) scaleX(0.4); opacity: 1; }
          85%  { transform: translateX(-78%) scaleX(0.28); opacity: 0.9; }
          100% { transform: translateX(-88%) scaleX(0.22); opacity: 0; }
        }
        @keyframes curtainGatherRight {
          0%   { transform: translateX(0) scaleX(1); opacity: 1; }
          60%  { transform: translateX(65%) scaleX(0.4); opacity: 1; }
          85%  { transform: translateX(78%) scaleX(0.28); opacity: 0.9; }
          100% { transform: translateX(88%) scaleX(0.22); opacity: 0; }
        }

        /* The gathered curtains compress the fold texture, creating
           an increasingly dense pleat pattern — pure CSS 3D! */
        .curtain-left, .curtain-right {
          will-change: transform, opacity;
        }

        /* ── Stage hero entrance ── */
        .stage-hero {
          animation: heroFadeUp 1s 0.2s ease-out both;
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Spotlight burst on each reveal ── */
        .spotlight-burst {
          background: radial-gradient(circle, rgba(212,168,67,0.25) 0%, transparent 70%);
          animation: burstPulse 0.9s ease-out both;
        }
        @keyframes burstPulse {
          0%   { opacity: 0; transform: scale(0.5); }
          40%  { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.3); }
        }

        /* ── Floating particles ── */
        .particle {
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-110vh) translateX(30px); opacity: 0; }
        }

        /* ── Modal ── */
        .modal-backdrop {
          animation: fadeIn 0.3s ease-out both;
        }
        .modal-card {
          animation: modalPop 0.4s ease-out both;
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── All-revealed flourish ── */
        .all-revealed {
          animation: fadeIn 0.8s 0.3s ease-out both;
        }

        /* ── Mobile: faster gather, slightly different range ── */
        @media (max-width: 640px) {
          @keyframes curtainGatherLeft {
            0%   { transform: translateX(0) scaleX(1); opacity: 1; }
            60%  { transform: translateX(-70%) scaleX(0.35); opacity: 1; }
            100% { transform: translateX(-92%) scaleX(0.18); opacity: 0; }
          }
          @keyframes curtainGatherRight {
            0%   { transform: translateX(0) scaleX(1); opacity: 1; }
            60%  { transform: translateX(70%) scaleX(0.35); opacity: 1; }
            100% { transform: translateX(92%) scaleX(0.18); opacity: 0; }
          }
        }
      `}</style>
    </div>
  );
};

export default ArtistsPage;
