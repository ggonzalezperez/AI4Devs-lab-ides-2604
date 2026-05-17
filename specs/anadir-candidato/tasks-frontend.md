# Plan Técnico Frontend — Añadir Candidato (SCRUM-01)

**Rama a crear:** `feature/anadir-candidato-frontend`  
**Agente responsable:** frontend-developer  
**Dependencia:** Que el backend esté implementado y el endpoint POST /api/candidates funcione  
**Referencia completa:** [requirements.md](requirements.md)

---

## Paso 0: Preparar el entorno

- [ ] 0.1 Crear la rama de feature (desde main, no desde la rama backend)
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/anadir-candidato-frontend
  ```

- [ ] 0.2 Instalar dependencias
  ```bash
  cd frontend
  npm install react-bootstrap bootstrap axios react-router-dom
  npm install --save-dev @types/react-router-dom
  ```

- [ ] 0.3 Verificar servidor backend disponible
  ```bash
  curl http://localhost:3010/api/candidates -X POST \
    -F "firstName=Test" -F "lastName=Test" -F "email=test.verify@test.com"
  # Debe devolver 201 o 400 (no "connection refused")
  ```

---

## Paso 1: Tipos TypeScript

- [ ] 1.1 Crear `frontend/src/types/candidate.ts`
  ```typescript
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

---

## Paso 2: Servicio de API

- [ ] 2.1 Crear directorio `frontend/src/services/`

- [ ] 2.2 Crear `frontend/src/services/candidateService.ts`
  ```typescript
  import axios from 'axios';
  import { Candidate, CreateCandidateDto, ApiResponse } from '../types/candidate';

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

  export const candidateService = {
    async addCandidate(data: CreateCandidateDto, cvFile?: File | null): Promise<Candidate> {
      const formData = new FormData();
      
      // Añadir campos de texto
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      
      // Añadir archivo CV si existe
      if (cvFile) {
        formData.append('cv', cvFile);
      }

      const response = await axios.post<ApiResponse<Candidate>>(
        `${API_BASE_URL}/api/candidates`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error desconocido al crear el candidato');
      }
      
      return response.data.data!;
    },
  };
  ```

---

## Paso 3: Tests del Componente (TDD — ANTES de implementar)

- [ ] 3.1 Crear `frontend/src/tests/AddCandidateForm.test.tsx`

  Tests a incluir:
  ```typescript
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import { BrowserRouter } from 'react-router-dom';
  import AddCandidateForm from '../components/AddCandidateForm/AddCandidateForm';
  import { candidateService } from '../services/candidateService';

  jest.mock('../services/candidateService');

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('AddCandidateForm', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should_render_all_required_fields', () => {
      renderWithRouter(<AddCandidateForm />);
      expect(screen.getByLabelText(/nombre \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellido \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/educación/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experiencia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cv/i)).toBeInTheDocument();
    });

    it('should_show_success_message_when_form_submitted_correctly', async () => {
      const mockCandidate = { id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@test.com', createdAt: '', updatedAt: '' };
      (candidateService.addCandidate as jest.Mock).mockResolvedValue(mockCandidate);

      renderWithRouter(<AddCandidateForm />);
      fireEvent.change(screen.getByLabelText(/nombre \*/i), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/apellido \*/i), { target: { value: 'García' } });
      fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'ana@test.com' } });
      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });

    it('should_show_error_when_service_throws', async () => {
      (candidateService.addCandidate as jest.Mock).mockRejectedValue(new Error('Ya existe un candidato con ese email'));

      renderWithRouter(<AddCandidateForm />);
      fireEvent.change(screen.getByLabelText(/nombre \*/i), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/apellido \*/i), { target: { value: 'García' } });
      fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'duplicado@test.com' } });
      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Ya existe un candidato con ese email');
      });
    });

    it('should_show_validation_error_when_firstName_is_empty', async () => {
      renderWithRouter(<AddCandidateForm />);
      fireEvent.change(screen.getByLabelText(/apellido \*/i), { target: { value: 'García' } });
      fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByTestId('submit-button'));

      expect(candidateService.addCandidate).not.toHaveBeenCalled();
    });

    it('should_disable_submit_button_while_loading', async () => {
      (candidateService.addCandidate as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderWithRouter(<AddCandidateForm />);
      fireEvent.change(screen.getByLabelText(/nombre \*/i), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/apellido \*/i), { target: { value: 'García' } });
      fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'ana@test.com' } });
      fireEvent.click(screen.getByTestId('submit-button'));

      expect(screen.getByTestId('submit-button')).toBeDisabled();
    });

    it('should_reject_non_pdf_docx_file', () => {
      renderWithRouter(<AddCandidateForm />);
      const file = new File(['content'], 'image.png', { type: 'image/png' });
      const input = screen.getByLabelText(/cv/i);
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/solo se permiten archivos pdf o docx/i)).toBeInTheDocument();
    });
  });
  ```

