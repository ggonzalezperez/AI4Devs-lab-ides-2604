import React, { useState, useEffect } from 'react';
import './PhoneField.css';

const COUNTRIES = [
  { code: 'ES', name: 'España',       dial: '+34'  , flag: '🇪🇸' },
  { code: 'US', name: 'EE.UU.',       dial: '+1'   , flag: '🇺🇸' },
  { code: 'MX', name: 'México',       dial: '+52'  , flag: '🇲🇽' },
  { code: 'GB', name: 'Reino Unido',  dial: '+44'  , flag: '🇬🇧' },
  { code: 'FR', name: 'Francia',      dial: '+33'  , flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania',     dial: '+49'  , flag: '🇩🇪' },
  { code: 'IT', name: 'Italia',       dial: '+39'  , flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal',     dial: '+351' , flag: '🇵🇹' },
  { code: 'AR', name: 'Argentina',    dial: '+54'  , flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia',     dial: '+57'  , flag: '🇨🇴' },
  { code: 'BR', name: 'Brasil',       dial: '+55'  , flag: '🇧🇷' },
  { code: 'CL', name: 'Chile',        dial: '+56'  , flag: '🇨🇱' },
  { code: 'PE', name: 'Perú',         dial: '+51'  , flag: '🇵🇪' },
  { code: 'NL', name: 'Países Bajos', dial: '+31'  , flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica',      dial: '+32'  , flag: '🇧🇪' },
  { code: 'CH', name: 'Suiza',        dial: '+41'  , flag: '🇨🇭' },
  { code: 'SE', name: 'Suecia',       dial: '+46'  , flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega',      dial: '+47'  , flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca',    dial: '+45'  , flag: '🇩🇰' },
  { code: 'PL', name: 'Polonia',      dial: '+48'  , flag: '🇵🇱' },
  { code: 'AU', name: 'Australia',    dial: '+61'  , flag: '🇦🇺' },
  { code: 'CA', name: 'Canadá',       dial: '+1'   , flag: '🇨🇦' },
  { code: 'IN', name: 'India',        dial: '+91'  , flag: '🇮🇳' },
  { code: 'JP', name: 'Japón',        dial: '+81'  , flag: '🇯🇵' },
  { code: 'CN', name: 'China',        dial: '+86'  , flag: '🇨🇳' },
];

function parsePhone(val: string): { dialCode: string; localNumber: string } {
  if (!val) return { dialCode: '+34', localNumber: '' };
  const match = val.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) return { dialCode: match[1], localNumber: match[2] };
  return { dialCode: '+34', localNumber: val };
}

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  'data-testid'?: string;
}

export function PhoneField({ value, onChange, error, 'data-testid': testId }: PhoneFieldProps) {
  const [dialCode, setDialCode] = useState(() => parsePhone(value).dialCode);
  const [localNumber, setLocalNumber] = useState(() => parsePhone(value).localNumber);

  useEffect(() => {
    if (value === '') setLocalNumber('');
  }, [value]);

  function handleDialChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    setDialCode(code);
    onChange(localNumber.trim() ? `${code} ${localNumber.trim()}` : '');
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d\s\-\(\)]/g, '');
    setLocalNumber(raw);
    onChange(raw.trim() ? `${dialCode} ${raw.trim()}` : '');
  }

  return (
    <div className={`phone-field${error ? ' phone-field--error' : ''}`}>
      <select
        className="phone-dial-select"
        value={dialCode}
        onChange={handleDialChange}
        aria-label="Código de país"
      >
        {COUNTRIES.map((c) => (
          <option key={`${c.code}-${c.dial}`} value={c.dial} title={c.name}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>
      <div className="phone-divider" aria-hidden="true" />
      <input
        type="tel"
        className="phone-number-input"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder="612 345 678"
        data-testid={testId}
        autoComplete="tel-national"
        aria-label="Número de teléfono"
      />
    </div>
  );
}

export default PhoneField;
