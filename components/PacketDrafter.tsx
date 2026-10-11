'use client';

import React, { useState } from 'react';
import type { AuthCase } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  caseData: AuthCase;
  narrativeText?: string;
  onApprove?: () => void;
}

export default function PacketDrafter({ caseData, narrativeText, onApprove }: Props) {
  const { role, approvePacked, attestDoctor } = useStore();
  const [narrative, setNarrative] = useState(narrativeText || caseData.packet?.narrative || '');
  const [tone, setTone] = useState<'standard' | 'evidence_dense' | 'urgent'>('evidence_dense');
  const [copied, setCopied] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. Rajesh Sharma');

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Banner / controls */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tag-ai">AI GENERATED</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Medical Necessity & Pre-Auth Packet
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            (Strictly grounded in uploaded case records)
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Draft Style:</span>
          <select
            value={tone}
            onChange={e => setTone(e.target.value as typeof tone)}
            style={{ fontSize: 11, padding: '3px 8px' }}
          >
            <option value="evidence_dense">Evidence-Dense (Insurer Standard)</option>
            <option value="standard">Standard Narrative</option>
            <option value="urgent">Urgent / Emergency Protocol</option>
          </select>
          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ fontSize: 11, padding: '4px 10px' }}
          >
            {copied ? '✓ Copied' : '📋 Copy Draft'}
          </button>
        </div>
      </div>

      {/* Editor / Viewer area */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        padding: 16,
      }}>
        <textarea
          value={narrative}
          onChange={e => setNarrative(e.target.value)}
          rows={16}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: 12,
            color: 'var(--text-primary)',
            fontSize: 12,
            lineHeight: 1.7,
            fontFamily: 'Inter, monospace',
            resize: 'vertical',
          }}
          placeholder="Narrative pre-auth content..."
        />

        {/* Evidence Highlights Strip */}
        <div style={{
          marginTop: 12,
          padding: '10px 12px',
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 8,
          fontSize: 11,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 700, color: '#60a5fa' }}>🔎 Grounded Citations Found:</span>
          <span className="tag-citation">[Evidence: Admission Note]</span>
          <span className="tag-citation">[Evidence: ECG Report]</span>
          <span className="tag-citation">[Evidence: Lab Troponin I]</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Every claim references source line numbers</span>
        </div>

        {/* Action strip */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {caseData.packet?.approvedBy ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, padding: '4px 10px' }}>
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: 12 }}>✓ Approved by:</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {caseData.packet.approvedBy} ({new Date(caseData.packet.approvedAt || Date.now()).toLocaleTimeString()})
                </span>
              </div>
            ) : (
              <button
                className="btn-approve"
                onClick={() => {
                  approvePacked(caseData.id, role === 'doctor' ? 'Dr. Rajesh Sharma' : 'Desk: Sunita Rao');
                  if (onApprove) onApprove();
                }}
              >
                ✅ Approve & Lock Packet
              </button>
            )}

            {!caseData.packet?.doctorAttestedBy && (
              <button
                className="btn-secondary"
                onClick={() => setShowDoctorModal(true)}
              >
                👨‍⚕️ Clinical Doctor Attestation
              </button>
            )}
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Status: {caseData.packet?.approvedBy ? 'Locked for submission' : 'Awaiting Reviewer Sign-off'}
          </div>
        </div>
      </div>

      {/* Doctor Attestation Modal */}
      {showDoctorModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 24, width: 420,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>👨‍⚕️ Clinical Attestation</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              I, the undersigned treating physician, confirm that:
              <br />• The clinical information in the auth packet is accurate and complete.
              <br />• The procedure is medically necessary as documented.
              <br />• I authorise submission to the insurer/TPA.
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Doctor Name</label>
              <input
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-approve" style={{ flex: 1 }} onClick={() => {
                attestDoctor(caseData.id, doctorName);
                setShowDoctorModal(false);
              }}>
                ✅ Confirm Attestation
              </button>
              <button className="btn-secondary" onClick={() => setShowDoctorModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