- [ ] 3.2 Verificar que los tests FALLAN
  ```bash
  cd frontend && npm test -- --watchAll=false
  ```
  Resultado esperado: errores de "Cannot find module" o "Element not found"

---

## Paso 4: Componente AddCandidateForm

- [ ] 4.1 Crear directorio `frontend/src/components/AddCandidateForm/`

- [ ] 4.2 Crear `frontend/src/components/AddCandidateForm/AddCandidateForm.css`
  ```css
  .add-candidate-form {
    padding: 2rem 0;
  }

  .add-candidate-form h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-footer {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
  ```

- [ ] 4.3 Crear `frontend/src/components/AddCandidateForm/AddCandidateForm.tsx`

  Implementar con:
  - Importar `React, { useState }` y componentes de `react-bootstrap`
  - Importar `candidateService` y tipos `CreateCandidateDto, Candidate`
  - Estado: `formData`, `cvFile`, `errors`, `fileError`, `loading`, `apiError`, `success`
  - Handler `handleChange` — actualiza `formData[name]` y llama `validateField`
  - Handler `handleFileChange` — valida tipo (PDF/DOCX) y tamaño (10MB)
  - Handler `handleSubmit` — valida form completo, llama servicio, gestiona loading/error/success
  - Función `validateField` — validaciones inline para cada campo
  - Función `validateForm` — valida todo el form antes de submit
  - Render con `Container > Row > Col`
  - Alert de éxito con `data-testid="success-message"` (variant="success")
  - Alert de error con `data-testid="error-message"` (variant="danger")
  - Form con `data-testid="add-candidate-form"`
  - Cada campo con `<Form.Group>`, `<Form.Label htmlFor="...">`, `<Form.Control id="...">`, `<Form.Control.Feedback type="invalid">`
  - Botón submit con `data-testid="submit-button"` y Spinner cuando `loading`

  **Campos a renderizar en el formulario:**
  
  | Campo | Tipo control | Label | ID | required |
  |-------|-------------|-------|-----|---------|
  | firstName | `Form.Control type="text"` | "Nombre *" | firstName | sí |
  | lastName | `Form.Control type="text"` | "Apellido *" | lastName | sí |
  | email | `Form.Control type="email"` | "Email *" | email | sí |
  | phone | `Form.Control type="tel"` | "Teléfono" | phone | no |
  | address | `Form.Control type="text"` | "Dirección" | address | no |
  | education | `Form.Control as="textarea" rows={4}` | "Educación" | education | no |
  | workExperience | `Form.Control as="textarea" rows={4}` | "Experiencia Laboral" | workExperience | no |
  | cv | `Form.Control type="file"` | "CV (PDF o DOCX, máx. 10MB)" | cv | no |

---

## Paso 5: Verificar que los Tests Pasan

- [ ] 5.1 Ejecutar tests
  ```bash
  cd frontend && npm test -- --watchAll=false
  ```
  Resultado esperado: TODOS LOS TESTS PASAN (verde)

- [ ] 5.2 Si algún test falla, revisar el componente

---

## Paso 6: Configurar Bootstrap CSS

- [ ] 6.1 Añadir import en `frontend/src/index.tsx` o `App.tsx`
  ```typescript
  import 'bootstrap/dist/css/bootstrap.min.css';
  ```

---

## Paso 7: Actualizar Routing en App.tsx

