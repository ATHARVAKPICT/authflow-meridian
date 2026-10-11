'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { AuthCase, AgentTraceStep } from '../types';
import DocumentViewer from './DocumentViewer';
import RulesPanel from './RulesPanel';
import PacketDrafter from './PacketDrafter';
import PayerSimulator from './PayerSimulator';

const MOCK_PACKETS: Record<string, string> = {
  'CASE-001': `MEDICAL NECESSITY NARRATIVE – CASHLESS AUTHORISATION REQUEST
Patient: [REDACTED] | Age: 58 | Gender: M | Policy: SRK-IND-2021-4471983
Procedure: Total Right Knee Replacement (TKR)
Diagnosis: Primary osteoarthritis right knee (M17.1, illustrative)

PRESENTING COMPLAINT AND DURATION:
Patient presents with right knee pain and stiffness of 3 years' progressive duration. [Evidence: Admission Note, §1] Functional limitation is severe — unable to climb stairs or walk more than 200 metres without pain. [Evidence: Admission Note, §1]

INVESTIGATIONS WITH VALUES:
Standing AP/lateral X-ray (10 March 2024): Severe medial compartment narrowing, osteophyte formation, and subchondral sclerosis, consistent with Grade IV osteoarthritis by Kellgren-Lawrence classification. [Evidence: Admission Note, §4] Pre-operative bloods within normal limits (Hb 13.2, HbA1c 5.4%, Creatinine 0.9, INR 1.0). [Evidence: Admission Note, §4]

WHY INPATIENT CARE IS MEDICALLY NECESSARY:
Conservative management (physiotherapy, intra-articular corticosteroids, NSAIDs) has been attempted and failed over 18 months. [Evidence: Admission Note, §2] TKR is a major orthopaedic procedure requiring general/spinal anaesthesia, intra-operative blood loss management, and post-operative haemodynamic monitoring. [Evidence: Admission Note, §6] Outpatient management is not clinically appropriate.

PLANNED TREATMENT AND EXPECTED LOS:
Total Right Knee Replacement under spinal anaesthesia, with titanium implant. Expected LOS: 3 nights (standard for uncomplicated TKR). Post-operative physiotherapy and DVT prophylaxis (enoxaparin) planned. [Evidence: Pre-operative Orders]

OPEN GAPS: None. All required documents present.`,

  'CASE-002': `MEDICAL NECESSITY NARRATIVE – CASHLESS AUTHORISATION REQUEST
Patient: [REDACTED] | Age: 34 | Gender: F | Policy: SRK-IND-2024-7821045
Procedure: Emergency Laparoscopic Appendicectomy
Diagnosis: Acute appendicitis (K35.8, illustrative)

⚠️ DESK ALERT: R01 FAIL – Initial 30-day waiting period is ACTIVE (18/30 days elapsed).
This pre-auth is likely to be rejected. Clinical care is proceeding. Desk should counsel patient on financial options: (1) other insurance coverage, (2) hospital financial assistance scheme, (3) self-pay with EMI option. Clinical care must never be delayed for insurance clearance.

PRESENTING COMPLAINT:
Severe right iliac fossa pain for 8 hours with nausea and vomiting. [Evidence: Emergency Admission Note, §1]

CLINICAL FINDINGS:
Tachycardia (pulse 102), low-grade fever (38.4°C), tenderness/guarding at McBurney's point, positive Rovsing's sign. [Evidence: Emergency Admission Note, §2–3] Elevated WBC 15,200 and CRP 64 mg/L indicating systemic inflammation. [Evidence: Emergency Admission Note, §4] USG confirming dilated non-compressible appendix (9mm). [Evidence: Emergency Admission Note, §4]

WHY INPATIENT SURGERY IS MEDICALLY NECESSARY:
Acute appendicitis with peritoneal signs is a surgical emergency. Delay risks perforation and peritonitis. [Evidence: Admission Note, §5]

SAFETY NOTICE: Treatment has commenced and is proceeding independent of insurance status.`,

  'CASE-003': `MEDICAL NECESSITY NARRATIVE – CASHLESS AUTHORISATION REQUEST
Patient: [REDACTED] | Age: 47 | Gender: M | Policy: SRK-FAM-2020-3312887
Procedure: Coronary Angiography + PCI
Diagnosis: NSTEMI (I21.4, illustrative)

PRESENTING COMPLAINT:
Central chest pain (9/10, crushing quality), radiating to left arm, associated with diaphoresis, for 2 hours prior to presentation. [Evidence: Cardiology Admission Note, §1]

RISK FACTORS:
Hypertension (known, disclosed, on treatment). Ex-smoker. Family history of CAD (father, MI at age 52). [Evidence: Cardiology Admission Note, §2]

INVESTIGATIONS WITH VALUES:
12-Lead ECG (08:35): ST-segment depression 1.5mm in leads V4–V6 and limb leads II, III, aVF, with flattened T-waves in V4–V6. Consistent with myocardial ischaemia. [Evidence: ECG Report] High-Sensitivity Troponin I (sample 08:40, result 10:15): 2.4 ng/mL — 60× upper limit of normal. CRITICALLY ELEVATED. [Evidence: Troponin I Report]

WHY INPATIENT CCU ADMISSION IS MEDICALLY NECESSARY:
Combination of (1) ischaemic chest pain, (2) ST-segment changes on ECG, and (3) markedly elevated high-sensitivity troponin confirms NSTEMI. Inpatient CCU admission is required for continuous cardiac monitoring, haemodynamic stability assessment, anticoagulation, and urgent coronary angiography. [Evidence: Dr. Mehta Handwritten Note] Outpatient angiography is not safe given haemodynamic instability. [Evidence: Dr. Mehta Handwritten Note]

PLANNED TREATMENT:
Coronary angiography + PCI (percutaneous coronary intervention) within 24 hours of admission. Dual antiplatelet therapy (aspirin + clopidogrel) and IV heparin commenced. [Evidence: Cardiology Admission Note, §6]

OPEN GAPS: All required documents present (Admission Note + ECG + Troponin).`,

  'CASE-004': `MEDICAL NECESSITY NARRATIVE – CASHLESS AUTHORISATION REQUEST
Patient: [REDACTED] | Age: 71 | Gender: F | Policies: SRK-SEN-2019-9901234 + SRK-GRP-2022-4400771
Procedure: Bipolar Hemiarthroplasty (BPHE) – Right Hip
Diagnosis: Right neck of femur fracture, displaced (S72.001, illustrative)

PRESENTING COMPLAINT:
Right hip pain and inability to bear weight following a fall at home. [Evidence: Emergency Admission Note, §1]

CLINICAL FINDINGS:
Classic signs of displaced NOF fracture: shortening and external rotation of right leg. [Evidence: Emergency Admission Note, §1] Haemodynamically stable on admission. Known hypertension and osteoporosis (both disclosed). [Evidence: Emergency Admission Note, §2]

INVESTIGATIONS:
X-ray right hip: Garden IV displaced fracture of neck of femur with significant osteoporotic changes. [Evidence: Emergency Admission Note, §3]

WHY INPATIENT SURGERY IS MEDICALLY NECESSARY:
Displaced neck of femur fracture in an elderly patient is a surgical emergency. Conservative management is not appropriate — non-operative treatment has extremely high mortality and morbidity in this population. Early surgical stabilisation (within 36 hours) is the evidence-based standard of care.

NOTE – MULTI-POLICY COORDINATION:
Two active policies detected. Coordination options computed by the rules engine. Patient/family to choose option (see Estimate screen). Insurer-specific coordination rules may vary (marked as assumption).`,
};

