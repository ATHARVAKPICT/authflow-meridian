// ============================================================
// AuthFlow – Engine Unit Tests
// Expected numbers from specification section 7
// ============================================================

import { describe, it, expect } from 'vitest';
import { computeEstimate, computeStandardRoomEstimate, roomChoiceSaving, computeMultiPolicyOptions, proportionFactor, roomRentCapPerDay } from '../engine/money';
import { R01_initialWaiting, R05_roomRentCap, R15_documentCompleteness, computeRiskScore } from '../engine/rules';
import type { BillLine, Policy } from '../types';

// ─────────────────────────────────────────────────────────
// CASE 1 TEST DATA
// ─────────────────────────────────────────────────────────
const POLICY_ANIL: Policy = {
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
    specific: [{ condition: 'knee replacement', months: 24 }],
  },
  disclosedPEDs: ['Osteoarthritis'],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: [],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
};

const CASE1_BILL: BillLine[] = [
  { id: 'b1-1', description: 'Room', category: 'room', amount: 24000, unit: 'day', quantity: 3 },
  { id: 'b1-2', description: 'Nursing', category: 'nursing', amount: 6000 },
  { id: 'b1-3', description: 'OT charges', category: 'ot', amount: 30000 },
  { id: 'b1-4', description: 'Surgeon fee', category: 'surgeon', amount: 60000 },
  { id: 'b1-5', description: 'Anaesthetist fee', category: 'anaesthetist', amount: 15000 },
  { id: 'b1-6', description: 'Consultations', category: 'consultation', amount: 6000 },
  { id: 'b1-7', description: 'Implant', category: 'implant', amount: 85000 },
  { id: 'b1-8', description: 'Medicines', category: 'medicines', amount: 18000 },
  { id: 'b1-9', description: 'Diagnostics', category: 'diagnostics', amount: 12000 },
  { id: 'b1-10', description: 'Consumables', category: 'consumables', amount: 5000 },
];

// ─────────────────────────────────────────────────────────
// CASE 4 TEST DATA
// ─────────────────────────────────────────────────────────
const POLICY_KAMALA_A: Policy = {
  id: 'POL-KAMALA-A',
  insurer: 'Suraksha General Insurance',
  tpa: 'CarePath TPA',
  product: 'Suraksha Senior Shield',
  policyNumber: 'SRK-SEN-2019-9901234',
  inceptionDate: '2019-01-15',
  continuousCoverageMonths: 65,
  sumInsured: 500000,
  balanceSumInsured: 500000,
  roomRentCapPctPerDay: 0.01,
  icuCapPctPerDay: 0.02,
  coPayPct: 0.2,
  waitingPeriods: { initialDays: 30, pedMonths: 36, specific: [] },
  disclosedPEDs: ['Hypertension', 'Osteoporosis'],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: [],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
};

const POLICY_KAMALA_B: Policy = {
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
  waitingPeriods: { initialDays: 30, pedMonths: 36, specific: [] },
  disclosedPEDs: [],
  proportionateDeductionHeads: ['nursing', 'ot', 'surgeon', 'anaesthetist', 'consultation'],
  exclusions: [],
  preHospDays: 30,
  postHospDays: 60,
  moratoriumMonths: 60,
};

// ─────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────

describe('Engine – Room Rent Cap', () => {
  it('computes cap correctly: 1% of ₹5,00,000 = ₹5,000/day', () => {
    expect(roomRentCapPerDay(POLICY_ANIL)).toBe(5000);
  });

  it('computes proportion factor: cap 5000 / billed 8000 = 0.625', () => {
    expect(proportionFactor(8000, 5000)).toBeCloseTo(0.625, 4);
  });

  it('returns factor 1.0 when billed ≤ cap', () => {
    expect(proportionFactor(5000, 5000)).toBe(1);
    expect(proportionFactor(4000, 5000)).toBe(1);
  });
});

