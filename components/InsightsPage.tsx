'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function InsightsPage() {
  const { region, withoutAuthFlowMode, setWithoutAuthFlowMode } = useStore();
  const [selectedHospital, setSelectedHospital] = useState<'all' | 'delhi' | 'bengaluru' | 'mumbai' | 'dubai'>('all');

  const HOSPITALS = [
    { id: 'all', name: 'All Meridian Hospitals (2,500 Beds)', beds: 2500, region: 'all' },
    { id: 'delhi', name: 'Meridian Super Specialty, New Delhi', beds: 750, region: 'india' },
    { id: 'bengaluru', name: 'Meridian Institute of Cardiology, Bengaluru', beds: 600, region: 'india' },
    { id: 'mumbai', name: 'Meridian Multi-Specialty, Mumbai', beds: 550, region: 'india' },
    { id: 'dubai', name: 'Meridian Royal Hospital, Dubai Healthcare City', beds: 350, region: 'uae' },
    { id: 'abu_dhabi', name: 'Meridian Center of Oncology, Abu Dhabi', beds: 250, region: 'uae' },
  ];

  const metrics = withoutAuthFlowMode ? {
    tat: '4.2 hrs',
    tatSubtitle: 'Traditional manual pre-auth cycle',
    firstPass: '64.2%',
    firstPassSubtitle: '35.8% cases queried or contested',
    queryRate: '31.6%',
    queryRateSubtitle: 'Manual ping-pong with TPAs',
    dischargeWait: '3h 12m',
    dischargeWaitSubtitle: 'Severe patient friction at discharge',
    leakageSaved: '₹0',
    leakageSubtitle: 'High uncollected deductions & delays',
  } : {
    tat: '18 mins',
    tatSubtitle: '92.8% faster turnaround',
    firstPass: '91.8%',
    firstPassSubtitle: '+27.6% boost with grounded packet drafting',
    queryRate: '5.2%',
    queryRateSubtitle: 'Down from 31.6% (evidence auto-attached)',
    dischargeWait: '24 mins',
    dischargeWaitSubtitle: '100% compliant with IRDAI 60-min rule',
    leakageSaved: '₹4.82 Cr',
    leakageSubtitle: 'Annualized deductions & bed-hour recovery',
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>📊</span>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Group COO & RCM Executive Intelligence
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Operational throughput, cashless discharge clearance, and revenue cycle impact across Meridian Health
              </p>
            </div>
          </div>
        </div>

        {/* Controls & Comparison Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Hospital selector */}
          <select
            value={selectedHospital}
            onChange={e => setSelectedHospital(e.target.value as typeof selectedHospital)}
            style={{ fontSize: 12, padding: '6px 12px', minWidth: 220 }}
          >
            {HOSPITALS.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {/* Without AuthFlow mode switch */}
          <button
            onClick={() => setWithoutAuthFlowMode(!withoutAuthFlowMode)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: withoutAuthFlowMode ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
              border: withoutAuthFlowMode ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)',
              color: withoutAuthFlowMode ? '#f87171' : '#34d399',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <span>{withoutAuthFlowMode ? '⚠️ Viewing: WITHOUT AuthFlow (Baseline)' : '⚡ Viewing: WITH AuthFlow (AI Copilot)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            ⏱ Avg. Pre-Auth TAT
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: withoutAuthFlowMode ? '#f87171' : '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
            {metrics.tat}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.tatSubtitle}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            🎯 First-Pass Approval Rate
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: withoutAuthFlowMode ? '#f59e0b' : '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
            {metrics.firstPass}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.firstPassSubtitle}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            ❓ Payer Query Rate
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: withoutAuthFlowMode ? '#f87171' : '#a78bfa', fontFamily: 'JetBrains Mono, monospace' }}>
            {metrics.queryRate}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.queryRateSubtitle}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            🚪 Discharge Auth Wait Time
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: withoutAuthFlowMode ? '#f87171' : '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
            {metrics.dischargeWait}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.dischargeWaitSubtitle}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            🛡️ Recovered Revenue & Leakage
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: withoutAuthFlowMode ? '#8ba3c7' : '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>
            {metrics.leakageSaved}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.leakageSubtitle}
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Deep-dives */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
        {/* Section 1: Pre-Auth TAT Comparison */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            ⏱ Process Velocity: Traditional vs. AuthFlow
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Breakdown of minutes spent in each pre-authorisation stage
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Clinical Extraction & Document Review</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60a5fa' }}>4m (vs. 45m manual)</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '9%', height: '100%', background: '#3b82f6', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Policy Rule Adjudication & Room Cap Analysis</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>Sub-second (vs. 35m manual)</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '3%', height: '100%', background: '#10b981', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Medical Necessity Narrative Drafting</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa' }}>2m (vs. 50m manual drafting)</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '5%', height: '100%', background: '#8b5cf6', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Doctor Attestation & Review</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b' }}>3m one-tap (vs. 60m physical rounds)</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '6%', height: '100%', background: '#f59e0b', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Insurer Turnaround (FHIR / NHCX Direct Payload)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#38bdf8' }}>9m avg response</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', background: '#0284c7', borderRadius: 4 }} />
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18,
            padding: '10px 14px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8,
            fontSize: 11,
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>✨ Net End-to-End Time Saved Per Case:</span>
            <span style={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>3 hours 46 minutes</span>
          </div>
        </div>

        {/* Section 2: Rejection & Query Prevention by Engine Rule */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            🛡️ Top Denial Prevention Vectors
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Deterministic rules that preempted queries and deductions before insurer submission
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { rule: 'Rule 05 – Room Rent Proportionate Capping', impact: '₹1.84 Cr protected', tag: 'Deduction Prevention', pct: 94 },
              { rule: 'Rule 01 – Initial 30-Day Waiting Period', impact: '312 bad claims halted', tag: 'Denial Prevention', pct: 88 },
              { rule: 'Rule 11 – Inpatient Necessity Evidence', impact: '840 queries avoided', tag: 'Query Preemption', pct: 92 },
              { rule: 'Rule 09 – Non-Payables & Consumables Check', impact: '₹98 Lakh transparent', tag: 'Estimate Accuracy', pct: 85 },
              { rule: 'Rule 15 – Document Completeness Gaps', impact: '1,120 incomplete packets caught', tag: 'First-Pass Quality', pct: 97 },
            ].map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.rule}</span>
                  <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700 }}>{item.impact}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>{item.tag}</span>
                  <span>{item.pct}% effectiveness</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: IRDAI 60-Minute Discharge SLA Ledger */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            ⏱ IRDAI Master Circular Compliance: Discharge SLA & Delay Ledger
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Mandate: Insurer must grant final authorisation within 60 minutes of discharge summary receipt
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cases Cleared Under 60 Min</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginTop: 4 }}>96.4%</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Avg TAT: 24 mins</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Insurer-Attributable Breaches</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>3.6%</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Logged to Delay Ledger</div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>Regulatory Rule:</strong> Under IRDAI Master Circular (2024), any extra hospital or bed charges resulting from insurer delay beyond 60 minutes are legally payable by the insurer, not the patient. AuthFlow automatically generates the <em>Delay Ledger</em> to bill insurer TPAs directly.
          </div>
        </div>

        {/* Section 4: Multi-Hospital Rollout Status */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            🏥 Hospital Unit Performance (2,500 Beds)
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Cashless adoption and SLA compliance across network units
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { unit: 'Meridian Super Specialty, New Delhi', beds: 750, tat: '16m', compliance: '98.2%', status: 'Live' },
              { unit: 'Meridian Institute of Cardiology, Bengaluru', beds: 600, tat: '14m', compliance: '99.1%', status: 'Live' },
              { unit: 'Meridian Multi-Specialty, Mumbai', beds: 550, tat: '19m', compliance: '95.8%', status: 'Live' },
              { unit: 'Meridian Royal Hospital, Dubai', beds: 350, tat: '22m', compliance: '96.0%', status: 'Pilot' },
              { unit: 'Meridian Center of Oncology, Abu Dhabi', beds: 250, tat: '25m', compliance: '94.5%', status: 'Pilot' },
            ].map((u, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 6,
                fontSize: 11,
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.unit}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{u.beds} Beds · {u.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{u.tat} TAT</div>
                  <div style={{ color: '#10b981', fontSize: 10 }}>{u.compliance} SLA</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
