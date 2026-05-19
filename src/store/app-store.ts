import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Role = "passenger" | "coolie" | "admin";
export type CoolieStatus = "pending" | "active" | "rejected";
export type BookingStatus = "pending" | "requested" | "assigned" | "in_progress" | "completed" | "cancelled";

export const FARE_PER_BAG = 100;
export const ADMIN_CUT = 0.2;
export const ADMIN_PASSWORD = "ADMIN@2026";

export interface Coolie {
  id: string;
  name: string;
  contact: string;
  station: string;
  badge: string;
  status: CoolieStatus;
  available: boolean;
  avatar: string;
  documents: string[];
  earnings: number;
  address?: string;
  experience?: number;
  shift?: "day" | "night";
  dutyHours?: 12 | 24;
  guarantorNumber?: string;
  joiningDate?: string;
  aadhaarUrl?: string;
  bankPassbookUrl?: string;
  selfieUrl?: string;
}

export interface Booking {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  trainNumber: string;
  trainName: string;
  arrivalStation: string;
  departureStation: string;
  platform: string;
  bogie: string;
  luggageCount: number;
  serviceMode: "platform" | "bogie";
  status: BookingStatus;
  assignedCoolieId?: string;
  otp: string;
  createdAt: number;
  fare: number;
  customFare?: number;
  fareConfirmed: boolean;
  luggagePhoto?: string;
}

export interface ParcelBooking {
  id: string;
  senderName: string;
  senderAddress: string;
  receiverMobile: string;
  sourceStation: string;
  destinationStation: string;
  cargoDescription: string;
  weightKg: number;
  senderPhotoUrl?: string;
  parcelPhotoUrl?: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  fareEstimate: number;
  createdAt: number;
}

export interface Txn {
  id: string;
  tripId: string;
  time: number;
  total: number;
  adminShare: number;
  coolieShare: number;
  passengerName: string;
  coolieId?: string;
  coolieName?: string;
  type: "escrow" | "release" | "refund" | "topup";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));
const uid = () => Math.random().toString(36).slice(2, 9);

function rowToBooking(r: Record<string, unknown>): Booking {
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
    status: r.status as BookingStatus,
    otp: r.otp as string,
    createdAt: new Date(r.created_at as string).getTime(),
    fare: Number(r.fare),
    customFare: r.custom_fare != null ? Number(r.custom_fare) : undefined,
    fareConfirmed: Boolean(r.fare_confirmed ?? false),
    assignedCoolieId: (r.assigned_coolie_id as string) ?? undefined,
    luggagePhoto: (r.luggage_photo_url as string) ?? undefined,
  };
}

function rowToCoolie(r: Record<string, unknown>): Coolie {
  return {
    id: r.id as string,
    name: r.name as string,
    contact: (r.contact as string) ?? "",
    station: (r.station as string) ?? "",
    badge: (r.badge as string) ?? "",
    status: (r.coolie_status as CoolieStatus) ?? "pending",
    available: r.available as boolean,
    avatar: r.avatar as string,
    documents: (r.documents as string[]) ?? [],
    earnings: Number(r.earnings ?? 0),
    address: (r.address as string) ?? undefined,
    experience: r.experience != null ? Number(r.experience) : undefined,
    shift: (r.shift as "day" | "night") ?? undefined,
  };
}

function rowToTxn(r: Record<string, unknown>): Txn {
  return {
    id: r.id as string,
    tripId: r.trip_id as string,
    time: new Date(r.created_at as string).getTime(),
    total: Number(r.total),
    adminShare: Number(r.admin_share),
    coolieShare: Number(r.coolie_share),
    passengerName: r.passenger_name as string,
    coolieId: (r.coolie_id as string) ?? undefined,
    coolieName: (r.coolie_name as string) ?? undefined,
    type: r.type as Txn["type"],
  };
}

// ─── Stations ─────────────────────────────────────────────────────────────────
const STATIONS = ["New Delhi (NDLS)", "Mumbai CST (CSMT)", "Howrah Junction (HWH)", "Chennai Central (MAS)", "Bengaluru City (SBC)"];

