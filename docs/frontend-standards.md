# Estándares de Frontend — LTI Talent Tracking System

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | ^18.3.1 | Framework UI |
| TypeScript | ^4.9.5 | Lenguaje principal |
| Create React App | 5.0.1 | Build tooling |
| React Router DOM | ^6.x | Navegación SPA |
| React Bootstrap | ^2.x | Componentes UI |
| Bootstrap | ^5.3.x | Estilos CSS |
| Axios | ^1.x | Cliente HTTP |
| Jest | via react-scripts | Testing unitario |
| React Testing Library | ^13.4.0 | Testing de componentes |
| Cypress | ^14.x | Testing E2E |

> **Nota:** React Bootstrap y Axios son las dependencias a añadir al proyecto si no están instaladas.

## Estructura de Carpetas

```
frontend/src/
├── components/                      # Componentes reutilizables de UI
│   ├── AddCandidateForm/            # Un componente por carpeta
│   │   ├── AddCandidateForm.tsx
│   │   └── AddCandidateForm.css
│   └── AutocompleteField/           # Componente de autocompletado reutilizable
│       ├── AutocompleteField.tsx
│       └── AutocompleteField.css
│
├── services/                # Capa de comunicación con el API backend
│   └── candidateService.ts
│
├── types/                   # Tipos TypeScript compartidos
│   └── candidate.ts
│
├── __mocks__/               # Mocks para Jest (CSS/archivos estáticos)
│   ├── styleMock.js
│   └── fileMock.js
│
├── tests/                   # Tests unitarios de componentes
│   ├── App.test.tsx
│   └── AddCandidateForm.test.tsx
│
├── App.tsx                  # Componente raíz + configuración de rutas
├── App.css                  # Estilos globales de la app + shell
├── index.tsx                # Punto de entrada
├── index.css                # Design tokens (CSS custom properties)
└── setupTests.ts            # Configuración Jest (polyfills, jest-dom)
```

## Componente PhoneField

`components/PhoneField/PhoneField.tsx` — campo de teléfono con selector de país multipais.

### Props

```typescript
interface PhoneFieldProps {
  value: string;              // Valor combinado, ej: "+34 612345678"
  onChange: (value: string) => void;
  error?: string;             // Mensaje de error (aplica estilo rojo al borde)
  'data-testid'?: string;
}
```

### Comportamiento

- **Selector de país** — dropdown nativo con 25 países (flag emoji + dial code). Default: España (+34).
- **Input de número local** — solo acepta dígitos, espacios, guiones y paréntesis.
- **Valor combinado** — llama a `onChange("+XX NNNNNNN")` cuando el usuario escribe o cambia de país. Si el número está vacío, llama `onChange("")`.
- **Reset** — responde a `value === ""` limpiando el número local (para reset de formularios).
- **Estado de error** — borde rojo + shadow cuando `error` prop tiene valor.
- **Inicialización** — parsea el `value` inicial para separar dial code y número local.

### Validación en el formulario padre

```typescript
// En validate() de AddCandidateForm:
if (formData.phone?.trim()) {
  const digits = formData.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    newErrors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
  }
}
```

### Países incluidos

España, EE.UU., México, Reino Unido, Francia, Alemania, Italia, Portugal, Argentina, Colombia, Brasil, Chile, Perú, Países Bajos, Bélgica, Suiza, Suecia, Noruega, Dinamarca, Polonia, Australia, Canadá, India, Japón, China.

---

## Sistema de Diseño

El frontend usa **CSS Custom Properties** (design tokens) definidos en `index.css`, evitando dependencia de Bootstrap para la UI de candidatos.

### Tokens principales

```css
--color-primary: #6366f1;       /* Índigo */
--color-primary-dark: #4f46e5;
--color-primary-subtle: #eef2ff;
--color-success: #22c55e;
--color-danger: #ef4444;
--color-surface: #ffffff;
--color-border: #e2e8f0;
--color-text: #0f172a;
--color-text-secondary: #64748b;
--color-text-tertiary: #94a3b8;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--space-1 … --space-10;         /* 4px · 8px · 12px · 16px … */
--shadow-md / --shadow-lg;
--transition: 0.15s ease;
```

**Nunca** usar variables Bootstrap (`--bs-*`) en componentes propios; usar siempre los tokens del sistema.

### Fuente

