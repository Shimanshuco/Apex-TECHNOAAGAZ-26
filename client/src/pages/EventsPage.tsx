import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Button } from "../components";
import { useAuth } from "../context/AuthContext";
import {
  CalendarDays,
  MapPin,
  Filter,
  Plus,
  Users,
  User,
} from "lucide-react";

interface Event {
  _id: string;
  title: string;
  category: string;
  cost: number;
  venue: string;
  participationType: "solo" | "team";
  date: string;
  image?: string;
}

const CATEGORIES = [
  { value: "", label: "All Events" },
  { value: "cultural", label: "Cultural" },
  { value: "literary", label: "Literary" },
  { value: "trending_event", label: "Trending Event" },
  { value: "technical", label: "Technical" },
];

const CATEGORY_COLORS: Record<string, string> = {
  cultural: "bg-gold/20 text-gold border-gold/30",
  literary: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  trending_event: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  technical: "bg-navy/30 text-blue-300 border-navy-light/40",
};

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [pricing, setPricing] = useState<{
    apex: number;
    otherEarly: number;
    otherRegular: number;
    isEarlyBird: boolean;
  } | null>(null);

  // Fetch pricing once on mount
  useEffect(() => {
    api<{ data: { apex: number; otherEarly: number; otherRegular: number; isEarlyBird: boolean } }>("/events/pricing")
      .then((res) => setPricing(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const endpoint = activeCategory
          ? `/events/category/${activeCategory}`
          : "/events";
        const res = await api<{ data: Event[] }>(endpoint);
        setEvents(res.data);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeCategory]);

  // Compute display price for a paid event
  const getDisplayPrice = (): string => {
    if (!pricing) return "Paid";
    if (user?.university === "apex_university") return `₹${pricing.apex}`;
    return pricing.isEarlyBird ? `₹${pricing.otherEarly}` : `₹${pricing.otherRegular}`;
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-navy to-gold bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-gray-400 mt-1">
            Discover and register for TECHNOAAGAZ 2026 events
          </p>
        </div>
        {user?.role === "admin" && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/admin/events/new")}
          >
            <span className="flex items-center gap-2">
              <Plus size={18} /> Create Event
            </span>
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <Filter size={18} className="text-gray-500 mt-2 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                activeCategory === cat.value
                  ? "bg-gold/20 text-gold border-gold/40"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No events found</p>
          <p className="text-gray-600 text-sm mt-1">
            Check back later or try a different category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event._id}
              variant="glass"
              className="hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              <div onClick={() => navigate(`/events/${event._id}`)}>
                {/* Event image */}
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-lg mb-4 -mt-1"
                  />
                )}

                {/* Category badge */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3 ${
                    CATEGORY_COLORS[event.category] || CATEGORY_COLORS.technical
                  }`}
                >
                  {event.category.replace("_", " ").toUpperCase()}
                </span>

                {/* Participation badge */}
                <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium border bg-white/5 text-gray-300 border-white/10 mb-3">
                  {event.participationType === "team" ? (
                    <span className="flex items-center gap-1"><Users size={12} /> Team</span>
                  ) : (
                    <span className="flex items-center gap-1"><User size={12} /> Solo</span>
                  )}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors mb-3 line-clamp-2">
                  {event.title}
                </h3>

                {/* Meta */}
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-gold/70" />
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gold/70" />
                    {event.venue}
                  </div>

                  {/* Cost */}
                  <div className="flex items-center gap-2 font-semibold">
                    {event.cost > 0 ? (
                      <span className="text-white">{getDisplayPrice()}</span>
                    ) : (
                      <span className="text-green-400">Free</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default EventsPage;