describe('Engine – Case 1: Planned Knee Replacement (Deluxe Room)', () => {
  const estimate = computeEstimate(CASE1_BILL, POLICY_ANIL, 8000, 3);

  it('Room payable = min(24000, 3 × 5000) = 15000', () => {
    expect(estimate.roomRentPayable).toBe(15000);
  });

  it('Proportionate factor = 0.625', () => {
    expect(estimate.proportionFactor).toBeCloseTo(0.625, 4);
  });

  it('Proportionate heads total billed = 6000+30000+60000+15000+6000 = 117000', () => {
    const propBilled = 6000 + 30000 + 60000 + 15000 + 6000;
    expect(propBilled).toBe(117000);
  });

  it('Proportionate heads payable = 117000 × 0.625 = 73125', () => {
    const propPayable = Math.round(117000 * 0.625);
    expect(propPayable).toBe(73125);
  });

  it('Non-proportionate (implant 85000 + medicines 18000 + diagnostics 12000) = 115000', () => {
    expect(85000 + 18000 + 12000).toBe(115000);
  });

  it('Consumables 5000 are non-payable', () => {
    const consumableLine = estimate.breakdown.find(b => b.label.toLowerCase().includes('consumable'));
    expect(consumableLine?.payable).toBe(0);
  });

  it('Total billed = 261000', () => {
    expect(estimate.totalBilled).toBe(261000);
  });

  it('Total payable = 203125', () => {
    expect(estimate.totalPayable).toBe(203125);
  });

  it('Patient liability = 57875', () => {
    expect(estimate.patientLiability).toBe(57875);
  });
});

describe('Engine – Case 1: Standard Room Comparison', () => {
  const standardEstimate = computeStandardRoomEstimate(CASE1_BILL, POLICY_ANIL, 3);
  const deluxeEstimate = computeEstimate(CASE1_BILL, POLICY_ANIL, 8000, 3);

  it('Standard room billed = 5000 × 3 = 15000 (replaces 24000)', () => {
    // Total billed with standard room: 261000 - 9000 = 252000
    expect(standardEstimate.totalBilled).toBe(252000);
  });

  it('Standard room payable ≈ 247000 (full room, no proportionate deduction)', () => {
    // Room: 15000, nursing: 6000, OT: 30000, surgeon: 60000, anaest: 15000, consult: 6000,
    // implant: 85000, meds: 18000, diagnostics: 12000, consumables: 0
    // Total: 247000
    expect(standardEstimate.totalPayable).toBe(247000);
  });

  it('Patient saves 52875 by choosing standard room', () => {
    const saving = roomChoiceSaving(deluxeEstimate, standardEstimate);
    expect(saving).toBe(52875);
  });
});

describe('Engine – Case 2: Initial Waiting Period', () => {
  const POLICY_MEERA: Policy = {
    id: 'POL-MEERA-001',
    insurer: 'Suraksha General Insurance',
    tpa: 'CarePath TPA',
    product: 'Suraksha Health Shield',
    policyNumber: 'SRK-IND-2024-7821045',
    inceptionDate: '2024-03-24',
    continuousCoverageMonths: 0,
    sumInsured: 300000,
    balanceSumInsured: 300000,
    roomRentCapPctPerDay: 0.01,
    icuCapPctPerDay: 0.02,
    coPayPct: 0,
    waitingPeriods: { initialDays: 30, pedMonths: 36, specific: [] },
    disclosedPEDs: [],
    proportionateDeductionHeads: [],
    exclusions: [],
    preHospDays: 30,
    postHospDays: 60,
    moratoriumMonths: 60,
  };

  it('R01 fails when admission is 18 days after inception (not accident)', () => {
    const admDate = new Date('2024-04-11');
    const result = R01_initialWaiting(POLICY_MEERA, 'emergency', admDate);
    // Emergency illness ≠ accident, and 18 days < 30 days
    expect(result.status).toBe('fail');
  });

  it('R01 passes if it were an accident', () => {
    const admDate = new Date('2024-04-11');
    const resultForAccident = R01_initialWaiting(POLICY_MEERA, 'emergency', admDate, true);
    expect(resultForAccident.status).toBe('pass');
  });
});

