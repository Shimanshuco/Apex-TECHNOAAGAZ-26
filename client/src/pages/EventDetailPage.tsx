import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";

import {
  CalendarDays,
  MapPin,
  ArrowLeft,
  Trophy,
  BookOpen,
  IndianRupee,
  ShieldCheck,
  Users,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  Loader2,
  Crown,
} from "lucide-react";

interface Coordinator {
  name: string;
  phone: string;
}

interface EventDetail {
  _id: string;
  title: string;
  category: string;
  cost: number;
  venue: string;
  participationType: "solo" | "team";
  minTeamSize?: number;
  maxTeamSize?: number;
  date: string;
  image?: string;
  studentCoordinators: Coordinator[];
  facultyCoordinators: Coordinator[];
  rules?: string;
  prizes?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  cultural: "bg-gold/20 text-gold border-gold/30",
  literary: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  trending_event: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  technical: "bg-navy/30 text-blue-300 border-navy-light/40",
};

interface TeamMemberData {
  name: string;
  email: string;
  phone: string;
}

interface RegistrationData {
  _id: string;
  teamName?: string;
  teamMembers: TeamMemberData[];
  paymentStatus: "pending" | "completed" | "failed";
  amount: number;
  user?: { name?: string; email?: string; phone?: string; university?: string; collegeName?: string };
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [asTeamMember, setAsTeamMember] = useState(false);

  // Team creation state
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [teamCreating, setTeamCreating] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState(false);

