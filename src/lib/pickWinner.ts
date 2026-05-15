import type { Participant, Spin } from "../types";

/**
 * Returns participants eligible to be picked: must be active, and must not
 * appear in the most recent `excludeLastN` spins. If exclusion empties the
 * pool, fall back to all active participants.
 */
export function getEligible(
  participants: Participant[],
  spins: Spin[],
  excludeLastN: number,
): Participant[] {
  const active = participants.filter((p) => p.active);
  if (active.length === 0) return [];
  if (excludeLastN <= 0) return active;

  const recentIds = new Set(
    spins
      .slice()
      .sort((a, b) => b.spunAt.localeCompare(a.spunAt))
      .slice(0, excludeLastN)
      .map((s) => s.participantId),
  );

  const filtered = active.filter((p) => !recentIds.has(p.id));
  return filtered.length > 0 ? filtered : active;
}

export function pickWinner(eligible: Participant[]): Participant | null {
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}
