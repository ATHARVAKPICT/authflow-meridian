// ============================================================
// AuthFlow – Zustand Global Store
// ============================================================

import { create } from 'zustand';
import type { AuthCase, AgentRole, Region, AgentTraceStep, AuditEntry, PayerEvent, CaseStatus } from '../types';
import { SEED_CASES } from '../data/cases';
import {
  R01_initialWaiting, R02_pedWaiting, R03_specificWaiting, R04_moratorium,
  R05_roomRentCap, R06_copay, R07_sublimits, R08_balanceSI, R09_consumables,
  R11_inpatientNecessity, R12_multiplePolices, R13_intimation, R14_hospWindows,
  R15_documentCompleteness, computeRiskScore,
} from '../engine/rules';

interface AppStore {
  cases: AuthCase[];
  selectedCaseId: string | null;
  role: AgentRole;
  region: Region;
  replayMode: boolean;
  demoSpeed: 1 | 60;
  liveModePasscodeVerified: boolean;
  withoutAuthFlowMode: boolean;

  // Actions
  selectCase: (id: string) => void;
  setRole: (role: AgentRole) => void;
  setRegion: (region: Region) => void;
  setReplayMode: (replay: boolean) => void;
  setDemoSpeed: (speed: 1 | 60) => void;
  setWithoutAuthFlowMode: (val: boolean) => void;
  uploadDocument: (caseId: string, docTitle: string, docContent: string, docType: string) => void;
  approvePacked: (caseId: string, actorName: string) => void;
  attestDoctor: (caseId: string, doctorName: string) => void;
  addTraceStep: (caseId: string, step: AgentTraceStep) => void;
  addPayerEvent: (caseId: string, event: PayerEvent, newStatus?: CaseStatus) => void;
  runRules: (caseId: string) => void;
  resetCases: () => void;
}

function computeRules(c: AuthCase) {
  const policy = c.policies[0];
  const admDate = new Date(c.admissionDecisionAt);
  const conditions = c.extractedFacts.map(f => f.value);
  const billedRoom = c.id === 'CASE-001' ? 8000 : 10000;
  const estimatedCost = c.estimate?.totalBilled ?? 0;
  const consumables = c.bill?.filter(l => l.category === 'consumables').reduce((s, l) => s + l.amount, 0) ?? 0;

  const results = [
    R01_initialWaiting(policy, c.admissionType, admDate),
    R02_pedWaiting(policy, conditions, admDate),
    R03_specificWaiting(policy, conditions, admDate),
    R04_moratorium(policy, admDate),
    R05_roomRentCap(policy, billedRoom),
    R06_copay(policy),
    R07_sublimits(policy),
    R08_balanceSI(policy, estimatedCost),
    R09_consumables(consumables),
    R11_inpatientNecessity(
      c.extractedFacts,
      c.specialty === 'Cardiology' ? ['Troponin I', 'ECG Finding', 'Inpatient Necessity'] : []
    ),
    R12_multiplePolices(c.policies.length),
    R13_intimation(c.admissionType, null, admDate),
    R14_hospWindows(policy),
    R15_documentCompleteness(
      c.specialty === 'Cardiology' ? ['Admission Note', 'ECG Report', 'Troponin I Result'] : ['Admission Note', 'Policy Card'],
      c.documents.map(d => d.title.split('–')[0].trim())
    ),
  ];

  const { score, level } = computeRiskScore(results);
  return { results, score, level };
}

