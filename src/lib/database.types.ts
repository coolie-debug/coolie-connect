export type CoolieStatus = "pending" | "active" | "rejected";
export type BookingStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
export type ServiceMode = "platform" | "bogie";
export type TxnType = "escrow" | "release" | "refund" | "topup";
export type UserRole = "passenger" | "coolie" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          name: string;
          avatar: string;
          contact: string | null;
          station: string | null;
          badge: string | null;
          coolie_status: CoolieStatus | null;
          available: boolean;
          wallet_balance: number;
          escrow_balance: number;
          earnings: number;
          tier: string | null;
          documents: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          passenger_id: string;
          passenger_name: string;
          passenger_avatar: string;
          train_number: string;
          train_name: string;
          arrival_station: string;
          departure_station: string;
          platform: string;
          bogie: string;
          luggage_count: number;
          service_mode: ServiceMode;
          status: BookingStatus;
          otp: string;
          fare: number;
          assigned_coolie_id: string | null;
          luggage_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          trip_id: string;
          booking_id: string | null;
          passenger_id: string | null;
          coolie_id: string | null;
          passenger_name: string;
          coolie_name: string | null;
          total: number;
          admin_share: number;
          coolie_share: number;
          type: TxnType;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      sos_alerts: {
        Row: {
          id: string;
          coolie_id: string;
          coolie_name: string;
          station: string;
          resolved: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sos_alerts"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["sos_alerts"]["Insert"]>;
      };
    };
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type SosAlertRow = Database["public"]["Tables"]["sos_alerts"]["Row"];
