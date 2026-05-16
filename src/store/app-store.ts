import { create } from "zustand";

export type Role = "passenger" | "coolie" | "admin";
export type CoolieStatus = "pending" | "active" | "rejected";
export type BookingStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled";

export const FARE_PER_BAG = 100;
export const ADMIN_CUT = 0.2;

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
  luggagePhoto?: string; // dataURL
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

interface AppState {
  role: Role;
  currentCoolieId: string | null;
  passengerProfile: {
    name: string;
    tier: string;
    avatar: string;
    payments: string[];
  };
  passengerWallet: number;
  passengerEscrow: number;
  adminWallet: number;
  coolieWallets: Record<string, number>;
  transactions: Txn[];
  coolies: Coolie[];
  bookings: Booking[];
  sosAlerts: { id: string; coolieId: string; time: number }[];

  setRole: (r: Role) => void;
  setCurrentCoolie: (id: string | null) => void;

  registerCoolie: (c: Omit<Coolie, "id" | "status" | "available" | "earnings">) => string;
  approveCoolie: (id: string) => void;
  rejectCoolie: (id: string) => void;

  createBooking: (b: Omit<Booking, "id" | "status" | "otp" | "createdAt" | "passengerName" | "passengerAvatar" | "fare">) => { id: string; error?: string };
  assignBooking: (bookingId: string, coolieId: string) => void;
  cancelBooking: (id: string) => void;
  verifyOtp: (bookingId: string, otp: string) => boolean;
  completeBooking: (id: string) => void;

  addPassengerMoney: (amount: number) => void;
  triggerSOS: (coolieId: string) => void;
  clearSOS: (id: string) => void;
}

const STATIONS = ["New Delhi (NDLS)", "Mumbai CST (CSMT)", "Howrah Junction (HWH)", "Chennai Central (MAS)", "Bengaluru City (SBC)"];

const seedCoolies: Coolie[] = [
  { id: "c1", name: "Ramesh Kumar", contact: "+91 98765 43210", station: STATIONS[0], badge: "NDLS-0421", status: "active", available: true, avatar: "🧔🏽", documents: ["aadhaar.pdf", "police-verify.pdf"], earnings: 1240 },
  { id: "c2", name: "Suresh Yadav", contact: "+91 98123 11122", station: STATIONS[0], badge: "NDLS-0518", status: "active", available: true, avatar: "👨🏽‍🦱", documents: ["aadhaar.pdf"], earnings: 980 },
  { id: "c3", name: "Manoj Singh", contact: "+91 99887 76655", station: STATIONS[0], badge: "NDLS-0623", status: "pending", available: false, avatar: "🧑🏽", documents: ["aadhaar.pdf", "police-verify.pdf"], earnings: 0 },
  { id: "c4", name: "Vikram Patel", contact: "+91 90011 22334", station: STATIONS[1], badge: "CSMT-1102", status: "active", available: false, avatar: "👨🏽", documents: ["aadhaar.pdf"], earnings: 1560 },
];

const seedBookings: Booking[] = [
  { id: "b1", passengerName: "Anita Sharma", passengerAvatar: "👩🏽", trainNumber: "12951", trainName: "Mumbai Rajdhani", arrivalStation: STATIONS[0], departureStation: STATIONS[1], platform: "4", bogie: "B3", luggageCount: 3, serviceMode: "bogie", status: "pending", otp: "4821", createdAt: Date.now() - 60000, fare: 300 },
  { id: "b2", passengerName: "Rajiv Mehta", passengerAvatar: "👨🏽‍💼", trainNumber: "12181", trainName: "Dayodaya Express", arrivalStation: STATIONS[0], departureStation: STATIONS[3], platform: "7", bogie: "A1", luggageCount: 2, serviceMode: "platform", status: "pending", otp: "7193", createdAt: Date.now() - 30000, fare: 200 },
];

const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));
const uid = () => Math.random().toString(36).slice(2, 9);

