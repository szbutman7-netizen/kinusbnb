"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Clock, ChevronDown, Check, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

interface KinusTimePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label: string;
  hint?: string;
  required?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const ITEM_HEIGHT = 40; // px
const VISIBLE_ITEMS = 5;
const PADDING_Y = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT; // 80px

const QUICK_PRESETS = [
  { labelHe: "08:00 (בוקר)", labelEn: "08:00 (Morning)", value: "08:00" },
  { labelHe: "12:00 (צהריים)", labelEn: "12:00 (Noon)", value: "12:00" },
  { labelHe: "15:00 (אחה״צ)", labelEn: "15:00 (Afternoon)", value: "15:00" },
  { labelHe: "18:00 (ערב)", labelEn: "18:00 (Evening)", value: "18:00" },
  { labelHe: "21:00 (לילה)", labelEn: "21:00 (Night)", value: "21:00" },
];

export function KinusTimePicker({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  hint,
  required,
}: KinusTimePickerProps) {
  const { language } = useLanguage();
  const isHe = language === "he";

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const minutesScrollRef = useRef<HTMLDivElement>(null);

  // Helper to parse current value or fallback
  const parseTime = useCallback((timeStr: string) => {
    if (!timeStr || !timeStr.includes(":")) {
      return { hour: "12", minute: "00" };
    }
    const [h, m] = timeStr.split(":");
    const validH = HOURS.includes(h) ? h : "12";
    // Find closest 15-minute slot
    const numM = parseInt(m, 10);
    let validM = "00";
    if (numM >= 7 && numM < 22) validM = "15";
    else if (numM >= 22 && numM < 37) validM = "30";
    else if (numM >= 37 && numM < 52) validM = "45";
    else if (numM >= 52) validM = "00";
    return { hour: validH, minute: validM };
  }, []);

  const parsed = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const p = parseTime(value);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
    }
  }, [value, parseTime]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Center wheels to selected values
  const centerWheels = useCallback((hour: string, minute: string, smooth: boolean = false) => {
    const hIdx = HOURS.indexOf(hour);
    const mIdx = MINUTES.indexOf(minute);

    const behavior = smooth ? "smooth" : "auto";

    if (hoursScrollRef.current && hIdx !== -1) {
      hoursScrollRef.current.scrollTo({
        top: hIdx * ITEM_HEIGHT,
        behavior,
      });
    }

    if (minutesScrollRef.current && mIdx !== -1) {
      minutesScrollRef.current.scrollTo({
        top: mIdx * ITEM_HEIGHT,
        behavior,
      });
    }
  }, []);

  // When opening, scroll to currently selected time
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        centerWheels(selectedHour, selectedMinute, false);
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedHour, selectedMinute, centerWheels]);

  // Handle user scrolling hours wheel
  const handleHoursScroll = () => {
    if (!hoursScrollRef.current) return;
    const scrollTop = hoursScrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(HOURS.length - 1, index));
    const newHour = HOURS[clampedIndex];
    if (newHour && newHour !== selectedHour) {
      setSelectedHour(newHour);
      onChange(`${newHour}:${selectedMinute}`);
    }
  };

  // Handle user scrolling minutes wheel
  const handleMinutesScroll = () => {
    if (!minutesScrollRef.current) return;
    const scrollTop = minutesScrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(MINUTES.length - 1, index));
    const newMinute = MINUTES[clampedIndex];
    if (newMinute && newMinute !== selectedMinute) {
      setSelectedMinute(newMinute);
      onChange(`${selectedHour}:${newMinute}`);
    }
  };

  const selectHourDirect = (h: string) => {
    setSelectedHour(h);
    onChange(`${h}:${selectedMinute}`);
    centerWheels(h, selectedMinute, true);
  };

  const selectMinuteDirect = (m: string) => {
    setSelectedMinute(m);
    onChange(`${selectedHour}:${m}`);
    centerWheels(selectedHour, m, true);
  };

  const applyPreset = (presetTime: string) => {
    const [h, m] = presetTime.split(":");
    setSelectedHour(h);
    setSelectedMinute(m);
    onChange(presetTime);
    centerWheels(h, m, true);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSelectedHour("12");
    setSelectedMinute("00");
    setIsOpen(false);
  };

  const displayText = value ? value : (placeholder || (isHe ? "בחר שעה" : "Select time"));

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-200 mb-1">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>

      {/* Trigger Button */}
      <button
        id={id}
        name={name}
        type="button"
        role="combobox"
        aria-required={required}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${label}: ${value || displayText}`}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${
          value
            ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)] bg-[#07142A]"
            : "border-slate-700 bg-[#07142A]"
        } text-white hover:border-[#E8D8A8]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs transition-all text-start`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Clock className="w-4 h-4 text-[#E8D8A8] flex-shrink-0" aria-hidden="true" />
          <span
            dir="ltr"
            className={value ? "text-white font-medium tracking-wider" : "text-slate-400 font-normal"}
          >
            {displayText}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {value && (
            <span
              onClick={handleClear}
              title={isHe ? "נקה בחירה" : "Clear selection"}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#E8D8A8] transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {hint && (
        <span className="text-[10px] text-[#E8D8A8] block mt-1 font-medium">
          {hint}
        </span>
      )}

      {/* Popover / Wheel Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute z-50 mt-1.5 w-full min-w-[270px] sm:min-w-[300px] bg-[#07142A]/95 border border-[#E8D8A8]/40 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-3 space-y-3 backdrop-blur-xl focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#E8D8A8]" />
            </div>
            <span
              dir="ltr"
              className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30"
            >
              {selectedHour}:{selectedMinute}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_PRESETS.map((p) => {
              const isSelected = value === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => applyPreset(p.value)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-[#E8D8A8] text-[#07142A] border-[#E8D8A8] font-bold shadow-sm"
                      : "bg-[#0B1E38]/80 text-slate-300 border-slate-700 hover:border-[#E8D8A8]/50 hover:text-white"
                  }`}
                >
                  {isHe ? p.labelHe : p.labelEn}
                </button>
              );
            })}
          </div>

          {/* Wheel Picker Container */}
          <div className="relative h-[200px] bg-[#040C1A]/90 rounded-xl border border-slate-800/90 overflow-hidden select-none">
            {/* Center Active Indicator Lens */}
            <div
              style={{ top: `${PADDING_Y}px`, height: `${ITEM_HEIGHT}px` }}
              className="pointer-events-none absolute inset-x-2 rounded-lg bg-[#E8D8A8]/10 border-y border-[#E8D8A8]/40 shadow-[0_0_12px_rgba(232,216,168,0.12)] z-0"
            />

            {/* Top Fade Overlay */}
            <div
              style={{ height: `${PADDING_Y}px` }}
              className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#040C1A] via-[#040C1A]/80 to-transparent z-10"
            />

            {/* Bottom Fade Overlay */}
            <div
              style={{ height: `${PADDING_Y}px` }}
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040C1A] via-[#040C1A]/80 to-transparent z-10"
            />

            {/* Wheels Columns Grid */}
            <div className="grid grid-cols-[1fr_auto_1fr] h-full items-center relative z-20" dir="ltr">
              {/* Hours Wheel */}
              <div
                ref={hoursScrollRef}
                onScroll={handleHoursScroll}
                style={{
                  paddingTop: `${PADDING_Y}px`,
                  paddingBottom: `${PADDING_Y}px`,
                }}
                className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {HOURS.map((h) => {
                  const isSelected = selectedHour === h;
                  return (
                    <div
                      key={h}
                      style={{ height: `${ITEM_HEIGHT}px` }}
                      onClick={() => selectHourDirect(h)}
                      className={`snap-center flex items-center justify-center font-mono cursor-pointer transition-all ${
                        isSelected
                          ? "text-[#E8D8A8] font-bold text-lg scale-110 drop-shadow-[0_0_8px_rgba(232,216,168,0.4)]"
                          : "text-slate-400 font-medium text-sm hover:text-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {h}
                    </div>
                  );
                })}
              </div>

              {/* Colon Separator */}
              <div className="flex flex-col items-center justify-center px-2 pointer-events-none">
                <span className="font-mono text-xl font-bold text-[#E8D8A8] drop-shadow-[0_0_6px_rgba(232,216,168,0.4)] pb-0.5">
                  :
                </span>
                <span className="text-[9px] text-slate-500 font-sans uppercase tracking-widest">
                  {isHe ? "שעה" : "TIME"}
                </span>
              </div>

              {/* Minutes Wheel (15-min intervals) */}
              <div
                ref={minutesScrollRef}
                onScroll={handleMinutesScroll}
                style={{
                  paddingTop: `${PADDING_Y}px`,
                  paddingBottom: `${PADDING_Y}px`,
                }}
                className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {MINUTES.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <div
                      key={m}
                      style={{ height: `${ITEM_HEIGHT}px` }}
                      onClick={() => selectMinuteDirect(m)}
                      className={`snap-center flex items-center justify-center font-mono cursor-pointer transition-all ${
                        isSelected
                          ? "text-[#E8D8A8] font-bold text-lg scale-110 drop-shadow-[0_0_8px_rgba(232,216,168,0.4)]"
                          : "text-slate-400 font-medium text-sm hover:text-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {m}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end pt-1 gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(`${selectedHour}:${selectedMinute}`);
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#E8D8A8] to-[#D4B968] text-[#07142A] text-xs font-bold shadow-[0_4px_12px_rgba(232,216,168,0.25)] hover:brightness-105 active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isHe ? "אישור שעה" : "Confirm"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
