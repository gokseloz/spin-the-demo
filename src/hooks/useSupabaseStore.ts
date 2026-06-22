import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Participant, Spin } from "../types";
import { TEAM_MEMBERS } from "../data/team";

type DbParticipant = {
  id: string;
  name: string;
  emoji: string;
  active: boolean;
  created_at: string;
};

type DbSpin = {
  id: string;
  participant_id: string | null;
  participant_name: string;
  spun_at: string;
};

const toParticipant = (r: DbParticipant): Participant => ({
  id: r.id,
  name: r.name,
  emoji: r.emoji,
  active: r.active,
  createdAt: r.created_at,
});

const toSpin = (r: DbSpin): Spin => ({
  id: r.id,
  participantId: r.participant_id ?? "",
  participantName: r.participant_name,
  spunAt: r.spun_at,
});

export function useSupabaseStore(enabled: boolean) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !enabled) return;
    const [pRes, sRes] = await Promise.all([
      supabase
        .from("participants")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("spins")
        .select("*")
        .order("spun_at", { ascending: false })
        .limit(100),
    ]);
    if (pRes.error) console.error("Failed to load participants", pRes.error);
    if (sRes.error) console.error("Failed to load spins", sRes.error);
    if (pRes.data) setParticipants(pRes.data.map(toParticipant));
    if (sRes.data) setSpins(sRes.data.map(toSpin));
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (!supabase || !enabled) return;
    // Initial fetch + realtime subscription. The setState inside `refresh`
    // is the intended cross-system synchronization for this hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const channel = supabase
      .channel("spin-the-demo")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spins" },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, [enabled, refresh]);

  const addParticipant = async (name: string, emoji: string) => {
    if (!supabase) return;
    const optimisticParticipant: Participant = {
      id: crypto.randomUUID(),
      name,
      emoji,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setParticipants((current) => [...current, optimisticParticipant]);

    const { data, error } = await supabase
      .from("participants")
      .insert({ name, emoji, active: true })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to add participant", error);
      setParticipants((current) =>
        current.filter(({ id }) => id !== optimisticParticipant.id),
      );
      return;
    }

    setParticipants((current) =>
      current.map((participant) =>
        participant.id === optimisticParticipant.id
          ? toParticipant(data as DbParticipant)
          : participant,
      ),
    );
  };

  const updateParticipant = async (id: string, patch: Partial<Participant>) => {
    if (!supabase) return;
    const previous = participants.find((participant) => participant.id === id);
    const dbPatch: Record<string, unknown> = {};
    const optimisticPatch: Partial<Participant> = {};
    if (patch.name !== undefined) {
      dbPatch.name = patch.name;
      optimisticPatch.name = patch.name;
    }
    if (patch.emoji !== undefined) {
      dbPatch.emoji = patch.emoji;
      optimisticPatch.emoji = patch.emoji;
    }
    if (patch.active !== undefined) {
      dbPatch.active = patch.active;
      optimisticPatch.active = patch.active;
    }
    if (Object.keys(dbPatch).length === 0) return;

    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id
          ? { ...participant, ...optimisticPatch }
          : participant,
      ),
    );

    const { error } = await supabase
      .from("participants")
      .update(dbPatch)
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to update participant", error);
      if (previous) {
        const rollback: Partial<Participant> = {};
        if (patch.name !== undefined) rollback.name = previous.name;
        if (patch.emoji !== undefined) rollback.emoji = previous.emoji;
        if (patch.active !== undefined) rollback.active = previous.active;
        setParticipants((current) =>
          current.map((participant) =>
            participant.id === id
              ? { ...participant, ...rollback }
              : participant,
          ),
        );
      }
    }
  };

  const deleteParticipant = async (id: string) => {
    if (!supabase) return;
    const removed = participants.find((participant) => participant.id === id);
    setParticipants((current) =>
      current.filter((participant) => participant.id !== id),
    );

    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", id)
      .select("id")
      .single();
    if (error) {
      console.error("Failed to delete participant", error);
      if (removed) {
        setParticipants((current) =>
          [...current, removed].sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt),
          ),
        );
      }
    }
  };

  const setActive = (id: string, active: boolean) =>
    updateParticipant(id, { active });

  const recordSpin = async (participant: Participant) => {
    if (!supabase) return;
    await supabase.from("spins").insert({
      participant_id: participant.id,
      participant_name: participant.name,
    });
    await refresh();
  };

  const clearHistory = async () => {
    if (!supabase) return;
    await supabase.from("spins").delete().not("id", "is", null);
    await refresh();
  };

  const deleteSpin = async (id: string) => {
    if (!supabase) return;
    await supabase.from("spins").delete().eq("id", id);
    await refresh();
  };

  const resetRound = async () => {
    if (!supabase) return;
    const { error: spinsError } = await supabase
      .from("spins")
      .delete()
      .not("id", "is", null);
    if (spinsError) {
      console.error("Failed to clear spins", spinsError);
      return;
    }

    const { error: participantsError } = await supabase
      .from("participants")
      .delete()
      .not("id", "is", null);
    if (participantsError) {
      console.error("Failed to reset participants", participantsError);
      return;
    }

    const createdAt = Date.now();
    const { error: insertError } = await supabase.from("participants").insert(
      TEAM_MEMBERS.map((member, index) => ({
        ...member,
        active: true,
        created_at: new Date(createdAt + index).toISOString(),
      })),
    );
    if (insertError) console.error("Failed to restore team", insertError);
    await refresh();
  };

  return {
    participants,
    spins,
    loading,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    setActive,
    recordSpin,
    clearHistory,
    deleteSpin,
    resetRound,
  };
}
