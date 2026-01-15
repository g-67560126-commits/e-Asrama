
export enum AppType {
  OUTING = 'Outing',
  BERMALAM = 'Pulang Bermalam',
  MC = 'MC (Cuti Sakit)'
}

export enum AppStatus {
  PENDING = 'Menunggu Kelulusan',
  APPROVED = 'Diluluskan',
  REJECTED = 'Tidak Diluluskan'
}

export interface Application {
  id: string;
  type: AppType;
  studentName: string;
  studentForm: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  vehicleType: string;
  vehiclePlate: string;
  dateOut: string;
  dateReturn: string;
  reason: string;
  attachment?: string; // base64 string
  status: AppStatus;
  wardenComment?: string;
  wardenName?: string;
  wardenPhone?: string;
  createdAt: string;
}

export type UserRole = 'parent' | 'warden' | 'superadmin';

export interface User {
  role: UserRole;
  name?: string;
  phone?: string;
  id?: string;
}

export interface WardenUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  password?: string;
}

export interface SystemConfig {
  name: string;
  logoUrl: string | null;
}
