import type { Participant } from "../types";

/**
 * Returns participants eligible to be picked: must be active.
 */
export function getEligible(participants: Participant[]): Participant[] {
  return participants.filter((p) => p.active);
}

export function pickWinner(eligible: Participant[]): Participant | null {
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}
