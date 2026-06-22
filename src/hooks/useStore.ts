import { useLocalStore } from "./useLocalStore";
import { useSupabaseStore } from "./useSupabaseStore";
import { isSupabaseConfigured } from "../lib/supabase";
import type { Participant, Settings, Spin } from "../types";

export type StoreApi = {
  participants: Participant[];
  spins: Spin[];
  loading: boolean;
  addParticipant: (name: string, emoji: string) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  setActive: (id: string, active: boolean) => void;
  recordSpin: (p: Participant) => void;
  clearHistory: () => void;
  deleteSpin: (id: string) => void;
  resetRound: () => void;
};

export type ClientPrefs = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll?: () => void;
};

/**
 * Returns a unified store. When Supabase env vars are set AND the caller passes
 * `authed=true`, data flows through Supabase. Otherwise localStorage is used.
 * UI prefs (theme, sound) always live in localStorage.
 */
export function useStore(authed: boolean): StoreApi & ClientPrefs {
  const local = useLocalStore();
  const useRemote = isSupabaseConfigured && authed;
  const remote = useSupabaseStore(useRemote);

  if (useRemote) {
    return {
      participants: remote.participants,
      spins: remote.spins,
      loading: remote.loading,
      addParticipant: remote.addParticipant,
      updateParticipant: remote.updateParticipant,
      deleteParticipant: remote.deleteParticipant,
      setActive: remote.setActive,
      recordSpin: remote.recordSpin,
      clearHistory: remote.clearHistory,
      deleteSpin: remote.deleteSpin,
      resetRound: remote.resetRound,
      settings: local.settings,
      updateSettings: local.updateSettings,
    };
  }

  return {
    participants: local.participants,
    spins: local.spins,
    loading: false,
    addParticipant: local.addParticipant,
    updateParticipant: local.updateParticipant,
    deleteParticipant: local.deleteParticipant,
    setActive: local.setActive,
    recordSpin: local.recordSpin,
    clearHistory: local.clearHistory,
    deleteSpin: local.deleteSpin,
    resetRound: local.resetRound,
    settings: local.settings,
    updateSettings: local.updateSettings,
    resetAll: local.resetAll,
  };
}
