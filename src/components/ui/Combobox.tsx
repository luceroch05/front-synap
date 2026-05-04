import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, CheckCircle } from 'lucide-react';

export interface ComboboxOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: number;
  onChange: (id: number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function Combobox({ options, value, onChange, placeholder = 'Buscar...', icon }: ComboboxProps) {
  const [isOpen, setIsOpen]         = useState(false);
  const [term, setTerm]             = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value);

  const filtered = useMemo(() => {
    if (!term.trim()) return options;
    const q = term.toLowerCase();
    return options.filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.sublabel?.toLowerCase().includes(q)
    );
  }, [options, term]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setTerm('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (opt: ComboboxOption) => {
    onChange(opt.id);
    setIsOpen(false);
    setTerm('');
    setHighlighted(-1);
  };

  return (
    <div ref={ref} className="relative">
      <div className={`relative flex items-center border rounded-xl transition-all ${
        isOpen ? 'border-[#F7941D] ring-2 ring-[#F7941D]/20' : 'border-gray-200'
      }`}>
        <span className="absolute left-3 text-gray-400 flex items-center">
          {icon ?? <Search className="w-4 h-4" />}
        </span>
        <input
          type="text"
          value={isOpen ? term : (selected?.label ?? '')}
          onChange={e => { setTerm(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setTerm(''); }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlighted(p => Math.min(p + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlighted(p => Math.max(p - 1, -1));
            } else if (e.key === 'Enter' && highlighted >= 0) {
              e.preventDefault();
              select(filtered[highlighted]);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              setTerm('');
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-transparent rounded-xl text-sm outline-none"
        />
        {selected && !isOpen && (
          <span className="absolute right-3 px-1.5 py-0.5 bg-green-50 rounded text-[10px] font-medium text-green-600">
            ✓
          </span>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {filtered.map((opt, idx) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => select(opt)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                idx === highlighted ? 'bg-orange-50 text-[#F7941D]' : 'hover:bg-gray-50'
              } ${value === opt.id ? 'bg-orange-50/50 font-medium text-[#F7941D]' : 'text-gray-700'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{opt.label}</span>
                  {opt.sublabel && (
                    <div className="text-xs text-gray-400">{opt.sublabel}</div>
                  )}
                </div>
                {value === opt.id && <CheckCircle className="w-3.5 h-3.5 text-[#F7941D] shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && filtered.length === 0 && term.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
          Sin resultados para "{term}"
        </div>
      )}
    </div>
  );
}