- [ ] 7.1 Modificar `frontend/src/App.tsx`:

  ```typescript
  import React from 'react';
  import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
  import { Container, Navbar, Nav, Button } from 'react-bootstrap';
  import AddCandidateForm from './components/AddCandidateForm/AddCandidateForm';
  import 'bootstrap/dist/css/bootstrap.min.css';
  import './App.css';

  function Dashboard() {
    return (
      <Container className="mt-4">
        <h1>LTI — Talent Tracking System</h1>
        <p className="text-muted">Gestión de candidatos y procesos de selección</p>
        <Link to="/candidates/add">
          <Button variant="primary" size="lg">
            + Añadir Candidato
          </Button>
        </Link>
      </Container>
    );
  }

  function App() {
    return (
      <BrowserRouter>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">LTI ATS</Navbar.Brand>
            <Nav>
              <Nav.Link as={Link} to="/candidates/add">Añadir Candidato</Nav.Link>
            </Nav>
          </Container>
        </Navbar>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/candidates/add"
            element={
              <Container className="mt-4">
                <AddCandidateForm />
              </Container>
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;
  ```

---

## Paso 8: Prueba Manual en Navegador

- [ ] 8.1 Arrancar frontend
  ```bash
  cd frontend && npm start
  ```

- [ ] 8.2 Verificar en http://localhost:3000:
  - [ ] Página principal muestra botón "Añadir Candidato"
  - [ ] El botón navega a `/candidates/add`
  - [ ] El formulario muestra todos los campos
  - [ ] Enviar sin campos obligatorios → muestra errores de validación sin llamar a la API
  - [ ] Introducir email inválido → muestra error de formato
  - [ ] Subir un archivo PNG → muestra error "Solo se permiten archivos PDF o DOCX"
  - [ ] Enviar formulario válido → muestra spinner durante la carga → muestra mensaje de éxito
  - [ ] Intentar crear candidato con email duplicado → muestra error del servidor
  - [ ] La interfaz se ve bien en pantalla reducida (responsive)

---

## Paso 9: Actualizar Documentación

- [ ] 9.1 Generar reporte en `specs/anadir-candidato/reportes/YYYY-MM-DD-tests-frontend.md`:
  ```markdown
  # Reporte de Tests Frontend — [Fecha]
  
  ## Resumen
  - Tests totales: X
  - Tests pasando: X
  - Cobertura: X%
  
  ## Prueba Manual
  - ✅ Formulario visible desde la pantalla principal
  - ✅ Todos los campos presentes
  - ✅ Validación de campos obligatorios funciona
  - ✅ Validación de email funciona
  - ✅ Validación de tipo de archivo funciona
  - ✅ Mensaje de éxito aparece al crear candidato
  - ✅ Mensaje de error aparece con email duplicado
  - ✅ Botón deshabilitado durante loading
  ```

---

## Paso 10: Commit

- [ ] 10.1 Revisar cambios
  ```bash
  git status && git diff
  ```

- [ ] 10.2 Staging solo de archivos de esta tarea
  ```bash
  git add frontend/src/
  git add frontend/package.json frontend/package-lock.json
  git add specs/anadir-candidato/reportes/
  ```

- [ ] 10.3 Commit
  ```bash
  git commit -m "feat(candidates): add AddCandidateForm component with full validation

  - React form with all candidate fields (name, email, phone, address, education, experience)
  - CV file upload with type validation (PDF/DOCX) and size limit (10MB)
  - Client-side validation with descriptive error messages in Spanish
  - Success/error feedback states with Bootstrap alerts
  - React Router integration with dedicated route /candidates/add
  - 6 unit tests with React Testing Library
  - Connects to POST /api/candidates backend endpoint"
  ```

---

## Checklist Final

- [ ] `npm test -- --watchAll=false` — todos los tests del frontend pasan
- [ ] Formulario visible y accesible desde http://localhost:3000
- [ ] Botón "+ Añadir Candidato" en la pantalla principal funciona
- [ ] Validación de campos obligatorios funciona en el cliente
- [ ] Validación de formato email funciona
- [ ] Validación de tipo de archivo CV funciona (rechaza PNG, acepta PDF/DOCX)
- [ ] Mensaje de éxito aparece al crear candidato correctamente
- [ ] Mensaje de error del servidor aparece correctamente (ej: email duplicado)
- [ ] Botón deshabilitado durante el loading
- [ ] Sin errores de TypeScript
- [ ] Reporte en `specs/anadir-candidato/reportes/`
- [ ] Commit en rama `feature/anadir-candidato-frontend`
