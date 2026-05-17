import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSuggestions } from '../../services/candidateService';
import './AutocompleteField.css';

/* ─── Static fallback suggestions ───────────────────────── */
const STATIC_SUGGESTIONS: Record<string, string[]> = {
  education: [
    'Grado en Ingeniería Informática – Universidad Politécnica de Madrid (UPM)',
    'Grado en Administración y Dirección de Empresas (ADE) – Universidad Autónoma de Madrid',
    'Grado en Psicología – Universidad Complutense de Madrid',
    'Máster en Inteligencia Artificial – Universidad Politécnica de Valencia',
    'Máster en Recursos Humanos y Gestión del Talento – ESADE',
    'FP Superior en Desarrollo de Aplicaciones Web – IES La Marca',
    'Grado en Comunicación Audiovisual – Universidad Carlos III de Madrid',
    'Licenciatura en Derecho – Universidad de Salamanca',
    'Máster en Marketing Digital – IE Business School',
    'Grado en Diseño – Escuela Superior de Diseño de Madrid',
  ],
  workExperience: [
    'Desarrollador Frontend – React, TypeScript · Startup FinTech (2022–presente)',
    'Desarrollador Backend – Node.js, PostgreSQL · Empresa XYZ (2020–2023)',
    'Desarrollador Full Stack – Django, Vue.js · Agencia Digital (2019–2022)',
    'Product Manager – Metodologías Agile/Scrum · SaaS Company (2021–presente)',
    'Diseñador UX/UI – Figma, Adobe XD · Consultora de Diseño (2020–2023)',
    'Analista de Datos – Python, Power BI · Gran Empresa Retail (2019–2022)',
    'Responsable de RRHH – Selección y Onboarding · Empresa Industrial (2018–presente)',
    'Director de Marketing Digital – SEO, SEM, Social Media · E-Commerce (2020–2023)',
    'Consultor de Negocio – Transformación Digital · Big Four (2017–2021)',
    'Ingeniero DevOps – AWS, Docker, CI/CD · Empresa Tecnológica (2021–presente)',
  ],
};

function filterStatic(field: string, query: string): string[] {
  const pool = STATIC_SUGGESTIONS[field] || [];
  if (!query.trim()) return pool.slice(0, 5);
  const q = query.toLowerCase();
  return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 5);
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const IconSuggestion = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ─── Props ──────────────────────────────────────────────── */
interface AutocompleteFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  field: 'education' | 'workExperience';
  placeholder?: string;
  rows?: number;
  hint?: string;
  'data-testid'?: string;
}

/* ─── Component ──────────────────────────────────────────── */
export function AutocompleteField({
  id,
  name,
  value,
  onChange,
  field,
  placeholder,
  rows = 3,
  hint,
  'data-testid': testId,
}: AutocompleteFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* fetch suggestions with 350ms debounce */
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const api = await getSuggestions(field, query);
          if (api.length > 0) {
            setSuggestions(api);
          } else {
            setSuggestions(filterStatic(field, query));
          }
        } catch {
          setSuggestions(filterStatic(field, query));
        }
        setOpen(true);
        setActiveIdx(-1);
      }, 350);
    },
    [field]
  );

  /* close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    onChange(v);
    if (v.trim().length >= 2) {
      fetchSuggestions(v);
    } else {
      setOpen(false);
    }
  }

  function handleFocus() {
    if (value.trim().length < 2) {
      setSuggestions(filterStatic(field, ''));
      setOpen(true);
    }
  }

  function handleSelect(suggestion: string) {
    onChange(suggestion);
    setOpen(false);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const firstLine = value.split('\n')[0];
  const displayQuery = firstLine.length > 0 ? firstLine : '';

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <textarea
        id={id}
        name={name}
        className="form-control"
        rows={rows}
        value={value}
        onChange={handleTextChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        data-testid={testId}
        autoComplete="off"
      />
      {hint && <span className="form-hint">{hint}</span>}

      {open && (
        <div className="autocomplete-dropdown" role="listbox">
          <div className="autocomplete-dropdown-header">
            {suggestions.length > 0 ? 'Sugerencias del sistema' : ''}
          </div>
          {suggestions.length === 0 ? (
            <div className="autocomplete-no-results">Sin sugerencias. Escribe libremente.</div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={i}
                role="option"
                aria-selected={i === activeIdx}
                className={`autocomplete-item${i === activeIdx ? ' autocomplete-item--active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              >
                <span className="autocomplete-item-icon"><IconSuggestion /></span>
                <span className="autocomplete-item-text">
                  {highlightMatch(s, displayQuery)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteField;
