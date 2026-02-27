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
  IndianRupee,
  User,
  Music,
  Image,
  X,
  Save,
  MapPin,
  Tag,
  Loader2,
  AlertCircle,
  CreditCard,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Phone,
  UserCheck,
  UsersRound,
  FolderOpen,
  Link,
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

interface ArtistItem {
  _id: string;
  name: string;
  description: string;
  photo: string;
  createdAt: string;
}

interface PendingPayment {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string; university?: string; collegeName?: string };
  event: { _id: string; title: string; category: string; cost: number; date: string };
  amount: number;
  paymentStatus: string;
  paymentScreenshot?: string;
  createdAt: string;
}

interface RegistrationItem {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string; university?: string; collegeName?: string; role?: string; gender?: string };
  event: { _id: string; title: string; category: string; date: string };
  teamName?: string;
  teamMembers: { name: string; email: string; phone: string }[];
  paymentStatus: "pending" | "completed" | "failed";
  paymentScreenshot?: string;
  amount: number;
  createdAt: string;
}

type EventRegStats = Record<string, { total: number; completed: number; pending: number; failed: number }>;

interface GalleryFolderItem {
  _id: string;
  year: number;
  title: string;
  driveFolderId: string;
  isActive: boolean;
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
  const [activeTab, setActiveTab] = useState<"users" | "events" | "artists" | "payments" | "gallery">("users");

  // Payments
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  // Event Registrations
  const [eventRegStats, setEventRegStats] = useState<EventRegStats>({});
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<Record<string, RegistrationItem[]>>({});
  const [loadingRegistrations, setLoadingRegistrations] = useState<string | null>(null);

  // Artists
  const [artistModal, setArtistModal] = useState<{ open: boolean; artist: ArtistItem | null }>({ open: false, artist: null });

  // Gallery
  const [galleryFolders, setGalleryFolders] = useState<GalleryFolderItem[]>([]);
  const [galleryForm, setGalleryForm] = useState({ year: "", title: "", driveFolderLink: "" });
  const [galleryEditing, setGalleryEditing] = useState<string | null>(null);
  const [gallerySaving, setGallerySaving] = useState(false);
  const [galleryError, setGalleryError] = useState("");

