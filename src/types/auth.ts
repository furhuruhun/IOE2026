export type UserRole = "peserta" | "panitia";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  institution: string | null;
  phone: string | null;
  domicile: string | null;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface GoogleLoginRequestBody {
  idToken: string;
}

// Shape Workers mengembalikan token+user — token TIDAK PERNAH diteruskan ke client,
// Route Handler strip token sebelum kirim balik. Lihat AUTH_IMPLEMENTATION.md §3.
export interface WorkersAuthResponseData {
  token: string;
  user: User;
  isNewUser?: boolean;
}

export interface AuthResponseData {
  user: User;
}

export interface GoogleAuthResponseData extends AuthResponseData {
  isNewUser: boolean;
}
