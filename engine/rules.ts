// ============================================================
// AuthFlow – Rules Engine (pure TS, no LLM)
// ============================================================
// Each rule returns a RuleResult with a citation and plain-language message.
// Source labels are honest – "illustrative" means we do not have the real IRDAI text.

import type { AuthCase, Policy, RuleResult, ExtractedFact } from '../types';

function today(): Date {
  return new Date();
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

// ─────────────────────────────────────────────────────────
// R01: Initial 30-day waiting period (accident exempt)
// ─────────────────────────────────────────────────────────
export function R01_initialWaiting(policy: Policy, admissionType: 'planned' | 'emergency', admissionDate: Date, isAccident: boolean = false): RuleResult {
  const inception = new Date(policy.inceptionDate);
  const daysSinceInception = Math.floor((admissionDate.getTime() - inception.getTime()) / 86400000);
  const satisfied = daysSinceInception >= policy.waitingPeriods.initialDays || isAccident;

  return {
    ruleId: 'R01',
    name: 'Initial Waiting Period',
    status: satisfied ? 'pass' : 'fail',
    message: satisfied
      ? `Initial waiting period satisfied (${daysSinceInception} days since inception; required: ${policy.waitingPeriods.initialDays} days${isAccident ? '; waived for accidental injury' : ''}).`
      : `Initial waiting period NOT satisfied. Policy incepted ${daysSinceInception} days ago; requires ${policy.waitingPeriods.initialDays} days (only waived for accidental injury, not illness). Pre-auth likely to be rejected. Discuss financial options with patient – clinical care must not be delayed.`,
    citation: { type: 'Policy clause', ref: 'Policy clause (illustrative) – Initial 30-day Waiting Period' },
  };
}

// ─────────────────────────────────────────────────────────
// R02: PED waiting period (capped at 36 months)
// ─────────────────────────────────────────────────────────
export function R02_pedWaiting(policy: Policy, diagnosedConditions: string[], admissionDate: Date): RuleResult {
  const inception = new Date(policy.inceptionDate);
  const monthsOld = monthsBetween(inception, admissionDate);
  const pedRequired = policy.waitingPeriods.pedMonths;

  const pedsInPlay = diagnosedConditions.filter(c =>
    policy.disclosedPEDs.some(ped => ped.toLowerCase().includes(c.toLowerCase()))
  );

  if (pedsInPlay.length === 0) {
    return {
      ruleId: 'R02',
      name: 'PED Waiting Period',
      status: 'pass',
      message: 'No relevant pre-existing diseases in play for this admission.',
      citation: { type: 'IRDAI', ref: 'IRDAI Master Circular 2024 (29 May 2024) – PED Waiting Period, capped at 36 months' },
    };
  }

  const satisfied = monthsOld >= pedRequired;
  return {
    ruleId: 'R02',
    name: 'PED Waiting Period',
    status: satisfied ? 'pass' : 'warn',
    message: satisfied
      ? `PED waiting satisfied for ${pedsInPlay.join(', ')} (${monthsOld} months; required: ${pedRequired}).`
      : `PED waiting NOT fully satisfied for ${pedsInPlay.join(', ')}. Policy is ${monthsOld} months old; requires ${pedRequired} months. Risk of partial or full rejection.`,
    citation: { type: 'IRDAI', ref: 'IRDAI Master Circular 2024 (29 May 2024) – PED Waiting Period, capped at 36 months' },
  };
}

// ─────────────────────────────────────────────────────────
// R03: Specific-disease waiting (24 months)
// ─────────────────────────────────────────────────────────
export function R03_specificWaiting(policy: Policy, diagnosedConditions: string[], admissionDate: Date): RuleResult {
  const inception = new Date(policy.inceptionDate);
  const monthsOld = monthsBetween(inception, admissionDate);

  const relevant = policy.waitingPeriods.specific.filter(sw =>
    diagnosedConditions.some(d => d.toLowerCase().includes(sw.condition.toLowerCase()))
  );

  if (relevant.length === 0) {
    return {
      ruleId: 'R03',
      name: 'Specific Disease Waiting Period',
      status: 'pass',
      message: 'No specific disease waiting periods apply to the current diagnoses.',
      citation: { type: 'Policy clause', ref: 'Policy clause (illustrative) – Specific Disease Waiting Period' },
    };
  }

  const unsatisfied = relevant.filter(sw => monthsOld < sw.months);

  if (unsatisfied.length === 0) {
    return {
      ruleId: 'R03',
      name: 'Specific Disease Waiting Period',
      status: 'pass',
      message: `Specific waiting satisfied for ${relevant.map(r => r.condition).join(', ')} (${monthsOld} months).`,
      citation: { type: 'Policy clause', ref: 'Policy clause (illustrative) – Specific Disease Waiting Period' },
    };
  }

  return {
    ruleId: 'R03',
    name: 'Specific Disease Waiting Period',
    status: 'warn',
    message: `Specific waiting NOT satisfied for: ${unsatisfied.map(u => `${u.condition} (requires ${u.months} months, policy is ${monthsOld} months)`).join('; ')}.`,
    citation: { type: 'Policy clause', ref: 'Policy clause (illustrative) – Specific Disease Waiting Period' },
  };
}

// ─────────────────────────────────────────────────────────
// R04: Moratorium (60 months – only fraud contestable)
// ─────────────────────────────────────────────────────────
export function R04_moratorium(policy: Policy, admissionDate: Date): RuleResult {
  const inception = new Date(policy.inceptionDate);
  const monthsOld = monthsBetween(inception, admissionDate);
  const moratoriumMonths = policy.moratoriumMonths ?? 60;

  if (monthsOld >= moratoriumMonths) {
    return {
      ruleId: 'R04',
      name: 'Moratorium (60 months)',
      status: 'info',
      message: `Policy has been in force for ${monthsOld} months. Past ${moratoriumMonths}-month moratorium – non-disclosure is now only contestable if established fraud (per IRDAI 2024).`,
      citation: { type: 'IRDAI', ref: 'IRDAI Master Circular 2024 – Moratorium Clause' },
    };
  }

  return {
    ruleId: 'R04',
    name: 'Moratorium (60 months)',
    status: 'info',
    message: `Policy is ${monthsOld} months old; moratorium threshold is ${moratoriumMonths} months. Non-disclosure remains contestable until then.`,
    citation: { type: 'IRDAI', ref: 'IRDAI Master Circular 2024 – Moratorium Clause' },
  };
}

// ─────────────────────────────────────────────────────────
// R05: Room-rent cap and proportionate deduction
// ─────────────────────────────────────────────────────────
export function R05_roomRentCap(policy: Policy, billedRoomPerDay: number): RuleResult {
  const cap = Math.round(policy.sumInsured * policy.roomRentCapPctPerDay);
  const exceeded = billedRoomPerDay > cap;

  return {
    ruleId: 'R05',
    name: 'Room Rent Cap & Proportionate Deduction',
    status: exceeded ? 'warn' : 'pass',
    message: exceeded
      ? `Room billed at ₹${billedRoomPerDay.toLocaleString('en-IN')}/day exceeds cap of ₹${cap.toLocaleString('en-IN')}/day (${Math.round(policy.roomRentCapPctPerDay * 100)}% of SI). Proportionate deduction applies to: nursing, OT, surgeon, anaesthetist, consultation. Patient will bear the difference.`
      : `Room at ₹${billedRoomPerDay.toLocaleString('en-IN')}/day is within cap of ₹${cap.toLocaleString('en-IN')}/day. No proportionate deduction.`,
    citation: { type: 'Policy clause', ref: 'Policy clause (illustrative) – Room Rent Sub-limit & Proportionate Deduction' },
    amountImpact: exceeded ? -(billedRoomPerDay - cap) : 0,
  };
}

// ─────────────────────────────────────────────────────────
// R06: Co-pay applied after deductions
// ─────────────────────────────────────────────────────────
export function R06_copay(policy: Policy): RuleResult {
  if (policy.coPayPct === 0) {
    return {
      ruleId: 'R06',
      name: 'Co-pay',
      status: 'pass',
      message: 'No co-pay applies to this policy.',
      citation: { type: 'Policy clause', ref: 'Policy clause – Co-pay' },
    };
  }

  return {
    ruleId: 'R06',
    name: 'Co-pay',
    status: 'info',
    message: `${Math.round(policy.coPayPct * 100)}% co-pay applies to the admissible amount after all deductions. Patient is liable for this portion.`,
    citation: { type: 'Policy clause', ref: 'Policy clause – Co-pay' },
  };
}

// ─────────────────────────────────────────────────────────
// R07: Sub-limits (configurable)
// ─────────────────────────────────────────────────────────
export function R07_sublimits(_policy: Policy): RuleResult {
  return {
    ruleId: 'R07',
    name: 'Sub-limits',
    status: 'info',
    message: 'No additional sub-limits configured for this policy beyond room-rent. Sub-limit checks are configurable per payer.',
    citation: { type: 'Policy clause', ref: 'Policy clause (illustrative) – Sub-limits' },
  };
}

// ─────────────────────────────────────────────────────────
// R08: Balance sum insured sufficient
// ─────────────────────────────────────────────────────────
export function R08_balanceSI(policy: Policy, estimatedCost: number): RuleResult {
  const sufficient = policy.balanceSumInsured >= estimatedCost;

  return {
    ruleId: 'R08',
    name: 'Balance Sum Insured',
    status: sufficient ? 'pass' : 'warn',
    message: sufficient
      ? `Balance SI ₹${policy.balanceSumInsured.toLocaleString('en-IN')} is sufficient for estimated cost ₹${estimatedCost.toLocaleString('en-IN')}.`
      : `Balance SI ₹${policy.balanceSumInsured.toLocaleString('en-IN')} may be insufficient for estimated cost ₹${estimatedCost.toLocaleString('en-IN')}. Patient may face a shortfall of ₹${(estimatedCost - policy.balanceSumInsured).toLocaleString('en-IN')}.`,
    citation: { type: 'Policy clause', ref: 'Policy clause – Sum Insured' },
    amountImpact: !sufficient ? -(estimatedCost - policy.balanceSumInsured) : 0,
  };
}

// ─────────────────────────────────────────────────────────
// R09: Non-payable consumables
// ─────────────────────────────────────────────────────────
export function R09_consumables(consumablesAmount: number): RuleResult {
  if (consumablesAmount === 0) {
    return { ruleId: 'R09', name: 'Non-payable Consumables', status: 'pass', message: 'No consumable items billed.', citation: { type: 'Policy clause', ref: 'Standard Non-payable List (abbreviated, illustrative) – Consumables' } };
  }

  return {
    ruleId: 'R09',
    name: 'Non-payable Consumables',
    status: 'warn',
    message: `₹${consumablesAmount.toLocaleString('en-IN')} in consumables (gloves, masks, admission kit, etc.) are non-payable per the standard non-payable list. These will be billed to the patient.`,
    citation: { type: 'Policy clause', ref: 'Standard Non-payable List (abbreviated, illustrative)' },
    amountImpact: -consumablesAmount,
  };
}

// ─────────────────────────────────────────────────────────
// R10: Billed rate vs payer-empanelled tariff
// ─────────────────────────────────────────────────────────
export function R10_tariff(billedRate: number, empanelledRate: number, category: string, nights: number): RuleResult {
  const disallowance = Math.max(0, (billedRate - empanelledRate) * nights);

  return {
    ruleId: 'R10',
    name: 'Tariff vs Empanelled Rate',
    status: disallowance > 0 ? 'warn' : 'pass',
    message: disallowance > 0
      ? `${category} billed at ₹${billedRate.toLocaleString('en-IN')}/day vs payer-empanelled ₹${empanelledRate.toLocaleString('en-IN')}/day. Disallowance risk: ₹${disallowance.toLocaleString('en-IN')} for ${nights} night(s).`
      : `${category} billed at empanelled rate ₹${billedRate.toLocaleString('en-IN')}/day. No tariff disallowance.`,
    citation: { type: 'Hospital-payer tariff', ref: 'Hospital-Payer Empanelment Tariff Agreement (illustrative)' },
    amountImpact: -disallowance,
  };
}

// ─────────────────────────────────────────────────────────
// R11: Inpatient necessity vs diagnostic-only admission
// ─────────────────────────────────────────────────────────
export function R11_inpatientNecessity(facts: ExtractedFact[], requiredFields: string[]): RuleResult {
  const missing = requiredFields.filter(f => !facts.some(fact => fact.field === f && fact.confidence !== 'low'));

  return {
    ruleId: 'R11',
    name: 'Inpatient Medical Necessity',
    status: missing.length > 0 ? 'warn' : 'pass',
    message: missing.length > 0
      ? `Medical necessity narrative is incomplete. Missing documented evidence for: ${missing.join(', ')}. Payer may query inpatient admission vs outpatient diagnostics. Upload the missing documents and ensure the narrative cites clinical indicators.`
      : 'Medical necessity is documented with adequate clinical evidence (ECG changes, troponin, vitals). Inpatient admission is well-supported.',
    citation: { type: 'Payer practice', ref: 'Payer practice (illustrative) – Inpatient Admission Criteria' },
  };
}

// ─────────────────────────────────────────────────────────
// R12: Multiple policies – patient may choose
// ─────────────────────────────────────────────────────────
export function R12_multiplePolices(policyCount: number): RuleResult {
  if (policyCount < 2) {
    return { ruleId: 'R12', name: 'Multiple Policies', status: 'pass', message: 'Single policy – no coordination required.', citation: { type: 'IRDAI', ref: 'IRDAI Master Circular 2024 – Multiple Insurance Policies' } };
  }

  return {
    ruleId: 'R12',
    name: 'Multiple Policies',
    status: 'info',
    message: `${policyCount} active policies detected. Per IRDAI 2024, the policyholder may choose which policy to claim first. Coordination-of-benefits option is computed. Insurer-specific rules may vary (marked as assumption).`,
    citation: { type: 'IRDAI', ref: 'IRDAI Master Circular 2024 – Coordination of Multiple Policies' },
  };
}

// ─────────────────────────────────────────────────────────
// R13: Insurer intimation within 48 hours (emergency/non-network)
// ─────────────────────────────────────────────────────────
export function R13_intimation(admissionType: 'planned' | 'emergency', intimatedAt: Date | null, admissionDate: Date): RuleResult {
  if (admissionType === 'planned') {
    return { ruleId: 'R13', name: 'Insurer Intimation', status: 'pass', message: 'Planned admission – pre-auth submitted before admission.', citation: { type: 'IRDAI', ref: 'GIC "Cashless Everywhere" (Jan 2024)' } };
  }

  if (!intimatedAt) {
    return { ruleId: 'R13', name: 'Insurer Intimation', status: 'warn', message: 'Emergency admission – insurer has not been intimated yet. Must be done within 48 hours of admission.', citation: { type: 'IRDAI', ref: 'GIC "Cashless Everywhere" (Jan 2024)' } };
  }

  const hoursElapsed = (intimatedAt.getTime() - admissionDate.getTime()) / 3600000;
  return {
    ruleId: 'R13',
    name: 'Insurer Intimation',
    status: hoursElapsed <= 48 ? 'pass' : 'fail',
    message: hoursElapsed <= 48
      ? `Insurer intimated within ${Math.round(hoursElapsed)} hours of emergency admission.`
      : `Insurer intimated ${Math.round(hoursElapsed)} hours after admission, exceeding the 48-hour requirement. Risk of claim complications.`,
    citation: { type: 'IRDAI', ref: 'GIC "Cashless Everywhere" (Jan 2024)' },
  };
}

// ─────────────────────────────────────────────────────────
// R14: Pre- and post-hospitalisation windows
// ─────────────────────────────────────────────────────────
export function R14_hospWindows(policy: Policy): RuleResult {
  return {
    ruleId: 'R14',
    name: 'Pre/Post Hospitalisation',
    status: 'info',
    message: `Policy covers ${policy.preHospDays} days pre-hospitalisation and ${policy.postHospDays} days post-hospitalisation expenses related to this admission. Ensure relevant bills are collected within these windows.`,
    citation: { type: 'Policy clause', ref: 'Policy clause – Pre/Post Hospitalisation' },
  };
}

// ─────────────────────────────────────────────────────────
// R15: Document completeness checklist by procedure
// ─────────────────────────────────────────────────────────
export function R15_documentCompleteness(required: string[], present: string[]): RuleResult {
  const missing = required.filter(r => !present.includes(r));
  return {
    ruleId: 'R15',
    name: 'Document Completeness',
    status: missing.length === 0 ? 'pass' : 'warn',
    message: missing.length === 0
      ? 'All required documents are present for this procedure.'
      : `Missing documents: ${missing.join(', ')}. Payer is likely to raise a deficiency query. Upload the missing documents before submission.`,
    citation: { type: 'Payer practice', ref: 'Payer practice (illustrative) – Document Checklist by Procedure' },
  };
}

// ─────────────────────────────────────────────────────────
// R16: SLA clocks – pre-auth decision 1 hour, final discharge auth 3 hours
// ─────────────────────────────────────────────────────────
export function R16_slaClocks(preAuthMinutes: number | null, finalAuthMinutes: number | null): RuleResult {
  const preAuthBreached = preAuthMinutes !== null && preAuthMinutes > 60;
  const finalAuthBreached = finalAuthMinutes !== null && finalAuthMinutes > 180;
  const anyBreach = preAuthBreached || finalAuthBreached;

  let message = '';
  if (preAuthBreached) message += `Pre-auth decision took ${preAuthMinutes}m (limit: 60m) – insurer-attributable delay. `;
  if (finalAuthBreached) message += `Final discharge auth took ${finalAuthMinutes}m (limit: 180m) – extra hospital charges are insurer's liability. `;
  if (!anyBreach) message = 'SLA clocks within IRDAI mandated limits.';

  return {
    ruleId: 'R16',
    name: 'SLA Clocks (IRDAI Mandate)',
    status: anyBreach ? 'warn' : 'pass',
    message,
    citation: { type: 'IRDAI', ref: 'IRDAI Master Circular 2024 – Pre-auth: 1 hour; Final Discharge Auth: 3 hours' },
  };
}

// ─────────────────────────────────────────────────────────
// Run all applicable rules and compute a risk score
// ─────────────────────────────────────────────────────────
export interface RulesOutput {
  results: RuleResult[];
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
}

export function computeRiskScore(results: RuleResult[]): { score: number; level: 'low' | 'medium' | 'high' } {
  const weights = { fail: 40, warn: 15, pass: 0, info: 0 };
  const raw = results.reduce((sum, r) => sum + weights[r.status], 0);
  const score = Math.min(100, raw);
  const level = score >= 40 ? 'high' : score >= 15 ? 'medium' : 'low';
  return { score, level };
}