// ─── Store interface ───────────────────────────────────────────────────────────
interface AppState {
  role: Role;
  currentCoolieId: string | null;
  passengerProfile: { name: string; tier: string; avatar: string; payments: string[] };
  passengerWallet: number;
  passengerEscrow: number;
  adminWallet: number;
  coolieWallets: Record<string, number>;
  transactions: Txn[];
  coolies: Coolie[];
  bookings: Booking[];
  parcelBookings: ParcelBooking[];
  sosAlerts: { id: string; coolieId: string; time: number }[];
  dynamicFarePerBag: number;
  adminAuthenticated: boolean;
  loading: boolean;
  dbConnected: boolean;

  initFromSupabase: () => Promise<void>;
  setRole: (r: Role) => void;
  setCurrentCoolie: (id: string | null) => void;
  setAdminAuthenticated: (v: boolean) => void;

  // Coolie management
  registerCoolie: (c: Omit<Coolie, "id" | "status" | "available" | "earnings">) => Promise<string>;
  approveCoolie: (id: string) => Promise<void>;
  rejectCoolie: (id: string) => Promise<void>;

  // Booking management
  createBooking: (b: Omit<Booking, "id" | "status" | "otp" | "createdAt" | "passengerName" | "passengerAvatar" | "fare" | "fareConfirmed">) => Promise<{ id: string; error?: string }>;
  bookWithCoolie: (b: Omit<Booking, "id" | "status" | "otp" | "createdAt" | "passengerName" | "passengerAvatar" | "fare" | "fareConfirmed">, coolieId: string) => Promise<{ id: string; error?: string }>;
  assignBooking: (bookingId: string, coolieId: string) => Promise<void>;
  acceptBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (id: string, by?: "passenger" | "coolie" | "admin") => Promise<void>;
  verifyOtp: (bookingId: string, otp: string) => Promise<boolean>;
  completeBooking: (id: string) => Promise<void>;
  setCustomFare: (bookingId: string, amount: number) => Promise<void>;

  // Dynamic pricing
  setDynamicFare: (amount: number) => Promise<void>;

  // Parcel bookings
  submitParcel: (data: Omit<ParcelBooking, "id" | "status" | "fareEstimate" | "createdAt">) => Promise<string>;

  // Wallet
  addPassengerMoney: (amount: number) => Promise<void>;

  // SOS
  triggerSOS: (coolieId: string) => Promise<void>;
  clearSOS: (id: string) => Promise<void>;

  // Realtime patch helpers
  _patchBooking: (booking: Booking) => void;
  _patchCoolie: (coolie: Coolie) => void;
  _addTransaction: (txn: Txn) => void;
  _addSOS: (alert: { id: string; coolieId: string; time: number }) => void;
  _removeSOS: (id: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  role: "passenger",
  currentCoolieId: null,
  passengerProfile: {
    name: "Priya Verma",
    tier: "Platinum Yatri",
    avatar: "👩🏽‍💼",
    payments: ["•••• 4821 (HDFC)", "UPI: priya@okhdfc"],
  },
  passengerWallet: 500,
  passengerEscrow: 0,
  adminWallet: 0,
  coolieWallets: {},
  transactions: [],
  coolies: [],
  bookings: [],
  parcelBookings: [],
  sosAlerts: [],
  dynamicFarePerBag: FARE_PER_BAG,
  adminAuthenticated: false,
  loading: false,
  dbConnected: false,

  // ── Init ──────────────────────────────────────────────────────────────────
  initFromSupabase: async () => {
    set({ loading: true });
    try {
      const [profilesRes, bookingsRes, txnsRes, sosRes, configRes, parcelRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }),
        supabase.from("sos_alerts").select("*").eq("resolved", false).order("created_at", { ascending: false }),
        supabase.from("system_config").select("*").eq("key", "fare_per_bag").maybeSingle(),
        supabase.from("parcel_bookings").select("*").order("created_at", { ascending: false }),
      ]);

      if (profilesRes.error || bookingsRes.error) {
        console.warn("Supabase load failed, using seed data", profilesRes.error ?? bookingsRes.error);
        set({ loading: false, dbConnected: false });
        return;
      }

      const profiles = (profilesRes.data ?? []) as Record<string, unknown>[];
      const coolies = profiles.filter(p => p.role === "coolie").map(rowToCoolie);
      const adminProfile = profiles.find(p => p.role === "admin");
      const passengerProfile = profiles.find(p => p.id === "passenger-priya");

      const coolieWallets: Record<string, number> = {};
      coolies.forEach(c => {
        const row = profiles.find(p => p.id === c.id);
        if (row) coolieWallets[c.id] = Number(row.wallet_balance ?? 0);
      });

