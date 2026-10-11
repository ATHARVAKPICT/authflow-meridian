'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function PatientView() {
  const { cases, selectedCaseId, selectCase } = useStore();
  const [selectedId, setSelectedId] = useState<string>(selectedCaseId || cases[0]?.id || 'CASE-001');

  const currentCase = cases.find(c => c.id === selectedId) || cases[0];
  if (!currentCase) return null;

  const estimate = currentCase.estimate;
  const isApproved = currentCase.status === 'approved' || currentCase.status === 'discharged';
  const isRejected = currentCase.status === 'rejected';

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto', width: '100%', lineHeight: 1.6 }}>
      {/* Patient Portal Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30,58,138,0.25), rgba(59,130,246,0.15))',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: 'white', fontWeight: 700,
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              Meridian Health · Patient Cashless Portal
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Transparent real-time insurance tracking for you and your family
            </div>
          </div>
        </div>

        {/* Patient Case Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Viewing Case:</span>
          <select
            value={selectedId}
            onChange={e => {
              setSelectedId(e.target.value);
              selectCase(e.target.value);
            }}
            style={{ fontSize: 12, padding: '5px 10px' }}
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id}: {c.patient.name} ({c.procedure || c.diagnosis || 'Admission'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Status Banner */}
      <div style={{
        background: isApproved
          ? 'rgba(16,185,129,0.1)'
          : isRejected
          ? 'rgba(239,68,68,0.1)'
          : 'rgba(245,158,11,0.1)',
        border: isApproved
          ? '1px solid rgba(16,185,129,0.3)'
          : isRejected
          ? '1px solid rgba(239,68,68,0.3)'
          : '1px solid rgba(245,158,11,0.3)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>
            {isApproved ? '✅' : isRejected ? '⚠️' : '⏳'}
          </span>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: isApproved ? '#34d399' : isRejected ? '#f87171' : '#fbbf24',
            }}>
              {isApproved
                ? 'Cashless Pre-Authorisation Confirmed'
                : isRejected
                ? 'Insurance Claim Status: Policy Waiting Period Applicable'
                : 'Pre-Authorisation Under Active Review'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {isApproved
                ? `Approved by ${currentCase.policies[0]?.insurer} (${currentCase.policies[0]?.tpa}) for hospital admission.`
                : isRejected
                ? 'Our financial counselor is by your side to explore interest-free EMI and hospital assistance options.'
                : 'Our hospital desk has drafted your clinical necessity packet and submitted all lab records.'}
            </div>
          </div>
        </div>

        <div style={{
          fontSize: 12,
          fontWeight: 700,
          background: 'rgba(0,0,0,0.25)',
          padding: '6px 14px',
          borderRadius: 8,
          color: 'var(--text-primary)',
        }}>
          Status: {currentCase.status.toUpperCase()}
        </div>
      </div>

      {/* Financial Transparency Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Coverage Summary */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💳</span> Financial Estimate Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Estimated Hospital Bill:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
                ₹{estimate?.totalBilled.toLocaleString('en-IN') || '0'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>Insurer Covered Amount (Cashless):</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                ₹{(estimate?.insurerApproved ?? estimate?.totalPayable)?.toLocaleString('en-IN') || '0'}
              </span>
            </div>

            <div style={{ height: 1, background: 'var(--border-subtle)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
              <span>Estimated Out-of-Pocket / Patient Share:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                ₹{(estimate?.patientPayable ?? estimate?.patientLiability)?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          {/* Plain English explanation */}
          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}>
            <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: 4 }}>
              💡 Why is there an out-of-pocket amount?
            </div>
            <div>
              {currentCase.id === 'CASE-001'
                ? 'Your policy has a 1% room rent cap (₹5,000/day). Choosing a Deluxe room (₹8,000/day) leads to a proportionate share on room & associated fees.'
                : currentCase.id === 'CASE-002'
                ? 'Your policy is currently in the initial 30-day waiting period (day 18/30). Our desk is assisting you with alternate options.'
                : 'Any non-medical consumables (masks, gloves, linen) and policy deductibles are not covered under standard insurance terms.'}
            </div>
          </div>
        </div>

        {/* Live Discharge Roadmap */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⏱</span> Cashless Discharge Roadmap (IRDAI 60-min SLA)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: '1. Clinical Discharge Summary', desc: 'Prepared & signed by treating consultant', status: 'completed' },
              { title: '2. Final Bill & Pharmacy Audit', desc: 'Itemised bill verified by hospital desk', status: 'completed' },
              { title: '3. Insurer Final Authorisation', desc: 'IRDAI mandates TPA response within 60 minutes', status: isApproved ? 'completed' : 'in_progress' },
              { title: '4. Discharge Gate Pass Issued', desc: 'Ready for home with medication discharge pack', status: currentCase.status === 'discharged' ? 'completed' : 'pending' },
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: step.status === 'completed' ? '#10b981' : step.status === 'in_progress' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'white', fontWeight: 700, flexShrink: 0, marginTop: 2,
                }}>
                  {step.status === 'completed' ? '✓' : idx + 1}
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16,
            padding: '10px 12px',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8,
            fontSize: 11,
            color: '#34d399',
          }}>
            🛡️ <strong>Zero Delay Guarantee:</strong> If the insurer delays authorization beyond 60 minutes, any extra hospital bed charges are billed to the insurer, not you.
          </div>
        </div>
      </div>

      {/* Help & Support Assistance */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Need Financial Counseling or Assistance?
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Our cashless desk executives and patient advocates are available 24/7 on Ground Floor, Block A.
          </div>
        </div>
        <button
          onClick={() => alert('Assistance request sent to Meridian Cashless Desk. An executive will visit your room within 10 minutes.')}
          className="btn-primary"
          style={{ fontSize: 12, padding: '8px 16px' }}
        >
          📞 Request Desk Counselor Visit
        </button>
      </div>
    </div>
  );
}
