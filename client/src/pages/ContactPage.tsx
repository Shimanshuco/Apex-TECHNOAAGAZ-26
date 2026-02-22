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
} from "lucide-react";

const contacts = [
  {
    name: "General Inquiries",
    email: "info@technoaagaz.in",
    phone: "+91 98765 43210",
  },
  {
    name: "Event Registration",
    email: "register@technoaagaz.in",
    phone: "+91 98765 43211",
  },
  {
    name: "Sponsorship",
    email: "sponsor@technoaagaz.in",
    phone: "+91 98765 43212",
  },
];

const socials = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/technoaagaz",
    handle: "@technoaagaz",
    color: "hover:text-pink-400",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://youtube.com/@technoaagaz",
    handle: "@technoaagaz",
    color: "hover:text-red-500",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/company/technoaagaz",
    handle: "TECHNOAAGAZ",
    color: "hover:text-blue-500",
  },
  {
    icon: Globe,
    label: "Website",
    href: "https://technoaagaz.in",
    handle: "technoaagaz.in",
    color: "hover:text-gold",
  },
];

const ContactPage: React.FC = () => {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Get in Touch</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Have questions about TECHNOAAGAZ 2026? We&#39;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Contact cards */}
        <div className="space-y-4">
          {contacts.map((c) => (
            <Card key={c.name} variant="glass" className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-gold" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{c.name}</h3>
                <a
                  href={`mailto:${c.email}`}
                  className="text-gold text-sm hover:underline block mt-1"
                >
                  {c.email}
                </a>
                <a
                  href={`tel:${c.phone.replace(/\s/g, "")}`}
                  className="text-gray-400 text-sm hover:text-white block mt-0.5"
                >
                  {c.phone}
                </a>
              </div>
            </Card>
          ))}

          {/* Location */}
          <Card variant="neon" glowColor="navy">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-navy/30 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-navy-light" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Venue</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Apex University Campus
                  <br />
                  Jaipur, Rajasthan, India
                </p>
              </div>
            </div>
          </Card>

          {/* Timings */}
          <Card variant="glass">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Event Dates</h3>
                <p className="text-gray-300 text-sm mt-1">
                  10<sup>th</sup> — 13<sup>th</sup> March 2026
                  <br />
                  <span className="text-gray-500">
                    Gates open 9:00 AM daily
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Social + Map */}
        <div className="space-y-6">
          <Card variant="glass">
            <h3 className="text-lg font-semibold text-white mb-4">
              Follow Us
            </h3>
            <div className="space-y-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 transition-all ${s.color}`}
                >
                  <s.icon size={20} />
                  <div>
                    <span className="block font-medium">{s.label}</span>
                    <span className="text-xs text-gray-500">{s.handle}</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          {/* Map placeholder */}
          <Card variant="glass" className="overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
            <div className="w-full h-56 rounded-xl bg-gray-800/50 border border-white/5 flex items-center justify-center">
              <iframe
                title="Apex University Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.123!2d75.7873115!3d26.9124019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU0JzQ0LjYiTiA3NcKwNDcnMTQuMyJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                className="w-full h-full rounded-xl border-0"
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