export default function CaseWorkspace() {
  const { cases, selectedCaseId, role, uploadDocument, approvePacked, attestDoctor } = useStore();
  const [activeTab, setActiveTab] = useState<'documents' | 'packet' | 'tracking' | 'reconciliation'>('documents');
  const [showFHIR, setShowFHIR] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedTrace, setStreamedTrace] = useState<AgentTraceStep[]>([]);
  const [showRedacted, setShowRedacted] = useState(false);
  const [showPayerSim, setShowPayerSim] = useState(false);
  const [doctorModal, setDoctorModal] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. Rajesh Sharma');
  const traceRef = useRef<HTMLDivElement>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // Simulate streaming agent trace on mount
  useEffect(() => {
    if (!selectedCase) return;
    setStreamedTrace([]);
    setIsStreaming(true);
    const steps = selectedCase.agentTrace || [];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        const nextStep = steps[i];
        i++;
        if (nextStep) {
          setStreamedTrace(prev => [...prev, nextStep]);
        }
        if (traceRef.current) {
          traceRef.current.scrollTop = traceRef.current.scrollHeight;
        }
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [selectedCaseId]);

  if (!selectedCase) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Select a case from the worklist to open the workspace.
      </div>
    );
  }

  const narrative = MOCK_PACKETS[selectedCase.id] || '';
  const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  const riskScore = { low: 8, medium: 42, high: 72 }[selectedCase.riskLevel];

  const fhirBundle = {
    resourceType: 'Bundle',
    id: `bundle-${selectedCase.id}`,
    meta: { lastUpdated: selectedCase.admissionDecisionAt, profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'] },
    type: 'collection',
    note: 'SYNTHETIC DATA – MOCK FHIR BUNDLE – NOT SUBMITTED TO ANY REAL SYSTEM',
    entry: [
      {
        resource: {
          resourceType: 'Claim',
          id: `claim-${selectedCase.id}`,
          status: 'active',
          use: 'preauthorization',
          patient: { reference: 'Patient/[REDACTED]' },
          created: selectedCase.admissionDecisionAt,
          insurer: { display: selectedCase.insurerName + ' (illustrative)' },
          diagnosis: [{
            sequence: 1,
            diagnosisCodeableConcept: {
              coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: selectedCase.diagnosisCode?.split(' ')[0] || 'Z00', display: selectedCase.diagnosis }],
              text: selectedCase.diagnosis + ' (ICD-10 illustrative)',
            },
          }],
          total: { value: selectedCase.estimate?.totalBilled || 0, currency: 'INR' },
        },
      },
    ],
  };

  return (
    <div style={{ height: 'calc(100vh - 84px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Case header bar */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {selectedCase.patient.name} · {selectedCase.patient.age}y {selectedCase.patient.gender}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {selectedCase.specialty} · {selectedCase.hospital} · {selectedCase.id}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Risk indicator */}
        <div style={{
          background: `${riskColors[selectedCase.riskLevel]}15`,
          border: `1px solid ${riskColors[selectedCase.riskLevel]}33`,
          borderRadius: 8,
          padding: '6px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>DENIAL RISK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 60, height: 4, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${riskScore}%`, height: '100%', background: riskColors[selectedCase.riskLevel], transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: riskColors[selectedCase.riskLevel], fontFamily: 'JetBrains Mono, monospace' }}>
              {selectedCase.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* SLA clock */}
        {selectedCase.slaClocks[0] && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>SLA CLOCK</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: selectedCase.slaClocks[0].breachedBy ? '#ef4444' : '#10b981' }}>
              {selectedCase.slaClocks[0].completedAt ? '✓ Done' :
                selectedCase.slaClocks[0].breachedBy ? `BREACHED +${selectedCase.slaClocks[0].breachedBy}m` :
                  `${selectedCase.slaClocks[0].deadlineMinutes}m`}
            </div>
          </div>
        )}

        {/* Payer simulator toggle */}
        <button
          onClick={() => setShowPayerSim(!showPayerSim)}
          style={{
            background: showPayerSim ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
            border: `1px solid ${showPayerSim ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
            borderRadius: 8,
            color: showPayerSim ? '#a78bfa' : 'var(--text-secondary)',
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🎮 Payer Sim
        </button>
      </div>

      {/* Three-pane layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 340px', overflow: 'hidden' }}>
        {/* LEFT PANE – Documents */}
        <div style={{ borderRight: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.05em' }}>
            DOCUMENTS & EVIDENCE
          </div>
          <DocumentViewer caseData={selectedCase} />

          {/* Agent trace */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
              🤖 AGENT ACTIVITY
              {isStreaming && <span style={{ fontSize: 10, color: '#a78bfa', animation: 'pulse 1s infinite' }}>● LIVE</span>}
            </div>
            <div ref={traceRef} style={{ maxHeight: 200, overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--border-subtle)' }}>
              {streamedTrace.filter((step): step is AgentTraceStep => Boolean(step && step.type)).map(step => (
                <div key={step.id || Math.random()} className={`trace-step ${step.type || 'reading'}`} style={{ fontSize: 11, marginBottom: 3, display: 'flex', gap: 6 }}>
                  <span style={{ opacity: 0.5, fontSize: 10, flexShrink: 0 }}>
                    {step.at ? new Date(step.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                  </span>
                  <span>{step.message}</span>
                </div>
              ))}
              {isStreaming && (
                <div style={{ fontSize: 11, color: '#a78bfa', opacity: 0.7 }}>
                  ▌ thinking...
                </div>
              )}
            </div>
          </div>

          {/* What the model saw toggle */}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setShowRedacted(!showRedacted)}
              style={{
                width: '100%',
                background: showRedacted ? 'rgba(124,58,237,0.1)' : 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-secondary)',
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🔍 {showRedacted ? 'Hide' : 'Show'} Redacted Input (PHI removed)
            </button>
            {showRedacted && (
              <div style={{ marginTop: 8, background: '#0d1117', border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#79c0ff', maxHeight: 150, overflowY: 'auto' }}>
                {`// Redacted input sent to LLM\n// PHI tokens: [NAME-REDACTED], [DOB-REDACTED], [POLICY-REDACTED]\n// Region: India | Hosting: ap-south-1\n\n{\n  "patient": "[NAME-REDACTED]",\n  "age": ${selectedCase.patient.age},\n  "gender": "${selectedCase.patient.gender}",\n  "policyNumber": "[POLICY-REDACTED]",\n  "documents": [...]\n}`}
              </div>
            )}
          </div>
        </div>

        {/* CENTRE PANE – Packet / Tracking */}
        <div style={{ overflowY: 'auto', padding: '12px' }}>
          {/* Step tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
            {(['documents', 'packet', 'tracking', 'reconciliation'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: `1px solid ${activeTab === tab ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                  borderRadius: 6,
                  color: activeTab === tab ? '#60a5fa' : 'var(--text-secondary)',
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'documents' ? '📋 Eligibility' : tab === 'packet' ? '✍️ Auth Packet' : tab === 'tracking' ? '📡 Payer Events' : '🧾 Reconciliation'}
              </button>
            ))}
          </div>

          {/* Eligibility / Estimate */}
          {activeTab === 'documents' && (
            <PacketDrafter caseData={selectedCase} />
          )}

          {/* Auth Packet */}
          {activeTab === 'packet' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className="tag-ai">AI DRAFT</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>prompt: packet-drafter-v1.1 | replay mode</span>
              </div>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: 16,
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                fontFamily: 'Inter, sans-serif',
              }}>
                {narrative}
              </div>

              {/* Approval/attestation actions */}
              {role === 'desk' && (
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    className="btn-approve"
                    onClick={() => approvePacked(selectedCase.id, 'Desk: Sunita Rao')}
                  >
                    ✅ Approve Packet
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setDoctorModal(true)}
                  >
                    👨‍⚕️ Request Doctor Attestation
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setShowFHIR(true)}
                    disabled={!selectedCase.packet?.approvedBy}
                  >
                    📤 Send to Payer (FHIR)
                  </button>
                </div>
              )}

              {role === 'doctor' && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#10b981', marginBottom: 8, fontWeight: 600 }}>👨‍⚕️ Clinical Attestation Required</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      I certify that the above clinical information is accurate and the medical necessity for the requested procedure is documented in the case notes.
                    </div>
                  </div>
                  <button className="btn-approve" onClick={() => {
                    attestDoctor(selectedCase.id, 'Dr. Rajesh Sharma');
                    alert('Attestation confirmed ✓');
                  }}>
                    ✅ Attest (One-tap) – Dr. Rajesh Sharma
                  </button>
                </div>
              )}

              {/* Approval status */}
              {selectedCase.packet?.approvedBy && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 11 }}>
                  <span className="tag-human">APPROVED</span>
                  <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>
                    {selectedCase.packet.approvedBy} · {new Date(selectedCase.packet.approvedAt!).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tracking */}
          {activeTab === 'tracking' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Payer Event Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedCase.payerEvents.map((evt, idx) => {
                  const colors: Record<string, string> = {
                    preauth_submitted: '#60a5fa', preauth_approved: '#10b981',
                    query: '#f59e0b', rejected: '#ef4444', partial: '#f97316',
                    enhancement_submitted: '#a78bfa', enhancement_approved: '#10b981',
                    final_auth_requested: '#60a5fa', final_auth_approved: '#10b981',
                    final_auth_delayed: '#ef4444',
                  };
                  const color = colors[evt.type] || '#8ba3c7';
                  return (
                    <div key={evt.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
                        {idx < selectedCase.payerEvents.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: 'var(--border-subtle)', minHeight: 20 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                          {evt.type.replace(/_/g, ' ')}
                          {evt.isSimulated && <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontWeight: 400, fontSize: 10 }}>[simulated]</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          {new Date(evt.at).toLocaleString('en-IN')}
                        </div>
                        {evt.payload && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderRadius: 6, padding: '6px 10px' }}>
                            {Object.entries(evt.payload).map(([k, v]) => (
                              <div key={k}><strong>{k}:</strong> {typeof v === 'number' ? `₹${v.toLocaleString('en-IN')}` : String(v)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Without AuthFlow toggle (Case 3) */}
              {selectedCase.id === 'CASE-003' && (
                <div style={{ marginTop: 16, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, marginBottom: 6 }}>
                    🔄 Toggle: Without AuthFlow
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Without AuthFlow: Payer queries (why inpatient?), 3h ping-pong, manual troponin chase → approval in 4.5 hours.
                    With AuthFlow: Complete packet, troponin cited → approval in 38 minutes.
                    <strong style={{ color: '#10b981' }}> Saved: ~4 hours of insurer-desk ping-pong.</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reconciliation */}
          {activeTab === 'reconciliation' && selectedCase.reconciliation && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Bill Reconciliation
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)' }}>
                      {['Description', 'Billed', 'Approved', 'Deduction', 'Reason', 'Citation'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', fontSize: 10, letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCase.reconciliation.lines.map((line, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{line.description}</td>
                        <td style={{ padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>₹{line.billed.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>₹{line.approved.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', color: line.deduction > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                          {line.deduction > 0 ? `-₹${line.deduction.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td style={{ padding: '6px 10px', color: 'var(--text-muted)', fontSize: 10 }}>{line.reason}</td>
                        <td style={{ padding: '6px 10px', color: '#60a5fa', fontSize: 10 }}>{line.citation}</td>
                      </tr>
                    ))}
                    {/* Totals */}
                    <tr style={{ background: 'var(--bg-surface)', fontWeight: 700 }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>TOTAL</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>₹{selectedCase.reconciliation.totalBilled.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>₹{selectedCase.reconciliation.totalApproved.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>-₹{selectedCase.reconciliation.totalDeduction.toLocaleString('en-IN')}</td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Patient liability statement */}
              <div style={{ marginTop: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="tag-ai">AI DRAFT</span> Patient Liability Statement
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {selectedCase.reconciliation.liabilityStatement}
                </div>
              </div>

              {/* Delay ledger */}
              {selectedCase.reconciliation.delayLedger.length > 0 && (
                <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>⏱ Delay Ledger (Insurer-Attributable)</div>
                  {selectedCase.reconciliation.delayLedger.map(d => (
                    <div key={d.id} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{d.minutesLost}m delay</span> · {d.description}
                      {d.extraCharge && <span style={{ color: '#f97316', marginLeft: 6 }}>Extra charge: ₹{d.extraCharge.toLocaleString('en-IN')} (insurer-attributable)</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANE – Rules & Risk */}
        <div style={{ borderLeft: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '12px' }}>
          <RulesPanel caseData={selectedCase} />
          {showPayerSim && <PayerSimulator caseData={selectedCase} />}
        </div>
      </div>

      {/* FHIR Bundle Modal */}
      {showFHIR && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 24, width: 640, maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>FHIR Pre-auth Bundle</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>use: preauthorization · MOCK – not submitted to any real system · NHCX adapter</div>
              </div>
              <button onClick={() => setShowFHIR(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div className="json-viewer" style={{ flex: 1, overflow: 'auto' }}>
              <pre>{JSON.stringify(fhirBundle, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Doctor attestation modal */}
      {doctorModal && (
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
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-approve" style={{ flex: 1 }} onClick={() => {
                attestDoctor(selectedCase.id, doctorName);
                setDoctorModal(false);
              }}>
                ✅ Confirm Attestation
              </button>
              <button className="btn-secondary" onClick={() => setDoctorModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
