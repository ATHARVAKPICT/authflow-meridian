// ============================================================
// AuthFlow – Domain Model (TypeScript types)
// ============================================================

export type AdmissionType = 'planned' | 'emergency';
export type CaseStatus =
  | 'new'
  | 'extracting'
  | 'draft_ready'
  | 'review'
  | 'submitted'
  | 'approved'
  | 'queried'
  | 'rejected'
  | 'enhancement_needed'
  | 'final_auth_pending'
  | 'discharged';

export type RuleStatus = 'pass' | 'warn' | 'fail' | 'info';
export type CitationType = 'IRDAI' | 'Policy clause' | 'Hospital-payer tariff' | 'Payer practice';

export type PayerEventType =
  | 'preauth_submitted'
  | 'preauth_approved'
  | 'query'
  | 'partial'
  | 'rejected'
  | 'enhancement_submitted'
  | 'enhancement_approved'
  | 'final_auth_requested'
  | 'final_auth_approved'
  | 'final_auth_delayed';

export type AgentRole = 'desk' | 'doctor' | 'rcm_head' | 'patient';
export type Region = 'india' | 'ksa' | 'uae';
export type RiskLevel = 'low' | 'medium' | 'high';

// ──────────────────────────────────────────────
// Patient (synthetic only)
// ──────────────────────────────────────────────
export interface Patient {
  id: string;
  name: string; // synthetic
  age: number;
  gender: 'M' | 'F';
  contactToken: string; // redacted token, not real phone
}

// ──────────────────────────────────────────────
// Policy
// ──────────────────────────────────────────────
export interface WaitingPeriods {
  initialDays: number;
  pedMonths: number;
  specific: { condition: string; months: number }[];
}

export interface Policy {
  id: string;
  insurer: string;
  tpa: string;
  product: string;
  policyNumber: string; // synthetic
  inceptionDate: string; // ISO date
  continuousCoverageMonths: number;
  sumInsured: number;
  balanceSumInsured: number;
  roomRentCapPctPerDay: number; // normal room, e.g. 0.01 = 1%
  icuCapPctPerDay: number;
  coPayPct: number; // e.g. 0.20 = 20%
  waitingPeriods: WaitingPeriods;
  disclosedPEDs: string[];
  proportionateDeductionHeads: string[];
  exclusions: string[];
  preHospDays: number;
  postHospDays: number;
  moratoriumMonths: number; // after this, nondisclosure only contestable for fraud
}

// ──────────────────────────────────────────────
// Documents
// ──────────────────────────────────────────────
export type DocType =
  | 'admission_note'
  | 'discharge_summary'
  | 'lab_report'
  | 'imaging'
  | 'prescription'
  | 'policy_card'
  | 'id_proof'
  | 'referral'
  | 'consent'
  | 'handwritten_note';

export interface CaseDocument {
  id: string;
  type: DocType;
  title: string;
  content: string; // plain text
  uploadedAt: string;
  isImage?: boolean; // for multimodal
  imagePath?: string;
  redacted?: boolean;
}

// ──────────────────────────────────────────────
// Extracted Facts
// ──────────────────────────────────────────────
export interface EvidenceSpan {
  docId: string;
  start: number;
  end: number;
  snippet: string;
}

export interface ExtractedFact {
  field: string;
  value: string;
  code?: string; // ICD-10, illustrative
  confidence: 'high' | 'medium' | 'low';
  evidence: EvidenceSpan;
  needsDeskConfirmation?: boolean;
}

// ──────────────────────────────────────────────
// Rules Engine
// ──────────────────────────────────────────────
export interface RuleCitation {
  type: CitationType;
  ref: string;
}

export interface RuleResult {
  ruleId: string;
  name: string;
  status: RuleStatus;
  message: string;
  citation: RuleCitation;
  amountImpact?: number; // negative = deduction
}

// ──────────────────────────────────────────────
// Estimate & Bill
// ──────────────────────────────────────────────
export interface BillLine {
  id: string;
  description: string;
  category:
    | 'room'
    | 'nursing'
    | 'ot'
    | 'surgeon'
    | 'anaesthetist'
    | 'consultation'
    | 'implant'
    | 'medicines'
    | 'diagnostics'
    | 'consumables'
    | 'icu'
    | 'other';
  amount: number;
  unit?: string;
  quantity?: number;
  isProportionate?: boolean; // subject to proportionate deduction
  isNonPayable?: boolean;
}

