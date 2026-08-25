import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AvailabilityEditor({ value = '', onChange }) {
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri']);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [customText, setCustomText] = useState(value || 'Mon, Wed, Fri (6:00 PM - 9:00 PM)');

  useEffect(() => {
    if (value) {
      setCustomText(value);
    }
  }, [value]);

  const format12Hour = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m < 10 ? '0' + m : m} ${period}`;
  };

  const updateSchedule = (days, start, end) => {
    if (!days || days.length === 0) {
      const emptyStr = 'Unavailable';
      setCustomText(emptyStr);
      if (onChange) onChange(emptyStr);
      return;
    }

    const startFormatted = format12Hour(start);
    const endFormatted = format12Hour(end);
    const scheduleStr = `${days.join(', ')} (${startFormatted} - ${endFormatted})`;
    setCustomText(scheduleStr);
    if (onChange) onChange(scheduleStr);
  };

  const handleToggleDay = (day) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(updated);
    updateSchedule(updated, startTime, endTime);
  };

  const handleStartTimeChange = (val) => {
    setStartTime(val);
    updateSchedule(selectedDays, val, endTime);
  };

  const handleEndTimeChange = (val) => {
    setEndTime(val);
    updateSchedule(selectedDays, startTime, val);
  };

  const applyPreset = (days, start, end) => {
    setSelectedDays(days);
    setStartTime(start);
    setEndTime(end);
    updateSchedule(days, start, end);
  };

  const handleCustomTextChange = (e) => {
    const text = e.target.value;
    setCustomText(text);
    if (onChange) onChange(text);
  };

  return (
    <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-3 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="font-extrabold text-orange-900 text-xs flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
          <span>Structured Weekly Availability Editor</span>
        </label>
        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
          Single Source of Truth
        </span>
      </div>

      {/* 1. Day Selection Pills */}
      <div>
        <span className="block text-[11px] font-semibold text-slate-700 mb-1.5">1. Select Available Days</span>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <button
                type="button"
                key={day}
                onClick={() => handleToggleDay(day)}
                className={`px-3 py-1 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Time Pickers */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <span className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span>Start Time</span>
          </span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div>
          <span className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span>End Time</span>
          </span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* 3. Presets */}
      <div className="pt-1 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => applyPreset(['Mon', 'Wed', 'Fri'], '18:00', '21:00')}
          className="px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-800 text-[10px] font-bold rounded-lg border border-orange-200 transition-colors cursor-pointer"
        >
          ⚡ Mon, Wed, Fri (6:00 PM - 9:00 PM)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(['Sat', 'Sun'], '10:00', '17:00')}
          className="px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-800 text-[10px] font-bold rounded-lg border border-orange-200 transition-colors cursor-pointer"
        >
          ⚡ Weekends (10:00 AM - 5:00 PM)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], '18:00', '21:00')}
          className="px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-800 text-[10px] font-bold rounded-lg border border-orange-200 transition-colors cursor-pointer"
        >
          ⚡ Daily Night (6:00 PM - 9:00 PM)
        </button>
      </div>

      {/* 4. Formatted Availability Result */}
      <div>
        <span className="block text-[11px] font-semibold text-slate-700 mb-1">
          Formatted Available Schedule Output (Synced to Booking)
        </span>
        <input
          type="text"
          required
          value={customText}
          onChange={handleCustomTextChange}
          placeholder="e.g. Mon, Wed, Fri (6:00 PM - 9:00 PM)"
          className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono font-extrabold text-orange-900 text-xs"
        />
      </div>

    </div>
  );
}