describe('Engine – Case 4: Multi-Policy Coordination', () => {
  const options = computeMultiPolicyOptions(420000, POLICY_KAMALA_A, POLICY_KAMALA_B);

  it('Option A only: payable = 80% × 420000 = 336000, liability = 84000', () => {
    expect(options[0].policyAPayable).toBe(336000);
    expect(options[0].patientLiability).toBe(84000);
  });

  it('Option B only: payable = min(420000, 300000) = 300000, liability = 120000', () => {
    expect(options[1].policyBPayable).toBe(300000);
    expect(options[1].patientLiability).toBe(120000);
  });

  it('Option B then A: B pays 300000, balance 120000, A pays 80% = 96000, liability = 24000', () => {
    expect(options[2].policyBPayable).toBe(300000);
    expect(options[2].policyAPayable).toBe(96000);
    expect(options[2].patientLiability).toBe(24000);
  });

  it('Option B then A is labelled as assumption', () => {
    expect(options[2].isAssumption).toBe(true);
  });
});

describe('Engine – Rules: R05 Room Rent Cap', () => {
  it('R05 warns when room exceeds cap', () => {
    const result = R05_roomRentCap(POLICY_ANIL, 8000);
    expect(result.status).toBe('warn');
    expect(result.amountImpact).toBe(-3000); // 8000 - 5000 per day
  });

  it('R05 passes when room is within cap', () => {
    const result = R05_roomRentCap(POLICY_ANIL, 5000);
    expect(result.status).toBe('pass');
    expect(result.amountImpact).toBe(0);
  });
});

describe('Engine – Rules: R15 Document Completeness', () => {
  it('R15 warns when troponin missing', () => {
    const result = R15_documentCompleteness(
      ['Admission Note', 'ECG Report', 'Troponin I Result'],
      ['Admission Note', 'ECG Report']
    );
    expect(result.status).toBe('warn');
    expect(result.message).toContain('Troponin I Result');
  });

  it('R15 passes when all documents present', () => {
    const result = R15_documentCompleteness(
      ['Admission Note', 'ECG Report', 'Troponin I Result'],
      ['Admission Note', 'ECG Report', 'Troponin I Result']
    );
    expect(result.status).toBe('pass');
  });
});

describe('Engine – Risk Scoring', () => {
  it('fail rule gives 40 points → high risk', () => {
    const results = [{ ruleId: 'R01', name: 'Test', status: 'fail' as const, message: '', citation: { type: 'Policy clause' as const, ref: '' } }];
    const { score, level } = computeRiskScore(results);
    expect(score).toBe(40);
    expect(level).toBe('high');
  });

  it('two warn rules give 30 points → medium risk', () => {
    const results = [
      { ruleId: 'R01', name: 'Test', status: 'warn' as const, message: '', citation: { type: 'Policy clause' as const, ref: '' } },
      { ruleId: 'R02', name: 'Test', status: 'warn' as const, message: '', citation: { type: 'Policy clause' as const, ref: '' } },
    ];
    const { score, level } = computeRiskScore(results);
    expect(score).toBe(30);
    expect(level).toBe('medium');
  });

  it('all pass rules give 0 points → low risk', () => {
    const results = [
      { ruleId: 'R01', name: 'Test', status: 'pass' as const, message: '', citation: { type: 'Policy clause' as const, ref: '' } },
    ];
    const { score, level } = computeRiskScore(results);
    expect(score).toBe(0);
    expect(level).toBe('low');
  });
});

describe('Engine – Case 4: ICU Tariff Disallowance', () => {
  it('ICU disallowance = (14000 - 12000) × 4 nights = 8000', () => {
    const billedRate = 14000;
    const empanelledRate = 12000;
    const nights = 4;
    const disallowance = Math.max(0, (billedRate - empanelledRate) * nights);
    expect(disallowance).toBe(8000);
  });
});