export const useAppStore = create<AppState>((set, get) => ({
  role: "passenger",
  currentCoolieId: null,
  passengerProfile: {
    name: "Priya Verma",
    tier: "Platinum Yatri",
    avatar: "👩🏽‍💼",
    payments: ["•••• 4821 (HDFC)", "UPI: priya@okhdfc"],
  },
  passengerWallet: 2500,
  passengerEscrow: 0,
  adminWallet: 8420,
  coolieWallets: { c1: 1240, c2: 980, c4: 1560 },
  transactions: [
    { id: uid(), tripId: "T1023", time: Date.now() - 3600_000, total: 240, adminShare: 48, coolieShare: 192, passengerName: "Anita Sharma", coolieId: "c1", coolieName: "Ramesh Kumar", type: "release" },
    { id: uid(), tripId: "T1022", time: Date.now() - 7200_000, total: 400, adminShare: 80, coolieShare: 320, passengerName: "Rajiv Mehta", coolieId: "c4", coolieName: "Vikram Patel", type: "release" },
  ],
  coolies: seedCoolies,
  bookings: seedBookings,
  sosAlerts: [],

  setRole: (role) => set({ role }),
  setCurrentCoolie: (id) => set({ currentCoolieId: id }),

  registerCoolie: (c) => {
    const id = uid();
    set((s) => ({
      coolies: [...s.coolies, { ...c, id, status: "pending", available: false, earnings: 0 }],
      coolieWallets: { ...s.coolieWallets, [id]: 0 },
      currentCoolieId: id,
    }));
    return id;
  },
  approveCoolie: (id) => set((s) => ({ coolies: s.coolies.map(c => c.id === id ? { ...c, status: "active", available: true } : c) })),
  rejectCoolie: (id) => set((s) => ({ coolies: s.coolies.map(c => c.id === id ? { ...c, status: "rejected" } : c) })),

  createBooking: (b) => {
    const fare = b.luggageCount * FARE_PER_BAG;
    const { passengerWallet, passengerProfile } = get();
    if (passengerWallet < fare) {
      return { id: "", error: `Insufficient wallet balance. Need ₹${fare}, have ₹${passengerWallet}.` };
    }
    const id = uid();
    const booking: Booking = {
      ...b, id, status: "pending", otp: genOtp(), createdAt: Date.now(), fare,
      passengerName: passengerProfile.name, passengerAvatar: passengerProfile.avatar,
    };
    set((s) => ({
      bookings: [booking, ...s.bookings],
      passengerWallet: s.passengerWallet - fare,
      passengerEscrow: s.passengerEscrow + fare,
      transactions: [{ id: uid(), tripId: id.slice(0, 4).toUpperCase(), time: Date.now(), total: fare, adminShare: 0, coolieShare: 0, passengerName: passengerProfile.name, type: "escrow" }, ...s.transactions],
    }));
    return { id };
  },
  assignBooking: (bookingId, coolieId) => set((s) => ({
    bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status: "assigned", assignedCoolieId: coolieId } : b),
    coolies: s.coolies.map(c => c.id === coolieId ? { ...c, available: false } : c),
  })),
  cancelBooking: (id) => set((s) => {
    const b = s.bookings.find(x => x.id === id);
    if (!b || (b.status !== "pending" && b.status !== "assigned")) return {};
    return {
      bookings: s.bookings.map(x => x.id === id ? { ...x, status: "cancelled" } : x),
      passengerWallet: s.passengerWallet + b.fare,
      passengerEscrow: s.passengerEscrow - b.fare,
      transactions: [{ id: uid(), tripId: b.id.slice(0, 4).toUpperCase(), time: Date.now(), total: b.fare, adminShare: 0, coolieShare: 0, passengerName: b.passengerName, type: "refund" }, ...s.transactions],
    };
  }),
  verifyOtp: (bookingId, otp) => {
    const b = get().bookings.find(x => x.id === bookingId);
    if (!b || b.otp !== otp) return false;
    set((s) => ({ bookings: s.bookings.map(x => x.id === bookingId ? { ...x, status: "in_progress" } : x) }));
    // Auto-trigger wallet split on verify
    get().completeBooking(bookingId);
    return true;
  },
  completeBooking: (id) => set((s) => {
    const b = s.bookings.find(x => x.id === id);
    if (!b || !b.assignedCoolieId) return {};
    if (b.status === "completed") return {};
    const adminShare = Math.round(b.fare * ADMIN_CUT);
    const coolieShare = b.fare - adminShare;
    const coolieId = b.assignedCoolieId;
    const coolie = s.coolies.find(c => c.id === coolieId);
    return {
      bookings: s.bookings.map(x => x.id === id ? { ...x, status: "completed" } : x),
      coolies: s.coolies.map(c => c.id === coolieId ? { ...c, available: true, earnings: c.earnings + coolieShare } : c),
      passengerEscrow: s.passengerEscrow - b.fare,
      adminWallet: s.adminWallet + adminShare,
      coolieWallets: { ...s.coolieWallets, [coolieId]: (s.coolieWallets[coolieId] || 0) + coolieShare },
      transactions: [{
        id: uid(), tripId: b.id.slice(0, 4).toUpperCase(), time: Date.now(),
        total: b.fare, adminShare, coolieShare,
        passengerName: b.passengerName, coolieId, coolieName: coolie?.name, type: "release",
      }, ...s.transactions],
    };
  }),

  addPassengerMoney: (amount) => set((s) => ({
    passengerWallet: s.passengerWallet + amount,
    transactions: [{ id: uid(), tripId: "TOPUP", time: Date.now(), total: amount, adminShare: 0, coolieShare: 0, passengerName: s.passengerProfile.name, type: "topup" }, ...s.transactions],
  })),

  triggerSOS: (coolieId) => set((s) => ({ sosAlerts: [{ id: uid(), coolieId, time: Date.now() }, ...s.sosAlerts] })),
  clearSOS: (id) => set((s) => ({ sosAlerts: s.sosAlerts.filter(a => a.id !== id) })),
}));

export const STATIONS_LIST = STATIONS;
