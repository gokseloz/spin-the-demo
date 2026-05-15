import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Participant, Spin } from "../types";

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

export function useSupabaseStore() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase) return;
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
    if (pRes.data) setParticipants(pRes.data.map(toParticipant));
    if (sRes.data) setSpins(sRes.data.map(toSpin));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    if (!supabase) return;
    // Realtime: any change → refetch (simple & robust)
    const channel = supabase
      .channel("spin-the-demo")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spins" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, [refresh]);

  const addParticipant = async (name: string, emoji: string) => {
    if (!supabase) return;
    await supabase.from("participants").insert({ name, emoji, active: true });
    await refresh();
  };

  const updateParticipant = async (id: string, patch: Partial<Participant>) => {
    if (!supabase) return;
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.emoji !== undefined) dbPatch.emoji = patch.emoji;
    if (patch.active !== undefined) dbPatch.active = patch.active;
    await supabase.from("participants").update(dbPatch).eq("id", id);
    await refresh();
  };

  const deleteParticipant = async (id: string) => {
    if (!supabase) return;
    await supabase.from("participants").delete().eq("id", id);
    await refresh();
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

  return {
    participants,
    spins,
    loading,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    setActive,
    recordSpin,
  };
}