      const bookings = (bookingsRes.data ?? []).map(r => rowToBooking(r as Record<string, unknown>));
      const transactions = (txnsRes.data ?? []).map(r => rowToTxn(r as Record<string, unknown>));
      const sosAlerts = (sosRes.data ?? []).map(r => ({
        id: r.id as string, coolieId: r.coolie_id as string,
        time: new Date(r.created_at as string).getTime(),
      }));

      const dynamicFarePerBag = configRes.data
        ? Number((configRes.data as Record<string, unknown>).value ?? FARE_PER_BAG)
        : FARE_PER_BAG;

      const parcelBookings = (parcelRes.data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        senderName: r.sender_name as string,
        senderAddress: r.sender_address as string,
        receiverMobile: r.receiver_mobile as string,
        sourceStation: r.source_station as string,
        destinationStation: r.destination_station as string,
        cargoDescription: r.cargo_description as string,
        weightKg: Number(r.weight_kg),
        senderPhotoUrl: (r.sender_photo_url as string) ?? undefined,
        parcelPhotoUrl: (r.parcel_photo_url as string) ?? undefined,
        status: (r.status as ParcelBooking["status"]) ?? "pending",
        fareEstimate: Number(r.fare_estimate ?? 0),
        createdAt: new Date(r.created_at as string).getTime(),
      }));

      set({
        coolies,
        bookings,
        transactions, sosAlerts, parcelBookings, dynamicFarePerBag,
        coolieWallets,
        adminWallet: adminProfile ? Number(adminProfile.wallet_balance ?? 0) : 0,
        passengerWallet: passengerProfile ? Number(passengerProfile.wallet_balance ?? 500) : 500,
        passengerEscrow: passengerProfile ? Number(passengerProfile.escrow_balance ?? 0) : 0,
        loading: false, dbConnected: true,
      });
    } catch (err) {
      console.warn("Supabase init error, using seed data:", err);
      set({ loading: false, dbConnected: false });
    }
  },

  setRole: (role) => set({ role }),
  setCurrentCoolie: (id) => set({ currentCoolieId: id }),
  setAdminAuthenticated: (v) => set({ adminAuthenticated: v }),

  // ── Realtime patch helpers ─────────────────────────────────────────────────
  _patchBooking: (booking) => set((s) => {
    const idx = s.bookings.findIndex(b => b.id === booking.id);
    if (idx === -1) return { bookings: [booking, ...s.bookings] };
    const next = [...s.bookings]; next[idx] = booking;
    return { bookings: next };
  }),
  _patchCoolie: (coolie) => set((s) => {
    const idx = s.coolies.findIndex(c => c.id === coolie.id);
    if (idx === -1) return { coolies: [...s.coolies, coolie] };
    const next = [...s.coolies]; next[idx] = coolie;
    return { coolies: next };
  }),
  _addTransaction: (txn) => set((s) => ({ transactions: [txn, ...s.transactions] })),
  _addSOS: (alert) => set((s) => ({ sosAlerts: [alert, ...s.sosAlerts] })),
  _removeSOS: (id) => set((s) => ({ sosAlerts: s.sosAlerts.filter(a => a.id !== id) })),

  // ── Register Coolie ────────────────────────────────────────────────────────
  registerCoolie: async (c) => {
    const id = uid();
    const newCoolie: Coolie = { ...c, id, status: "pending", available: false, earnings: 0 };
    set((s) => ({
      coolies: [...s.coolies, newCoolie],
      coolieWallets: { ...s.coolieWallets, [id]: 0 },
      currentCoolieId: id,
    }));
    const { error } = await supabase.from("profiles").insert({
      id, role: "coolie", name: c.name, avatar: c.avatar, contact: c.contact,
      station: c.station, badge: c.badge, coolie_status: "pending", available: false,
      wallet_balance: 0, escrow_balance: 0, earnings: 0, documents: c.documents,
      address: c.address ?? null, experience: c.experience ?? null,
      shift: c.shift ?? null, duty_hours: c.dutyHours ?? null,
      guarantor_number: c.guarantorNumber ?? null, joining_date: c.joiningDate ?? null,
    });
    if (error) console.warn("registerCoolie DB error:", error.message);
    return id;
  },

  approveCoolie: async (id) => {
    set((s) => ({ coolies: s.coolies.map(c => c.id === id ? { ...c, status: "active", available: true } : c) }));
    await supabase.from("profiles").update({ coolie_status: "active", available: true }).eq("id", id);
  },

  rejectCoolie: async (id) => {
    set((s) => ({ coolies: s.coolies.map(c => c.id === id ? { ...c, status: "rejected" } : c) }));
    await supabase.from("profiles").update({ coolie_status: "rejected" }).eq("id", id);
  },

  // ── Create Booking ─────────────────────────────────────────────────────────
  createBooking: async (b) => {
    const { dynamicFarePerBag, passengerWallet, passengerProfile } = get();
    const fare = b.luggageCount * dynamicFarePerBag;
    if (passengerWallet < fare) return { id: "", error: `Insufficient balance. Need ₹${fare}, have ₹${passengerWallet}.` };
    const id = uid(); const otp = genOtp();
    const booking: Booking = { ...b, id, status: "pending", otp, createdAt: Date.now(), fare, fareConfirmed: false, passengerName: passengerProfile.name, passengerAvatar: passengerProfile.avatar };
    set((s) => ({
      bookings: [booking, ...s.bookings],
      passengerWallet: s.passengerWallet - fare, passengerEscrow: s.passengerEscrow + fare,
      transactions: [{ id: uid(), tripId: id.slice(0, 4).toUpperCase(), time: Date.now(), total: fare, adminShare: 0, coolieShare: 0, passengerName: passengerProfile.name, type: "escrow" }, ...s.transactions],
    }));
    await supabase.from("bookings").insert({ id, passenger_id: "passenger-priya", passenger_name: passengerProfile.name, passenger_avatar: passengerProfile.avatar, train_number: b.trainNumber, train_name: b.trainName, arrival_station: b.arrivalStation, departure_station: b.departureStation, platform: b.platform, bogie: b.bogie, luggage_count: b.luggageCount, service_mode: b.serviceMode, status: "pending", otp, fare, fare_confirmed: false, luggage_photo_url: b.luggagePhoto ?? null });
    await supabase.from("transactions").insert({ id: uid(), trip_id: id.slice(0, 4).toUpperCase(), booking_id: id, passenger_id: "passenger-priya", passenger_name: passengerProfile.name, total: fare, admin_share: 0, coolie_share: 0, type: "escrow" });
    await supabase.from("profiles").update({ wallet_balance: passengerWallet - fare, escrow_balance: get().passengerEscrow }).eq("id", "passenger-priya");
    return { id };
  },

  // ── Book with pre-selected Coolie ─────────────────────────────────────────
  bookWithCoolie: async (b, coolieId) => {
    const { dynamicFarePerBag, passengerWallet, passengerProfile } = get();
    const fare = b.luggageCount * dynamicFarePerBag;
    if (passengerWallet < fare) return { id: "", error: `Insufficient balance. Need ₹${fare}, have ₹${passengerWallet}.` };
    const id = uid(); const otp = genOtp();
    const booking: Booking = { ...b, id, status: "requested", otp, createdAt: Date.now(), fare, fareConfirmed: false, passengerName: passengerProfile.name, passengerAvatar: passengerProfile.avatar, assignedCoolieId: coolieId };
    set((s) => ({
      bookings: [booking, ...s.bookings],
      passengerWallet: s.passengerWallet - fare, passengerEscrow: s.passengerEscrow + fare,
      transactions: [{ id: uid(), tripId: id.slice(0, 4).toUpperCase(), time: Date.now(), total: fare, adminShare: 0, coolieShare: 0, passengerName: passengerProfile.name, type: "escrow" }, ...s.transactions],
    }));
    await supabase.from("bookings").insert({ id, passenger_id: "passenger-priya", passenger_name: passengerProfile.name, passenger_avatar: passengerProfile.avatar, train_number: b.trainNumber, train_name: b.trainName, arrival_station: b.arrivalStation, departure_station: b.departureStation, platform: b.platform, bogie: b.bogie, luggage_count: b.luggageCount, service_mode: b.serviceMode, status: "requested", otp, fare, fare_confirmed: false, assigned_coolie_id: coolieId, luggage_photo_url: b.luggagePhoto ?? null });
    await supabase.from("transactions").insert({ id: uid(), trip_id: id.slice(0, 4).toUpperCase(), booking_id: id, passenger_id: "passenger-priya", passenger_name: passengerProfile.name, total: fare, admin_share: 0, coolie_share: 0, type: "escrow" });
    await supabase.from("profiles").update({ wallet_balance: get().passengerWallet, escrow_balance: get().passengerEscrow }).eq("id", "passenger-priya");
    return { id };
  },

  // ── Set Custom Fare (admin/coolie quote override) ──────────────────────────
  setCustomFare: async (bookingId, amount) => {
    set((s) => ({ bookings: s.bookings.map(b => b.id === bookingId ? { ...b, customFare: amount, fareConfirmed: true } : b) }));
    await supabase.from("bookings").update({ custom_fare: amount, fare_confirmed: true }).eq("id", bookingId);
  },

  // ── Accept / Reject Booking ────────────────────────────────────────────────
  acceptBooking: async (bookingId) => {
    set((s) => ({ bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status: "assigned" } : b) }));
    await supabase.from("bookings").update({ status: "assigned" }).eq("id", bookingId);
  },

  rejectBooking: async (bookingId) => {
    set((s) => ({ bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status: "pending", assignedCoolieId: undefined } : b) }));
    await supabase.from("bookings").update({ status: "pending", assigned_coolie_id: null }).eq("id", bookingId);
  },

  // ── Assign Booking ─────────────────────────────────────────────────────────
  assignBooking: async (bookingId, coolieId) => {
    set((s) => ({
      bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status: "assigned", assignedCoolieId: coolieId } : b),
      coolies: s.coolies.map(c => c.id === coolieId ? { ...c, available: false } : c),
    }));
    await Promise.all([
      supabase.from("bookings").update({ status: "assigned", assigned_coolie_id: coolieId }).eq("id", bookingId),
      supabase.from("profiles").update({ available: false }).eq("id", coolieId),
    ]);
  },

  // ── Cancel Booking ─────────────────────────────────────────────────────────
  cancelBooking: async (id) => {
    const { bookings, passengerProfile } = get();
    const b = bookings.find(x => x.id === id);
    if (!b || ["completed", "cancelled"].includes(b.status)) return;
    const effectiveFare = b.customFare ?? b.fare;
    set((s) => ({
      bookings: s.bookings.map(x => x.id === id ? { ...x, status: "cancelled" } : x),
      passengerWallet: s.passengerWallet + effectiveFare,
      passengerEscrow: Math.max(0, s.passengerEscrow - effectiveFare),
      transactions: [{ id: uid(), tripId: b.id.slice(0, 4).toUpperCase(), time: Date.now(), total: effectiveFare, adminShare: 0, coolieShare: 0, passengerName: b.passengerName, type: "refund" }, ...s.transactions],
    }));
    if (b.assignedCoolieId) {
      set((s) => ({ coolies: s.coolies.map(c => c.id === b.assignedCoolieId ? { ...c, available: true } : c) }));
      await supabase.from("profiles").update({ available: true }).eq("id", b.assignedCoolieId);
    }
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    await supabase.from("transactions").insert({ id: uid(), trip_id: b.id.slice(0, 4).toUpperCase(), booking_id: id, passenger_id: "passenger-priya", passenger_name: passengerProfile.name, total: effectiveFare, admin_share: 0, coolie_share: 0, type: "refund" });
    await supabase.from("profiles").update({ wallet_balance: get().passengerWallet, escrow_balance: get().passengerEscrow }).eq("id", "passenger-priya");
  },

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  verifyOtp: async (bookingId, otp) => {
    const b = get().bookings.find(x => x.id === bookingId);
    if (!b || b.otp !== otp) return false;
    set((s) => ({ bookings: s.bookings.map(x => x.id === bookingId ? { ...x, status: "in_progress" } : x) }));
    await supabase.from("bookings").update({ status: "in_progress" }).eq("id", bookingId);
    await get().completeBooking(bookingId);
    return true;
  },

  // ── Complete Booking ───────────────────────────────────────────────────────
  completeBooking: async (id) => {
    const s = get();
    const b = s.bookings.find(x => x.id === id);
    if (!b || !b.assignedCoolieId || b.status === "completed") return;
    const effectiveFare = b.customFare ?? b.fare;
    const adminShare = Math.round(effectiveFare * ADMIN_CUT);
    const coolieShare = effectiveFare - adminShare;
    const coolieId = b.assignedCoolieId;
    const coolie = s.coolies.find(c => c.id === coolieId);
    set((state) => ({
      bookings: state.bookings.map(x => x.id === id ? { ...x, status: "completed" } : x),
      coolies: state.coolies.map(c => c.id === coolieId ? { ...c, available: true, earnings: c.earnings + coolieShare } : c),
      passengerEscrow: Math.max(0, state.passengerEscrow - effectiveFare),
      adminWallet: state.adminWallet + adminShare,
      coolieWallets: { ...state.coolieWallets, [coolieId]: (state.coolieWallets[coolieId] || 0) + coolieShare },
      transactions: [{ id: uid(), tripId: b.id.slice(0, 4).toUpperCase(), time: Date.now(), total: effectiveFare, adminShare, coolieShare, passengerName: b.passengerName, coolieId, coolieName: coolie?.name, type: "release" }, ...state.transactions],
    }));
    await Promise.all([
      supabase.from("bookings").update({ status: "completed" }).eq("id", id),
      supabase.from("profiles").update({ available: true, earnings: (coolie?.earnings ?? 0) + coolieShare, wallet_balance: (s.coolieWallets[coolieId] ?? 0) + coolieShare }).eq("id", coolieId),
      supabase.from("profiles").update({ wallet_balance: s.adminWallet + adminShare }).eq("id", "admin-main"),
      supabase.from("profiles").update({ escrow_balance: Math.max(0, s.passengerEscrow - effectiveFare) }).eq("id", "passenger-priya"),
      supabase.from("transactions").insert({ id: uid(), trip_id: b.id.slice(0, 4).toUpperCase(), booking_id: id, passenger_id: "passenger-priya", coolie_id: coolieId, passenger_name: b.passengerName, coolie_name: coolie?.name ?? null, total: effectiveFare, admin_share: adminShare, coolie_share: coolieShare, type: "release" }),
    ]);
  },

  // ── Dynamic Fare (Admin) ───────────────────────────────────────────────────
  setDynamicFare: async (amount) => {
    set({ dynamicFarePerBag: amount });
    await supabase.from("system_config").upsert({ key: "fare_per_bag", value: String(amount) }, { onConflict: "key" });
  },

  // ── Parcel Booking ─────────────────────────────────────────────────────────
  submitParcel: async (data) => {
    const id = uid();
    const fareEstimate = Math.round(data.weightKg * 15);
    const parcel: ParcelBooking = { ...data, id, status: "pending", fareEstimate, createdAt: Date.now() };
    set((s) => ({ parcelBookings: [parcel, ...s.parcelBookings] }));
    await supabase.from("parcel_bookings").insert({
      id, sender_name: data.senderName, sender_address: data.senderAddress,
      receiver_mobile: data.receiverMobile, source_station: data.sourceStation,
      destination_station: data.destinationStation, cargo_description: data.cargoDescription,
      weight_kg: data.weightKg, sender_photo_url: data.senderPhotoUrl ?? null,
      parcel_photo_url: data.parcelPhotoUrl ?? null, status: "pending", fare_estimate: fareEstimate,
    });
    return id;
  },

  // ── Wallet Top-up ──────────────────────────────────────────────────────────
  addPassengerMoney: async (amount) => {
    const { passengerProfile, passengerWallet } = get();
    set((s) => ({
      passengerWallet: s.passengerWallet + amount,
      transactions: [{ id: uid(), tripId: "TOPUP", time: Date.now(), total: amount, adminShare: 0, coolieShare: 0, passengerName: passengerProfile.name, type: "topup" }, ...s.transactions],
    }));
    await supabase.from("profiles").update({ wallet_balance: passengerWallet + amount }).eq("id", "passenger-priya");
    await supabase.from("transactions").insert({ id: uid(), trip_id: "TOPUP", passenger_id: "passenger-priya", passenger_name: passengerProfile.name, total: amount, admin_share: 0, coolie_share: 0, type: "topup" });
  },

  // ── SOS ───────────────────────────────────────────────────────────────────
  triggerSOS: async (coolieId) => {
    const coolie = get().coolies.find(c => c.id === coolieId);
    const id = uid();
    set((s) => ({ sosAlerts: [{ id, coolieId, time: Date.now() }, ...s.sosAlerts] }));
    await supabase.from("sos_alerts").insert({ id, coolie_id: coolieId, coolie_name: coolie?.name ?? "Unknown", station: coolie?.station ?? "Unknown", resolved: false });
  },

  clearSOS: async (id) => {
    set((s) => ({ sosAlerts: s.sosAlerts.filter(a => a.id !== id) }));
    await supabase.from("sos_alerts").update({ resolved: true }).eq("id", id);
  },
}));

export const STATIONS_LIST = STATIONS;