export interface Estimate {
  totalBilled: number;
  totalPayable: number;
  patientLiability: number;
  roomRentPayable: number;
  proportionFactor?: number; // e.g. 0.625
  breakdown: {
    label: string;
    billed: number;
    payable: number;
    reason?: string;
  }[];
  multiPolicyOptions?: MultiPolicyOption[];
  roomChoiceSaving?: number;
  roomDeduction?: number;
  proportionateDeduction?: number;
  copayAmount?: number;
  nonPayables?: number;
  insurerApproved?: number;
  patientPayable?: number;
}

export interface MultiPolicyOption {
  label: string;
  description: string;
  policyAPayable: number;
  policyBPayable: number;
  patientLiability: number;
  isAssumption?: boolean;
}

// ──────────────────────────────────────────────
// Payer Events & SLA
// ──────────────────────────────────────────────
export interface PayerEvent {
  id: string;
  type: PayerEventType;
  at: string;
  payload: Record<string, unknown>;
  isSimulated: boolean;
}

export interface SLAClock {
  name: string;
  startedAt: string;
  deadlineMinutes: number;
  completedAt?: string;
  breachedBy?: number; // minutes
}

// ──────────────────────────────────────────────
// Delay Ledger
// ──────────────────────────────────────────────
export interface DelayEntry {
  id: string;
  cause: 'insurer' | 'hospital' | 'patient';
  description: string;
  from: string;
  to: string;
  minutesLost: number;
  extraCharge?: number;
}

// ──────────────────────────────────────────────
// Auth Packet
// ──────────────────────────────────────────────
export interface AuthPacket {
  id: string;
  narrative: string; // AI-drafted, tagged with evidenceIds
  checklist: { item: string; status: 'present' | 'missing' | 'pending'; docId?: string }[];
  openGaps: string[];
  step: number; // 0-5
  approvedBy?: string;
  approvedAt?: string;
  doctorAttestedBy?: string;
  doctorAttestedAt?: string;
  fhirBundle?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Audit Log
// ──────────────────────────────────────────────
export type AuditEventType =
  | 'agent_call'
  | 'rule_run'
  | 'human_approval'
  | 'submission'
  | 'document_upload'
  | 'attestation'
  | 'payer_event';

export interface AuditEntry {
  id: string;
  at: string;
  type: AuditEventType;
  actor: string;
  description: string;
  detail?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Agent Trace Step
// ──────────────────────────────────────────────
export interface AgentTraceStep {
  id: string;
  at: string;
  message: string;
  type: 'reading' | 'found' | 'mapped' | 'checking' | 'drafting' | 'warning' | 'done';
}

// ──────────────────────────────────────────────
// Reconciliation
// ──────────────────────────────────────────────
export interface ReconciliationLine {
  description: string;
  billed: number;
  approved: number;
  deduction: number;
  reason: string;
  citation: string;
}

export interface Reconciliation {
  lines: ReconciliationLine[];
  totalBilled: number;
  totalApproved: number;
  totalDeduction: number;
  patientLiability: number;
  liabilityStatement: string; // AI-drafted, engine numbers
  delayLedger: DelayEntry[];
}

// ──────────────────────────────────────────────
// Main Case
// ──────────────────────────────────────────────
export interface AuthCase {
  id: string;
  patient: Patient;
  admissionType: AdmissionType;
  admissionDecisionAt: string;
  medicalClearanceAt?: string;
  status: CaseStatus;
  riskLevel: RiskLevel;
  policies: Policy[];
  documents: CaseDocument[];
  extractedFacts: ExtractedFact[];
  packet?: AuthPacket;
  ruleResults: RuleResult[];
  payerEvents: PayerEvent[];
  estimate?: Estimate;
  bill?: BillLine[];
  reconciliation?: Reconciliation;
  auditLog: AuditEntry[];
  slaClocks: SLAClock[];
  agentTrace: AgentTraceStep[];
  specialty: string;
  procedure?: string;
  diagnosis?: string;
  diagnosisCode?: string;
  hospital: string;
  region: Region;
  insurerName: string;
  tpaName: string;
  withoutAuthFlowMode?: boolean; // toggle for Case 3 comparison
}

// ──────────────────────────────────────────────
// App State (Zustand)
// ──────────────────────────────────────────────
export interface AppState {
  cases: AuthCase[];
  selectedCaseId: string | null;
  role: AgentRole;
  region: Region;
  replayMode: boolean; // true = no real LLM
  demoSpeed: 1 | 60; // x1 or x60 acceleration
  liveModePasscodeVerified: boolean;
}
