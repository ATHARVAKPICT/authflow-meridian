'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Worklist from '../components/Worklist';
import CaseWorkspace from '../components/CaseWorkspace';
import InsightsPage from '../components/InsightsPage';
import AboutPage from '../components/AboutPage';
import PatientView from '../components/PatientView';

type Page = 'worklist' | 'workspace' | 'insights' | 'about' | 'patient';

export default function Home() {
  const { selectedCaseId, role, setRole, region, setRegion, resetCases, replayMode, setReplayMode, demoSpeed, setDemoSpeed } = useStore();
  const [page, setPage] = useState<Page>('worklist');

  // Auto-navigate to workspace when a case is selected
  useEffect(() => {
    if (selectedCaseId && page === 'worklist') {
      setPage('workspace');
    }
  }, [selectedCaseId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* SYNTHETIC DATA BANNER */}
      <div className="synthetic-banner">
        ⚠️ SYNTHETIC DATA — PROTOTYPE — No real patient, policy, or clinical data. All names, numbers and clinical values are invented. — For demonstration purposes only.
      </div>

      {/* TOP NAV */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        height: '56px',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => { setPage('worklist'); }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: 'white',
          }}>A</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>AuthFlow</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>Meridian Health · Pre-Auth Copilot</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Nav links */}
        {[
          { id: 'worklist', label: '📋 Worklist' },
          { id: 'insights', label: '📊 Insights' },
          { id: 'about', label: '📖 About' },
          { id: 'patient', label: '👤 Patient View' },
        ].map(nav => (
          <button
            key={nav.id}
            onClick={() => setPage(nav.id as Page)}
            style={{
              background: page === nav.id ? 'rgba(59,130,246,0.15)' : 'transparent',
              border: page === nav.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              borderRadius: 6,
              color: page === nav.id ? '#60a5fa' : 'var(--text-secondary)',
              padding: '5px 12px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {nav.label}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />

        {/* Role switcher */}
        <select
          value={role}
          onChange={e => setRole(e.target.value as never)}
          style={{ fontSize: 12, padding: '4px 8px', minWidth: 120 }}
        >
          <option value="desk">🖥️ Desk Executive</option>
          <option value="doctor">👨‍⚕️ Doctor</option>
          <option value="rcm_head">📈 RCM Head</option>
          <option value="patient">👤 Patient</option>
        </select>

        {/* Region */}
        <select
          value={region}
          onChange={e => setRegion(e.target.value as never)}
          style={{ fontSize: 12, padding: '4px 8px', minWidth: 100 }}
        >
          <option value="india">🇮🇳 India (NHCX)</option>
          <option value="ksa">🇸🇦 KSA (NPHIES) [mock]</option>
          <option value="uae">🇦🇪 UAE (DHA) [mock]</option>
        </select>

        {/* Replay/Live toggle */}
        <button
          onClick={() => setReplayMode(!replayMode)}
          style={{
            background: replayMode ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${replayMode ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 6,
            color: replayMode ? '#10b981' : '#ef4444',
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          {replayMode ? '▶ REPLAY' : '🔴 LIVE'}
        </button>

        {/* Speed toggle */}
        <button
          onClick={() => setDemoSpeed(demoSpeed === 1 ? 60 : 1)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ×{demoSpeed}
        </button>

        {/* Reset */}
        <button
          onClick={resetCases}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-muted)',
            padding: '4px 10px',
            fontSize: 11,
            cursor: 'pointer',
          }}
          title="Reset all cases to initial state"
        >
          ↺ Reset
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {page === 'worklist' && <Worklist onOpenCase={() => setPage('workspace')} />}
        {page === 'workspace' && <CaseWorkspace />}
        {page === 'insights' && <InsightsPage />}
        {page === 'about' && <AboutPage />}
        {page === 'patient' && <PatientView />}
      </main>
    </div>
  );
}