export const useStore = create<AppStore>((set, get) => ({
  cases: SEED_CASES.map(c => {
    const { results, level } = computeRules(c);
    return { ...c, ruleResults: results, riskLevel: level };
  }),
  selectedCaseId: null,
  role: 'desk',
  region: 'india',
  replayMode: true,
  demoSpeed: 1,
  liveModePasscodeVerified: false,
  withoutAuthFlowMode: false,

  selectCase: (id) => set({ selectedCaseId: id }),
  setRole: (role) => set({ role }),
  setRegion: (region) => set({ region }),
  setReplayMode: (replay) => set({ replayMode: replay }),
  setDemoSpeed: (speed) => set({ demoSpeed: speed }),
  setWithoutAuthFlowMode: (val) => set({ withoutAuthFlowMode: val }),

  uploadDocument: (caseId, docTitle, docContent, docType) => {
    set(state => {
      const cases = state.cases.map(c => {
        if (c.id !== caseId) return c;
        const newDoc = {
          id: `DOC-${Date.now()}`,
          type: docType as never,
          title: docTitle,
          content: docContent,
          uploadedAt: new Date().toISOString(),
        };
        const newFact = docTitle.toLowerCase().includes('troponin') ? {
          id: `FACT-${Date.now()}`,
          field: 'Troponin I',
          value: '2.4 ng/mL (60× ULN) – CRITICALLY ELEVATED',
          code: 'I21.4 (illustrative)',
          confidence: 'high' as const,
          evidence: { docId: newDoc.id, start: 0, end: 50, snippet: 'Troponin I: 2.4 ng/mL' },
        } : null;

        const updatedFacts = newFact
          ? [...c.extractedFacts.filter(f => f.field !== 'Troponin Result (Initial)'), newFact]
          : c.extractedFacts;

        const updatedCase = {
          ...c,
          documents: [...c.documents, newDoc],
          extractedFacts: updatedFacts,
        };

        const { results, level } = computeRules(updatedCase);

        const auditEntry: AuditEntry = {
          id: `AL-${Date.now()}`,
          at: new Date().toISOString(),
          type: 'document_upload',
          actor: 'Desk',
          description: `Document uploaded: ${docTitle}`,
        };

        return {
          ...updatedCase,
          ruleResults: results,
          riskLevel: level,
          auditLog: [...updatedCase.auditLog, auditEntry],
        };
      });
      return { cases };
    });
  },

  approvePacked: (caseId, actorName) => {
    set(state => ({
      cases: state.cases.map(c => {
        if (c.id !== caseId) return c;
        const auditEntry: AuditEntry = {
          id: `AL-${Date.now()}`,
          at: new Date().toISOString(),
          type: 'human_approval',
          actor: actorName,
          description: 'Auth packet approved for submission',
        };
        return {
          ...c,
          status: 'review' as const,
          packet: {
            ...(c.packet ?? { id: `PKT-${c.id}`, narrative: '', checklist: [], openGaps: [], step: 3 }),
            approvedBy: actorName,
            approvedAt: new Date().toISOString(),
          },
          auditLog: [...c.auditLog, auditEntry],
        };
      }),
    }));
  },

  attestDoctor: (caseId, doctorName) => {
    set(state => ({
      cases: state.cases.map(c => {
        if (c.id !== caseId) return c;
        const auditEntry: AuditEntry = {
          id: `AL-${Date.now()}`,
          at: new Date().toISOString(),
          type: 'attestation',
          actor: doctorName,
          description: 'Clinical attestation confirmed',
        };
        return {
          ...c,
          packet: {
            ...(c.packet ?? { id: `PKT-${c.id}`, narrative: '', checklist: [], openGaps: [], step: 4 }),
            doctorAttestedBy: doctorName,
            doctorAttestedAt: new Date().toISOString(),
          },
          auditLog: [...c.auditLog, auditEntry],
        };
      }),
    }));
  },

  addTraceStep: (caseId, step) => {
    set(state => ({
      cases: state.cases.map(c => c.id === caseId ? { ...c, agentTrace: [...c.agentTrace, step] } : c),
    }));
  },

  addPayerEvent: (caseId, event, newStatus) => {
    set(state => ({
      cases: state.cases.map(c => {
        if (c.id !== caseId) return c;
        const auditEntry: AuditEntry = {
          id: `AL-${Date.now()}`,
          at: new Date().toISOString(),
          type: 'payer_event',
          actor: 'Payer Simulator',
          description: `Payer event: ${event.type}`,
        };
        return {
          ...c,
          status: newStatus || c.status,
          payerEvents: [...c.payerEvents, event],
          auditLog: [...c.auditLog, auditEntry],
        };
      }),
    }));
  },

  runRules: (caseId) => {
    set(state => ({
      cases: state.cases.map(c => {
        if (c.id !== caseId) return c;
        const { results, level } = computeRules(c);
        return { ...c, ruleResults: results, riskLevel: level };
      }),
    }));
  },

  resetCases: () => {
    set({
      cases: SEED_CASES.map(c => {
        const { results, level } = computeRules(c);
        return { ...c, ruleResults: results, riskLevel: level };
      }),
      selectedCaseId: null,
    });
  },
}));
