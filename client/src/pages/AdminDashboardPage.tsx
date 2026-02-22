import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";

import {
  Users,
  CalendarDays,
  CheckCircle,
  Clock,
  Shield,
  Plus,
  QrCode,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Eye,
  IndianRupee,
  UserCircle,
  Mail,
  Phone,
  GraduationCap,
  User,
  Music,
  Image,
  X,
  Save,
  MapPin,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface Stats {
  total: number;
  verified: number;
  pending: number;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  university?: string;
  collegeName?: string;
  isVerified: boolean;
  createdAt: string;
}

interface EventItem {
  _id: string;
  title: string;
  category: string;
  participationType: "solo" | "team";
  minTeamSize: number;
  maxTeamSize: number;
  date: string;
  isActive: boolean;
  image?: string;
  cost: number;
  venue: string;
}

interface RegistrationItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    university?: string;
    collegeName?: string;
    role: string;
  };
  teamName?: string;
  teamMembers: { name: string; email: string; phone: string; university?: string; collegeName?: string }[];
  paymentStatus: string;
  paymentId?: string;
  amount: number;
  createdAt: string;
}

interface ArtistItem {
  _id: string;
  name: string;
  description: string;
  photo: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "participant", label: "Participants" },
  { value: "volunteer", label: "Volunteers" },
  { value: "admin", label: "Admins" },
];

