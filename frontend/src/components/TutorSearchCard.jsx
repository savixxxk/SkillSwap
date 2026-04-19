import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  BookOpen,
  List,
  Calendar as CalendarIcon,
  ArrowDownUp,
  AlertCircle,
} from "lucide-react";
import "./TutorSearchCard.css";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "ICT",
  "History",
  "Economics",
];
const LEVELS = ["O/L", "A/L", "Undergraduate", "Postgraduate", "Professional"];
const SORT_OPTIONS = [
  "Top Rated",
  "Most Reviews",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
];

const todayStr = () => new Date().toISOString().split("T")[0];

const TutorSearchCard = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [date, setDate] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [chips, setChips] = useState({
    Online: true,
    "In-person": false,
    Undergrad: false,
    Weekend: false,
    Weekday: false,
    "Verified only": false,
    "Top rated": false,
  });
  const [errors, setErrors] = useState({});
  const [openDrop, setOpenDrop] = useState(null);

  const toggleChip = (label) => {
    setChips((prev) => ({ ...prev, [label]: !prev[label] }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.chips;
      return copy;
    });
  };

  const toggleDrop = (name) =>
    setOpenDrop((prev) => (prev === name ? null : name));

  const isPastDate = (val) => val && new Date(val) < new Date(todayStr());

  const validate = () => {
    const errs = {};
    if (query.trim() && query.trim().length < 2) {
      errs.query = "Search term must be at least 2 characters.";
    }
    if (date && isPastDate(date)) {
      errs.date = "Select today or a future date.";
    }
    const hasDelivery = chips["Online"] || chips["In-person"];
    if (!hasDelivery) {
      errs.chips = "Please select at least Online or In-person.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    if (!validate()) return;

    if (onSearch) {
      onSearch({ query, subject, level, date, sortBy, chips });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, subject, level, date, sortBy, chips]);

  const handleSearch = () => {
    if (!validate()) return;

    if (onSearch) {
      onSearch({ query, subject, level, date, sortBy, chips });
    }
  };

  const handleClear = () => {
    setQuery("");
    setSubject("");
    setLevel("");
    setDate("");
    setSortBy("");
    setChips({
      Online: false,
      "In-person": false,
      Undergrad: false,
      Weekend: false,
      Weekday: false,
      "Verified only": false,
      "Top rated": false,
    });
    setErrors({});
    setOpenDrop(null);

    if (onSearch) {
      onSearch(null);
    }
  };

  return (
    <div className="modern-tutor-search bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-8 border border-blue-100 ring-1 ring-blue-50">
      <div className="mb-2">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
          Search &amp; Filters
        </h3>
        <p className="text-sm md:text-base text-slate-500">
          Search by subject, level, or tutor name and narrow results with the
          filters below.
        </p>
      </div>

      {/* Row 1: Search */}
      <div className="mts-row flex flex-col sm:flex-row gap-3 mb-6">
        <div
          className={`flex-1 relative ${errors.query ? "ring-2 ring-red-400" : ""}`}
        >
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim().length >= 2)
                setErrors((p) => ({ ...p, query: null }));
            }}
            placeholder="Search by subject, level, or tutor name..."
            className="mts-input w-full pl-12 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors duration-300 font-sans text-slate-800 bg-white"
          />
          {errors.query && (
            <div className="absolute top-full mt-1 text-xs text-red-600 font-medium">
              {errors.query}
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="mts-btn mts-btn-search px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg shadow-lg shadow-blue-500/20 transition-all duration-300 whitespace-nowrap"
        >
          <Search size={18} className="inline mr-2" /> Search
        </button>
        <button
          onClick={handleClear}
          className="mts-btn mts-btn-clear px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all duration-300 whitespace-nowrap flex items-center gap-2 border border-slate-200"
        >
          <Trash2 size={16} /> Clear
        </button>
      </div>

      {/* Row 2: Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
        {/* Subject */}
        <div className="relative">
          <button
            onClick={() => toggleDrop("subject")}
            className="mts-select-btn w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2 shadow-sm"
          >
            <BookOpen size={16} />
            <span className="truncate">{subject || "Subject"}</span>
          </button>
          {openDrop === "subject" && (
            <ul className="mts-dropdown-menu absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              <li
                onClick={() => {
                  setSubject("");
                  setOpenDrop(null);
                }}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer font-medium"
              >
                All Subjects
              </li>
              {SUBJECTS.map((s) => (
                <li
                  key={s}
                  onClick={() => {
                    setSubject(s);
                    setOpenDrop(null);
                  }}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Level */}
        <div className="relative">
          <button
            onClick={() => toggleDrop("level")}
            className="mts-select-btn w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2 shadow-sm"
          >
            <List size={16} />
            <span className="truncate">{level || "Level"}</span>
          </button>
          {openDrop === "level" && (
            <ul className="mts-dropdown-menu absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              <li
                onClick={() => {
                  setLevel("");
                  setOpenDrop(null);
                }}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer font-medium"
              >
                All Levels
              </li>
              {LEVELS.map((l) => (
                <li
                  key={l}
                  onClick={() => {
                    setLevel(l);
                    setOpenDrop(null);
                  }}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                >
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date */}
        <div
          className={`relative ${errors.date ? "ring-2 ring-red-400 rounded-lg" : ""}`}
        >
          <div className="mts-select-btn no-pointer w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-2">
            <CalendarIcon size={16} />
            <input
              type="date"
              value={date}
              onChange={(e) => {
                const val = e.target.value;
                setDate(val);
                if (isPastDate(val)) {
                  setErrors((p) => ({
                    ...p,
                    date: "Select today or a future date.",
                  }));
                } else {
                  setErrors((p) => ({ ...p, date: null }));
                }
              }}
              className="date-input flex-1 bg-transparent outline-none text-slate-700"
            />
          </div>
          {errors.date && (
            <div className="absolute top-full mt-1 text-xs text-red-600 font-medium">
              {errors.date}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => toggleDrop("sortBy")}
            className="mts-select-btn w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2 shadow-sm"
          >
            <ArrowDownUp size={16} />
            <span className="truncate">{sortBy || "Sort by"}</span>
          </button>
          {openDrop === "sortBy" && (
            <ul className="mts-dropdown-menu right-aligned absolute top-full right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-50 min-w-max">
              {SORT_OPTIONS.map((o) => (
                <li
                  key={o}
                  onClick={() => {
                    setSortBy(o);
                    setOpenDrop(null);
                  }}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                >
                  {o}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Row 3: Chips */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(chips).map((label) => (
          <button
            key={label}
            onClick={() => toggleChip(label)}
            className={`mts-chip px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
              chips[label]
                ? "active bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {errors.chips && (
        <div className="mt-3 flex items-center gap-2 text-red-600 font-medium text-sm">
          <AlertCircle size={16} /> {errors.chips}
        </div>
      )}
    </div>
  );
};

export default TutorSearchCard;
