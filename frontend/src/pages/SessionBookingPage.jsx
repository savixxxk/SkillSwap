import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarClock, MapPin, School, Users } from "lucide-react";
import API from "../services/api";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

const LOCATIONS = [
  "Birdnest",
  "Juice Bar",
  "Anohara",
  "Basement Canteen",
  "Student Area",
  "Library",
];

export default function SessionBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }

    const parsed = JSON.parse(raw);
    if (parsed.role !== "student") {
      navigate("/", { replace: true });
      return;
    }

    setUser(parsed);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [tutorsRes, subjectsRes] = await Promise.all([
          API.get("/tutors/directory"),
          API.get("/auth/tutor/exam/subjects"),
        ]);

        const list = (tutorsRes.data || []).filter((tutor) => tutor.role !== "admin");
        const subjectMap = {};
        (subjectsRes.data?.subjects || []).forEach((subject) => {
          subjectMap[subject.id] = subject.name;
        });

        if (cancelled) return;

        setTutors(list);
        setSubjects(subjectMap);

        const presetTutor = location.state?.tutor;
        if (presetTutor?._id) {
          setSelectedTutorId(presetTutor._id);
          const firstSubject = presetTutor.subjects?.[0] || presetTutor.teachingSubjects?.[0] || "";
          setSelectedSubject(firstSubject);
        } else if (list[0]?._id) {
          setSelectedTutorId(list[0]._id);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Unable to load booking options.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [location.state]);

  const selectedTutor = useMemo(
    () => tutors.find((tutor) => tutor._id === selectedTutorId) || null,
    [selectedTutorId, tutors],
  );

  const selectedTutorSubjects = useMemo(() => {
    const ids = selectedTutor?.teachingSubjects || [];
    return ids.map((subjectId) => ({ id: subjectId, name: subjects[subjectId] || subjectId }));
  }, [selectedTutor, subjects]);

  useEffect(() => {
    if (!selectedTutorSubjects.length) return;
    if (!selectedSubject || !selectedTutorSubjects.some((subject) => subject.id === selectedSubject)) {
      setSelectedSubject(selectedTutorSubjects[0].id);
    }
  }, [selectedTutorSubjects, selectedSubject]);

  const handleTutorChange = (value) => {
    setSelectedTutorId(value);
    setError("");
    setSuccess("");
    const nextTutor = tutors.find((tutor) => tutor._id === value);
    if (nextTutor?.teachingSubjects?.length) {
      setSelectedSubject(nextTutor.teachingSubjects[0]);
    } else {
      setSelectedSubject("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedTutor) {
      setError("Please choose a tutor.");
      return;
    }
    if (!selectedSubject) {
      setError("Please choose a subject.");
      return;
    }
    if (!selectedTime) {
      setError("Please choose a date and time.");
      return;
    }
    if (new Date(selectedTime) <= new Date()) {
      setError("Please select a future time.");
      return;
    }

    setSaving(true);
    try {
      await API.post("/sessions/book", {
        studentId: user._id,
        tutorId: selectedTutor._id,
        studentName: user.name,
        tutorName: selectedTutor.name,
        subject: selectedSubject,
        time: selectedTime,
        location: selectedLocation,
        durationMinutes: 60,
        notes,
      });
      setSuccess("Session request submitted successfully.");
      setSelectedTime("");
      setNotes("");
      setSelectedLocation(LOCATIONS[0]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to book session.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AppHeader />
        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <p className="text-slate-300">Loading booking options...</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <section className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/35 p-6 shadow-[0_30px_80px_-35px_rgba(34,211,238,0.55)] md:p-8">
          <p className="inline-flex rounded-full border border-sky-300/35 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Book a session</p>
          <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Schedule your next learning session</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Choose a tutor, pick a subject, select a campus location, and reserve a time that works for you.
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Tutor</span>
                <select
                  className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100"
                  value={selectedTutorId}
                  onChange={(e) => handleTutorChange(e.target.value)}
                >
                  {tutors.map((tutor) => (
                    <option key={tutor._id} value={tutor._id}>
                      {tutor.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Location</span>
                <select
                  className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {LOCATIONS.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Date and time</span>
                <input
                  type="datetime-local"
                  className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Duration</span>
                <input
                  type="text"
                  value="60 minutes"
                  disabled
                  className="rounded-xl border border-white/15 bg-slate-950/50 px-4 py-3 text-slate-300"
                />
              </label>
            </div>

            <div className="mt-5">
              <span className="mb-3 block text-sm font-semibold text-slate-200">Subject</span>
              <div className="grid gap-3 md:grid-cols-2">
                {selectedTutorSubjects.length > 0 ? (
                  selectedTutorSubjects.map((subject) => (
                    <label
                      key={subject.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${selectedSubject === subject.id ? "border-sky-300 bg-sky-300/10" : "border-white/10 bg-white/5"}`}
                    >
                      <input
                        type="radio"
                        name="subject"
                        value={subject.id}
                        checked={selectedSubject === subject.id}
                        onChange={() => setSelectedSubject(subject.id)}
                      />
                      <span className="text-sm font-semibold text-slate-100">{subject.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-slate-300">This tutor has no listed subjects.</p>
                )}
              </div>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Notes</span>
              <textarea
                rows={4}
                className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100"
                placeholder="Add any learning goals or extra details"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            {error && <p className="mt-4 rounded-xl border border-rose-300/35 bg-rose-300/10 px-4 py-3 text-rose-100">{error}</p>}
            {success && <p className="mt-4 rounded-xl border border-emerald-300/35 bg-emerald-300/10 px-4 py-3 text-emerald-100">{success}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
            >
              {saving ? "Booking..." : "Book session"}
              <ArrowRight size={16} />
            </button>
          </form>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-sky-200">
                  <Users size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Tutor</span>
                </div>
                <p className="text-lg font-bold text-white">{selectedTutor?.name || "Select a tutor"}</p>
                <p className="mt-1 text-sm text-slate-300">{selectedTutor?.bio || "Choose from certified tutors available on the platform."}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-sky-200">
                  <School size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Subjects</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTutorSubjects.length > 0 ? selectedTutorSubjects.map((subject) => (
                    <span key={subject.id} className="rounded-full border border-sky-300/35 bg-sky-300/10 px-3 py-1 text-sm text-sky-100">
                      {subject.name}
                    </span>
                  )) : <span className="text-slate-400">No subjects selected</span>}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-sky-200">
                  <MapPin size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Location</span>
                </div>
                <p className="text-white">{selectedLocation}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-sky-200">
                  <CalendarClock size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Time</span>
                </div>
                <p className="text-white">{selectedTime || "Choose a time"}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}