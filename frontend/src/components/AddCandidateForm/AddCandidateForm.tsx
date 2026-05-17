import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CreateCandidateDto } from '../../types/candidate';
import { addCandidate } from '../../services/candidateService';
import { AutocompleteField } from '../AutocompleteField/AutocompleteField';
import { PhoneField } from '../PhoneField/PhoneField';
import './AddCandidateForm.css';

/* ─── Icons ─────────────────────────────────────────────── */
const IconUser = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPhone = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconUpload = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconFile = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconAlert = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ─── Constants ──────────────────────────────────────────── */
const EMPTY_FORM: CreateCandidateDto = {
  firstName: '', lastName: '', email: '',
  phone: '', address: '', education: '', workExperience: '',
};

const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/* ─── Progress indicator ─────────────────────────────────── */
function ProgressBar({ formData }: { formData: CreateCandidateDto }) {
  const filled = useMemo(() => {
    let count = 0;
    if (formData.firstName.trim()) count++;
    if (formData.lastName.trim()) count++;
    if (formData.email.trim()) count++;
    return count;
  }, [formData]);

  const pct = Math.round((filled / 3) * 100);

  return (
    <div className="form-progress">
      <div className="form-progress-header">
        <span className="form-progress-label">
          {filled === 3 ? '✓ Campos obligatorios completados' : `${filled} de 3 campos obligatorios`}
        </span>
        <span className="form-progress-pct">{pct}%</span>
      </div>
      <div className="form-progress-bar">
        <div
          className={`form-progress-fill${filled === 3 ? ' form-progress-fill--complete' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────── */
export function AddCandidateForm() {
  const [formData, setFormData] = useState<CreateCandidateDto>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCandidateDto, string>>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  }

  function handleAutocompleteChange(field: keyof CreateCandidateDto) {
    return (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handlePhoneChange(value: string) {
    setFormData((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
    setApiError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!ALLOWED_MIME.includes(file.type)) {
        setFileError('Solo se permiten archivos PDF o DOCX');
        setCvFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFileError('El archivo no puede superar los 10MB');
        setCvFile(null);
        return;
      }
    }
    setCvFile(file);
    setFileError(null);
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof CreateCandidateDto, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'El email tiene un formato inválido';
    }
    if (formData.phone?.trim()) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        newErrors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await addCandidate(formData, cvFile);
      setSuccess(true);
      setFormData(EMPTY_FORM);
      setCvFile(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Error al guardar el candidato');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  const uploadZoneClass = [
    'upload-zone',
    cvFile ? 'upload-zone--filled' : '',
    fileError ? 'upload-zone--error' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Page header */}
      <div className="form-page-header">
        <div className="form-page-breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="form-page-breadcrumb-sep"><IconChevronRight /></span>
          <span>Nuevo candidato</span>
        </div>
        <h1 className="form-page-title">Añadir candidato</h1>
        <p className="form-page-desc">
          Completa los datos del candidato. Los campos marcados con{' '}
          <span style={{ color: 'var(--color-danger)' }}>*</span> son obligatorios.
        </p>
        <ProgressBar formData={formData} />
      </div>

      <div className="form-card">
        {/* Success alert */}
        {success && (
          <div className="form-alert form-alert--success" data-testid="success-message">
            <span className="form-alert-icon"><IconCheck /></span>
            <span>Candidato añadido correctamente. Puedes añadir otro o volver al inicio.</span>
            <button className="form-alert-close" onClick={() => setSuccess(false)} aria-label="Cerrar">
              <IconX />
            </button>
          </div>
        )}

        {/* Error alert */}
        {apiError && (
          <div className="form-alert form-alert--danger" data-testid="error-message">
            <span className="form-alert-icon"><IconAlert /></span>
            <span>{apiError}</span>
          </div>
        )}

        <form data-testid="add-candidate-form" onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Personal data ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon"><IconUser /></div>
              <div>
                <p className="form-section-title">Datos personales</p>
                <p className="form-section-subtitle">Nombre y correo electrónico del candidato</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="firstName" className="form-label-custom">
                  Nombre <span className="form-label-required">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  className={`form-control${errors.firstName ? ' is-invalid' : ''}`}
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ej. María"
                  data-testid="input-firstName"
                  autoComplete="given-name"
                />
                {errors.firstName && <span className="invalid-feedback">{errors.firstName}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="lastName" className="form-label-custom">
                  Apellido <span className="form-label-required">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  className={`form-control${errors.lastName ? ' is-invalid' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ej. García López"
                  data-testid="input-lastName"
                  autoComplete="family-name"
                />
                {errors.lastName && <span className="invalid-feedback">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email" className="form-label-custom">
                Email <span className="form-label-required">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={`form-control${errors.email ? ' is-invalid' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="nombre@empresa.com"
                data-testid="input-email"
                autoComplete="email"
              />
              {errors.email && <span className="invalid-feedback">{errors.email}</span>}
            </div>
          </div>

          {/* ── Section 2: Contact ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon"><IconPhone /></div>
              <div>
                <p className="form-section-title">Información de contacto</p>
                <p className="form-section-subtitle">Teléfono y dirección postal (opcional)</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label-custom">Teléfono</label>
                <PhoneField
                  value={formData.phone || ''}
                  onChange={handlePhoneChange}
                  error={errors.phone}
                  data-testid="input-phone"
                />
                {errors.phone && (
                  <span className="invalid-feedback" style={{ display: 'block' }}>
                    {errors.phone}
                  </span>
                )}
                <span className="form-hint">Selecciona el país e introduce el número local.</span>
              </div>

              <div className="form-field">
                <label htmlFor="address" className="form-label-custom">Dirección</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, ciudad, código postal"
                  data-testid="input-address"
                  autoComplete="street-address"
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Professional profile (with autocomplete) ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon"><IconBriefcase /></div>
              <div>
                <p className="form-section-title">Perfil profesional</p>
                <p className="form-section-subtitle">
                  Formación y experiencia · el sistema sugiere entradas similares
                </p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="education" className="form-label-custom">Educación</label>
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
            </div>

            <div className="form-field">
              <label htmlFor="workExperience" className="form-label-custom">Experiencia laboral</label>
              <AutocompleteField
                id="workExperience"
                name="workExperience"
                field="workExperience"
                value={formData.workExperience || ''}
                onChange={handleAutocompleteChange('workExperience')}
                rows={4}
                placeholder={'Desarrollador Frontend – React · Empresa XYZ (2022–presente)\nResponsabilidades: …'}
                hint="Escribe o selecciona una sugerencia. Puedes describir varios puestos."
                data-testid="input-workExperience"
              />
            </div>
          </div>

          {/* ── Section 4: Documents ── */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon"><IconUpload /></div>
              <div>
                <p className="form-section-title">Documentos</p>
                <p className="form-section-subtitle">Curriculum Vitae del candidato (opcional)</p>
              </div>
            </div>

            <label className={uploadZoneClass} htmlFor="cv" data-testid="input-cv">
              <input
                id="cv"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="upload-zone-icon">
                {cvFile ? <IconFile /> : fileError ? <IconX /> : <IconUpload />}
              </div>

              {cvFile ? (
                <>
                  <p className="upload-zone-title">Archivo seleccionado</p>
                  <p className="upload-zone-filename">{cvFile.name}</p>
                  <p className="upload-zone-sub">
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB · Haz clic para cambiar
                  </p>
                </>
              ) : (
                <>
                  <p className="upload-zone-title">Arrastra tu CV aquí o haz clic para buscar</p>
                  <p className="upload-zone-sub">PDF o DOCX · Máximo 10 MB</p>
                </>
              )}
              {fileError && <p className="upload-zone-error">{fileError}</p>}
            </label>
          </div>

          {/* ── Footer ── */}
          <div className="form-footer">
            <span className="form-footer-note">
              <span style={{ color: 'var(--color-danger)' }}>*</span> Campos obligatorios
            </span>
            <button
              data-testid="submit-button"
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-submit-spinner" />
                  Guardando…
                </>
              ) : (
                <>
                  <IconCheck />
                  Guardar candidato
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

export default AddCandidateForm;
