import React from "react";
import { Card } from "../components";
import {
  Sparkles,
  CalendarDays,
  MapPin,
  Trophy,
  Code,
  Music,
  Lightbulb,
  Users,
} from "lucide-react";

const highlights = [
  {
    icon: Code,
    title: "Technical Events",
    desc: "Hackathons, coding contests, robotics, and more",
    color: "text-gold bg-gold/20",
  },
  {
    icon: Music,
    title: "Cultural Nights",
    desc: "Live performances, band shows, DJ nights",
    color: "text-gold-light bg-gold/20",
  },
  {
    icon: Lightbulb,
    title: "Workshops",
    desc: "Hands-on sessions with industry experts",
    color: "text-amber-400 bg-amber-500/20",
  },
  {
    icon: Trophy,
    title: "Competitions",
    desc: "Exciting prizes with national-level contests",
    color: "text-navy-light bg-navy/30",
  },
];

const AboutPage: React.FC = () => {
  return (
    <>
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm mb-6">
          <Sparkles size={14} /> Your Stage Your Story
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About{" "}
          <span className="bg-gradient-to-r from-navy to-gold bg-clip-text text-transparent">
            TECHNOAAGAZ 2026
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          TechnoAgaaz 2026 is a vibrant
          techno-cultural festival that
          celebrates innovation, creativity,
          tradition, and talent. This three-day
          extravaganza blends technical
          micro-activities, cultural
          performances, and immersive
          entertainment, culminating in a
          spectacular Celebrity Artist Night.
        </p>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Card variant="neon" glowColor="gold" className="text-center">
          <CalendarDays size={28} className="text-gold mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">10 — 13 March</h3>
          <p className="text-gray-400 text-sm mt-1">4 Days of Innovation</p>
        </Card>
        <Card variant="neon" glowColor="gold" className="text-center">
          <MapPin size={28} className="text-gold mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Apex University</h3>
          <p className="text-gray-400 text-sm mt-1">Jaipur, Rajasthan</p>
        </Card>
        <Card variant="neon" glowColor="navy" className="text-center">
          <Users size={28} className="text-navy-light mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">5000+ Participants</h3>
          <p className="text-gray-400 text-sm mt-1">From across India</p>
        </Card>
      </div>

      {/* Highlights */}
      <h2 className="text-2xl font-bold text-white mb-6">Event Highlights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {highlights.map((h) => (
          <Card key={h.title} variant="glass" className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${h.color}`}
            >
              <h.icon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{h.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{h.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Description */}
      <Card variant="glass" className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">Our Vision</h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            TECHNOAAGAZ is more than just a tech fest — it&#39;s a platform
            where innovation meets inspiration. Organized by Apex University,
            Jaipur, this annual celebration of technology and culture has grown
            to become one of Rajasthan&#39;s most anticipated collegiate events.
          </p>
          <p>
            From high-intensity hackathons and coding competitions to
            mesmerizing cultural performances and artist nights, TECHNOAAGAZ
            offers something for every student. Industry workshops, guest
            lectures from leading tech professionals, and hands-on labs provide
            invaluable learning experiences beyond the classroom.
          </p>
          <p>
            Join us for four unforgettable days of creativity, competition, and
            community. Whether you&#39;re a coder, a musician, an artist, or an
            innovator — TECHNOAAGAZ 2026 has a stage for you.
          </p>
        </div>
      </Card>
    </>
  );
};

export default AboutPage;
