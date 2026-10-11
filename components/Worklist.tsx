'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { AuthCase } from '../types';
import { formatMinutes } from '../engine/sla';

interface Props {
  onOpenCase: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: '#60a5fa' },
  extracting: { label: 'Extracting', color: '#a78bfa' },
  draft_ready: { label: 'Draft Ready', color: '#34d399' },
  review: { label: 'In Review', color: '#fbbf24' },
  submitted: { label: 'Submitted', color: '#60a5fa' },
  approved: { label: 'Approved', color: '#10b981' },
  queried: { label: 'Queried', color: '#f59e0b' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  enhancement_needed: { label: 'Enhancement', color: '#f97316' },
  final_auth_pending: { label: 'Final Auth Pending', color: '#60a5fa' },
  discharged: { label: 'Discharged', color: '#10b981' },
};

function SLABadge({ case: c }: { case: AuthCase }) {
  const clock = c.slaClocks[0];
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!clock) return null;

  const isComplete = !!clock.completedAt;
  const isBreached = clock.breachedBy !== undefined && clock.breachedBy > 0;

  if (isBreached) {
    return (
      <span style={{ fontSize: 11, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
        ⏱ BREACHED +{formatMinutes(clock.breachedBy!)}
      </span>
    );
  }

  if (isComplete) {
    return (
      <span style={{ fontSize: 11, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
        ✓ Done
      </span>
    );
  }

  if (!mounted) {
    return (
      <span style={{ fontSize: 11, color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
        ⏱ {clock.deadlineMinutes}m
      </span>
    );
  }

  const started = new Date(clock.startedAt);
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - started.getTime()) / 60000);
  const remaining = clock.deadlineMinutes - elapsed;
  const color = remaining < 15 ? '#ef4444' : remaining < 30 ? '#f59e0b' : '#10b981';
  return (
    <span style={{ fontSize: 11, color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
      ⏱ {remaining > 0 ? formatMinutes(remaining) : 'EXPIRED'}
    </span>
  );
}

function CaseCard({ c, isSelected, onSelect }: { c: AuthCase; isSelected: boolean; onSelect: () => void }) {
  const status = STATUS_LABELS[c.status] ?? { label: c.status, color: '#8ba3c7' };
  const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: `1px solid ${isSelected ? '#3b82f6' : 'var(--border-subtle)'}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      {/* Risk indicator bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        borderRadius: '10px 0 0 10px',
        background: riskColors[c.riskLevel],
      }} />

      <div style={{ marginLeft: 8 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {c.patient.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {c.patient.age}y · {c.patient.gender} · {c.specialty}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{
              background: `${status.color}22`,
              border: `1px solid ${status.color}44`,
              color: status.color,
              borderRadius: 9999,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}>
              {status.label}
            </span>
            <span style={{
              background: `${riskColors[c.riskLevel]}22`,
              border: `1px solid ${riskColors[c.riskLevel]}44`,
              color: riskColors[c.riskLevel],
              borderRadius: 9999,
              padding: '1px 6px',
              fontSize: 10,
              fontWeight: 700,
            }}>
              {c.riskLevel.toUpperCase()} RISK
            </span>
          </div>
        </div>

        {/* Diagnosis */}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.3 }}>
          {c.diagnosis}
        </div>

        {/* Policy / Payer */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            📋 {c.policies[0]?.product?.slice(0, 28)}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            🏢 {c.tpaName}
          </span>
        </div>

        {/* Footer: SLA + admission type + estimate */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SLABadge case={c} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              background: c.admissionType === 'emergency' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
              color: c.admissionType === 'emergency' ? '#ef4444' : '#60a5fa',
              border: `1px solid ${c.admissionType === 'emergency' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 10,
              fontWeight: 700,
            }}>
              {c.admissionType === 'emergency' ? '🚨 EMERGENCY' : '📅 PLANNED'}
            </span>
            {c.estimate && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{(c.estimate.totalBilled / 1000).toFixed(0)}k
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Worklist({ onOpenCase }: Props) {
  const { cases, selectedCaseId, selectCase, role } = useStore();

  const handleSelect = (id: string) => {
    selectCase(id);
    onOpenCase();
  };

  const [todayStr, setTodayStr] = useState('Today');
  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const metrics = {
    total: cases.length,
    high: cases.filter(c => c.riskLevel === 'high').length,
    pending: cases.filter(c => !['approved', 'discharged', 'rejected'].includes(c.status)).length,
    approvedToday: cases.filter(c => c.status === 'approved').length,
  };

  return (
    <div style={{ padding: 24, height: 'calc(100vh - 84px)', overflowY: 'auto' }} className="page-enter">
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Pre-Auth Worklist
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Meridian Health · Insurance Desk · {todayStr}
          {role !== 'desk' && (
            <span style={{ marginLeft: 8, color: '#f59e0b' }}>
              Viewing as: {role === 'doctor' ? 'Treating Doctor' : role === 'rcm_head' ? 'RCM Head' : 'Patient'}
            </span>
          )}
        </p>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Cases', value: metrics.total, color: '#60a5fa', icon: '📋' },
          { label: 'High Risk', value: metrics.high, color: '#ef4444', icon: '⚠️' },
          { label: 'Pending Auth', value: metrics.pending, color: '#f59e0b', icon: '⏳' },
          { label: 'Approved Today', value: metrics.approvedToday, color: '#10b981', icon: '✅' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{kpi.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: kpi.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Demo path hint */}
      <div style={{
        background: 'rgba(124,58,237,0.08)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 8,
        padding: '10px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <span style={{ fontSize: 12, color: '#a78bfa' }}>
          <strong>Demo path:</strong> Start with Case 3 (Chest Pain / NSTEMI) — the "wow" case. Watch the AI flag a missing troponin, then upload it to see risk drop from HIGH → LOW.
        </span>
      </div>

      {/* Case list */}
      <div style={{ display: 'grid', gap: 10 }}>
        {cases.map(c => (
          <CaseCard
            key={c.id}
            c={c}
            isSelected={selectedCaseId === c.id}
            onSelect={() => handleSelect(c.id)}
          />
        ))}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        North-star metric: Median minutes from medical clearance to financial clearance.
        Supporting: first-pass approval rate · query rate · rejection count & ₹ · desk min/case · insurer delay hours · patient surprise-liability incidents.
      </div>
    </div>
  );
}
