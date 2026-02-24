import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Input } from "../components";
import { Select } from "../components/Select";
import { api } from "../lib/api";

import {
  Mail,
  Phone,
  GraduationCap,
  Shield,
  CalendarDays,
  CheckCircle,
  XCircle,
  QrCode,
  CreditCard,
  Users,
  ChevronRight,
  IndianRupee,
  Pencil,
  X,
  Save,
  UserCircle,
  MapPin,
  Droplets,
  User,
} from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

interface RegistrationItem {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
    category: string;
    image?: string;
    venue?: string;
  };
  teamName?: string;
  teamMembers: TeamMember[];
  paymentStatus: "pending" | "completed" | "failed";
  paymentId?: string;
  amount: number;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  participant: "Participant",
  volunteer: "Volunteer",
  admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
  participant: "bg-gold/20 text-gold border-gold/30",
  volunteer: "bg-green-500/20 text-green-400 border-green-500/30",
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
};

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const BLOOD_GROUP_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const ProfilePage: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [myRegs, setMyRegs] = useState<RegistrationItem[]>([]);
  const [teamRegs, setTeamRegs] = useState<RegistrationItem[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    refreshUser();
    (async () => {
      try {
        const tkn = localStorage.getItem("ta_token");
        const data = await api<{ data: RegistrationItem[]; teamData: RegistrationItem[] }>(
          "/events/user/my-registrations",
          { token: tkn }
        );
        setMyRegs(data.data ?? []);
        setTeamRegs(data.teamData ?? []);
      } catch (_) {
        /* ignore */
      } finally {
        setLoadingRegs(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditGender(user?.gender || "");
    setEditBloodGroup(user?.bloodGroup || "");
    setEditAddress(user?.address || "");
    setEditError("");
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    setEditSaving(true);
    setEditError("");
    try {
      await api("/auth/me", {
        method: "PUT",
        body: {
          name: editName,
          phone: editPhone,
          gender: editGender || undefined,
          bloodGroup: editBloodGroup || undefined,
          address: editAddress || undefined,
        },
        token,
      });
      await refreshUser();
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setEditSaving(false);
    }
  };

  if (!user) return null;

  const universityDisplay =
    user.university === "apex_university"
      ? "Apex University"
      : user.collegeName || "Other";

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        <span className="bg-gradient-to-r from-navy to-gold bg-clip-text text-transparent">
          My Profile
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User info */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass">
            {/* ── View mode ── */}
            {!editing ? (
              <>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy/50 to-gold/30 border border-gold/20 flex items-center justify-center text-2xl font-bold text-gold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">
                      {user.name}
                    </h2>
                    <span
                      className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-medium border ${
                        ROLE_COLORS[user.role] || ROLE_COLORS.participant
                      }`}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {user.isVerified ? (
                      <span className="flex items-center gap-1 text-sm text-green-400">
                        <CheckCircle size={16} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        <XCircle size={16} /> Not Verified
                      </span>
                    )}
                    <button
                      onClick={startEdit}
                      className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-gold hover:border-gold/30 transition-all"
                      title="Edit Profile"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail size={16} className="text-gold/70 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone size={16} className="text-gold/70 shrink-0" />
                    <span>{user.phone || "—"}</span>
                  </div>
                  {user.university && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <GraduationCap size={16} className="text-gold/70 shrink-0" />
                      <span>{universityDisplay}</span>
                    </div>
                  )}
                  {user.gender && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <User size={16} className="text-gold/70 shrink-0" />
                      <span className="capitalize">{user.gender}</span>
                    </div>
                  )}
                  {user.bloodGroup && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Droplets size={16} className="text-gold/70 shrink-0" />
                      <span>{user.bloodGroup}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin size={16} className="text-gold/70 shrink-0" />
                      <span>{user.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-300">
                    <Shield size={16} className="text-gold/70 shrink-0" />
                    <span>{ROLE_LABELS[user.role]}</span>
                  </div>
                </div>
              </>
            ) : (
              /* ── Edit mode ── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Pencil size={16} className="text-gold" /> Edit Profile
                  </h3>
                  <button
                    onClick={() => setEditing(false)}
                    className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-white transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>

                {editError && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {editError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Name</label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Phone</label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Gender</label>
                    <Select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      options={GENDER_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Blood Group</label>
                    <Select
                      value={editBloodGroup}
                      onChange={(e) => setEditBloodGroup(e.target.value)}
                      options={BLOOD_GROUP_OPTIONS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1.5">Address</label>
                    <Input
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Address"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={editSaving || !editName.trim()}
                  >
                    <span className="flex items-center gap-2">
                      {editSaving ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {editSaving ? "Saving…" : "Save Changes"}
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Registered Events */}
          <Card variant="glass">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <CalendarDays size={18} className="text-gold" /> My Registrations
            </h3>

            {loadingRegs ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myRegs.length > 0 ? (
              <div className="space-y-4">
                {myRegs.map((reg) => (
                  <div
                    key={reg._id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold/20 transition-colors"
                  >
                    {/* Event row */}
                    <div className="flex items-center gap-4">
                      {reg.event?.image && (
                        <img
                          src={reg.event.image}
                          alt={reg.event.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 hidden sm:block"
                        />
                      )}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/events/${reg.event?._id}`)}
                      >
                        <p className="text-white font-medium truncate">
                          {reg.event?.title || "Event"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                          {reg.event?.date && (
                            <span>
                              {new Date(reg.event.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                          {reg.event?.venue && <span>{reg.event.venue}</span>}
                          <span className="capitalize">
                            {reg.event?.category?.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/events/${reg.event?._id}`)}
                          className="text-xs text-gold hover:text-gold-light transition-colors"
                        >
                          View →
                        </button>
                      </div>
                    </div>

                    {/* Payment info */}
                    {reg.amount > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-xs">
                        <CreditCard size={12} className="text-gray-500" />
                        {reg.paymentStatus === "completed" ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <IndianRupee size={10} />
                            {reg.amount} Paid
                          </span>
                        ) : (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <IndianRupee size={10} />
                            {reg.amount} Pending
                          </span>
                        )}
                        {reg.paymentId && (
                          <span className="text-gray-600 ml-2">#{reg.paymentId}</span>
                        )}
                      </div>
                    )}

                    {/* Team info */}
                    {reg.teamName && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs font-medium text-gold flex items-center gap-1">
                          <Users size={12} /> Team: {reg.teamName}
                        </p>
                        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {reg.teamMembers.map((m, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 text-xs text-gray-500"
                            >
                              <ChevronRight size={10} />
                              <span className="text-gray-400">{m.name}</span>
                              <span>— {m.email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                You haven&#39;t registered for any events yet.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate("/events")}
            >
              Browse Events
            </Button>
          </Card>

          {/* Team Registrations */}
          {teamRegs.length > 0 && (
            <Card variant="glass">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <Users size={18} className="text-gold" /> Team Registrations
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Events where someone added you as a team member
              </p>
              <div className="space-y-3">
                {teamRegs.map((reg) => (
                  <div
                    key={reg._id}
                    className="p-4 rounded-xl bg-gold/5 border border-gold/10 hover:border-gold/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/events/${reg.event?._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                        <UserCircle size={18} className="text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {reg.event?.title || "Event"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                          {reg.teamName && (
                            <span className="text-gold">Team: {reg.teamName}</span>
                          )}
                          {reg.event?.date && (
                            <span>
                              {new Date(reg.event.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gold shrink-0">View →</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* QR Code */}
        <div>
          <Card variant="neon" glowColor="gold">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <QrCode size={18} className="text-gold" /> Your QR Code
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Show this QR at the venue for verification
            </p>
            {user.qrCode ? (
              <div className="flex justify-center">
                <img
                  src={user.qrCode}
                  alt="Your QR Code"
                  className="w-48 h-48 rounded-xl border-2 border-gold/30 bg-white p-2"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-48 rounded-xl border border-dashed border-gray-700">
                <p className="text-gray-600 text-sm">No QR code generated</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
