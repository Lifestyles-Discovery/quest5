import { useState, useRef, useEffect } from 'react';

interface FilterChipProps {
  label: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export default function FilterChip({ label, children, onClose }: FilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        chipRef.current &&
        !chipRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <div className="relative inline-block" ref={chipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          rounded-full px-3 py-1 text-sm transition-colors
          ${isOpen
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }
        `}
      >
        {label}
        <span className="ml-1 opacity-50">▾</span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Range editor with button groups for beds/baths/garage
interface RangeEditorProps {
  label: string;
  min: number;
  max: number;
  rangeMin?: number;
  rangeMax: number;
  onChange: (min: number, max: number) => void;
}

export function RangeEditor({ label, min, max, rangeMin = 0, rangeMax, onChange }: RangeEditorProps) {
  const options = Array.from({ length: rangeMax - rangeMin + 1 }, (_, i) => rangeMin + i);

  const isAnyMin = min <= rangeMin;
  const isAnyMax = max >= rangeMax;

  const handleMinClick = (value: number | 'any') => {
    const newMin = value === 'any' ? rangeMin : value;
    // If new min > current max, adjust max
    const newMax = newMin > max ? rangeMax : max;
    onChange(newMin, newMax);
  };

  const handleMaxClick = (value: number | 'any') => {
    const newMax = value === 'any' ? rangeMax : value;
    // If new max < current min, adjust min
    const newMin = newMax < min ? rangeMin : min;
    onChange(newMin, newMax);
  };

  const buttonBase = "px-2 py-1 text-xs font-medium rounded transition-colors";
  const buttonSelected = "bg-blue-600 text-white";
  const buttonUnselected = "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
      {/* Min row: [Any] [0] [1] ... [n] [spacer] */}
      <div className="flex items-center gap-1">
        <span className="w-8 text-xs text-gray-500 dark:text-gray-400">Min</span>
        <button
          type="button"
          onClick={() => handleMinClick('any')}
          className={`${buttonBase} ${isAnyMin ? buttonSelected : buttonUnselected}`}
        >
          Any
        </button>
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleMinClick(n)}
            className={`${buttonBase} ${!isAnyMin && min === n ? buttonSelected : buttonUnselected}`}
          >
            {n}
          </button>
        ))}
        {/* Spacer to align with Max's "Any" */}
        <span className={`${buttonBase} invisible`}>Any</span>
      </div>
      {/* Max row: [spacer] [0] [1] ... [n] [Any] */}
      <div className="flex items-center gap-1">
        <span className="w-8 text-xs text-gray-500 dark:text-gray-400">Max</span>
        {/* Spacer to align with Min's "Any" */}
        <span className={`${buttonBase} invisible`}>Any</span>
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleMaxClick(n)}
            className={`${buttonBase} ${!isAnyMax && max === n ? buttonSelected : buttonUnselected}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleMaxClick('any')}
          className={`${buttonBase} ${isAnyMax ? buttonSelected : buttonUnselected}`}
        >
          Any
        </button>
      </div>
    </div>
  );
}

// Number editor for sqft±, year±, months
interface NumberEditorProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  step?: number;
}

export function NumberEditor({ label, value, onChange, suffix, prefix, step }: NumberEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {prefix && <span className="text-sm text-gray-600 dark:text-gray-400">{prefix}</span>}
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={(e) => e.target.select()}
        step={step}
        className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      />
      {suffix && <span className="text-sm text-gray-600 dark:text-gray-400">{suffix}</span>}
    </div>
  );
}

// Select editor for zip, county
interface SelectEditorProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SelectEditor({ label, value, options, onChange, placeholder = 'Any' }: SelectEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// Location editor combining search type + term
interface LocationEditorProps {
  searchType: string;
  searchTerm: string;
  searchTypes: { type: string }[];
  onSearchTypeChange: (type: string) => void;
  onSearchTermChange: (term: string) => void;
}

export function LocationEditor({
  searchType,
  searchTerm,
  searchTypes,
  onSearchTypeChange,
  onSearchTermChange,
}: LocationEditorProps) {
  const isRadius = searchType?.toLowerCase() === 'radius';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Search by</span>
        <select
          value={searchType || ''}
          onChange={(e) => onSearchTypeChange(e.target.value)}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {searchTypes.map((st) => (
            <option key={st.type} value={st.type}>{st.type}</option>
          ))}
        </select>
      </div>
      <input
        type={isRadius ? 'number' : 'text'}
        value={searchTerm || ''}
        onChange={(e) => onSearchTermChange(e.target.value)}
        placeholder={isRadius ? 'Miles' : 'Subdivision name'}
        step={isRadius ? '0.1' : undefined}
        onFocus={(e) => e.target.select()}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      />
    </div>
  );
}
