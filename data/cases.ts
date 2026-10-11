// ============================================================
// AuthFlow – Seed Cases (Synthetic Data Only)
// ============================================================
// All patient names, policy numbers, dates, and clinical values
// are invented. No real patient data.
// ============================================================

import type { AuthCase, BillLine } from '../types';

// ─────────────────────────────────────────────────────────
// Shared policy data (imported inline for SSR safety)
// ─────────────────────────────────────────────────────────

const POLICY_ANIL = {
  id: 'POL-ANIL-001',
  insurer: 'Suraksha General Insurance',
  tpa: 'CarePath TPA',
  product: 'Suraksha Health Shield – Individual',
  policyNumber: 'SRK-IND-2021-4471983',
  inceptionDate: '2021-08-10',
  continuousCoverageMonths: 31,
  sumInsured: 500000,
  balanceSumInsured: 500000,
  roomRentCapPctPerDay: 0.01,
  icuCapPctPerDay: 0.02,
  coPayPct: 0,
  waitingPeriods: {
    initialDays: 30,
    pedMonths: 36,
    specific: [
      { condition: 'knee replacement', months: 24 },
      { condition: 'joint replacement', months: 24 },
    ],
  },
  disclosedPEDs: ['Osteoarthritis'],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: ['cosmetic surgery'],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
} as const;

const POLICY_MEERA = {
  id: 'POL-MEERA-001',
  insurer: 'Suraksha General Insurance',
  tpa: 'CarePath TPA',
  product: 'Suraksha Health Shield – Individual',
  policyNumber: 'SRK-IND-2024-7821045',
  inceptionDate: '2024-03-24',
  continuousCoverageMonths: 0,
  sumInsured: 300000,
  balanceSumInsured: 300000,
  roomRentCapPctPerDay: 0.01,
  icuCapPctPerDay: 0.02,
  coPayPct: 0,
  waitingPeriods: {
    initialDays: 30,
    pedMonths: 36,
    specific: [],
  },
  disclosedPEDs: [],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: ['cosmetic surgery'],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
} as const;

const POLICY_IMRAN = {
  id: 'POL-IMRAN-001',
  insurer: 'Suraksha General Insurance',
  tpa: 'CarePath TPA',
  product: 'Suraksha Health Shield – Family Floater',
  policyNumber: 'SRK-FAM-2020-3312887',
  inceptionDate: '2020-06-01',
  continuousCoverageMonths: 48,
  sumInsured: 1000000,
  balanceSumInsured: 1000000,
  roomRentCapPctPerDay: 0.01,
  icuCapPctPerDay: 0.02,
  coPayPct: 0,
  waitingPeriods: {
    initialDays: 30,
    pedMonths: 36,
    specific: [],
  },
  disclosedPEDs: ['Hypertension'],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: ['cosmetic surgery'],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
} as const;

const POLICY_KAMALA_A = {
  id: 'POL-KAMALA-A',
  insurer: 'Suraksha General Insurance',
  tpa: 'CarePath TPA',
  product: 'Suraksha Senior Shield – Individual',
  policyNumber: 'SRK-SEN-2019-9901234',
  inceptionDate: '2019-01-15',
  continuousCoverageMonths: 65,
  sumInsured: 500000,
  balanceSumInsured: 500000,
  roomRentCapPctPerDay: 0.01,
  icuCapPctPerDay: 0.02,
  coPayPct: 0.2,
  waitingPeriods: {
    initialDays: 30,
    pedMonths: 36,
    specific: [{ condition: 'hip fracture', months: 24 }],
  },
  disclosedPEDs: ['Hypertension', 'Osteoporosis'],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: ['cosmetic surgery'],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
} as const;

const POLICY_KAMALA_B = {
  id: 'POL-KAMALA-B',
  insurer: 'Suraksha General Insurance',
  tpa: 'CarePath TPA',
  product: 'Suraksha Group Family Floater',
  policyNumber: 'SRK-GRP-2022-4400771',
  inceptionDate: '2022-04-01',
  continuousCoverageMonths: 24,
  sumInsured: 300000,
  balanceSumInsured: 300000,
  roomRentCapPctPerDay: 0.01,
  icuCapPctPerDay: 0.02,
  coPayPct: 0,
  waitingPeriods: {
    initialDays: 30,
    pedMonths: 36,
    specific: [],
  },
  disclosedPEDs: ['Hypertension', 'Osteoporosis'],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: ['cosmetic surgery'],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
} as const;

// ─────────────────────────────────────────────────────────
// CASE 1 – Planned Knee Replacement (Room-Rent Trap)
// Patient: Anil Kulkarni, 58, M
// ─────────────────────────────────────────────────────────
const case1Bill: BillLine[] = [
  { id: 'b1-1', description: 'Room (Deluxe, ₹8,000/day × 3 nights)', category: 'room', amount: 24000, unit: 'day', quantity: 3 },
  { id: 'b1-2', description: 'Nursing charges', category: 'nursing', amount: 6000, isProportionate: true },
  { id: 'b1-3', description: 'Operation Theatre charges', category: 'ot', amount: 30000, isProportionate: true },
  { id: 'b1-4', description: 'Surgeon fee', category: 'surgeon', amount: 60000, isProportionate: true },
  { id: 'b1-5', description: 'Anaesthetist fee', category: 'anaesthetist', amount: 15000, isProportionate: true },
  { id: 'b1-6', description: 'Consultation charges', category: 'consultation', amount: 6000, isProportionate: true },
  { id: 'b1-7', description: 'Knee implant (titanium)', category: 'implant', amount: 85000 },
  { id: 'b1-8', description: 'Medicines & IV fluids', category: 'medicines', amount: 18000 },
  { id: 'b1-9', description: 'Diagnostics (X-ray, blood work)', category: 'diagnostics', amount: 12000 },
  { id: 'b1-10', description: 'Consumables (gloves, masks, admission kit)', category: 'consumables', amount: 5000, isNonPayable: true },
];

