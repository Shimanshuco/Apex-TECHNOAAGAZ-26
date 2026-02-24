import React, { useState, useEffect, useRef, useCallback } from "react";

/* ── Edition Data ────────────────────────────────────── */
interface Edition {
  year: number;
  title: string;
  folder: string;
  imageCount: number;
}

const editions: Edition[] = [
  {
    year: 2023,
    title: "TECHNOAAGAZ 2023",
    folder: "/Techno23",
    imageCount: 25,
  },
  // Add more years here as they happen
  // { year: 2024, title: "TECHNOAAGAZ 2024", tagline: "...", folder: "/Techno24", imageCount: 30 },
];

function buildImages(edition: Edition) {
  return Array.from({ length: edition.imageCount }, (_, i) => ({
    id: i + 1,
    src: `${edition.folder}/${i + 1}.jpg`,
    alt: `${edition.title} — Memory ${i + 1}`,
  }));
}

type GalleryImage = ReturnType<typeof buildImages>[number];

/* ── Lightbox ────────────────────────────────────────── */
const Lightbox: React.FC<{
  image: GalleryImage | null;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ image, total, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (!image) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [image, onClose, onPrev, onNext]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/92 backdrop-blur-xl" onClick={onClose}>
      {/* close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-110 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 hover:rotate-90 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      {/* prev */}
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 md:left-6 z-110 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 hover:-translate-x-1 transition-all duration-300">
        <svg xmlns="http://www.w3.org/ 2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      {/* image */}
      <img src={image.src} alt={image.alt} className="max-h-[90vh] max-w-[95vw] md:max-w-[85vw] object-contain rounded-2xl shadow-2xl shadow-purple-500/20 animate-scale-in select-none" onClick={(e) => e.stopPropagation()} />
      {/* next */}
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 md:right-6 z-110 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 hover:translate-x-1 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      {/* counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/50 px-5 py-2 rounded-full backdrop-blur-sm border border-white/10">
        {image.id} / {total}
      </div>
    </div>
  );
};

/* ── Gallery Card ────────────────────────────────────── */
const GalleryCard: React.FC<{
  image: GalleryImage;
  editionTitle: string;
  index: number;
  onClick: () => void;
}> = ({ image, editionTitle, index, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delay = (index % 3) * 150;

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-90"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={onClick}
    >
      {/* Neon glow border */}
      <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-80 blur-md transition-all duration-500 z-0" />

      <div className="relative z-10 rounded-2xl overflow-hidden bg-gray-900 border border-white/5">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className="w-full h-72 sm:h-80 md:h-88 lg:h-104 object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
        />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <p className="text-white font-bold text-base drop-shadow-lg">{editionTitle}</p>
          <p className="text-amber-300 text-sm mt-1 font-medium">Memory #{image.id}</p>
        </div>

        {/* Expand icon */}
        <div className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </div>
      </div>
    </div>
  );
};

/* ── Floating Particles ──────────────────────────────── */
const Particles: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-purple-400/30 animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${6 + Math.random() * 8}s`,
        }}
      />
    ))}
  </div>
);

/* ── Main Page ───────────────────────────────────────── */
const PreviousTechnoPage: React.FC = () => {
  const [activeEdition, setActiveEdition] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  const edition = editions[activeEdition];
  const images = buildImages(edition);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const closeLightbox = () => setLightboxIdx(null);
  const goPrev = useCallback(() => {
    setLightboxIdx((p) => (p !== null ? (p - 1 + images.length) % images.length : null));
  }, [images.length]);
  const goNext = useCallback(() => {
    setLightboxIdx((p) => (p !== null ? (p + 1) % images.length : null));
  }, [images.length]);

  return (
    <>
      <Particles />

      {/* ── Hero Header ──────────────────────────────── */}
      <div className="text-center mb-16 relative z-10">
        <div className={`transition-all duration-1000 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6 animate-bounce-slow">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-sm font-semibold tracking-widest uppercase">Flashback Gallery</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-tight">
            <span className="block">
              <span className="bg-linear-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 35px rgba(255,180,0,0.5))", fontStyle: "italic" }}>
                TECHNOAAGAZ
              </span>
            </span>
            <span className="block text-3xl md:text-5xl lg:text-6xl font-bold text-white/90 mt-1" style={{ textShadow: "0 0 30px rgba(255,255,255,0.3)" }}>
              Previous Editions
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mt-4">
            A walk down memory lane — relive the unforgettable moments from past TECHNOAAGAZ festivals at Apex University.
          </p>
        </div>

        {/* Animated divider */}
        <div className={`mt-8 mx-auto h-0.5 bg-linear-to-r from-transparent via-amber-500/70 to-transparent transition-all duration-1500 ease-out ${headerVisible ? "w-56 md:w-80 opacity-100" : "w-0 opacity-0"}`} />
      </div>

      {/* ── Edition Tabs ─────────────────────────────── */}
      {editions.length > 1 && (
        <div className="flex justify-center gap-3 mb-12 flex-wrap relative z-10">
          {editions.map((ed, i) => (
            <button
              key={ed.year}
              onClick={() => { setActiveEdition(i); setLightboxIdx(null); }}
              className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all duration-300 ${
                i === activeEdition
                  ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(255,180,0,0.3)]"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {ed.year}
            </button>
          ))}
        </div>
      )}

      {/* ── Edition Title ────────────────────────────── */}
      <div className={`text-center mb-10 relative z-10 transition-all duration-700 ${headerVisible ? "opacity-100" : "opacity-0"}`}>
        <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
          <span className="bg-linear-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {edition.title}
          </span>
        </h2>

        <p className="text-amber-400/60 text-xs mt-2 font-semibold tracking-widest">{edition.imageCount} MEMORIES</p>
      </div>

      {/* ── Gallery Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7 relative z-10">
        {images.map((img, i) => (
          <GalleryCard
            key={`${edition.year}-${img.id}`}
            image={img}
            editionTitle={edition.title}
            index={i}
            onClick={() => setLightboxIdx(i)}
          />
        ))}
      </div>

      {/* ── CTA Footer ───────────────────────────────── */}
      <div className="text-center mt-20 mb-6 relative z-10">
        <div className="inline-block p-8 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-sm">
          <p className="text-gray-400 text-base mb-2">These were the memories.</p>
          <p className="text-white text-xl md:text-2xl font-bold mb-5">
            Ready for <span className="bg-linear-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">TECHNOAAGAZ 2026</span>?
          </p>
          <a
            href="/events"
            className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full font-bold text-white border-2 border-amber-400 bg-amber-500/10 hover:bg-amber-500/25 hover:shadow-[0_0_35px_rgba(255,180,0,0.3)] hover:scale-105 transition-all duration-300"
          >
            Explore Events 2026
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────── */}
      <Lightbox
        image={lightboxIdx !== null ? images[lightboxIdx] : null}
        total={images.length}
        onClose={closeLightbox}
        onPrev={goPrev}
        onNext={goNext}
      />

      {/* ── Extra Styles ─────────────────────────────── */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-40px) scale(1.5); opacity: 0.6; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-float { animation: float var(--dur, 8s) ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </>
  );
};

export default PreviousTechnoPage;
