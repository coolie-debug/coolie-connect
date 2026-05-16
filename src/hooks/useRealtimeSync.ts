import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/app-store";

/**
 * useRealtimeSync
 * Subscribes to Supabase Realtime on bookings, sos_alerts, and transactions.
 * Updates the Zustand store whenever a row is inserted or updated.
 * Must be called once at the app root level.
 */
export function useRealtimeSync() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { _patchBooking, _patchCoolie, _addTransaction, _addSOS, _removeSOS, initFromSupabase } = useAppStore();

  useEffect(() => {
    // Initial load
    initFromSupabase();

    // Subscribe to realtime
    const channel = supabase
      .channel("coolie-mitr-realtime")

      // ── Bookings ──────────────────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          _patchBooking(rowToBooking(payload.new as Record<string, unknown>));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        (payload) => {
          _patchBooking(rowToBooking(payload.new as Record<string, unknown>));
        }
      )

      // ── Profiles (coolie status / availability) ────────────────────────────
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.role === "coolie") {
            _patchCoolie({
              id: row.id as string,
              name: row.name as string,
              contact: (row.contact as string) ?? "",
              station: (row.station as string) ?? "",
              badge: (row.badge as string) ?? "",
              status: (row.coolie_status as "pending" | "active" | "rejected") ?? "pending",
              available: row.available as boolean,
              avatar: row.avatar as string,
              documents: (row.documents as string[]) ?? [],
              earnings: Number(row.earnings ?? 0),
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.role === "coolie") {
            _patchCoolie({
              id: row.id as string,
              name: row.name as string,
              contact: (row.contact as string) ?? "",
              station: (row.station as string) ?? "",
              badge: (row.badge as string) ?? "",
              status: (row.coolie_status as "pending" | "active" | "rejected") ?? "pending",
              available: row.available as boolean,
              avatar: row.avatar as string,
              documents: (row.documents as string[]) ?? [],
              earnings: Number(row.earnings ?? 0),
            });
          }
        }
      )

      // ── Transactions ──────────────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          const r = payload.new as Record<string, unknown>;
          _addTransaction({
            id: r.id as string,
            tripId: r.trip_id as string,
            time: new Date(r.created_at as string).getTime(),
            total: Number(r.total),
            adminShare: Number(r.admin_share),
            coolieShare: Number(r.coolie_share),
            passengerName: r.passenger_name as string,
            coolieId: (r.coolie_id as string) ?? undefined,
            coolieName: (r.coolie_name as string) ?? undefined,
            type: r.type as "escrow" | "release" | "refund" | "topup",
          });
        }
      )

      // ── SOS Alerts ────────────────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sos_alerts" },
        (payload) => {
          const r = payload.new as Record<string, unknown>;
          _addSOS({
            id: r.id as string,
            coolieId: r.coolie_id as string,
            time: new Date(r.created_at as string).getTime(),
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sos_alerts" },
        (payload) => {
          const r = payload.new as Record<string, unknown>;
          if (r.resolved === true) _removeSOS(r.id as string);
        }
      )

      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Coolie Mitr] Realtime connected ✓");
        }
        if (status === "CHANNEL_ERROR") {
          console.warn("[Coolie Mitr] Realtime channel error — changes won't sync live");
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, []);
}

// ── Local row mapper (duplicated from store to avoid circular imports) ─────────
function rowToBooking(r: Record<string, unknown>) {
  return {
    id: r.id as string,
    passengerName: r.passenger_name as string,
    passengerAvatar: r.passenger_avatar as string,
    trainNumber: r.train_number as string,
    trainName: r.train_name as string,
    arrivalStation: r.arrival_station as string,
    departureStation: r.departure_station as string,
    platform: r.platform as string,
    bogie: r.bogie as string,
    luggageCount: r.luggage_count as number,
    serviceMode: r.service_mode as "platform" | "bogie",
    status: r.status as import("@/store/app-store").BookingStatus,
    otp: r.otp as string,
    createdAt: new Date(r.created_at as string).getTime(),
    fare: Number(r.fare),
    assignedCoolieId: (r.assigned_coolie_id as string) ?? undefined,
    luggagePhoto: (r.luggage_photo_url as string) ?? undefined,
  };
}