const CATEGORY_COLORS: Record<string, string> = {
  cultural: "bg-gold/15 text-gold border-gold/20",
  literary: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  trending_event: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  technical: "bg-navy/20 text-blue-300 border-navy-light/20",
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
const getUserUniversity = (u: { university?: string; collegeName?: string }) => {
  if (!u.university) return "—";
  return u.university === "apex_university" ? "Apex University" : u.collegeName || "Other";
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ═══════════════════════════════════════════════════════
   ARTIST FORM MODAL
   ═══════════════════════════════════════════════════════ */
const ArtistFormModal: React.FC<{
  artist: ArtistItem | null;
  onClose: () => void;
  onSaved: () => void;
  token: string | null;
}> = ({ artist, onClose, onSaved, token }) => {
  const isEdit = !!artist;
  const [name, setName] = useState(artist?.name || "");
  const [description, setDescription] = useState(artist?.description || "");
  const [photo, setPhoto] = useState(artist?.photo || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !photo.trim()) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api(`/artists/${artist._id}`, {
          method: "PUT",
          body: { name: name.trim(), description: description.trim(), photo: photo.trim() },
          token,
        });
      } else {
        await api("/artists", {
          method: "POST",
          body: { name: name.trim(), description: description.trim(), photo: photo.trim() },
          token,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save artist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-gray-900 border border-gold/20 rounded-2xl shadow-2xl shadow-gold/10 overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music size={18} className="text-gold" />
            {isEdit ? "Edit Artist" : "Add New Artist"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <Input
            label="Artist Name"
            placeholder="Enter artist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Photo URL"
            placeholder="https://example.com/photo.jpg"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            required
          />

          {photo && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10">
              <img src={photo} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}

          <Textarea
            label="Description"
            placeholder="Write about the artist..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="md" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1" disabled={saving}>
              <span className="flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : isEdit ? "Update" : "Create"}
              </span>
            </Button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes animateIn { from { opacity:0; transform: scale(.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .animate-in { animation: animateIn .25s ease-out both; }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  /* ── State ── */
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "events" | "artists">("users");

  // Events
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Record<string, RegistrationItem[]>>({});
  const [regLoading, setRegLoading] = useState<string | null>(null);

  // Artists
  const [artistModal, setArtistModal] = useState<{ open: boolean; artist: ArtistItem | null }>({ open: false, artist: null });

  /* ── Data fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, eventsRes, artistsRes] = await Promise.all([
        api<{ data: Stats }>("/qr/stats", { token }),
        api<{ data: UserItem[] }>(roleFilter ? `/admin/users/${roleFilter}` : "/admin/users", { token }),
        api<{ data: EventItem[] }>("/events"),
        api<{ data: ArtistItem[] }>("/artists"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
      setArtists(artistsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, roleFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Event helpers ── */
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event permanently?")) return;
    try {
      await api(`/events/${id}`, { method: "DELETE", token });
      setEvents((p) => p.filter((e) => e._id !== id));
    } catch (err) { console.error(err); }
  };

  const toggleEventRegistrations = async (eventId: string) => {
    if (expandedEvent === eventId) { setExpandedEvent(null); return; }
    setExpandedEvent(eventId);
    if (!registrations[eventId]) {
      setRegLoading(eventId);
      try {
        const res = await api<{ data: RegistrationItem[] }>(`/events/${eventId}/registrations`, { token });
        setRegistrations((p) => ({ ...p, [eventId]: res.data }));
      } catch { setRegistrations((p) => ({ ...p, [eventId]: [] })); }
      finally { setRegLoading(null); }
    }
  };

  /* ── Artist helpers ── */
  const handleDeleteArtist = async (id: string) => {
    if (!confirm("Delete this artist?")) return;
    try {
      await api(`/artists/${id}`, { method: "DELETE", token });
      setArtists((p) => p.filter((a) => a._id !== id));
    } catch (err) { console.error(err); }
  };

  const refreshArtists = async () => {
    try {
      const res = await api<{ data: ArtistItem[] }>("/artists");
      setArtists(res.data);
    } catch { /* noop */ }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={36} className="text-gold animate-spin" />
        <p className="text-gray-500 text-sm">Loading dashboard…</p>
      </div>
    );
  }

  const tabs = [
    { key: "users" as const, icon: Users, label: "Users", count: users.length },
    { key: "events" as const, icon: CalendarDays, label: "Events", count: events.length },
    { key: "artists" as const, icon: Music, label: "Artists", count: artists.length },
  ];

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">Admin Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Manage TECHNOAAGAZ 2026</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="md" onClick={() => navigate("/admin/events/new")}>
            <span className="flex items-center gap-2"><Plus size={16} /> New Event</span>
          </Button>
          <Button variant="outline" size="md" onClick={() => setArtistModal({ open: true, artist: null })}>
            <span className="flex items-center gap-2"><Music size={16} /> Add Artist</span>
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate("/qr/verify")}>
            <span className="flex items-center gap-2"><QrCode size={16} /> QR Scan</span>
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { value: stats.total, label: "Total Registrations", icon: Users, iconBg: "bg-gold/20", iconColor: "text-gold", glow: "gold" as const },
            { value: stats.verified, label: "Verified", icon: CheckCircle, iconBg: "bg-green-500/20", iconColor: "text-green-400", glow: "gold" as const },
            { value: stats.pending, label: "Pending", icon: Clock, iconBg: "bg-yellow-500/20", iconColor: "text-yellow-400", glow: "navy" as const },
          ].map((s, i) => (
            <Card key={i} variant="neon" glowColor={s.glow}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                  <s.icon size={22} className={s.iconColor} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === t.key
                ? "bg-gold/15 text-gold shadow-sm shadow-gold/10"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <t.icon size={15} />
            {t.label}
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === t.key ? "bg-gold/20 text-gold" : "bg-white/5 text-gray-600"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          USERS TAB
         ═══════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Shield size={16} className="text-gray-500" />
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-gray-900/80 border border-white/10 rounded-lg text-white text-sm px-4 py-2 pr-8 focus:outline-none focus:border-gold transition-colors"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <Card variant="glass" className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-white/5">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 hidden md:table-cell font-medium">University</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="text-gray-300 hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-medium text-white">{u.name}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell truncate max-w-45 text-gray-400">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell text-gray-400">{getUserUniversity(u)}</td>
                    <td className="py-3">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 border border-green-500/20 text-green-400">
                          <CheckCircle size={10} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-gray-600 py-10">No users found</p>}
          </Card>
        </>
      )}

      {/* ═══════════════════════════════════════════════
          EVENTS TAB
         ═══════════════════════════════════════════════ */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {events.length === 0 && (
            <div className="flex flex-col items-center py-16 text-gray-600">
              <CalendarDays size={40} className="mb-3 opacity-30" />
              <p>No events yet</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate("/admin/events/new")}>
                <span className="flex items-center gap-2"><Plus size={14} /> Create Event</span>
              </Button>
            </div>
          )}

          {events.map((evt) => {
            const isExpanded = expandedEvent === evt._id;
            const regs = registrations[evt._id];
            const isRegLoading = regLoading === evt._id;
            const catClass = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.technical;

            return (
              <Card
                key={evt._id}
                variant="glass"
                className={`transition-all duration-300 hover:border-white/15 ${isExpanded ? "ring-1 ring-gold/25" : ""}`}
              >
                {/* ── Event Header ── */}
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {evt.image ? (
                    <div className="hidden sm:block w-24 h-24 rounded-xl overflow-hidden border border-white/5 shrink-0">
                      <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="hidden sm:flex w-24 h-24 rounded-xl bg-white/5 border border-white/5 items-center justify-center shrink-0">
                      <CalendarDays size={28} className="text-gray-700" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">{evt.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {/* Category */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catClass}`}>
                            <Tag size={9} />
                            {evt.category.replace("_", " ")}
                          </span>
                          {/* Solo/Team */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-navy/20 border border-navy-light/20 text-blue-300">
                            {evt.participationType === "team" ? <><Users size={9} /> Team ({evt.minTeamSize || 2}–{evt.maxTeamSize || 5})</> : <><User size={9} /> Solo</>}
                          </span>
                          {/* Cost */}
                          {evt.cost > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/10 border border-gold/20 text-gold">
                              <IndianRupee size={9} />{evt.cost}
                            </span>
                          )}
                          {/* Active */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${evt.isActive ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                            {evt.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleEventRegistrations(evt._id)}
                          title="View registrations"
                          className={`p-2 rounded-lg border transition-all duration-200 ${
                            isExpanded
                              ? "bg-gold/15 border-gold/30 text-gold shadow-sm shadow-gold/10"
                              : "border-white/10 text-gray-500 hover:text-gold hover:bg-gold/10 hover:border-gold/20"
                          }`}
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/events/edit/${evt._id}`)}
                          title="Edit event"
                          className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all duration-200"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt._id)}
                          title="Delete event"
                          className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-gold/50" />
                        {formatDate(evt.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gold/50" />
                        {evt.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Expanded Registrations ── */}
                {isExpanded && (
                  <div className="border-t border-white/5 pt-5 mt-5 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Users size={14} className="text-gold" />
                      Registrations
                      {regs && (
                        <span className="px-2 py-0.5 rounded-full bg-gold/10 text-[10px] text-gold font-semibold">
                          {regs.length}
                        </span>
                      )}
                    </h4>

                    {isRegLoading || !regs ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={20} className="text-gold animate-spin" />
                      </div>
                    ) : regs.length === 0 ? (
                      <div className="text-center py-8 text-gray-600 text-sm">No registrations yet</div>
                    ) : (
                      <div className="space-y-2">
                        {regs.map((reg) => (
                          <div key={reg._id} className="rounded-xl bg-gray-900/60 border border-white/5 overflow-hidden">
                            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-navy/40 to-gold/20 border border-white/10 flex items-center justify-center shrink-0">
                                <UserCircle size={20} className="text-gray-400" />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm">{reg.user?.name || "Unknown"}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                    <Mail size={10} /> {reg.user?.email}
                                  </span>
                                  {reg.user?.phone && (
                                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                      <Phone size={10} /> {reg.user.phone}
                                    </span>
                                  )}
                                  {reg.user?.university && (
                                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                      <GraduationCap size={10} /> {getUserUniversity(reg.user)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Payment badge */}
                              <div className="flex items-center gap-2 shrink-0">
                                {reg.amount > 0 && (
                                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                                    reg.paymentStatus === "completed"
                                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                      : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                                  }`}>
                                    <IndianRupee size={10} />
                                    {reg.amount}
                                    <span className="ml-0.5 opacity-70">{reg.paymentStatus === "completed" ? "Paid" : "Pending"}</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-600">
                                  {new Date(reg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                            </div>

                            {/* Team members */}
                            {reg.teamName && reg.teamMembers.length > 0 && (
                              <div className="px-4 pb-4">
                                <div className="rounded-lg bg-gold/5 border border-gold/10 p-3">
                                  <p className="text-xs font-semibold text-gold mb-2 flex items-center gap-1.5">
                                    <Users size={12} />
                                    Team: {reg.teamName}
                                    <span className="text-gold/50 ml-1">({reg.teamMembers.length} members)</span>
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {reg.teamMembers.map((m, i) => (
                                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/2 border border-white/5">
                                        <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-[10px] text-gold font-bold shrink-0 mt-0.5">
                                          {i + 1}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs text-gray-300 font-medium truncate">{m.name}</p>
                                          <div className="flex flex-col gap-0.5 text-[10px] text-gray-500 mt-0.5">
                                            <span className="flex items-center gap-1 truncate">
                                              <Mail size={9} /> {m.email}
                                            </span>
                                            {m.phone && (
                                              <span className="flex items-center gap-1">
                                                <Phone size={9} /> {m.phone}
                                              </span>
                                            )}
                                            {m.university && (
                                              <span className="flex items-center gap-1">
                                                <GraduationCap size={9} />
                                                {m.university === "apex_university"
                                                  ? "Apex University"
                                                  : m.collegeName || "Other"}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          ARTISTS TAB
         ═══════════════════════════════════════════════ */}
      {activeTab === "artists" && (
        <div>
          {/* Top action bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-400">
              {artists.length} artist{artists.length !== 1 ? "s" : ""} in lineup
            </p>
            <Button variant="primary" size="sm" onClick={() => setArtistModal({ open: true, artist: null })}>
              <span className="flex items-center gap-2"><Plus size={14} /> Add Artist</span>
            </Button>
          </div>

          {artists.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-600">
              <Music size={40} className="mb-3 opacity-30" />
              <p>No artists added yet</p>
              <p className="text-xs text-gray-700 mt-1">Click "Add Artist" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {artists.map((a) => (
                <Card key={a._id} variant="glass" className="group relative overflow-hidden hover:border-gold/20 transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-3/4 -mx-6 -mt-6 mb-4 overflow-hidden">
                    {a.photo ? (
                      <img
                        src={a.photo}
                        alt={a.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Image size={40} className="text-gray-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                    {/* Floating action buttons */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <button
                        onClick={() => setArtistModal({ open: true, artist: a })}
                        className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-gold/20 hover:border-gold/30 hover:text-gold transition-all"
                        title="Edit artist"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteArtist(a._id)}
                        className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all"
                        title="Delete artist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-lg">{a.name}</h3>
                      <p className="text-gold/80 text-xs flex items-center gap-1 mt-0.5">
                        <Music size={11} /> Featured Artist
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{a.description}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-gray-600">
                      Added {formatDate(a.createdAt)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setArtistModal({ open: true, artist: a })}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gold hover:bg-gold/10 transition-all"
                        title="Edit"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteArtist(a._id)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Artist Modal ── */}
      {artistModal.open && (
        <ArtistFormModal
          artist={artistModal.artist}
          onClose={() => setArtistModal({ open: false, artist: null })}
          onSaved={refreshArtists}
          token={token}
        />
      )}
    </>
  );
};

export default AdminDashboardPage;
