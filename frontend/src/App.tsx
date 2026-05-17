import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AddCandidateForm } from './components/AddCandidateForm/AddCandidateForm';
import { getCandidateCount } from './services/candidateService';
import './App.css';

/* ─── Icons ─────────────────────────────────────────────── */
const IconUsers = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconClock = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);

/* ─── Navigation ─────────────────────────────────────────── */
function AppNav() {
  const location = useLocation();
  return (
    <nav className="app-nav">
      <Link to="/" className="nav-brand">
        <div className="nav-brand-icon">LT</div>
        <div className="nav-brand-text">
          <span className="nav-brand-name">LTI</span>
          <span className="nav-brand-tagline">Talent Tracking</span>
        </div>
      </Link>
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link-item${location.pathname === '/' ? ' active' : ''}`}
        >
          <IconUsers />
          Candidatos
        </Link>
        <Link
          to="/candidates/new"
          className={`nav-link-item${location.pathname === '/candidates/new' ? ' active' : ''}`}
        >
          <IconPlus />
          Añadir candidato
        </Link>
      </div>
    </nav>
  );
}

/* ─── Dashboard ──────────────────────────────────────────── */
function Dashboard() {
  const [totalCandidates, setTotalCandidates] = useState<number | null>(null);

  useEffect(() => {
    getCandidateCount()
      .then(setTotalCandidates)
      .catch(() => setTotalCandidates(null));
  }, []);

  return (
    <main className="app-main">
      <div className="dashboard-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Panel de Reclutamiento</p>
          <h1 className="hero-title">Gestiona tu talento,<br />construye tu equipo</h1>
          <p className="hero-subtitle">
            Centraliza candidatos, seguimiento de procesos y documentación en un solo lugar.
          </p>
          <Link to="/candidates/new" className="hero-cta">
            <IconPlus />
            Añadir candidato
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--indigo"><IconUsers /></div>
          <div>
            <div className="stat-value" data-testid="stat-total-candidates">
              {totalCandidates !== null ? totalCandidates : '—'}
            </div>
            <div className="stat-label">Candidatos totales</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--green"><IconCheck /></div>
          <div>
            <div className="stat-value">—</div>
            <div className="stat-label">Procesos activos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--amber"><IconClock /></div>
          <div>
            <div className="stat-value">—</div>
            <div className="stat-label">Pendientes de revisión</div>
          </div>
        </div>
      </div>

      <div className="quick-action-card">
        <div className="quick-action-text">
          <h3>Registra un nuevo candidato</h3>
          <p>Añade datos personales, experiencia laboral y adjunta el CV en PDF o DOCX.</p>
        </div>
        <Link to="/candidates/new" className="btn-primary-custom">
          <IconPlus />
          Añadir candidato
        </Link>
      </div>
    </main>
  );
}

/* ─── Form page ──────────────────────────────────────────── */
function NewCandidatePage() {
  return (
    <main className="app-main">
      <AddCandidateForm />
    </main>
  );
}

/* ─── App root ───────────────────────────────────────────── */
function AppInner() {
  return (
    <div className="app-shell">
      <AppNav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates/new" element={<NewCandidatePage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
