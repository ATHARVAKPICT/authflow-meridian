// ============================================================
// AuthFlow – SLA Clock Engine (pure TS, no LLM)
// ============================================================

import type { SLAClock, DelayEntry, PayerEvent } from '../types';

export const SLA_PREAUTH_MINUTES = 60; // IRDAI mandate: 1 hour
export const SLA_FINAL_AUTH_MINUTES = 180; // IRDAI mandate: 3 hours

/**
 * Creates a new SLA clock.
 */
export function createSLAClock(name: string, deadlineMinutes: number, startedAt?: string): SLAClock {
  return {
    name,
    startedAt: startedAt ?? new Date().toISOString(),
    deadlineMinutes,
  };
}

/**
 * Computes elapsed minutes for a clock.
 */
export function elapsedMinutes(clock: SLAClock, now?: Date): number {
  const start = new Date(clock.startedAt);
  const end = clock.completedAt ? new Date(clock.completedAt) : (now ?? new Date());
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

/**
 * Returns remaining minutes (negative = breached).
 */
export function remainingMinutes(clock: SLAClock, now?: Date): number {
  return clock.deadlineMinutes - elapsedMinutes(clock, now);
}

/**
 * Returns true if SLA is breached.
 */
export function isBreached(clock: SLAClock, now?: Date): boolean {
  return remainingMinutes(clock, now) < 0;
}

/**
 * Compute how many minutes the insurer was late (for final auth).
 */
export function insurerDelayMinutes(clock: SLAClock): number {
  if (!clock.completedAt) return 0;
  const elapsed = elapsedMinutes(clock);
  return Math.max(0, elapsed - clock.deadlineMinutes);
}

/**
 * Build the delay ledger from payer events.
 * Extra charges for insurer delay: ₹500 per hour beyond the 3-hour limit.
 */
export function buildDelayLedger(events: PayerEvent[], finalAuthClock: SLAClock | undefined): DelayEntry[] {
  const entries: DelayEntry[] = [];

  if (finalAuthClock && finalAuthClock.completedAt) {
    const delayMins = insurerDelayMinutes(finalAuthClock);
    if (delayMins > 0) {
      const extraHours = delayMins / 60;
      const extraCharge = Math.round(extraHours * 500); // ₹500/hour illustrative rate

      entries.push({
        id: 'delay-insurer-final-auth',
        cause: 'insurer',
        description: `Final discharge authorisation exceeded IRDAI 3-hour SLA by ${delayMins} minutes. Extra ward charges are insurer-attributable.`,
        from: finalAuthClock.startedAt,
        to: finalAuthClock.completedAt,
        minutesLost: delayMins,
        extraCharge,
      });
    }
  }

  return entries;
}

/**
 * Format minutes as "Xh Ym".
 */
export function formatMinutes(mins: number): string {
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  const sign = mins < 0 ? '-' : '';
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}