Inter (Google Fonts) cargada en `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

---

## Componente AutocompleteField

`components/AutocompleteField/AutocompleteField.tsx` — campo de texto con dropdown de sugerencias.

### Props

```typescript
interface AutocompleteFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  field: 'education' | 'workExperience';
  placeholder?: string;
  rows?: number;           // Default: 3
  hint?: string;
  'data-testid'?: string;
}
```

### Comportamiento

- **Debounce 350 ms** — la API de sugerencias se llama 350 ms después del último keystroke
- **Mínimo 2 caracteres** para disparar la llamada a la API
- **Fallback estático** — si la API devuelve vacío o falla, se muestran sugerencias predefinidas en castellano (`STATIC_SUGGESTIONS`)
- **Dropdown en foco** — al hacer focus con < 2 caracteres muestra las sugerencias estáticas (top 5)
- **Navegación con teclado:** `ArrowDown/Up` (navegar), `Enter` (seleccionar activo), `Escape` (cerrar)
- **Click fuera** cierra el dropdown
- **Highlight de coincidencias** — la parte coincidente aparece en color primario negrita (`<mark>`)
- **ARIA:** `role="listbox"` / `role="option"` / `aria-selected`

### Uso en formularios

```typescript
import { AutocompleteField } from '../AutocompleteField/AutocompleteField';

