export type UserRole = "CUSTOMER" | "RESTAURANT_ADMIN" | "SUPERADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string | null;
  phone: string | null;
  companyId: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