export const CASE_1: AuthCase = {
  id: 'CASE-001',
  patient: {
    id: 'PAT-001',
    name: 'Anil Kulkarni',
    age: 58,
    gender: 'M',
    contactToken: '[PHONE-REDACTED-A1K]',
  },
  admissionType: 'planned',
  admissionDecisionAt: '2024-03-12T09:00:00+05:30',
  medicalClearanceAt: '2024-03-12T10:30:00+05:30',
  status: 'approved',
  riskLevel: 'medium',
  policies: [POLICY_ANIL as never],
  specialty: 'Orthopaedics',
  diagnosis: 'Primary osteoarthritis, right knee – Total knee replacement',
  diagnosisCode: 'M17.1 (illustrative)',
  hospital: 'Meridian Orthopaedics & Sports Medicine Centre, Mumbai',
  region: 'india',
  insurerName: 'Suraksha General Insurance',
  tpaName: 'CarePath TPA',
  documents: [
    {
      id: 'DOC-C1-01',
      type: 'admission_note',
      title: 'Admission Note – Anil Kulkarni',
      content: `MERIDIAN ORTHOPAEDICS & SPORTS MEDICINE CENTRE
Date: 12 March 2024
Patient: Anil Kulkarni | Age: 58 | Gender: Male
Admission Type: Planned
Ward: Orthopaedics – Deluxe Room 412

PRESENTING COMPLAINT:
Right knee pain and stiffness for 3 years, progressively worsening. Unable to climb stairs or walk > 200 metres without severe pain. Conservative management (physiotherapy, NSAIDs) has failed over 18 months.

HISTORY:
Osteoarthritis of right knee diagnosed in 2021. Previously treated by Dr. Priya Menon (orthopaedic surgeon) with intra-articular steroid injections (last: September 2023). Patient has been on diclofenac 50 mg BD and pantoprazole 40 mg OD.

VITALS ON ADMISSION:
BP: 128/82 mmHg | Pulse: 76/min | SpO2: 98% (room air) | Weight: 78 kg | Height: 170 cm

EXAMINATION:
Right knee: Varus deformity, crepitus +++, ROM 10°–90° (painful). Left knee: Normal. No neurovascular deficit in lower limbs.

INVESTIGATIONS:
X-ray right knee (standing, AP and lateral – 10 March 2024): Severe medial compartment narrowing, osteophyte formation, subchondral sclerosis consistent with Grade IV osteoarthritis (Kellgren-Lawrence).
Blood work: Hb 13.2 g/dL, WBC 7,400, Platelets 2,10,000, HbA1c 5.4%, Creatinine 0.9 mg/dL, PT-INR 1.0.

PLAN:
Total Right Knee Replacement (TKR) scheduled for 13 March 2024. Consent obtained. Anaesthesia review done. Blood cross-matched.

Consultant: Dr. Rajesh Sharma, MS Orthopaedics
Registration: MCI-2003-04821 (illustrative)`,
      uploadedAt: '2024-03-12T11:00:00+05:30',
    },
    {
      id: 'DOC-C1-02',
      type: 'prescription',
      title: 'Pre-operative Orders',
      content: `PRE-OPERATIVE MEDICATION ORDERS
Patient: Anil Kulkarni | Date: 12 March 2024

1. Tab. Cefuroxime 1.5g IV prophylaxis 30 min before incision
2. Tab. Pantoprazole 40mg OD
3. Enoxaparin 40mg SC OD starting 12 hours post-op
4. IV Fluids: RL 1L at 80 mL/hr during surgery
5. NPO after midnight

Surgeon: Dr. Rajesh Sharma
Anaesthetist: Dr. Kavya Iyer`,
      uploadedAt: '2024-03-12T11:30:00+05:30',
    },
    {
      id: 'DOC-C1-03',
      type: 'id_proof',
      title: 'Policy Card – Suraksha Health Shield',
      content: `SURAKSHA GENERAL INSURANCE
HEALTH SHIELD POLICY CARD (SYNTHETIC / ILLUSTRATIVE)

Insured Name: Anil Kulkarni
Policy No: SRK-IND-2021-4471983
Sum Insured: ₹5,00,000
Inception Date: 10 August 2021
Valid Till: 09 August 2024
TPA: CarePath TPA
Emergency Helpline: 1800-XXX-XXXX (illustrative)
Network Hospital: Meridian Orthopaedics (Mumbai)

Note: This is a synthetic document. No real policy exists.`,
      uploadedAt: '2024-03-12T09:30:00+05:30',
    },
  ],
  extractedFacts: [
    { field: 'Primary Diagnosis', value: 'Primary osteoarthritis, right knee', code: 'M17.1 (illustrative)', confidence: 'high', evidence: { docId: 'DOC-C1-01', start: 400, end: 450, snippet: 'Primary osteoarthritis, right knee – Total knee replacement' } },
    { field: 'Procedure', value: 'Total Knee Replacement (TKR)', confidence: 'high', evidence: { docId: 'DOC-C1-01', start: 950, end: 1010, snippet: 'Total Right Knee Replacement (TKR) scheduled for 13 March 2024' } },
    { field: 'Room Type', value: 'Deluxe Room at ₹8,000/day', confidence: 'high', evidence: { docId: 'DOC-C1-01', start: 180, end: 220, snippet: 'Orthopaedics – Deluxe Room 412' } },
    { field: 'Policy Inception', value: '10 August 2021 (31 months ago)', confidence: 'high', evidence: { docId: 'DOC-C1-03', start: 130, end: 165, snippet: 'Inception Date: 10 August 2021' } },
    { field: 'Conservative Management Failure', value: '18 months of physiotherapy and NSAIDs failed', confidence: 'high', evidence: { docId: 'DOC-C1-01', start: 270, end: 340, snippet: 'Conservative management (physiotherapy, NSAIDs) has failed over 18 months' } },
    { field: 'X-ray Finding', value: 'Grade IV OA – Severe medial compartment narrowing, osteophytes, subchondral sclerosis', confidence: 'high', evidence: { docId: 'DOC-C1-01', start: 700, end: 810, snippet: 'Severe medial compartment narrowing, osteophyte formation, subchondral sclerosis consistent with Grade IV osteoarthritis' } },
  ],
  ruleResults: [],
  payerEvents: [
    { id: 'PE-C1-1', type: 'preauth_submitted', at: '2024-03-12T11:45:00+05:30', payload: { amount: 261000 }, isSimulated: true },
    { id: 'PE-C1-2', type: 'preauth_approved', at: '2024-03-12T12:26:00+05:30', payload: { approvedAmount: 203125, notes: 'Approved with room-rent deduction and proportionate heads adjusted.' }, isSimulated: true },
    { id: 'PE-C1-3', type: 'final_auth_requested', at: '2024-03-15T14:00:00+05:30', payload: { finalBill: 261000 }, isSimulated: true },
    { id: 'PE-C1-4', type: 'final_auth_approved', at: '2024-03-15T18:12:00+05:30', payload: { approvedAmount: 203125, notes: 'Final auth delayed. Extra ward charge of ₹1,500 is insurer-attributable.' }, isSimulated: true },
  ],
  estimate: {
    totalBilled: 261000,
    totalPayable: 203125,
    patientLiability: 57875,
    roomRentPayable: 15000,
    proportionFactor: 0.625,
    breakdown: [
      { label: 'Room Rent', billed: 24000, payable: 15000, reason: 'Cap ₹5,000/day; billed ₹8,000/day' },
      { label: 'Nursing charges', billed: 6000, payable: 3750, reason: 'Proportionate: 62.5%' },
      { label: 'Operation Theatre charges', billed: 30000, payable: 18750, reason: 'Proportionate: 62.5%' },
      { label: 'Surgeon fee', billed: 60000, payable: 37500, reason: 'Proportionate: 62.5%' },
      { label: 'Anaesthetist fee', billed: 15000, payable: 9375, reason: 'Proportionate: 62.5%' },
      { label: 'Consultation charges', billed: 6000, payable: 3750, reason: 'Proportionate: 62.5%' },
      { label: 'Knee implant (titanium)', billed: 85000, payable: 85000, reason: 'Not subject to proportionate deduction' },
      { label: 'Medicines & IV fluids', billed: 18000, payable: 18000, reason: 'Not subject to proportionate deduction' },
      { label: 'Diagnostics (X-ray, blood work)', billed: 12000, payable: 12000, reason: 'Not subject to proportionate deduction' },
      { label: 'Consumables (gloves, masks, admission kit)', billed: 5000, payable: 0, reason: 'Non-payable consumable' },
    ],
    roomChoiceSaving: 52875,
  },
  bill: case1Bill,
  reconciliation: {
    lines: [
      { description: 'Room Rent (3 nights)', billed: 24000, approved: 15000, deduction: 9000, reason: 'Room-rent cap exceeded', citation: 'R05 – Policy clause' },
      { description: 'Nursing', billed: 6000, approved: 3750, deduction: 2250, reason: 'Proportionate deduction (62.5%)', citation: 'R05 – Policy clause' },
      { description: 'OT Charges', billed: 30000, approved: 18750, deduction: 11250, reason: 'Proportionate deduction (62.5%)', citation: 'R05 – Policy clause' },
      { description: 'Surgeon Fee', billed: 60000, approved: 37500, deduction: 22500, reason: 'Proportionate deduction (62.5%)', citation: 'R05 – Policy clause' },
      { description: 'Anaesthetist Fee', billed: 15000, approved: 9375, deduction: 5625, reason: 'Proportionate deduction (62.5%)', citation: 'R05 – Policy clause' },
      { description: 'Consultations', billed: 6000, approved: 3750, deduction: 2250, reason: 'Proportionate deduction (62.5%)', citation: 'R05 – Policy clause' },
      { description: 'Knee Implant', billed: 85000, approved: 85000, deduction: 0, reason: 'Payable in full', citation: 'Policy' },
      { description: 'Medicines', billed: 18000, approved: 18000, deduction: 0, reason: 'Payable in full', citation: 'Policy' },
      { description: 'Diagnostics', billed: 12000, approved: 12000, deduction: 0, reason: 'Payable in full', citation: 'Policy' },
      { description: 'Consumables', billed: 5000, approved: 0, deduction: 5000, reason: 'Standard non-payable list', citation: 'R09 – Non-payable list' },
    ],
    totalBilled: 261000,
    totalApproved: 203125,
    totalDeduction: 57875,
    patientLiability: 57875,
    liabilityStatement: 'Your insurer has approved ₹2,03,125 of the ₹2,61,000 bill. The remaining ₹57,875 is your out-of-pocket amount. The largest component is the room-rent deduction (₹9,000) and proportionate reduction on clinical charges (₹43,875) because your Deluxe Room exceeded your policy cap of ₹5,000/day. Consumables (₹5,000) are not covered under any health policy. If you had chosen the Standard Room at ₹5,000/day, your liability would have been only ₹5,000.',
    delayLedger: [
      { id: 'DL-C1-1', cause: 'insurer', description: 'Final discharge authorisation received 4h 12m after request (IRDAI SLA: 3h). Extra ward charge attributable to insurer.', from: '2024-03-15T14:00:00+05:30', to: '2024-03-15T18:12:00+05:30', minutesLost: 72, extraCharge: 1500 },
    ],
  },
  auditLog: [
    { id: 'AL-C1-1', at: '2024-03-12T10:00:00+05:30', type: 'agent_call', actor: 'System', description: 'Extraction agent invoked', detail: { promptVersion: 'extract-v1.2', inputHash: 'abc123' } },
    { id: 'AL-C1-2', at: '2024-03-12T10:05:00+05:30', type: 'rule_run', actor: 'System', description: 'Rules R01–R16 computed' },
    { id: 'AL-C1-3', at: '2024-03-12T11:20:00+05:30', type: 'agent_call', actor: 'System', description: 'Packet drafter invoked', detail: { promptVersion: 'draft-v1.1' } },
    { id: 'AL-C1-4', at: '2024-03-12T11:40:00+05:30', type: 'human_approval', actor: 'Desk: Sunita Rao', description: 'Auth packet approved for submission' },
    { id: 'AL-C1-5', at: '2024-03-12T11:42:00+05:30', type: 'attestation', actor: 'Dr. Rajesh Sharma', description: 'Clinical attestation confirmed' },
    { id: 'AL-C1-6', at: '2024-03-12T11:45:00+05:30', type: 'submission', actor: 'Desk: Sunita Rao', description: 'FHIR preauth bundle submitted to CarePath TPA' },
  ],
  slaClocks: [
    { name: 'Pre-auth Decision', startedAt: '2024-03-12T11:45:00+05:30', deadlineMinutes: 60, completedAt: '2024-03-12T12:26:00+05:30' },
    { name: 'Final Discharge Auth', startedAt: '2024-03-15T14:00:00+05:30', deadlineMinutes: 180, completedAt: '2024-03-15T18:12:00+05:30', breachedBy: 72 },
  ],
  agentTrace: [
    { id: 't1', at: '2024-03-12T10:00:05+05:30', message: 'Reading admission note – Anil Kulkarni', type: 'reading' },
    { id: 't2', at: '2024-03-12T10:00:08+05:30', message: 'Found diagnosis: Primary osteoarthritis right knee (M17.1)', type: 'found' },
    { id: 't3', at: '2024-03-12T10:00:10+05:30', message: 'Mapped to procedure: Total Knee Replacement (TKR)', type: 'mapped' },
    { id: 't4', at: '2024-03-12T10:00:12+05:30', message: 'Checking R03: Specific waiting – knee replacement requires 24 months', type: 'checking' },
    { id: 't5', at: '2024-03-12T10:00:14+05:30', message: 'R03 PASS – policy is 31 months old (≥ 24 months)', type: 'found' },
    { id: 't6', at: '2024-03-12T10:00:16+05:30', message: 'Checking R05: Room rent – Deluxe ₹8,000/day vs cap ₹5,000/day', type: 'checking' },
    { id: 't7', at: '2024-03-12T10:00:18+05:30', message: 'R05 WARN – Proportionate deduction will apply. Patient liability increases by ₹52,875 vs standard room', type: 'warning' },
    { id: 't8', at: '2024-03-12T10:00:20+05:30', message: 'Drafting medical necessity narrative', type: 'drafting' },
    { id: 't9', at: '2024-03-12T10:00:25+05:30', message: 'Extraction complete. 6 facts extracted, 0 low-confidence', type: 'done' },
  ],
};

