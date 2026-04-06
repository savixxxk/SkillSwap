import React, { useState, useEffect } from 'react';
import { Search, Trash2, BookOpen, List, Calendar as CalendarIcon, ArrowDownUp, AlertCircle, X } from 'lucide-react';
import './TutorSearchCard.css';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT', 'History', 'Economics'];
const LEVELS = ['O/L', 'A/L', 'Undergraduate', 'Postgraduate', 'Professional'];
const SORT_OPTIONS = ['Top Rated', 'Most Reviews', 'Price: Low to High', 'Price: High to Low', 'Newest'];

const todayStr = () => new Date().toISOString().split('T')[0];

const TutorSearchCard = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [date, setDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [chips, setChips] = useState({ Online: true, 'In-person': false, Undergrad: false, Weekend: false, Weekday: false, 'Verified only': false, 'Top rated': false });
  const [errors, setErrors] = useState({});
  const [openDrop, setOpenDrop] = useState(null);

  const toggleChip = (label) => {
    setChips(prev => ({ ...prev, [label]: !prev[label] }));
    setErrors(prev => { const copy = { ...prev }; delete copy.chips; return copy; });
  };

  const toggleDrop = (name) => setOpenDrop(prev => (prev === name ? null : name));

  const isPastDate = (val) => val && new Date(val) < new Date(todayStr());

  const validate = () => {
    const errs = {};
    if (query.trim() && query.trim().length < 2) {
      errs.query = 'Search term must be at least 2 characters.';
    }
    if (date && isPastDate(date)) {
      errs.date = 'Select today or a future date.';
    }
    const hasDelivery = chips['Online'] || chips['In-person'];
    if (!hasDelivery) {
      errs.chips = 'Please select at least Online or In-person.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Live filter effect: emit search whenever filters change and strictly pass validation.
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
    setQuery(''); setSubject(''); setLevel('');
    setDate(''); setSortBy('');
    setChips({ Online: false, 'In-person': false, Undergrad: false, Weekend: false, Weekday: false, 'Verified only': false, 'Top rated': false });
    setErrors({});
    setOpenDrop(null);

    // Reset filters in parent
    if (onSearch) {
      onSearch(null); // Passing null implies clear all
    }
  };

  return (
    <div className="modern-tutor-search">
      {/* Row 1: Search */}
      <div className="mts-row mts-row-1">
        <div className={`mts-search-wrapper ${errors.query ? 'has-error' : ''}`}>
          <Search className="mts-icon-theme" size={18} />
          <div className="mts-input-inner">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim().length >= 2) setErrors(p => ({ ...p, query: null }));
              }}
              placeholder="Search by subject, level, or tutor name..."
              className="mts-input"
            />
          </div>
          {errors.query && <div className="mts-error-tooltip">{errors.query}</div>}
        </div>

        <button className="mts-btn mts-btn-search" onClick={handleSearch}>
          Search
        </button>
        <button className="mts-btn mts-btn-clear" onClick={handleClear}>
          <Trash2 size={16} /> Clear
        </button>
      </div>

      {/* Row 2: Filters */}
      <div className="mts-row mts-row-2">

        {/* Subject */}
        <div className="mts-dropdown-container">
          <button className="mts-select-btn" onClick={() => toggleDrop('subject')}>
            <BookOpen size={16} className="mts-icon-theme" />
            <span>{subject || 'Subject'}</span>
          </button>
          {openDrop === 'subject' && (
            <ul className="mts-dropdown-menu">
              <li onClick={() => { setSubject(''); setOpenDrop(null); }}>All Subjects</li>
              {SUBJECTS.map(s => (
                <li key={s} onClick={() => { setSubject(s); setOpenDrop(null); }}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Level */}
        <div className="mts-dropdown-container">
          <button className="mts-select-btn" onClick={() => toggleDrop('level')}>
            <List size={16} className="mts-icon-theme" />
            <span>{level || 'Level'}</span>
          </button>
          {openDrop === 'level' && (
            <ul className="mts-dropdown-menu">
              <li onClick={() => { setLevel(''); setOpenDrop(null); }}>All Levels</li>
              {LEVELS.map(l => (
                <li key={l} onClick={() => { setLevel(l); setOpenDrop(null); }}>{l}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Date */}
        <div className="mts-dropdown-container">
          <div className={`mts-select-btn no-pointer ${errors.date ? 'has-error' : ''}`}>
            <CalendarIcon size={16} className="mts-icon-theme" />
            <div className="mts-input-inner">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  const val = e.target.value;
                  setDate(val);
                  if (isPastDate(val)) {
                    setErrors(p => ({ ...p, date: 'Select today or a future date.' }));
                  } else {
                    setErrors(p => ({ ...p, date: null }));
                  }
                }}
                className="mts-input date-input"
              />
              <CalendarIcon size={14} className="mts-inner-cal-icon mts-icon-theme" />
            </div>
            {errors.date && <div className="mts-error-tooltip">{errors.date}</div>}
          </div>
        </div>

        {/* Sort */}
        <div className="mts-dropdown-container ml-auto">
          <button className="mts-select-btn" onClick={() => toggleDrop('sortBy')}>
            <ArrowDownUp size={16} className="mts-icon-theme" />
            <span>{sortBy || 'Sort by'}</span>
          </button>
          {openDrop === 'sortBy' && (
            <ul className="mts-dropdown-menu right-aligned">
              {SORT_OPTIONS.map(o => (
                <li key={o} onClick={() => { setSortBy(o); setOpenDrop(null); }}>{o}</li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Row 3: Chips */}
      <div className="mts-row mts-row-3">
        {Object.keys(chips).map(label => (
          <button
            key={label}
            className={`mts-chip ${chips[label] ? 'active' : ''}`}
            onClick={() => toggleChip(label)}
          >
            {label}
          </button>
        ))}
        {errors.chips && <span className="mts-inline-error"><AlertCircle size={14} /> {errors.chips}</span>}
      </div>

    </div>
  );
};

export default TutorSearchCard;
