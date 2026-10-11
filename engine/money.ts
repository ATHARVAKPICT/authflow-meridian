// ============================================================
// AuthFlow – Money Math Engine (pure TS, no LLM)
// ============================================================
// All monetary calculations are here. The LLM never does arithmetic.
// All amounts are in INR (whole numbers, integer arithmetic via Math.round).

import type { BillLine, Policy, Estimate, MultiPolicyOption } from '../types';

/**
 * PROPORTIONATE DEDUCTION HEADS (subject to proportionate reduction
 * when the patient books a room above their cap).
 */
export const PROPORTIONATE_HEADS = [
  'nursing',
  'ot',
  'surgeon',
  'anaesthetist',
  'consultation',
] as const;

/**
 * NON-PAYABLE CONSUMABLES (abbreviated sample list – illustrative).
 */
export const NON_PAYABLE_CONSUMABLES = [
  'gloves',
  'masks',
  'admission kit',
  'attendant charges',
  'telephone charges',
  'television charges',
  'toiletries',
  'diapers',
];

/**
 * Compute room-rent cap per day from policy.
 */
export function roomRentCapPerDay(policy: Policy): number {
  return Math.round(policy.sumInsured * policy.roomRentCapPctPerDay);
}

/**
 * Compute ICU cap per day from policy.
 */
export function icuCapPerDay(policy: Policy): number {
  return Math.round(policy.sumInsured * policy.icuCapPctPerDay);
}

/**
 * Compute the proportionate factor when room billed > cap.
 * factor = min(billedPerDay, cap) / billedPerDay
 * = cap / billedPerDay  (when billed > cap)
 */
export function proportionFactor(billedPerDay: number, capPerDay: number): number {
  if (billedPerDay <= capPerDay) return 1;
  return capPerDay / billedPerDay;
}

/**
 * Main estimate computation (deterministic).
 * Returns a full Estimate object.
 */
export function computeEstimate(
  bill: BillLine[],
  policy: Policy,
  roomPerDay: number,
  nights: number
): Estimate {
  const cap = roomRentCapPerDay(policy);

  // ── Room ──────────────────────────────────────────────────
  const roomBilled = roomPerDay * nights;
  const roomPayable = Math.min(roomBilled, cap * nights);

  // ── Proportion factor ──────────────────────────────────────
  const pf = proportionFactor(roomPerDay, cap);

  // ── Categorise bill lines ─────────────────────────────────
  let propBilled = 0; // sum of proportionate heads (excl room)
  let propPayable = 0;
  let nonPropBilled = 0;
  let nonPropPayable = 0;
  let consumablesNonPayable = 0;

  const breakdown: Estimate['breakdown'] = [];

  // Room line
  breakdown.push({
    label: 'Room Rent',
    billed: roomBilled,
    payable: roomPayable,
    reason: pf < 1 ? `Cap ₹${cap}/day; billed ₹${roomPerDay}/day` : 'Within cap',
  });

  for (const line of bill) {
    if (line.category === 'room') continue; // handled above

    if (line.category === 'consumables') {
      // Non-payable
      consumablesNonPayable += line.amount;
      breakdown.push({
        label: line.description,
        billed: line.amount,
        payable: 0,
        reason: 'Non-payable consumable',
      });
      continue;
    }

    if (PROPORTIONATE_HEADS.includes(line.category as (typeof PROPORTIONATE_HEADS)[number])) {
      const payable = Math.round(line.amount * pf);
      propBilled += line.amount;
      propPayable += payable;
      breakdown.push({
        label: line.description,
        billed: line.amount,
        payable,
        reason: pf < 1 ? `Proportionate: ${Math.round(pf * 1000) / 10}%` : 'Full',
      });
    } else {
      // Non-proportionate: implants, medicines, diagnostics
      nonPropBilled += line.amount;
      nonPropPayable += line.amount;
      breakdown.push({
        label: line.description,
        billed: line.amount,
        payable: line.amount,
        reason: 'Not subject to proportionate deduction',
      });
    }
  }

  const totalBilled = roomBilled + propBilled + nonPropBilled + consumablesNonPayable;
  let totalPayable = roomPayable + propPayable + nonPropPayable;

  // Apply co-pay
  totalPayable = Math.round(totalPayable * (1 - policy.coPayPct));

  const patientLiability = totalBilled - totalPayable;

  return {
    totalBilled,
    totalPayable,
    patientLiability,
    roomRentPayable: roomPayable,
    proportionFactor: pf,
    breakdown,
  };
}

/**
 * Compute estimate for standard room (cap exactly met).
 * Used to show the patient's saving from choosing a standard room.
 */
export function computeStandardRoomEstimate(
  bill: BillLine[],
  policy: Policy,
  nights: number
): Estimate {
  const cap = roomRentCapPerDay(policy);
  return computeEstimate(bill, policy, cap, nights); // billed = cap = no proportionate penalty
}

/**
 * Room-choice saving = patient liability (deluxe) − patient liability (standard).
 */
export function roomChoiceSaving(
  deluxeEstimate: Estimate,
  standardEstimate: Estimate
): number {
  return deluxeEstimate.patientLiability - standardEstimate.patientLiability;
}

/**
 * Multi-policy coordination (Case 4).
 * Returns an array of options.
 */
export function computeMultiPolicyOptions(
  totalEstimate: number,
  policyA: Policy,
  policyB: Policy
): MultiPolicyOption[] {
  const siA = policyA.balanceSumInsured;
  const siB = policyB.balanceSumInsured;
  const coPayA = policyA.coPayPct;

  // Option A only
  const aOnlyPayable = Math.min(Math.round(totalEstimate * (1 - coPayA)), siA);
  const aOnlyLiability = totalEstimate - aOnlyPayable;

  // Option B only
  const bOnlyPayable = Math.min(totalEstimate, siB);
  const bOnlyLiability = totalEstimate - bOnlyPayable;

  // Option B first, then A for balance (assumption – insurer coordination rules vary)
  const bPays = Math.min(totalEstimate, siB);
  const balanceAfterB = totalEstimate - bPays;
  const aPaysBalance = Math.min(Math.round(balanceAfterB * (1 - coPayA)), siA);
  const abLiability = totalEstimate - bPays - aPaysBalance;

  return [
    {
      label: 'Option A only',
      description: `${policyA.product} (${Math.round(coPayA * 100)}% co-pay)`,
      policyAPayable: aOnlyPayable,
      policyBPayable: 0,
      patientLiability: aOnlyLiability,
    },
    {
      label: 'Option B only',
      description: `${policyB.product} (0% co-pay, up to ₹${siB.toLocaleString('en-IN')})`,
      policyAPayable: 0,
      policyBPayable: bOnlyPayable,
      patientLiability: bOnlyLiability,
    },
    {
      label: 'Option B first, then A for balance',
      description: 'B pays up to its SI, A covers 80% of the remainder (assumption)',
      policyAPayable: aPaysBalance,
      policyBPayable: bPays,
      patientLiability: abLiability,
      isAssumption: true,
    },
  ];
}

/**
 * Tariff disallowance check (Rule R10).
 * Returns the amount disallowed per night.
 */
export function tariffDisallowance(
  billedRate: number,
  empanelledRate: number,
  nights: number
): number {
  if (billedRate <= empanelledRate) return 0;
  return (billedRate - empanelledRate) * nights;
}

/**
 * Format a number as Indian Rupee string.
 */
export function inr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