// ─────────────────────────────────────────────────────────
// CASE 2 – Emergency Appendicitis (Waiting-Period Trap)
// Patient: Meera Nair, 34, F
// ─────────────────────────────────────────────────────────
export const CASE_2: AuthCase = {
  id: 'CASE-002',
  patient: {
    id: 'PAT-002',
    name: 'Meera Nair',
    age: 34,
    gender: 'F',
    contactToken: '[PHONE-REDACTED-M2N]',
  },
  admissionType: 'emergency',
  admissionDecisionAt: '2024-04-11T22:15:00+05:30',
  status: 'rejected',
  riskLevel: 'high',
  policies: [POLICY_MEERA as never],
  specialty: 'General Surgery',
  diagnosis: 'Acute appendicitis – Emergency appendicectomy',
  diagnosisCode: 'K35.8 (illustrative)',
  hospital: 'Meridian General Hospital, Kochi',
  region: 'india',
  insurerName: 'Suraksha General Insurance',
  tpaName: 'CarePath TPA',
  documents: [
    {
      id: 'DOC-C2-01',
      type: 'admission_note',
      title: 'Emergency Admission Note – Meera Nair',
      content: `MERIDIAN GENERAL HOSPITAL – EMERGENCY DEPARTMENT
Date: 11 April 2024 | Time: 22:15
Patient: Meera Nair | Age: 34 | Gender: Female
Admission Type: Emergency

PRESENTING COMPLAINT:
Severe right iliac fossa pain for 8 hours, associated with nausea and one episode of vomiting. No prior similar episodes.

VITALS:
BP: 110/70 mmHg | Pulse: 102/min (tachycardia) | Temp: 38.4°C | SpO2: 99%

EXAMINATION:
Abdomen: Tenderness and guarding in RIF. McBurney's point tenderness +. Rovsing's sign +. No rigidity.

INVESTIGATIONS:
WBC: 15,200/μL (elevated). CRP: 64 mg/L (elevated). USG Abdomen: Dilated, non-compressible appendix 9mm in diameter – features consistent with acute appendicitis.

DIAGNOSIS: Acute Appendicitis (K35.8, illustrative)
PLAN: Emergency laparoscopic appendicectomy. Consent obtained from patient. IV antibiotics started (Ceftriaxone 1g + Metronidazole 500mg).

SAFETY NOTE: Clinical care is proceeding immediately. This note is for financial counselling purposes only – treatment is never delayed for insurance clearance.

Consultant: Dr. Anand Pillai, MS General Surgery
Registration: MCI-2008-09312 (illustrative)`,
      uploadedAt: '2024-04-11T22:45:00+05:30',
    },
    {
      id: 'DOC-C2-02',
      type: 'id_proof',
      title: 'Policy Card – Suraksha Health Shield',
      content: `SURAKSHA GENERAL INSURANCE – HEALTH SHIELD
Insured: Meera Nair | Policy No: SRK-IND-2024-7821045
Sum Insured: ₹3,00,000 | Inception: 24 March 2024
TPA: CarePath TPA

⚠️ INITIAL WAITING PERIOD: 30 days from inception (until 23 April 2024)
This admission (11 April 2024) is within the initial waiting period.

Note: Synthetic document. No real policy exists.`,
      uploadedAt: '2024-04-11T22:30:00+05:30',
    },
  ],
  extractedFacts: [
    { field: 'Primary Diagnosis', value: 'Acute appendicitis', code: 'K35.8 (illustrative)', confidence: 'high', evidence: { docId: 'DOC-C2-01', start: 460, end: 490, snippet: 'Acute Appendicitis (K35.8, illustrative)' } },
    { field: 'Policy Inception', value: '24 March 2024 (18 days ago)', confidence: 'high', evidence: { docId: 'DOC-C2-02', start: 130, end: 165, snippet: 'Inception: 24 March 2024' } },
    { field: 'Admission Cause', value: 'Emergency – not an accident', confidence: 'high', evidence: { docId: 'DOC-C2-01', start: 60, end: 90, snippet: 'Admission Type: Emergency' } },
    { field: 'WBC Count', value: '15,200/μL (elevated)', confidence: 'high', evidence: { docId: 'DOC-C2-01', start: 390, end: 430, snippet: 'WBC: 15,200/μL (elevated)' } },
  ],
  ruleResults: [],
  payerEvents: [
    { id: 'PE-C2-1', type: 'preauth_submitted', at: '2024-04-11T23:00:00+05:30', payload: { amount: 80000 }, isSimulated: true },
    { id: 'PE-C2-2', type: 'rejected', at: '2024-04-11T23:52:00+05:30', payload: { reason: 'Initial 30-day waiting period active. Policy inception 24 March 2024. Admission 11 April 2024 (18 days). Non-accident illness not covered.' }, isSimulated: true },
  ],
  estimate: {
    totalBilled: 80000,
    totalPayable: 0,
    patientLiability: 80000,
    roomRentPayable: 0,
    breakdown: [
      { label: 'All charges', billed: 80000, payable: 0, reason: 'Initial waiting period active – claim rejected' },
    ],
  },
  auditLog: [
    { id: 'AL-C2-1', at: '2024-04-11T22:30:00+05:30', type: 'agent_call', actor: 'System', description: 'Extraction agent invoked' },
    { id: 'AL-C2-2', at: '2024-04-11T22:35:00+05:30', type: 'rule_run', actor: 'System', description: 'R01 FAIL – initial waiting period not satisfied' },
    { id: 'AL-C2-3', at: '2024-04-11T22:40:00+05:30', type: 'human_approval', actor: 'Desk: Ramesh Kumar', description: 'Desk reviewed risk. Decided to submit for completeness and explore alternatives.' },
  ],
  slaClocks: [
    { name: 'Pre-auth Decision', startedAt: '2024-04-11T23:00:00+05:30', deadlineMinutes: 60, completedAt: '2024-04-11T23:52:00+05:30' },
  ],
  agentTrace: [
    { id: 't1', at: '2024-04-11T22:30:05+05:30', message: 'Reading emergency admission note – Meera Nair', type: 'reading' },
    { id: 't2', at: '2024-04-11T22:30:08+05:30', message: 'Found diagnosis: Acute appendicitis (K35.8)', type: 'found' },
    { id: 't3', at: '2024-04-11T22:30:10+05:30', message: 'Checking R01: Initial waiting period', type: 'checking' },
    { id: 't4', at: '2024-04-11T22:30:12+05:30', message: '⚠️ R01 FAIL – policy inception 24 Mar 2024, admission 11 Apr 2024 = 18 days (< 30 required)', type: 'warning' },
    { id: 't5', at: '2024-04-11T22:30:14+05:30', message: 'Admission type: Emergency. Checking if accident waiver applies...', type: 'checking' },
    { id: 't6', at: '2024-04-11T22:30:16+05:30', message: '⚠️ Not an accident – waiver does not apply. Predicted rejection.', type: 'warning' },
    { id: 't7', at: '2024-04-11T22:30:18+05:30', message: '⚠️ SAFETY: Clinical care proceeding. This flag is for financial counselling only.', type: 'warning' },
    { id: 't8', at: '2024-04-11T22:30:20+05:30', message: 'Drafting alternatives: other coverage, self-pay, hospital financial assistance', type: 'drafting' },
  ],
};

