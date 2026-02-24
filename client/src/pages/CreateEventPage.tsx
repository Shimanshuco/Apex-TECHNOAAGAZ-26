import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "cultural", label: "Cultural" },
  { value: "literary", label: "Literary" },
  { value: "trending_event", label: "Trending Event" },
  { value: "technical", label: "Technical" },
];

const PARTICIPATION_OPTIONS = [
  { value: "solo", label: "Solo" },
  { value: "team", label: "Team" },
];

interface Coordinator {
  name: string;
  phone: string;
}

const CreateEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    category: "cultural",
    isPaid: false,
    venue: "",
    participationType: "solo",
    minTeamSize: 2,
    maxTeamSize: 5,
    date: "",
    image: "",
    rules: "",
    prizes: "",
  });

  const [studentCoordinators, setStudentCoordinators] = useState<Coordinator[]>([]);
  const [facultyCoordinators, setFacultyCoordinators] = useState<Coordinator[]>([]);

  // Temp inputs for adding coordinators
  const [studentCoordName, setStudentCoordName] = useState("");
  const [studentCoordPhone, setStudentCoordPhone] = useState("");
  const [facultyCoordName, setFacultyCoordName] = useState("");
  const [facultyCoordPhone, setFacultyCoordPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load event if editing
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await api<{ data: any }>(`/events/${id}`);
        const e = res.data;
        setForm({
          title: e.title,
          category: e.category,
          isPaid: (e.cost ?? 0) > 0,
          venue: e.venue,
          participationType: e.participationType || "solo",
          minTeamSize: e.minTeamSize ?? 2,
          maxTeamSize: e.maxTeamSize ?? 5,
          date: e.date?.split("T")[0] || "",
          image: e.image || "",
          rules: e.rules || "",
          prizes: e.prizes || "",
        });
        setStudentCoordinators(e.studentCoordinators || []);
        setFacultyCoordinators(e.facultyCoordinators || []);
      } catch {
        navigate("/admin/dashboard");
      }
    };
    load();
  }, [id, isEdit, navigate]);

  const update = (field: string, value: string | number | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const addStudentCoordinator = () => {
    if (studentCoordName.trim() && studentCoordPhone.trim()) {
      setStudentCoordinators((p) => [...p, { name: studentCoordName.trim(), phone: studentCoordPhone.trim() }]);
      setStudentCoordName("");
      setStudentCoordPhone("");
    }
  };

  const addFacultyCoordinator = () => {
    if (facultyCoordName.trim() && facultyCoordPhone.trim()) {
      setFacultyCoordinators((p) => [...p, { name: facultyCoordName.trim(), phone: facultyCoordPhone.trim() }]);
      setFacultyCoordName("");
      setFacultyCoordPhone("");
    }
  };

  const removeStudentCoordinator = (i: number) =>
    setStudentCoordinators((p) => p.filter((_, idx) => idx !== i));

  const removeFacultyCoordinator = (i: number) =>
    setFacultyCoordinators((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body: Record<string, any> = {
      title: form.title,
      category: form.category,
      cost: form.isPaid ? 1 : 0,
      venue: form.venue,
      participationType: form.participationType,
      date: form.date,
      image: form.image || undefined,
      studentCoordinators,
      facultyCoordinators,
      rules: form.rules || undefined,
      prizes: form.prizes || undefined,
    };

    if (form.participationType === "team") {
      body.minTeamSize = Number(form.minTeamSize);
      body.maxTeamSize = Number(form.maxTeamSize);
    }

    try {
      if (isEdit) {
        await api(`/events/${id}`, { method: "PUT", body, token });
      } else {
        await api("/events", { method: "POST", body, token });
      }
      navigate("/events");
    } catch (err: any) {
      if (err.errors && typeof err.errors === "object") {
        const msgs = Object.entries(err.errors)
          .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
          .join(" | ");
        setError(msgs || err.message || "Validation failed");
      } else {
        setError(err.message || "Failed to save event");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-3xl font-bold mb-8">
        <span className="bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
          {isEdit ? "Edit Event" : "Create New Event"}
        </span>
      </h1>

      <Card variant="glass" className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <Input
            label="Event Title"
            placeholder="Hackathon 2026"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />

          {/* Category + Participation Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              options={CATEGORY_OPTIONS}
            />
            <Select
              label="Participation Type"
              value={form.participationType}
              onChange={(e) => update("participationType", e.target.value)}
              options={PARTICIPATION_OPTIONS}
            />
          </div>

          {/* Team Size (conditional) */}
          {form.participationType === "team" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Min Team Size"
                type="number"
                min={1}
                value={form.minTeamSize}
                onChange={(e) => update("minTeamSize", parseInt(e.target.value) || 1)}
                required
              />
              <Input
                label="Max Team Size"
                type="number"
                min={1}
                value={form.maxTeamSize}
                onChange={(e) => update("maxTeamSize", parseInt(e.target.value) || 1)}
                required
              />
            </div>
          )}

          {/* Paid / Free + Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Event Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => update("isPaid", false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    !form.isPaid
                      ? "bg-green-500/15 border-green-500/30 text-green-400"
                      : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
                  }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => update("isPaid", true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    form.isPaid
                      ? "bg-gold/15 border-gold/30 text-gold"
                      : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
                  }`}
                >
                  Paid
                </button>
              </div>
              {form.isPaid && (
                <p className="text-xs text-gray-500 mt-1.5">Pricing is set via environment config</p>
              )}
            </div>
            <Input
              label="Venue"
              placeholder="Main Auditorium"
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />

          {/* Image URL */}
          <Input
            label="Image URL (Optional)"
            placeholder="https://..."
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
          />

          {/* Rules + Prizes */}
          <Textarea
            label="Rules (Optional)"
            placeholder="Event rules..."
            value={form.rules}
            onChange={(e) => update("rules", e.target.value)}
          />
          <Textarea
            label="Prizes (Optional)"
            placeholder="Prize details..."
            value={form.prizes}
            onChange={(e) => update("prizes", e.target.value)}
          />

          {/* ── Student Coordinators ── */}
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Student Coordinators
            </label>
            {studentCoordinators.length > 0 && (
              <div className="space-y-2 mb-3">
                {studentCoordinators.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <span className="flex-1 px-3 py-2 bg-navy/30 border border-navy-light/30 rounded-lg">
                      {c.name} — {c.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStudentCoordinator(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Name"
                value={studentCoordName}
                onChange={(e) => setStudentCoordName(e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={studentCoordPhone}
                onChange={(e) => setStudentCoordPhone(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStudentCoordinator}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* ── Faculty Coordinators ── */}
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Faculty Coordinators
            </label>
            {facultyCoordinators.length > 0 && (
              <div className="space-y-2 mb-3">
                {facultyCoordinators.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <span className="flex-1 px-3 py-2 bg-navy/30 border border-navy-light/30 rounded-lg">
                      {c.name} — {c.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFacultyCoordinator(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Name"
                value={facultyCoordName}
                onChange={(e) => setFacultyCoordName(e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={facultyCoordPhone}
                onChange={(e) => setFacultyCoordPhone(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFacultyCoordinator}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              {isEdit ? <Save size={18} /> : <Plus size={18} />}
              {loading
                ? "Saving…"
                : isEdit
                  ? "Update Event"
                  : "Create Event"}
            </span>
          </Button>
        </form>
      </Card>
    </>
  );
};

export default CreateEventPage;
