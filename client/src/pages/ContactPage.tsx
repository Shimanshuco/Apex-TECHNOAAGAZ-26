import React from "react";
import { Card } from "../components";
import {
  Mail,
  MapPin,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Clock,
  Phone,
} from "lucide-react";

/* ── Social / Contact Data ─────────────────────────── */

const socials = [
  {
    icon: Instagram,
    label: "SWW Instagram",
    href: "https://www.instagram.com/au_studentwelfarewing?igsh=MXNqYnd0dmRkeml3bg==",
    handle: "@au_studentwelfarewing",
    color: "hover:text-pink-400",
    bg: "group-hover:bg-pink-500/20",
  },
  {
    icon: Instagram,
    label: "Apex University Instagram",
    href: "https://www.instagram.com/apex_university/",
    handle: "@apex_university",
    color: "hover:text-pink-400",
    bg: "group-hover:bg-pink-500/20",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://youtube.com/@sww-apexuniversity?si=AcBMJ236lRkgAksJ",
    handle: "@sww-apexuniversity",
    color: "hover:text-red-500",
    bg: "group-hover:bg-red-500/20",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/school/apex-university/",
    handle: "Apex University",
    color: "hover:text-blue-500",
    bg: "group-hover:bg-blue-500/20",
  },
  {
    icon: Globe,
    label: "Apex University Website",
    href: "https://www.apexuniversity.co.in/",
    handle: "apexuniversity.co.in",
    color: "hover:text-gold",
    bg: "group-hover:bg-gold/20",
  },
];

const ContactPage: React.FC = () => {
  return (
    <>
      {/* ── Header ─────────────────────────────────── */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-in-down">
          Get in Touch
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Have questions about TECHNOAAGAZ 2026? We&#39;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* ── Left Column: Organizers + Email + Date ── */}
        <div className="space-y-6">
          {/* ── Convenor & Co-Convenor ────────────────── */}
          <Card variant="neon" glowColor="gold">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Phone size={18} className="text-gold" />
              Event Organizers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group">
                <img
                  src="/convenor.jpg"
                  alt="Convenor"
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border-3 border-gold/50 shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform bg-gold/20 mb-4"
                />
                <p className="text-white font-bold text-lg">Convenor</p>
                <a href="tel:+917357053102" className="text-gold text-sm hover:underline mt-1">
                  +91 73570 53102
                </a>
              </div>
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group">
                <img
                  src="/co-convenor.jpg"
                  alt="Co-Convenor"
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border-3 border-navy-light/50 shadow-lg shadow-navy/20 group-hover:scale-105 transition-transform bg-navy/30 mb-4"
                />
                <p className="text-white font-bold text-lg">Co-Convenor</p>
                <a href="tel:+917541841303" className="text-gold text-sm hover:underline mt-1">
                  +91 75418 41303
                </a>
              </div>
            </div>
          </Card>

          {/* ── Email ─────────────────────────────────── */}
          <Card variant="glass" className="flex items-center gap-4 hover:bg-white/8 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-gold" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Email</h3>
              <a
                href="mailto:studentwelfare@apexmail.in"
                className="text-gold text-sm hover:underline block mt-0.5"
              >
                studentwelfare@apexmail.in
              </a>
            </div>
          </Card>

          {/* ── Event Date ─────────────────────────────── */}
          <Card variant="glass">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Event Dates</h3>
                <p className="text-gray-300 text-sm mt-1">
                  10<sup>th</sup> — 12<sup>th</sup> March 2026
                  <br />
                  <span className="text-gray-500">Gates open 9:00 AM daily</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right Column: Socials + Venue + Map ──── */}
        <div className="space-y-6">
          {/* ── Follow Us ──────────────────────────── */}
          <Card variant="glass">
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="space-y-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 transition-all duration-300 ${s.color}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 transition-all duration-300 ${s.bg}`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <span className="block font-medium">{s.label}</span>
                    <span className="text-xs text-gray-500">{s.handle}</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          {/* ── Venue ──────────────────────────────── */}
          <Card variant="neon" glowColor="navy">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-navy/30 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-navy-light" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Venue</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Apex Institute of Engineering and Technology
                  <br />
                  Jaipur, Rajasthan, India
                </p>
              </div>
            </div>
          </Card>

          {/* ── Map ────────────────────────────────── */}
          <Card variant="glass" className="overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
            <div className="w-full h-64 rounded-xl overflow-hidden border border-white/5">
              <iframe
                title="Apex Institute of Engineering and Technology"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3562.3089848736513!2d75.84953027521908!3d26.766418976734652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396dc9ee616c7551%3A0x166db839a656b446!2sApex%20Institute%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1771785903655!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