// ─────────────────────────────────────────────────────────
// CASE 3 – Chest Pain / NSTEMI (Medical-Necessity Trap)
// Patient: Imran Sheikh, 47, M
// ─────────────────────────────────────────────────────────
export const CASE_3: AuthCase = {
  id: 'CASE-003',
  patient: {
    id: 'PAT-003',
    name: 'Imran Sheikh',
    age: 47,
    gender: 'M',
    contactToken: '[PHONE-REDACTED-I3S]',
  },
  admissionType: 'emergency',
  admissionDecisionAt: '2024-05-20T08:30:00+05:30',
  medicalClearanceAt: '2024-05-20T11:45:00+05:30',
  status: 'approved',
  riskLevel: 'low',
  policies: [POLICY_IMRAN as never],
  specialty: 'Cardiology',
  diagnosis: 'NSTEMI – Coronary angiography + PCI',
  diagnosisCode: 'I21.4 (illustrative)',
  hospital: 'Meridian Heart Institute, Hyderabad',
  region: 'india',
  insurerName: 'Suraksha General Insurance',
  tpaName: 'CarePath TPA',
  documents: [
    {
      id: 'DOC-C3-01',
      type: 'admission_note',
      title: 'Cardiology Admission Note – Imran Sheikh',
      content: `MERIDIAN HEART INSTITUTE – CARDIOLOGY UNIT
Date: 20 May 2024 | Time: 08:30
Patient: Imran Sheikh | Age: 47 | Gender: Male
Admission Type: Emergency

PRESENTING COMPLAINT:
Central chest pain (9/10, crushing) for 2 hours, radiating to left arm. Diaphoresis. No prior similar episode. Known hypertensive on amlodipine 5mg OD for 5 years.

RISK FACTORS:
Hypertension (disclosed, on treatment). Ex-smoker (quit 2019). Family history of CAD (father, MI at 52).

VITALS ON ADMISSION:
BP: 158/96 mmHg | Pulse: 94/min | SpO2: 96% (room air) | RR: 20/min

12-LEAD ECG (08:35):
ST-segment depression 1.5mm in leads V4–V6 and II, III, aVF. No ST elevation. Normal sinus rhythm. No prior ECG for comparison.

WORKING DIAGNOSIS: NSTEMI (I21.4, illustrative)

PLAN:
- Antiplatelet therapy: Aspirin 325mg + Clopidogrel 600mg loading doses given
- IV heparin infusion started
- Urgent coronary angiography planned within 24 hours
- Troponin I pending (sample sent at 08:40) – RESULT NOT YET IN FILE
- Cardiology monitoring: CCU admission

⚠️ DOCUMENT GAP: Troponin I result not yet uploaded. Required for pre-auth packet. Desk to follow up with lab.

Consultant: Dr. Arjun Mehta, DM Cardiology
Registration: MCI-2010-17432 (illustrative)`,
      uploadedAt: '2024-05-20T09:00:00+05:30',
    },
    {
      id: 'DOC-C3-02',
      type: 'imaging',
      title: 'ECG Report – Imran Sheikh',
      content: `MERIDIAN HEART INSTITUTE – ECG REPORT
Date: 20 May 2024 | Time: 08:35
Patient: Imran Sheikh | Age: 47

FINDINGS:
Rate: 94 bpm | Rhythm: Normal Sinus Rhythm
Axis: Normal
ST Changes: ST-segment depression 1.5mm in leads V4–V6 and limb leads II, III, aVF
T-waves: Flattened T-waves in V4–V6
QTc: 440ms

IMPRESSION: ST-segment depression pattern consistent with myocardial ischaemia. NSTEMI not excluded. Recommend serial troponin measurement and cardiology review.

Reported by: Dr. Suresh Babu, MD (Cardiology)
Registration: MCI-2005-03211 (illustrative)`,
      uploadedAt: '2024-05-20T09:15:00+05:30',
    },
    {
      id: 'DOC-C3-03',
      type: 'lab_report',
      title: 'Troponin I Result – Imran Sheikh (UPLOADED AFTER GAP FLAGGED)',
      content: `MERIDIAN PATHOLOGY LABORATORY
Test Report
Date: 20 May 2024 | Sample collected: 08:40 | Result available: 10:15

Patient: Imran Sheikh | Age: 47 | Gender: Male
Requisitioned by: Dr. Arjun Mehta, Cardiology

TEST: High-Sensitivity Troponin I (hs-TnI)
Result: 2.4 ng/mL
Reference Range: < 0.04 ng/mL
Status: ⚠️ CRITICALLY ELEVATED (60× upper limit of normal)

INTERPRETATION: Markedly elevated hs-TnI is consistent with significant myocardial necrosis. In the clinical context of chest pain, ST changes, and risk factors, this confirms NSTEMI. Inpatient CCU management and urgent angiography are medically necessary.

Laboratory Director: Dr. Priya Bose, MD Pathology
NABL Accredited Lab (illustrative)`,
      uploadedAt: '2024-05-20T10:30:00+05:30',
    },
    {
      id: 'DOC-C3-04',
      type: 'handwritten_note',
      title: 'Dr. Mehta Handwritten Note (scanned)',
      content: `[SCANNED HANDWRITTEN NOTE - Illustrative multimodal document]

20/5/24 10:20 AM

Pt Imran S, 47M
- Trop I 2.4 ng/mL ✓ (CRITICALLY ↑)
- ECG: ST dep V4-V6 ✓
- Symptoms + troponin + ECG = NSTEMI confirmed
- Inpatient admission MEDICALLY NECESSARY
  (outpatient angio NOT safe given haemodynamic instability)
- Plan: angio + PCI today

[Signature: Dr. A. Mehta, DM Card]`,
      uploadedAt: '2024-05-20T10:35:00+05:30',
      isImage: true,
    },
  ],
  extractedFacts: [
    { field: 'Primary Diagnosis', value: 'NSTEMI', code: 'I21.4 (illustrative)', confidence: 'high', evidence: { docId: 'DOC-C3-01', start: 450, end: 480, snippet: 'WORKING DIAGNOSIS: NSTEMI (I21.4, illustrative)' } },
    { field: 'ECG Finding', value: 'ST-segment depression 1.5mm in V4–V6 and II, III, aVF', confidence: 'high', evidence: { docId: 'DOC-C3-02', start: 130, end: 200, snippet: 'ST-segment depression 1.5mm in leads V4–V6 and limb leads II, III, aVF' } },
    { field: 'Troponin I', value: '2.4 ng/mL (60× ULN) – CRITICALLY ELEVATED', confidence: 'high', evidence: { docId: 'DOC-C3-03', start: 200, end: 260, snippet: 'Result: 2.4 ng/mL (60× upper limit of normal)' } },
    { field: 'Hypertension', value: 'Known, disclosed, on treatment (amlodipine 5mg)', confidence: 'high', evidence: { docId: 'DOC-C3-01', start: 220, end: 280, snippet: 'Known hypertensive on amlodipine 5mg OD for 5 years' } },
    { field: 'Inpatient Necessity', value: 'Confirmed – outpatient angiography not safe given haemodynamic instability', confidence: 'high', evidence: { docId: 'DOC-C3-04', start: 160, end: 220, snippet: 'Inpatient admission MEDICALLY NECESSARY (outpatient angio NOT safe given haemodynamic instability)' } },
    { field: 'Troponin Result (Initial)', value: 'NOT DOCUMENTED – gap flagged', confidence: 'low', evidence: { docId: 'DOC-C3-01', start: 540, end: 590, snippet: 'Troponin I pending – RESULT NOT YET IN FILE' }, needsDeskConfirmation: true },
  ],
  ruleResults: [],
  payerEvents: [
    { id: 'PE-C3-1', type: 'preauth_submitted', at: '2024-05-20T11:50:00+05:30', payload: { amount: 280000 }, isSimulated: true },
    { id: 'PE-C3-2', type: 'preauth_approved', at: '2024-05-20T12:28:00+05:30', payload: { approvedAmount: 280000, notes: 'Approved. Complete packet with troponin result and ECG confirmed inpatient necessity.' }, isSimulated: true },
  ],
  estimate: {
    totalBilled: 280000,
    totalPayable: 280000,
    patientLiability: 0,
    roomRentPayable: 20000,
    breakdown: [
      { label: 'CCU Room (₹10,000/day × 2)', billed: 20000, payable: 20000, reason: 'Within ICU cap (₹20,000/day = 2% of ₹10,00,000 SI)' },
      { label: 'Nursing & monitoring', billed: 15000, payable: 15000, reason: 'Within cap – no proportionate deduction' },
      { label: 'Coronary Angiography', billed: 45000, payable: 45000, reason: 'Payable in full' },
      { label: 'PCI (stent + procedure)', billed: 120000, payable: 120000, reason: 'Payable in full' },
      { label: 'Medicines & anticoagulants', billed: 35000, payable: 35000, reason: 'Payable in full' },
      { label: 'Diagnostics', billed: 20000, payable: 20000, reason: 'Payable in full' },
      { label: 'Surgeon/Cardiologist fee', billed: 25000, payable: 25000, reason: 'Within cap – no proportionate deduction' },
    ],
  },
  auditLog: [
    { id: 'AL-C3-1', at: '2024-05-20T09:00:00+05:30', type: 'agent_call', actor: 'System', description: 'Extraction agent – initial run (troponin gap flagged)' },
    { id: 'AL-C3-2', at: '2024-05-20T09:05:00+05:30', type: 'rule_run', actor: 'System', description: 'R11 WARN – troponin missing; R15 WARN – document incomplete' },
    { id: 'AL-C3-3', at: '2024-05-20T10:30:00+05:30', type: 'document_upload', actor: 'Desk: Fatima Begum', description: 'Troponin I report uploaded' },
    { id: 'AL-C3-4', at: '2024-05-20T10:32:00+05:30', type: 'agent_call', actor: 'System', description: 'Extraction agent – re-run after troponin upload. Risk drops High → Low.' },
    { id: 'AL-C3-5', at: '2024-05-20T11:40:00+05:30', type: 'human_approval', actor: 'Desk: Fatima Begum', description: 'Auth packet approved' },
    { id: 'AL-C3-6', at: '2024-05-20T11:43:00+05:30', type: 'attestation', actor: 'Dr. Arjun Mehta', description: 'Clinical attestation confirmed' },
    { id: 'AL-C3-7', at: '2024-05-20T11:50:00+05:30', type: 'submission', actor: 'Desk: Fatima Begum', description: 'FHIR preauth bundle submitted' },
  ],
  slaClocks: [
    { name: 'Pre-auth Decision', startedAt: '2024-05-20T11:50:00+05:30', deadlineMinutes: 60, completedAt: '2024-05-20T12:28:00+05:30' },
  ],
  agentTrace: [
    { id: 't1', at: '2024-05-20T09:00:05+05:30', message: 'Reading cardiology admission note – Imran Sheikh', type: 'reading' },
    { id: 't2', at: '2024-05-20T09:00:08+05:30', message: 'Found diagnosis: NSTEMI (I21.4)', type: 'found' },
    { id: 't3', at: '2024-05-20T09:00:10+05:30', message: 'Found ECG: ST-segment depression 1.5mm V4–V6', type: 'found' },
    { id: 't4', at: '2024-05-20T09:00:12+05:30', message: '⚠️ Troponin I result NOT in file – flagging gap', type: 'warning' },
    { id: 't5', at: '2024-05-20T09:00:14+05:30', message: 'Checking R11: Inpatient necessity – requires troponin + ECG documented', type: 'checking' },
    { id: 't6', at: '2024-05-20T09:00:16+05:30', message: '⚠️ R11 WARN – troponin result missing. Payer likely to query inpatient vs outpatient admission', type: 'warning' },
    { id: 't7', at: '2024-05-20T09:00:18+05:30', message: '⚠️ R15 WARN – document checklist incomplete (troponin report missing)', type: 'warning' },
    { id: 't8', at: '2024-05-20T09:00:20+05:30', message: 'Risk level: HIGH. Requesting desk to upload troponin report before submission', type: 'warning' },
    { id: 't9', at: '2024-05-20T10:32:05+05:30', message: 'Re-reading after troponin upload...', type: 'reading' },
    { id: 't10', at: '2024-05-20T10:32:08+05:30', message: 'Found Troponin I: 2.4 ng/mL (60× ULN) – CRITICALLY ELEVATED', type: 'found' },
    { id: 't11', at: '2024-05-20T10:32:10+05:30', message: 'Mapped to I21.4 confirmed. Inpatient necessity now fully documented.', type: 'mapped' },
    { id: 't12', at: '2024-05-20T10:32:12+05:30', message: 'Risk level: LOW ✓. Drafting updated packet...', type: 'done' },
  ],
};