  /* ── Data fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, eventsRes, artistsRes, paymentsRes, regStatsRes, galleryRes] = await Promise.all([
        api<{ data: Stats }>("/qr/stats", { token }),
        api<{ data: UserItem[] }>(roleFilter ? `/admin/users/${roleFilter}` : "/admin/users", { token }),
        api<{ data: EventItem[] }>("/events"),
        api<{ data: ArtistItem[] }>("/artists"),
        api<{ data: PendingPayment[] }>("/admin/registrations/pending", { token }),
        api<{ data: EventRegStats }>("/admin/events/registration-stats", { token }),
        api<{ data: GalleryFolderItem[] }>("/gallery/all", { token }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
      setArtists(artistsRes.data);
      setPendingPayments(paymentsRes.data);
      setEventRegStats(regStatsRes.data);
      setGalleryFolders(galleryRes.data || []);
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

  const fetchEventRegistrations = async (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }
    setExpandedEventId(eventId);
    if (eventRegistrations[eventId]) return;
    setLoadingRegistrations(eventId);
    try {
      const res = await api<{ data: RegistrationItem[] }>(`/events/${eventId}/registrations`, { token });
      setEventRegistrations((prev) => ({ ...prev, [eventId]: res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegistrations(null);
    }
  };



  /* ── Payment helpers ── */
  const handleApprovePayment = async (id: string) => {
    setProcessingPaymentId(id);
    try {
      await api(`/admin/registrations/${id}/approve`, { method: "PATCH", token });
      setPendingPayments((p) => p.filter((pp) => pp._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRejectPayment = async (id: string) => {
    if (!confirm("Reject this payment? The student will need to re-register.")) return;
    setProcessingPaymentId(id);
    try {
      await api(`/admin/registrations/${id}/reject`, { method: "PATCH", token });
      setPendingPayments((p) => p.filter((pp) => pp._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingPaymentId(null);
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

  /* ── Gallery helpers ── */
  const resetGalleryForm = () => {
    setGalleryForm({ year: "", title: "", driveFolderLink: "" });
    setGalleryEditing(null);
    setGalleryError("");
  };

  const handleSaveGalleryFolder = async () => {
    if (!galleryForm.year.trim() || !galleryForm.title.trim() || !galleryForm.driveFolderLink.trim()) {
      setGalleryError("All fields are required");
      return;
    }
    setGallerySaving(true);
    setGalleryError("");
    try {
      const payload = { ...galleryForm, year: Number(galleryForm.year) };
      if (galleryEditing) {
        await api(`/gallery/${galleryEditing}`, { method: "PUT", token, body: payload });
      } else {
        await api("/gallery", { method: "POST", token, body: payload });
      }
      const res = await api<{ data: GalleryFolderItem[] }>("/gallery/all", { token });
      setGalleryFolders(res.data || []);
      resetGalleryForm();
    } catch (err: any) {
      setGalleryError(err?.message || "Failed to save gallery folder");
    } finally {
      setGallerySaving(false);
    }
  };

  const handleEditGalleryFolder = (folder: GalleryFolderItem) => {
    setGalleryForm({ year: String(folder.year), title: folder.title, driveFolderLink: folder.driveFolderId });
    setGalleryEditing(folder._id);
    setGalleryError("");
  };

  const handleDeleteGalleryFolder = async (id: string) => {
    if (!confirm("Delete this gallery folder?")) return;
    try {
      await api(`/gallery/${id}`, { method: "DELETE", token });
      setGalleryFolders((prev) => prev.filter((f) => f._id !== id));
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
    { key: "payments" as const, icon: CreditCard, label: "Payments", count: pendingPayments.length },
    { key: "artists" as const, icon: Music, label: "Artists", count: artists.length },
    { key: "gallery" as const, icon: FolderOpen, label: "Gallery", count: galleryFolders.length },
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
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
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
            const catClass = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.technical;

            return (
              <Card
                key={evt._id}
                variant="glass"
                className="transition-all duration-300 hover:border-white/15"
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
                      {/* Registration count badge */}
                      {eventRegStats[evt._id] && (
                        <span className="flex items-center gap-1.5">
                          <UserCheck size={12} className="text-gold/50" />
                          <span className="text-white font-medium">{eventRegStats[evt._id].total}</span> registered
                          {eventRegStats[evt._id].pending > 0 && (
                            <span className="text-yellow-400">({eventRegStats[evt._id].pending} pending)</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── View Registrations Toggle ── */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => fetchEventRegistrations(evt._id)}
                    className="flex items-center gap-2 text-sm font-medium text-gold/80 hover:text-gold transition-colors"
                  >
                    <Users size={14} />
                    {expandedEventId === evt._id ? "Hide" : "View"} Registrations
                    {eventRegStats[evt._id] && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gold/10 border border-gold/20 text-gold">
                        {eventRegStats[evt._id].total}
                      </span>
                    )}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${expandedEventId === evt._id ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* ── Expanded Registrations Panel ── */}
                {expandedEventId === evt._id && (
                  <div className="mt-4 space-y-4">
                    {loadingRegistrations === evt._id ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={22} className="text-gold animate-spin" />
                        <span className="ml-2 text-sm text-gray-500">Loading registrations…</span>
                      </div>
                    ) : (
                      (() => {
                        const regs = eventRegistrations[evt._id] || [];
                        if (regs.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <Users size={28} className="mx-auto text-gray-700 mb-2" />
                              <p className="text-sm text-gray-600">No registrations yet</p>
                            </div>
                          );
                        }

                        // Separate team registrations (have teamName) from solo/individual
                        const teamRegs = regs.filter((r) => r.teamName);

                        // Collect all emails that are already in a team (leaders + members)
                        const teamEmails = new Set<string>();
                        for (const t of teamRegs) {
                          teamEmails.add(t.user.email.toLowerCase());
                          for (const m of t.teamMembers) {
                            teamEmails.add(m.email.toLowerCase());
                          }
                        }

                        // Only show people who are NOT part of any team
                        const individualRegs = regs.filter(
                          (r) => !r.teamName && !teamEmails.has(r.user.email.toLowerCase())
                        );

                        const paymentBadge = (status: string) => {
                          if (status === "completed") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 border border-green-500/20 text-green-400"><CheckCircle size={9} /> Paid</span>;
                          if (status === "pending") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><Clock size={9} /> Pending</span>;
                          return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400"><AlertCircle size={9} /> Rejected</span>;
                        };

                        return (
                          <>
                            {/* Registration Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-white">{regs.length}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                              </div>
                              <div className="bg-green-500/5 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-green-400">{regs.filter((r) => r.paymentStatus === "completed").length}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Paid</p>
                              </div>
                              <div className="bg-yellow-500/5 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-yellow-400">{regs.filter((r) => r.paymentStatus === "pending").length}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pending</p>
                              </div>
                              <div className="bg-blue-500/5 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-blue-400">{teamRegs.length}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Teams</p>
                              </div>
                            </div>

                            {/* Teams Section */}
                            {teamRegs.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                                  <UsersRound size={15} className="text-gold" />
                                  Teams ({teamRegs.length})
                                </h4>
                                <div className="space-y-3">
                                  {teamRegs.map((team) => (
                                    <div key={team._id} className="bg-white/3 border border-white/5 rounded-xl p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-sm font-semibold text-gold">{team.teamName}</h5>
                                        {paymentBadge(team.paymentStatus)}
                                      </div>
                                      {/* Team Leader */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gold/15 text-gold border border-gold/20 uppercase tracking-wider">Leader</span>
                                        <span className="text-sm text-white font-medium">{team.user.name}</span>
                                        <span className="text-xs text-gray-500">{team.user.email}</span>
                                        {team.user.phone && <span className="text-xs text-gray-500 flex items-center gap-0.5"><Phone size={9} />{team.user.phone}</span>}
                                      </div>
                                      {/* Team Members */}
                                      {team.teamMembers.length > 0 && (
                                        <div className="ml-4 space-y-1.5 mt-2 border-l-2 border-white/5 pl-3">
                                          {team.teamMembers.map((m, mi) => (
                                            <div key={mi} className="flex flex-wrap items-center gap-2 text-xs">
                                              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-gray-400 border border-white/5">Member</span>
                                              <span className="text-gray-300 font-medium">{m.name}</span>
                                              <span className="text-gray-500">{m.email}</span>
                                              <span className="text-gray-500 flex items-center gap-0.5"><Phone size={9} />{m.phone}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
                                        <span>University: {getUserUniversity(team.user)}</span>
                                        <span>Amount: ₹{team.amount}</span>
                                        <span>Registered: {formatDate(team.createdAt)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Individual Registrations */}
                            {individualRegs.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                                  <User size={15} className="text-gold" />
                                  {evt.participationType === "team" ? "Individual Registrations (No Team Yet)" : "Registrations"} ({individualRegs.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-left text-gray-500 border-b border-white/5">
                                        <th className="pb-2 pr-3 font-medium">Name</th>
                                        <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Email</th>
                                        <th className="pb-2 pr-3 font-medium hidden md:table-cell">Phone</th>
                                        <th className="pb-2 pr-3 font-medium hidden lg:table-cell">University</th>
                                        <th className="pb-2 pr-3 font-medium">Payment</th>
                                        <th className="pb-2 font-medium hidden sm:table-cell">Date</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/3">
                                      {individualRegs.map((reg) => (
                                        <tr key={reg._id} className="text-gray-300 hover:bg-white/3 transition-colors">
                                          <td className="py-2.5 pr-3 font-medium text-white">{reg.user.name}</td>
                                          <td className="py-2.5 pr-3 hidden sm:table-cell text-gray-400 truncate max-w-36">{reg.user.email}</td>
                                          <td className="py-2.5 pr-3 hidden md:table-cell text-gray-400">{reg.user.phone || "—"}</td>
                                          <td className="py-2.5 pr-3 hidden lg:table-cell text-gray-400">{getUserUniversity(reg.user)}</td>
                                          <td className="py-2.5 pr-3">{paymentBadge(reg.paymentStatus)}</td>
                                          <td className="py-2.5 hidden sm:table-cell text-gray-500">{formatDate(reg.createdAt)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          PAYMENTS TAB
         ═══════════════════════════════════════════════ */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">
              {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? "s" : ""} to review
            </p>
            <Button variant="outline" size="sm" onClick={fetchAll}>
              <span className="flex items-center gap-2"><Loader2 size={14} /> Refresh</span>
            </Button>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-600">
              <CheckCircle size={40} className="mb-3 opacity-30" />
              <p>All payments verified!</p>
              <p className="text-xs text-gray-700 mt-1">No pending screenshots to review</p>
            </div>
          ) : (
            pendingPayments.map((p) => (
              <Card key={p._id} variant="glass" className="hover:border-white/15 transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Screenshot preview thumbnail */}
                  {p.paymentScreenshot && (
                    <button
                      type="button"
                      onClick={() => setPreviewScreenshot(p.paymentScreenshot || null)}
                      className="relative w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden border border-white/10 shrink-0 group cursor-pointer"
                    >
                      <img
                        src={p.paymentScreenshot}
                        alt="Payment screenshot"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Eye size={20} className="text-white" />
                      </div>
                    </button>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{p.user.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{p.user.email}</p>
                        {p.user.phone && (
                          <p className="text-xs text-gray-500">{p.user.phone}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 border border-gold/20 text-gold shrink-0">
                        <IndianRupee size={11} />{p.amount}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={11} className="text-gold/50" />
                        {p.event.title}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={11} className="text-gold/50" />
                        {getUserUniversity(p.user)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} className="text-gray-600" />
                        {formatDate(p.createdAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprovePayment(p._id)}
                        disabled={processingPaymentId === p._id}
                      >
                        <span className="flex items-center gap-2">
                          {processingPaymentId === p._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ThumbsUp size={14} />
                          )}
                          Approve
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectPayment(p._id)}
                        disabled={processingPaymentId === p._id}
                      >
                        <span className="flex items-center gap-2">
                          <ThumbsDown size={14} />
                          Reject
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Screenshot Preview Modal ── */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setPreviewScreenshot(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 max-w-2xl max-h-[85vh] overflow-auto rounded-2xl border border-white/10 shadow-2xl bg-gray-900">
            <img src={previewScreenshot} alt="Payment screenshot" className="w-full h-auto" />
            <div className="absolute top-3 right-3 flex gap-2">
              {/* Open in new tab — only for Drive URLs (https), hide for base64 */}
              {previewScreenshot.startsWith("http") && (
                <a
                  href={previewScreenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-full bg-black/70 hover:bg-gold/80 transition-colors"
                  title="Open full image in new tab"
                >
                  <Eye size={18} className="text-white" />
                </a>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewScreenshot(null); }}
                className="p-2 rounded-full bg-black/70 hover:bg-red-500/80 transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>
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

      {/* ── Gallery Tab ── */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          {/* Add / Edit Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {galleryEditing ? "Edit Gallery Folder" : "Add Gallery Folder"}
            </h3>
            {galleryError && (
              <p className="text-red-400 text-sm mb-3">{galleryError}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Year</label>
                <input
                  type="number"
                  value={galleryForm.year}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, year: e.target.value }))}
                  className="w-full rounded-lg bg-navy/50 border border-white/10 px-3 py-2 text-white text-sm focus:border-gold/50 focus:outline-none"
                  placeholder="2026"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg bg-navy/50 border border-white/10 px-3 py-2 text-white text-sm focus:border-gold/50 focus:outline-none"
                  placeholder="TECHNOAAGAZ 2026"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Google Drive Folder Link</label>
                <input
                  type="text"
                  value={galleryForm.driveFolderLink}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, driveFolderLink: e.target.value }))}
                  className="w-full rounded-lg bg-navy/50 border border-white/10 px-3 py-2 text-white text-sm focus:border-gold/50 focus:outline-none"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleSaveGalleryFolder} disabled={gallerySaving}>
                <span className="flex items-center gap-2">
                  {gallerySaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {galleryEditing ? "Update Folder" : "Add Folder"}
                </span>
              </Button>
              {galleryEditing && (
                <Button variant="outline" size="sm" onClick={resetGalleryForm}>
                  Cancel
                </Button>
              )}
            </div>
          </Card>

          {/* Folder List */}
          {galleryFolders.length === 0 ? (
            <Card className="p-8 text-center">
              <FolderOpen size={36} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">No gallery folders yet. Add one above.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {galleryFolders.map((folder) => (
                <Card key={folder._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <FolderOpen size={18} className="text-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{folder.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Year: {folder.year}</span>
                        <span>•</span>
                        <span className={folder.isActive ? "text-emerald-400" : "text-red-400"}>
                          {folder.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                        <Link size={10} /> {folder.driveFolderId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditGalleryFolder(folder)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gold hover:bg-gold/10 transition-all"
                      title="Edit"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryFolder(folder._id)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
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
