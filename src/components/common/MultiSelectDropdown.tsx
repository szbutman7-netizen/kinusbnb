"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check, CheckSquare } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

export interface MultiSelectDropdownProps {
  label?: string;
  allLabel?: string;
  options: (MultiSelectOption | string)[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  allLabel = 'הכל',
  options,
  selectedValues = [],
  onChange,
  placeholder = 'חיפוש ברשימה...',
  className = '',
  buttonClassName = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: MultiSelectOption[] = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    const seen = new Set<string>();
    const list: MultiSelectOption[] = [];
    options.forEach(opt => {
      if (opt == null) return;
      const parsed: MultiSelectOption = typeof opt === 'string' ? { value: opt, label: opt } : opt;
      if (parsed.value == null) return;
      const valStr = String(parsed.value);
      if (!seen.has(valStr)) {
        seen.add(valStr);
        list.push({
          value: valStr,
          label: parsed.label != null ? String(parsed.label) : valStr,
          count: typeof parsed.count === 'number' ? parsed.count : undefined
        });
      }
    });
    return list;
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    const allValues = filteredOptions.map(o => o.value);
    const combined = Array.from(new Set([...selectedValues, ...allValues]));
    onChange(combined);
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange([]);
  };

  const buttonLabel = useMemo(() => {
    if (!selectedValues || selectedValues.length === 0) {
      return allLabel;
    }
    if (selectedValues.length === 1) {
      const found = normalizedOptions.find(o => o.value === selectedValues[0]);
      return found ? found.label : selectedValues[0];
    }
    const firstFound = normalizedOptions.find(o => o.value === selectedValues[0]);
    const firstName = firstFound ? firstFound.label : selectedValues[0];
    return `${firstName} (+${selectedValues.length - 1})`;
  }, [selectedValues, normalizedOptions, allLabel]);

  const hasSelections = selectedValues && selectedValues.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef} dir="rtl">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-slate-700 font-semibold text-xs">{label}:</label>
          {hasSelections && (
            <span className="text-[10px] text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded-full font-bold">
              {selectedValues.length} נבחרו
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 text-slate-800 border rounded-lg text-xs font-medium transition-colors cursor-pointer text-right select-none h-[36px] ${
          hasSelections
            ? 'border-blue-400 bg-blue-50/70 text-blue-950 font-bold ring-1 ring-blue-200'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${buttonClassName}`}
      >
        <span className="truncate flex-1" title={buttonLabel}>
          {buttonLabel}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {hasSelections && (
            <span
              onClick={handleClearAll}
              className="p-0.5 hover:bg-blue-200/60 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
              title="נקה בחירה"
            >
              <X className="w-3 h-3 text-blue-700" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-500 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-100">
          {/* Popover Header & Quick Actions */}
          <div className="p-2 bg-slate-50 border-b border-slate-100 space-y-1.5">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-300 rounded-lg pr-7 pl-7 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick select / clear buttons */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-blue-800 pt-0.5 gap-1">
              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:text-blue-950 hover:underline cursor-pointer flex items-center gap-1 px-1 py-0.5 rounded hover:bg-blue-100/60 whitespace-nowrap"
              >
                <CheckSquare className="w-3 h-3 shrink-0" />
                <span>בחר הכל ({filteredOptions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearAll()}
                disabled={!hasSelections}
                className="text-slate-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed hover:underline cursor-pointer flex items-center gap-1 px-1 py-0.5 rounded hover:bg-red-50 whitespace-nowrap"
              >
                <X className="w-3 h-3 shrink-0" />
                <span>נקה הכל</span>
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                לא נמצאו תוצאות עבור &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isChecked = selectedValues.includes(option.value);
                return (
                  <div
                    key={`opt-${option.value}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(option.value);
                    }}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-right select-none ${
                      isChecked
                        ? 'bg-blue-50 text-blue-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate" title={option.label}>
                        {option.label}
                      </span>
                    </div>

                    {typeof option.count === 'number' && (
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {option.count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer summary */}
          <div className="p-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {hasSelections
                ? `${selectedValues.length} מתוך ${normalizedOptions.length} נבחרו`
                : `סה"כ ${normalizedOptions.length} אפשרויות`}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-blue-700 hover:text-blue-900 font-bold px-2 py-0.5 rounded hover:bg-blue-100 cursor-pointer"
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
