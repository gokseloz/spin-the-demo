import { useEffect, useState } from "react";
import type { Participant, Settings, Spin } from "../types";
import { TEAM_MEMBERS } from "../data/team";

const KEYS = {
  participants: "spin-the-demo:participants",
  spins: "spin-the-demo:spins",
  settings: "spin-the-demo:settings",
};

const createDefaultParticipants = (): Participant[] => {
  const createdAt = Date.now();
  return TEAM_MEMBERS.map((member, index) => ({
    id: String(index + 1),
    ...member,
    active: true,
    createdAt: new Date(createdAt + index).toISOString(),
  }));
};

const DEFAULT_PARTICIPANTS = createDefaultParticipants();

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  themeMode: "dark",
};

function now() {
  return new Date().toISOString();
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStore() {
  const [participants, setParticipants] = useState<Participant[]>(() =>
    load(KEYS.participants, DEFAULT_PARTICIPANTS),
  );
  const [spins, setSpins] = useState<Spin[]>(() => load(KEYS.spins, []));
  const [settings, setSettings] = useState<Settings>(() =>
    load(KEYS.settings, DEFAULT_SETTINGS),
  );

  useEffect(() => save(KEYS.participants, participants), [participants]);
  useEffect(() => save(KEYS.spins, spins), [spins]);
  useEffect(() => save(KEYS.settings, settings), [settings]);

  const addParticipant = (name: string, emoji: string) =>
    setParticipants((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, emoji, active: true, createdAt: now() },
    ]);

  const updateParticipant = (id: string, patch: Partial<Participant>) =>
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );

  const deleteParticipant = (id: string) =>
    setParticipants((prev) => prev.filter((p) => p.id !== id));

  const setActive = (id: string, active: boolean) =>
    updateParticipant(id, { active });

  const recordSpin = (participant: Participant) =>
    setSpins((prev) => [
      {
        id: crypto.randomUUID(),
        participantId: participant.id,
        participantName: participant.name,
        spunAt: now(),
      },
      ...prev,
    ]);

  const clearHistory = () => setSpins([]);

  const deleteSpin = (id: string) =>
    setSpins((prev) => prev.filter((s) => s.id !== id));

  const resetRound = () => {
    setParticipants(createDefaultParticipants());
    setSpins([]);
  };

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const resetAll = () => {
    setParticipants(createDefaultParticipants());
    setSpins([]);
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    participants,
    spins,
    settings,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    setActive,
    recordSpin,
    clearHistory,
    deleteSpin,
    resetRound,
    updateSettings,
    resetAll,
  };
}