// En el componente padre:
function handleAutocompleteChange(field: keyof CreateCandidateDto) {
  return (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
}

// En el JSX:
<AutocompleteField
  id="education"
  name="education"
  field="education"
  value={formData.education || ''}
  onChange={handleAutocompleteChange('education')}
  rows={3}
  placeholder="Grado en Informática – UPM (2018–2022)"
  hint="Escribe o selecciona una sugerencia del sistema."
  data-testid="input-education"
/>
```

### getSuggestions en el servicio

```typescript
// services/candidateService.ts
export async function getSuggestions(
  field: 'education' | 'workExperience',
  query: string
): Promise<string[]> {
  const response = await axios.get<{ success: boolean; data: string[] }>(
    `${API_URL}/api/candidates/suggestions`,
    { params: { field, q: query } }
  );
  return response.data.data;
}
```

---

## Convenciones de Componentes

### Componentes Funcionales con Hooks

**Siempre** usar componentes funcionales. **Nunca** usar class components.

```typescript
// components/AddCandidateForm/AddCandidateForm.tsx
import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

interface AddCandidateFormProps {
  onSuccess?: (candidate: Candidate) => void;
}

const AddCandidateForm: React.FC<AddCandidateFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CreateCandidateDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    workExperience: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const candidate = await candidateService.addCandidate(formData, cvFile);
      setSuccess(true);
      onSuccess?.(candidate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir el candidato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {success && <Alert variant="success">Candidato añadido correctamente</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {/* campos del formulario */}
      <Button type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Añadir Candidato'}
      </Button>
    </Form>
  );
};

export default AddCandidateForm;
```

### Props con TypeScript

Siempre definir interfaces para las props:

```typescript
interface AddCandidateFormProps {
  onSuccess?: (candidate: Candidate) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateCandidateDto>;
}
```

### Naming de Componentes

- Archivos de componentes: `PascalCase.tsx` (ej: `AddCandidateForm.tsx`)
- Carpeta del componente: mismo nombre que el archivo (`AddCandidateForm/`)
- Custom hooks: `useNombreHook.ts` (prefijo `use`)
- Archivos de tipos: camelCase (`candidate.ts`)
- Archivos de servicios: camelCase (`candidateService.ts`)

## Tipos TypeScript Compartidos

```typescript
// types/candidate.ts
export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  workExperience?: string;
  cvUrl?: string;
  cvFileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  workExperience?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Capa de Servicios

Toda comunicación con el backend va a través de la capa de servicios en `src/services/`. **Nunca** hacer llamadas HTTP directamente desde los componentes.

```typescript
// services/candidateService.ts
import axios from 'axios';
import { Candidate, CreateCandidateDto } from '../types/candidate';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export async function getSuggestions(
  field: 'education' | 'workExperience',
  query: string
): Promise<string[]> {
  const response = await axios.get<{ success: boolean; data: string[] }>(
    `${API_URL}/api/candidates/suggestions`,
    { params: { field, q: query } }
  );
  return response.data.data;
}

export async function addCandidate(
  data: CreateCandidateDto,
  cvFile?: File | null
): Promise<Candidate> {
  const formData = new FormData();
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('email', data.email);
  if (data.phone) formData.append('phone', data.phone);
  if (data.address) formData.append('address', data.address);
  if (data.education) formData.append('education', data.education);
  if (data.workExperience) formData.append('workExperience', data.workExperience);
  if (cvFile) formData.append('cv', cvFile);

  const response = await axios.post<{ success: boolean; data: Candidate }>(
    `${API_URL}/api/candidates`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
}
```

## Routing con React Router

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AddCandidatePage from './pages/AddCandidatePage';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/candidates/add">Añadir Candidato</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates/add" element={<AddCandidatePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Validación de Formularios

- Validar en el cliente (UX), pero **nunca confiar** solo en validación cliente
- El servidor SIEMPRE valida de nuevo
- Mostrar errores de validación en tiempo real (onChange o onBlur)
- Deshabilitar el botón de envío mientras está en loading
- Mostrar spinner durante la carga

```typescript
const [errors, setErrors] = useState<Partial<Record<keyof CreateCandidateDto, string>>>({});

const validateField = (name: string, value: string) => {
  if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setErrors(prev => ({ ...prev, email: 'Email inválido' }));
  } else {
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }
};
```

## Carga de Archivos (CV)

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;
  if (file) {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setFileError('Solo se permiten archivos PDF o DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setFileError('El archivo no puede superar los 10MB');
      return;
    }
  }
  setCvFile(file);
  setFileError(null);
};
```

## Accesibilidad

- Usar HTML semántico (`<form>`, `<label>`, `<button>`)
- Asociar `<label>` con `<input>` via `htmlFor` e `id`
- Añadir `aria-label` a elementos sin texto visible
- Añadir `aria-invalid` a campos con error
- Asegurar contraste de colores adecuado

## Estándares de Testing

### Configuración Jest (frontend/jest.config.js)

```javascript
module.exports = {
  roots: ['<rootDir>/src/tests/'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|ico)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
};
```

### setupTests.ts — Polyfills requeridos

`react-router-dom` v6 usa `TextEncoder` internamente. jsdom no lo provee, hay que añadirlo:

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.defineProperty(global, 'TextEncoder', { value: TextEncoder });
Object.defineProperty(global, 'TextDecoder', { value: TextDecoder });
```

### Tests Unitarios de Componentes

Los componentes que usan `Link` o `useLocation` (React Router) deben envolverse en `MemoryRouter`:

```typescript
// tests/AddCandidateForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AddCandidateForm } from '../components/AddCandidateForm/AddCandidateForm';
import * as candidateService from '../services/candidateService';

jest.mock('../services/candidateService');

const renderForm = () =>
  render(
    <MemoryRouter>
      <AddCandidateForm />
    </MemoryRouter>
  );

describe('AddCandidateForm', () => {
  it('should_show_success_message_when_form_submitted_correctly', async () => {
    (candidateService.addCandidate as jest.Mock).mockResolvedValue({
      id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@test.com',
      createdAt: '', updatedAt: '',
    });

    renderForm();

    fireEvent.change(screen.getByTestId('input-firstName'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByTestId('input-lastName'), { target: { value: 'García' } });
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'ana@test.com' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
  });
});
```

### Atributos data-testid

Para facilitar el testing E2E, añadir `data-testid` a elementos clave:

```tsx
<Form data-testid="add-candidate-form">
  <Button data-testid="submit-button" type="submit">Añadir</Button>
</Form>
```

## Scripts Disponibles

```bash
npm start               # Servidor de desarrollo (puerto 3000)
npm test                # Ejecutar tests en modo watch
npm run build           # Build de producción
npm run test:coverage   # Tests con reporte de cobertura
```

## Variables de Entorno Frontend

Crear `frontend/.env` (no commitear):
```
REACT_APP_API_URL=http://localhost:3010
```

## Checklist Antes de Hacer Commit

- [ ] Todos los tests pasan (`npm test`)
- [ ] Sin errores de TypeScript
- [ ] El formulario se valida correctamente (campos obligatorios, formatos)
- [ ] Los mensajes de error son claros y en castellano
- [ ] Los mensajes de éxito son visibles
- [ ] El botón se deshabilita durante la carga
- [ ] La carga de archivos valida tipo y tamaño
- [ ] La ruta está registrada en `App.tsx`
- [ ] El botón de acceso desde el dashboard existe y funciona