  // Dynamic pricing
  const [pricing, setPricing] = useState<{
    apex: number;
    otherEarly: number;
    otherRegular: number;
    isEarlyBird: boolean;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api<{ data: EventDetail }>(`/events/${id}`);
        setEvent(res.data);

        // Fetch dynamic pricing
        try {
          const p = await api<{
            data: {
              apex: number;
              otherEarly: number;
              otherRegular: number;
              earlyBirdDeadline: string;
              isEarlyBird: boolean;
            };
          }>("/events/pricing");
          setPricing(p.data);
        } catch { /* ignore */ }

        if (user) {
          try {
            const token = localStorage.getItem("ta_token") || "";
            const check = await api<{
              registered: boolean;
              registration: RegistrationData | null;
              asTeamMember?: boolean;
            }>(
              `/events/${id}/check-registration`,
              { token }
            );
            setAlreadyRegistered(check.registered);
            if (check.registration) setRegistration(check.registration);
            if (check.asTeamMember) setAsTeamMember(true);
          } catch {
            /* ignore */
          }
        }
      } catch {
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, user]);

  const handleRegister = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/events/${id}/register`);
  };

  /* ── Look up a member by email ── */
  const handleLookupMember = async () => {
    if (!memberEmail.trim() || !id) return;
    const email = memberEmail.trim().toLowerCase();

    if (email === user?.email?.toLowerCase()) {
      setLookupError("You're already the team leader — no need to add yourself.");
      return;
    }
    if (teamMembers.some((m) => m.email.toLowerCase() === email)) {
      setLookupError("This member has already been added.");
      return;
    }

    setLookupLoading(true);
    setLookupError("");

    try {
      const token = localStorage.getItem("ta_token") || "";
      const res = await api<{
        success: boolean;
        data?: { name: string; email: string; phone: string };
      }>(`/auth/lookup?email=${encodeURIComponent(email)}&eventId=${id}`, { token });

      if (res.data) {
        setTeamMembers((prev) => [
          ...prev,
          { name: res.data!.name, email: res.data!.email, phone: res.data!.phone },
        ]);
        setMemberEmail("");
      }
    } catch (err: any) {
      setLookupError(err.message || "Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  const removeMember = (email: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.email !== email));
  };

  /* ── Create team ── */
  const handleCreateTeam = async () => {
    if (!event || !id) return;
    setTeamError("");
    setTeamCreating(true);

    try {
      const token = localStorage.getItem("ta_token") || "";
      await api(`/events/${id}/create-team`, {
        method: "POST",
        body: { teamName, teamMembers },
        token,
      });
      setTeamSuccess(true);

      // Re-fetch registration data to show updated team
      try {
        const check = await api<{
          registered: boolean;
          registration: RegistrationData | null;
          asTeamMember?: boolean;
        }>(`/events/${id}/check-registration`, { token });
        if (check.registration) setRegistration(check.registration);
      } catch { /* ignore */ }
    } catch (err: any) {
      setTeamError(err.message || "Failed to create team");
    } finally {
      setTeamCreating(false);
    }
  };

  /* ── Leader: add a member to existing team ── */
  const handleAddMember = async () => {
    if (!memberEmail.trim() || !id) return;
    const email = memberEmail.trim().toLowerCase();

    if (email === user?.email?.toLowerCase()) {
      setLookupError("You're already the team leader.");
      return;
    }

    setLookupLoading(true);
    setLookupError("");

    try {
      const token = localStorage.getItem("ta_token") || "";
      await api(`/events/${id}/add-team-member`, {
        method: "POST",
        body: { email },
        token,
      });

      // Re-fetch registration to update the member list
      const check = await api<{
        registered: boolean;
        registration: RegistrationData | null;
      }>(`/events/${id}/check-registration`, { token });
      if (check.registration) setRegistration(check.registration);
      setMemberEmail("");
    } catch (err: any) {
      setLookupError(err.message || "Failed to add member");
    } finally {
      setLookupLoading(false);
    }
  };

  /* ── Leader: remove a member from existing team ── */
  const handleRemoveMember = async (email: string) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("ta_token") || "";
      await api(`/events/${id}/remove-team-member`, {
        method: "DELETE",
        body: { email },
        token,
      });

      // Re-fetch registration
      const check = await api<{
        registered: boolean;
        registration: RegistrationData | null;
      }>(`/events/${id}/check-registration`, { token });
      if (check.registration) setRegistration(check.registration);
    } catch (err: any) {
      setTeamError(err.message || "Failed to remove member");
    }
  };

  const isLeader = alreadyRegistered && !asTeamMember && !!registration?.teamName;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Back */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft size={18} /> Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event image */}
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 md:h-80 object-cover rounded-2xl border border-white/10"
            />
          )}

          <div>
            {/* Category + Participation badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                  CATEGORY_COLORS[event.category] || CATEGORY_COLORS.technical
                }`}
              >
                {event.category.replace("_", " ").toUpperCase()}
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-white/5 text-gray-300 border-white/10">
                {event.participationType === "team" ? (
                  <span className="flex items-center gap-1"><Users size={12} /> Team ({event.minTeamSize || 2}–{event.maxTeamSize || 5})</span>
                ) : (
                  <span className="flex items-center gap-1"><User size={12} /> Solo Event</span>
                )}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {event.title}
            </h1>
          </div>

          {/* ── YOUR TEAM / REGISTRATION DETAILS ── */}
          {alreadyRegistered && registration && (
            <Card variant="glass" className="border-gold/20">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <ShieldCheck size={18} className="text-green-400" />
                {asTeamMember ? "Your Team (added by leader)" : "Your Registration"}
              </h3>

              {/* Payment status */}
              <div className="flex items-center gap-2 mb-4">
                {registration.paymentStatus === "completed" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30">
                    <CheckCircle2 size={12} /> Payment Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                    <Clock size={12} /> Payment {registration.paymentStatus}
                  </span>
                )}
                {registration.amount > 0 && (
                  <span className="text-sm text-gray-400">₹{registration.amount}</span>
                )}
              </div>

              {/* Team info (for team events) */}
              {registration.teamName && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Team Name</p>
                  <p className="text-gold font-semibold text-lg">{registration.teamName}</p>
                </div>
              )}

              {/* Team Leader */}
              {registration.user && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Team Leader</p>
                  <div className="bg-navy/30 border border-navy-light/20 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold shrink-0">
                      {registration.user.name?.charAt(0).toUpperCase() || "L"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{registration.user.name}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1 truncate">
                        <Mail size={10} /> {registration.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members */}
              {registration.teamMembers && registration.teamMembers.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Team Members ({registration.teamMembers.length})
                  </p>
                  <div className="space-y-2">
                    {registration.teamMembers.map((m, i) => (
                      <div
                        key={i}
                        className="bg-navy/30 border border-navy-light/20 rounded-xl p-3 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 text-sm font-bold shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm truncate">{m.name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1 truncate">
                              <Mail size={10} /> {m.email}
                            </span>
                            {m.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={10} /> {m.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Leader can remove members */}
                        {isLeader && (
                          <button
                            onClick={() => handleRemoveMember(m.email)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Leader: Add more members to existing team ── */}
              {isLeader && event.participationType === "team" && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-300 font-medium mb-2 flex items-center gap-1.5">
                    <Plus size={14} className="text-gold" /> Add a Member
                  </p>

                  {teamError && (
                    <p className="text-xs text-red-400 flex items-center gap-1 mb-2">
                      <AlertCircle size={12} /> {teamError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter member's email"
                        value={memberEmail}
                        onChange={(e) => { setMemberEmail(e.target.value); setLookupError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleAddMember}
                      disabled={lookupLoading || !memberEmail.trim()}
                      className="shrink-0 px-4"
                    >
                      {lookupLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-1"><Plus size={14} /> Add</span>
                      )}
                    </Button>
                  </div>

                  {lookupError && (
                    <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
                      <AlertCircle size={12} /> {lookupError}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Team: {(registration.teamMembers?.length || 0) + 1} / {event.maxTeamSize || 5} members
                    {(registration.teamMembers?.length || 0) + 1 >= (event.maxTeamSize || 5) && (
                      <span className="text-yellow-400 ml-1">(max reached)</span>
                    )}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* ── CREATE YOUR TEAM (team event, registered+paid, no team yet) ── */}
          {alreadyRegistered &&
            registration &&
            !asTeamMember &&
            event.participationType === "team" &&
            !registration.teamName &&
            registration.paymentStatus === "completed" && (
              <Card variant="neon" glowColor="gold" className="border-gold/30">
                {teamSuccess ? (
                  /* ── Success state ── */
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Team Created!</h3>
                    <p className="text-gray-400 text-sm">
                      Your team <span className="text-gold font-semibold">{teamName}</span> has
                      been formed with {teamMembers.length} member{teamMembers.length !== 1 && "s"}.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-1">
                      <Users size={18} className="text-gold" />
                      Create Your Team
                    </h3>
                    <p className="text-sm text-gray-400 mb-5">
                      Team size: <span className="text-gold font-medium">{event.minTeamSize || 2}–{event.maxTeamSize || 5} members</span> (including you as leader)
                    </p>

                    {teamError && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        {teamError}
                      </div>
                    )}

                    {/* Team name */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Team Name
                      </label>
                      <Input
                        placeholder="e.g. Code Warriors"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                    </div>

                    {/* You as leader */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Team Leader (you)</p>
                      <div className="bg-navy/30 border border-gold/20 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold shrink-0">
                          <Crown size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{user?.name}</p>
                          <p className="text-gray-400 text-xs flex items-center gap-1 truncate">
                            <Mail size={10} /> {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Add members */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">
                        Add Members ({teamMembers.length} added)
                      </p>

                      {/* Email lookup */}
                      <div className="flex gap-2 mb-3">
                        <div className="flex-1">
                          <Input
                            placeholder="Enter member's email"
                            value={memberEmail}
                            onChange={(e) => {
                              setMemberEmail(e.target.value);
                              setLookupError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleLookupMember()}
                          />
                        </div>
                        <Button
                          variant="primary"
                          onClick={handleLookupMember}
                          disabled={lookupLoading || !memberEmail.trim()}
                          className="shrink-0 px-4"
                        >
                          {lookupLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <Search size={14} /> Lookup
                            </span>
                          )}
                        </Button>
                      </div>

                      {lookupError && (
                        <p className="text-xs text-red-400 flex items-center gap-1 mb-3">
                          <AlertCircle size={12} /> {lookupError}
                        </p>
                      )}

                      {/* Member cards */}
                      {teamMembers.length > 0 && (
                        <div className="space-y-2">
                          {teamMembers.map((m) => (
                            <div
                              key={m.email}
                              className="bg-navy/30 border border-navy-light/20 rounded-xl p-3 flex items-center gap-3"
                            >
                              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 text-sm font-bold shrink-0">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-sm truncate">{m.name}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                                  <span className="flex items-center gap-1 truncate">
                                    <Mail size={10} /> {m.email}
                                  </span>
                                  {m.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone size={10} /> {m.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => removeMember(m.email)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Remove member"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Team size check */}
                    <div className="mb-5">
                      <p className="text-xs text-gray-500">
                        Total team size: <span className={`font-medium ${
                          teamMembers.length + 1 >= (event.minTeamSize || 2) &&
                          teamMembers.length + 1 <= (event.maxTeamSize || 5)
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}>
                          {teamMembers.length + 1}
                        </span>{" "}
                        / {event.minTeamSize || 2}–{event.maxTeamSize || 5} required
                      </p>
                    </div>

                    {/* Create Team button */}
                    <Button
                      variant="neon"
                      size="lg"
                      className="w-full"
                      onClick={handleCreateTeam}
                      disabled={
                        teamCreating ||
                        !teamName.trim() ||
                        teamMembers.length + 1 < (event.minTeamSize || 2) ||
                        teamMembers.length + 1 > (event.maxTeamSize || 5)
                      }
                    >
                      {teamCreating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" /> Creating Team…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus size={16} /> Create Team ({teamMembers.length + 1} members)
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </Card>
            )}

          {/* Rules */}
          {event.rules && (
            <Card variant="glass">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                <BookOpen size={18} className="text-gold" /> Rules
              </h3>
              <p className="text-gray-400 whitespace-pre-line">{event.rules}</p>
            </Card>
          )}

          {/* Prizes */}
          {event.prizes && (
            <Card variant="glass">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                <Trophy size={18} className="text-gold" /> Prizes
              </h3>
              <p className="text-gray-400 whitespace-pre-line">{event.prizes}</p>
            </Card>
          )}

          {/* Student Coordinators */}
          {event.studentCoordinators && event.studentCoordinators.length > 0 && (
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-white mb-3">
                Student Coordinators
              </h3>
              <div className="space-y-2">
                {event.studentCoordinators.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{c.name}</span>
                    <span className="text-gold flex items-center gap-1">
                      <Phone size={12} /> {c.phone}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Faculty Coordinators */}
          {event.facultyCoordinators && event.facultyCoordinators.length > 0 && (
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-white mb-3">
                Faculty Coordinators
              </h3>
              <div className="space-y-2">
                {event.facultyCoordinators.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{c.name}</span>
                    <span className="text-gold flex items-center gap-1">
                      <Phone size={12} /> {c.phone}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card variant="neon" glowColor="gold">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <CalendarDays size={18} className="text-gold shrink-0" />
                <span>
                  {new Date(event.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={18} className="text-gold shrink-0" />
                <span>{event.venue}</span>
              </div>

              {/* Participation type */}
              <div className="flex items-center gap-3 text-gray-300">
                {event.participationType === "team" ? (
                  <Users size={18} className="text-gold shrink-0" />
                ) : (
                  <User size={18} className="text-gold shrink-0" />
                )}
                <span className="capitalize">
                  {event.participationType} Participation
                  {event.participationType === "team" && event.minTeamSize && event.maxTeamSize && (
                    <span className="text-gold ml-1">({event.minTeamSize}–{event.maxTeamSize} members)</span>
                  )}
                </span>
              </div>

              {/* Cost */}
              <div className="flex items-center gap-3 text-gray-300">
                <IndianRupee size={18} className="text-gold shrink-0" />
                {event.cost > 0 ? (
                  pricing ? (
                    <div className="flex flex-col">
                      {user?.university === "apex_university" ? (
                        <span className="text-white font-semibold text-lg">₹{pricing.apex}</span>
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          ₹{pricing.isEarlyBird ? pricing.otherEarly : pricing.otherRegular}
                          {pricing.isEarlyBird && (
                            <span className="ml-2 text-xs text-green-400 font-normal">Early Bird</span>
                          )}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-white font-semibold text-lg">Paid Event</span>
                  )
                ) : (
                  <span className="text-green-400 font-semibold">Free Entry</span>
                )}
              </div>

              {/* Register / Edit button */}
              {isAdmin ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                >
                  Edit Event
                </Button>
              ) : alreadyRegistered && registration?.paymentStatus === "failed" ? (
                <div className="space-y-2">
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm">
                    <AlertCircle size={16} /> Payment Rejected
                  </div>
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full"
                    onClick={handleRegister}
                  >
                    Register Again
                  </Button>
                </div>
              ) : alreadyRegistered ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-semibold">
                  <ShieldCheck size={18} /> Already Registered
                </div>
              ) : (
                <Button
                  variant="neon"
                  size="lg"
                  className="w-full"
                  onClick={handleRegister}
                >
                  {user ? "Register Now" : "Login to Register"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EventDetailPage;
