// ============================================================
// AuthFlow – Delay Ledger Engine (pure TS, no LLM)
// ============================================================

import type { DelayEntry } from '../types';

/**
 * Compute total insurer-attributable delay minutes.
 */
export function totalInsurerDelay(entries: DelayEntry[]): number {
  return entries.filter(e => e.cause === 'insurer').reduce((sum, e) => sum + e.minutesLost, 0);
}

/**
 * Compute total extra charges attributable to insurer delay.
 */
export function totalInsurerExtraCharges(entries: DelayEntry[]): number {
  return entries
    .filter(e => e.cause === 'insurer' && e.extraCharge)
    .reduce((sum, e) => sum + (e.extraCharge ?? 0), 0);
}

/**
 * Generate a sample delay ledger for Case 1 (knee replacement).
 * Final auth took 4h 12m vs the 3-hour limit → 1h 12m insurer-attributable.
 * Extra ward charge at ₹1,500 for 72 minutes = ₹1,500 (illustrative flat charge).
 */
export function case1DelayLedger(): DelayEntry[] {
  const startedAt = new Date('2024-03-15T14:00:00+05:30').toISOString();
  const completedAt = new Date('2024-03-15T18:12:00+05:30').toISOString();

  return [
    {
      id: 'case1-delay-1',
      cause: 'insurer',
      description: 'Final discharge authorisation received 4h 12m after request (SLA: 3h). Extra ward charge for 72-minute delay.',
      from: startedAt,
      to: completedAt,
      minutesLost: 72,
      extraCharge: 1500,
    },
  ];
}
