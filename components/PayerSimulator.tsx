'use client';

import React, { useState } from 'react';
import type { AuthCase, PayerEventType } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  caseData: AuthCase;
}

export default function PayerSimulator({ caseData }: Props) {
  const { addPayerEvent } = useStore();
  const [selectedEventType, setSelectedEventType] = useState<PayerEventType>('preauth_approved');
  const [approvedAmount, setApprovedAmount] = useState<number>(
    caseData.estimate?.insurerApproved || caseData.estimate?.totalPayable || 180000
  );
  const [queryReason, setQueryReason] = useState<string>(
    'Requesting clinical justification for CCU stay and serial 6-hour Troponin levels.'
  );
  const [delayMinutes, setDelayMinutes] = useState<number>(75);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const triggerEvent = (type: PayerEventType) => {
    const now = new Date().toISOString();
    let payload: Record<string, unknown> = {};
    let newStatus = caseData.status;

    if (type === 'preauth_approved') {
      payload = {
        approvedAmount,
        refNumber: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
        authDate: now,
        notes: 'Pre-authorisation approved as per GIPSA tariff schedule.',
      };
      newStatus = 'approved';
    } else if (type === 'query') {
      payload = {
        queryId: `QRY-${Date.now()}`,
        queryText: queryReason,
        targetDocs: ['Admission Note', 'Lab Reports'],
        deadlineHours: 24,
      };
      newStatus = 'queried';
    } else if (type === 'partial') {
      payload = {
        approvedAmount: Math.round(approvedAmount * 0.8),
        deductionAmount: Math.round(approvedAmount * 0.2),
        reason: 'Proportionate deduction applied due to room tariff capping (Rule 05).',
      };
      newStatus = 'approved';
    } else if (type === 'rejected') {
      payload = {
        rejectionReason: 'Waiting period active under Section 4.1 or non-covered indication.',
        regulatoryCitation: 'IRDAI Health Master Circular / Policy Clause 4.1',
      };
      newStatus = 'rejected';
    } else if (type === 'final_auth_approved') {
      payload = {
        finalApprovedAmount: approvedAmount,
        settlementRef: `SETTLE-${Date.now()}`,
        tatMinutes: 38,
        compliantWithIRDAI60Min: true,
      };
      newStatus = 'discharged';
    } else if (type === 'final_auth_delayed') {
      payload = {
        delayMinutes,
        extraChargeImposed: delayMinutes > 60 ? (delayMinutes - 60) * 120 : 0,
        cause: 'Insurer medical assessor offline / delayed sign-off',
        insurerAttributable: true,
      };
      newStatus = 'final_auth_pending';
    }

    addPayerEvent(
      caseData.id,
      {
        id: `EVT-${Date.now()}`,
        at: now,
        type,
        payload,
        isSimulated: true,
      },
      newStatus
    );

    setFeedbackMsg(`✓ Triggered ${type.replace(/_/g, ' ')}`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div style={{
      marginTop: 16,
      background: 'var(--bg-surface)',
      border: '1px solid rgba(168,85,247,0.3)',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c084fc' }}>Payer & TPA Simulator</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Simulate insurer adjudication & regulatory SLA events</div>
          </div>
        </div>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          background: 'rgba(168,85,247,0.15)',
          color: '#c084fc',
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid rgba(168,85,247,0.3)',
        }}>
          INTERACTIVE TESTBED
        </span>
      </div>

      {feedbackMsg && (
        <div style={{
          marginBottom: 10,
          padding: '6px 10px',
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 6,
          fontSize: 11,
          color: '#34d399',
          fontWeight: 600,
        }}>
          {feedbackMsg}
        </div>
      )}

      {/* Simulator Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <button
            onClick={() => triggerEvent('preauth_approved')}
            className="btn-approve"
            style={{ fontSize: 11, padding: '8px 10px', justifyContent: 'center' }}
          >
            ✅ Approve Pre-Auth (Full)
          </button>
          <button
            onClick={() => triggerEvent('partial')}
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24',
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ⚠️ Approve Partial (-20%)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <button
            onClick={() => triggerEvent('query')}
            style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60a5fa',
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ❓ Raise Payer Query
          </button>
          <button
            onClick={() => triggerEvent('rejected')}
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✕ Reject Request
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

        {/* Discharge SLA Simulation */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>
          Discharge Cashless Clearance (IRDAI 60-min SLA)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <button
            onClick={() => triggerEvent('final_auth_approved')}
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981',
              borderRadius: 6,
              padding: '7px 8px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ⚡ Discharge (38m - SLA Pass)
          </button>
          <button
            onClick={() => triggerEvent('final_auth_delayed')}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              borderRadius: 6,
              padding: '7px 8px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ⏱ Discharge Delay ({delayMinutes}m Breach)
          </button>
        </div>

        {/* Custom query / delay parameter toggles */}
        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
          *Simulated actions append to Payer Event Timeline, recalculate SLA metrics, and log directly into the Delay Ledger.
        </div>
      </div>
    </div>
  );
}
