import { useEffect, useState } from "react";
import type { Participant, Settings, Spin } from "../types";

const KEYS = {
  participants: "spin-the-demo:participants",
  spins: "spin-the-demo:spins",
  settings: "spin-the-demo:settings",
};

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: "1", name: "Göksel", emoji: "🎯", active: true, createdAt: now() },
  { id: "2", name: "Fedi", emoji: "🚀", active: true, createdAt: now() },
  { id: "3", name: "Ali", emoji: "⭐", active: true, createdAt: now() },
  { id: "4", name: "Dhruv", emoji: "🔥", active: true, createdAt: now() },
  { id: "5", name: "Martim", emoji: "🌊", active: true, createdAt: now() },
  { id: "6", name: "Pujitha", emoji: "🌸", active: true, createdAt: now() },
  { id: "7", name: "Abhishek", emoji: "⚡", active: true, createdAt: now() },
  { id: "8", name: "Sajahan", emoji: "🎨", active: true, createdAt: now() },
];

const DEFAULT_SETTINGS: Settings = {
  excludeLastN: 3,
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

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const resetAll = () => {
    setParticipants(DEFAULT_PARTICIPANTS);
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
    updateSettings,
    resetAll,
  };
}
