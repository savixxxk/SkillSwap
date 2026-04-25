import React, { useState } from 'react';
import { Search, Trash2, BookOpen, List, Calendar as CalendarIcon, ArrowDownUp, AlertCircle, X } from 'lucide-react';
import './TutorSearchCard.css';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT', 'History', 'Economics'];
const LEVELS   = ['O/L', 'A/L', 'Undergraduate', 'Postgraduate', 'Professional'];
const SORT_OPTIONS = ['Top Rated', 'Most Reviews', 'Price: Low to High', 'Price: High to Low', 'Newest'];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const todayStr = () => new Date().toISOString().split('T')[0];

const TutorSearchCard = ({ onSearch }) => {
  const [query,    setQuery]   = useState('');
  const [subject,  setSubject] = useState('');
  const [level,    setLevel]   = useState('');
  const [date,     setDate]    = useState('');
  const [sortBy,   setSortBy]  = useState('');
  const [chips,    setChips]   = useState({ Online: true, 'In-person': false, Undergrad: true, Weekend: false, Weekday: false, 'Verified only': false, 'Top rated': false });
  const [errors,   setErrors]  = useState({});
  const [openDrop, setOpenDrop] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const handleDateSelect = (day) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDate(formattedDate);
    setErrors(prev => ({...prev, date: null}));
    setOpenDrop(null);
  };

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
                if (e.target.value.trim().length >= 2) setErrors(p => ({...p, query: null}));
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
              <li onClick={() => {setSubject(''); setOpenDrop(null);}}>All Subjects</li>
              {SUBJECTS.map(s => (
                <li key={s} onClick={() => {setSubject(s); setOpenDrop(null);}}>{s}</li>
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
              <li onClick={() => {setLevel(''); setOpenDrop(null);}}>All Levels</li>
              {LEVELS.map(l => (
                <li key={l} onClick={() => {setLevel(l); setOpenDrop(null);}}>{l}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Date */}
        <div className="mts-dropdown-container">
          <div className={`mts-select-btn no-pointer ${errors.date ? 'has-error' : ''}`}>
            <CalendarIcon size={16} className="mts-icon-theme" onClick={() => toggleDrop('calendar')} style={{cursor: 'pointer'}} />
            <div className="mts-input-inner">
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={date}
                onChange={(e) => {
                  const val = e.target.value;
                  setDate(val);
                  if (isPastDate(val)) {
                    setErrors(p => ({...p, date: 'Select today or a future date.'}));
                  } else if (val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                    setErrors(p => ({...p, date: 'Format: YYYY-MM-DD'}));
                  } else {
                    setErrors(p => ({...p, date: null}));
                  }
                }}
                onFocus={() => setOpenDrop('calendar')}
                className="mts-input date-input"
              />
            </div>
            {errors.date && <div className="mts-error-tooltip">{errors.date}</div>}
          </div>
          {openDrop === 'calendar' && (
            <div className="mts-dropdown-menu mts-calendar-dropdown">
              <div className="mts-cal-header">
                <button type="button" onClick={handlePrevMonth}>&lt;</button>
                <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
                <button type="button" onClick={handleNextMonth}>&gt;</button>
              </div>
              <div className="mts-cal-grid">
                {DAYS.map(d => <div key={d} className="mts-cal-day-name">{d}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isPast = isPastDate(dateStr);
                  const isSelected = date === dateStr;
                  return (
                    <div 
                      key={day} 
                      className={`mts-cal-day ${isPast ? 'mts-cal-disabled' : ''} ${isSelected ? 'mts-cal-selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isPast) handleDateSelect(day);
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                <li key={o} onClick={() => {setSortBy(o); setOpenDrop(null);}}>{o}</li>
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
