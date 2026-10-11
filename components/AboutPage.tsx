'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto', width: '100%', lineHeight: 1.7 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: 'white',
          }}>A</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              AuthFlow: AI-Native Pre-Authorisation & Cashless Claims Copilot
            </h1>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Built for Meridian Health (2,500 beds across India, UAE, and KSA) · Operational Prototype
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '12px 0 0' }}>
          AuthFlow reimagines the highest-friction operational workflow in modern healthcare: the insurance pre-authorisation and cashless discharge clearance cycle. Designed to transform multi-hour delays, opaque deductions, and high denial rates into a sub-20-minute, transparent, evidence-grounded copilot.
        </p>
      </div>

      {/* Grid of Core Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>
        {/* Pillar 1 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🛡️</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Strict Grounding & Zero Hallucination
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Every extracted clinical fact (ICD codes, troponin lab values, ECG ST elevations, X-ray findings) is bound to an exact text span and document offset. If a field lacks documentation, AuthFlow flags an <strong>Open Gap</strong> rather than hallucinating clinical justification.
          </p>
        </div>

        {/* Pillar 2 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>⚙️</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Deterministic Rules Engine
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            15 deterministic rules evaluate policy exclusions, 30-day initial waiting periods, pre-existing disease (PED) moratoriums (IRDAI 60-month clause), room rent cappings, and proportionate deductions with mathematical precision before submission.
          </p>
        </div>

        {/* Pillar 3 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>👨‍⚕️</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Human-in-the-Loop & Doctor Sign-Off
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            No claim is ever submitted autonomously without human oversight. Treating doctors have a dedicated <strong>One-Tap Attestation</strong> flow, and insurance desk executives review all estimates, patient liabilities, and policy clauses.
          </p>
        </div>

        {/* Pillar 4 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>⏱️</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            IRDAI 60-Min SLA & Delay Ledger
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            IRDAI Master Circular (2024) mandates that cashless final discharge authorisation must be granted within 60 minutes. When payers breach this SLA, AuthFlow logs the minutes lost into an insurer-attributable <strong>Delay Ledger</strong>, preventing patients from bearing extra room costs.
          </p>
        </div>

        {/* Pillar 5 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🌐</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            FHIR & NHCX Ready
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Pre-auth submissions generate standards-compliant FHIR Pre-Auth bundles compatible with India's National Health Claims Exchange (NHCX), with modular adapters for UAE eClaim and Saudi Arabia NPHIES protocols.
          </p>
        </div>

        {/* Pillar 6 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🔄</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Replay Mode vs. Live Mode
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Works 100% offline in <strong>Replay Mode</strong> with zero external API dependencies for evaluations and demos. Supports <strong>Live Mode</strong> via Gemini LLM with PII redaction and synthetic tokenization guardrails.
          </p>
        </div>
      </div>

      {/* Clinical Safety Protocol Notice */}
      <div style={{
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 6 }}>
          🚨 Absolute Clinical Safety Imperative
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Emergency medical care must <strong>NEVER</strong> be delayed or conditioned upon insurance pre-authorisation or financial approval. In cases such as acute appendicitis or acute myocardial infarction (NSTEMI), clinical triage and emergency operative treatment proceed immediately, regardless of insurance status or waiting period adjudication.
        </div>
      </div>

      {/* Synthetic Data Disclaimer */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        padding: '16px 20px',
        fontSize: 11,
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
          ⚖️ Synthetic Data & Consulting Case Assessment Disclaimer
        </div>
        <div>
          Meridian Health is a fictional hospital network. All patient records, doctor identities, insurance policy documents, tariff amounts, and payer communications are entirely synthetic and generated for demonstration purposes. No real protected health information (PHI) or proprietary insurer data is present in this system.
        </div>
      </div>
    </div>
  );
}