// ─────────────────────────────────────────────────────────
// CASE 4 – Hip Fracture, Two Policies, Enhancement
// Patient: Kamala Iyer, 71, F
// ─────────────────────────────────────────────────────────
export const CASE_4: AuthCase = {
  id: 'CASE-004',
  patient: {
    id: 'PAT-004',
    name: 'Kamala Iyer',
    age: 71,
    gender: 'F',
    contactToken: '[PHONE-REDACTED-K4I]',
  },
  admissionType: 'emergency',
  admissionDecisionAt: '2024-06-03T16:45:00+05:30',
  medicalClearanceAt: '2024-06-03T18:00:00+05:30',
  status: 'enhancement_needed',
  riskLevel: 'medium',
  policies: [POLICY_KAMALA_A as never, POLICY_KAMALA_B as never],
  specialty: 'Orthopaedics',
  diagnosis: 'Right neck of femur fracture – Hip arthroplasty (BPHE)',
  diagnosisCode: 'S72.001 (illustrative)',
  hospital: 'Meridian Orthopaedics & Sports Medicine Centre, Chennai',
  region: 'india',
  insurerName: 'Suraksha General Insurance',
  tpaName: 'CarePath TPA',
  documents: [
    {
      id: 'DOC-C4-01',
      type: 'admission_note',
      title: 'Emergency Admission Note – Kamala Iyer',
      content: `MERIDIAN ORTHOPAEDICS – EMERGENCY UNIT
Date: 3 June 2024 | Time: 16:45
Patient: Kamala Iyer | Age: 71 | Gender: Female
Admission Type: Emergency (fall at home)

PRESENTING COMPLAINT:
Right hip pain and inability to bear weight after fall at home. Shortening and external rotation of right leg.

HISTORY:
Known hypertension (on amlodipine 5mg, telmisartan 40mg). Osteoporosis (on weekly bisphosphonate). No prior hip surgery.

VITALS:
BP: 142/88 mmHg | Pulse: 88/min | SpO2: 97%

X-RAY RIGHT HIP:
Displaced right neck of femur fracture (Garden IV, completely displaced). Significant osteoporotic changes.

DIAGNOSIS: Right neck of femur fracture, displaced (S72.001, illustrative)
PLAN: Urgent bipolar hemiarthroplasty (BPHE). Consent from patient and son. Medical optimisation done.

Surgeon: Dr. Mohan Krishnan, MS Orthopaedics
Registration: MCI-2001-06612 (illustrative)`,
      uploadedAt: '2024-06-03T17:30:00+05:30',
    },
    {
      id: 'DOC-C4-02',
      type: 'admission_note',
      title: 'Enhancement Request – Post-surgical Infection',
      content: `MERIDIAN ORTHOPAEDICS – CLINICAL NOTE
Date: 6 June 2024 (Day 3)

Patient: Kamala Iyer | Hip BPHE post-op

COMPLICATION NOTE:
Post-surgical wound infection identified. Swab culture positive for MRSA. Requires IV vancomycin 1g BD for 10 days. Extended ICU monitoring required due to haemodynamic instability.

Revised LOS: 5 days → 9 days (extension of 4 days)
Additional estimated cost: ₹1,10,000

ICU Charges: ₹14,000/day (note: payer-empanelled rate is ₹12,000/day – tariff gap ₹2,000/day).

ENHANCEMENT REQUEST:
Requesting enhancement of cashless authorisation by ₹1,10,000.
Reason: Post-operative MRSA infection – unforeseen complication requiring ICU extension.

Dr. Mohan Krishnan, MS Orthopaedics`,
      uploadedAt: '2024-06-06T10:00:00+05:30',
    },
  ],
  extractedFacts: [
    { field: 'Primary Diagnosis', value: 'Right neck of femur fracture, displaced (Garden IV)', code: 'S72.001 (illustrative)', confidence: 'high', evidence: { docId: 'DOC-C4-01', start: 390, end: 450, snippet: 'Displaced right neck of femur fracture (Garden IV, completely displaced)' } },
    { field: 'Procedure', value: 'Bipolar Hemiarthroplasty (BPHE)', confidence: 'high', evidence: { docId: 'DOC-C4-01', start: 490, end: 530, snippet: 'Urgent bipolar hemiarthroplasty (BPHE)' } },
    { field: 'ICU Rate Billed', value: '₹14,000/day (empanelled: ₹12,000/day)', confidence: 'high', evidence: { docId: 'DOC-C4-02', start: 250, end: 310, snippet: 'ICU Charges: ₹14,000/day (payer-empanelled rate is ₹12,000/day)' } },
    { field: 'Complication', value: 'Post-surgical MRSA infection, LOS extended 5→9 days', confidence: 'high', evidence: { docId: 'DOC-C4-02', start: 100, end: 170, snippet: 'Post-surgical wound infection identified. Swab culture positive for MRSA.' } },
    { field: 'Enhancement Amount', value: '₹1,10,000', confidence: 'high', evidence: { docId: 'DOC-C4-02', start: 310, end: 350, snippet: 'Requesting enhancement of cashless authorisation by ₹1,10,000' } },
  ],
  ruleResults: [],
  payerEvents: [
    { id: 'PE-C4-1', type: 'preauth_submitted', at: '2024-06-03T18:30:00+05:30', payload: { amount: 420000 }, isSimulated: true },
    { id: 'PE-C4-2', type: 'preauth_approved', at: '2024-06-03T19:15:00+05:30', payload: { approvedAmount: 336000, notes: 'Approved under Policy A (80% of ₹4,20,000). Patient liability ₹84,000.' }, isSimulated: true },
    { id: 'PE-C4-3', type: 'enhancement_submitted', at: '2024-06-06T10:30:00+05:30', payload: { amount: 110000, reason: 'Post-op MRSA infection' }, isSimulated: true },
    { id: 'PE-C4-4', type: 'enhancement_approved', at: '2024-06-06T12:00:00+05:30', payload: { approvedAmount: 80000, notes: 'Enhancement partially approved ₹80,000. ICU tariff disallowance ₹2,000/day × 4 days = ₹8,000 disallowed. Other items under review.' }, isSimulated: true },
  ],
  estimate: {
    totalBilled: 420000,
    totalPayable: 336000,
    patientLiability: 84000,
    roomRentPayable: 420000,
    breakdown: [
      { label: 'All charges (initial estimate)', billed: 420000, payable: 336000, reason: 'Policy A: 20% co-pay on ₹4,20,000' },
    ],
    multiPolicyOptions: [
      { label: 'Option A only', description: 'Suraksha Senior Shield (20% co-pay)', policyAPayable: 336000, policyBPayable: 0, patientLiability: 84000 },
      { label: 'Option B only', description: 'Suraksha Group Family Floater (0% co-pay, up to ₹3,00,000)', policyAPayable: 0, policyBPayable: 300000, patientLiability: 120000 },
      { label: 'Option B first, then A for balance', description: 'B pays ₹3,00,000; A covers 80% of ₹1,20,000 = ₹96,000 (assumption)', policyAPayable: 96000, policyBPayable: 300000, patientLiability: 24000, isAssumption: true },
    ],
  },
  auditLog: [
    { id: 'AL-C4-1', at: '2024-06-03T17:00:00+05:30', type: 'agent_call', actor: 'System', description: 'Extraction agent invoked' },
    { id: 'AL-C4-2', at: '2024-06-03T17:05:00+05:30', type: 'rule_run', actor: 'System', description: 'R12 – multi-policy coordination options computed' },
    { id: 'AL-C4-3', at: '2024-06-03T18:20:00+05:30', type: 'human_approval', actor: 'Desk: Sunita Rao', description: 'Approved under Option A' },
    { id: 'AL-C4-4', at: '2024-06-06T10:00:00+05:30', type: 'document_upload', actor: 'Desk: Sunita Rao', description: 'Enhancement request uploaded' },
    { id: 'AL-C4-5', at: '2024-06-06T10:25:00+05:30', type: 'agent_call', actor: 'System', description: 'Enhancement packet drafted' },
    { id: 'AL-C4-6', at: '2024-06-06T10:28:00+05:30', type: 'human_approval', actor: 'Desk: Sunita Rao', description: 'Enhancement packet approved' },
  ],
  slaClocks: [
    { name: 'Pre-auth Decision', startedAt: '2024-06-03T18:30:00+05:30', deadlineMinutes: 60, completedAt: '2024-06-03T19:15:00+05:30' },
    { name: 'Enhancement Decision', startedAt: '2024-06-06T10:30:00+05:30', deadlineMinutes: 60, completedAt: '2024-06-06T12:00:00+05:30' },
  ],
  agentTrace: [
    { id: 't1', at: '2024-06-03T17:00:05+05:30', message: 'Reading emergency admission note – Kamala Iyer', type: 'reading' },
    { id: 't2', at: '2024-06-03T17:00:08+05:30', message: 'Found diagnosis: Right NOF fracture (S72.001), Bipolar Hemiarthroplasty', type: 'found' },
    { id: 't3', at: '2024-06-03T17:00:10+05:30', message: 'Found 2 active policies (Senior Shield + Group Floater)', type: 'found' },
    { id: 't4', at: '2024-06-03T17:00:12+05:30', message: 'Checking R12: Multiple policies – computing coordination options', type: 'checking' },
    { id: 't5', at: '2024-06-03T17:00:14+05:30', message: 'Option B→A coordination yields best outcome (₹24,000 liability – assumption)', type: 'found' },
    { id: 't6', at: '2024-06-06T09:00:05+05:30', message: 'Reading enhancement note – MRSA infection detected', type: 'reading' },
    { id: 't7', at: '2024-06-06T09:00:08+05:30', message: '⚠️ R10: ICU billed ₹14,000/day vs empanelled ₹12,000/day – ₹8,000 disallowance risk', type: 'warning' },
    { id: 't8', at: '2024-06-06T09:00:10+05:30', message: 'Projected cost now ₹5,30,000 – exceeds 80% threshold. Triggering enhancement request.', type: 'warning' },
    { id: 't9', at: '2024-06-06T09:00:12+05:30', message: 'Drafting enhancement packet with clinical justification for MRSA extension', type: 'drafting' },
  ],
};

export const SEED_CASES: AuthCase[] = [CASE_1, CASE_2, CASE_3, CASE_4];
