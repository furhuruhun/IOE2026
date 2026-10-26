export interface Bindings {
  DB: D1Database;
  FILES: R2Bucket;
  JWT_SECRET: string;
  JWT_TTL_SECONDS?: string;
  FILE_SIGNING_SECRET: string;
  FILE_URL_TTL_SECONDS?: string;
  GOOGLE_CLIENT_ID: string;
  APP_TZ?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "peserta" | "panitia";
  name: string;
}

export interface Variables {
  user?: AuthUser;
  requestId: string;
}

export type AppContext = {
  Bindings: Bindings;
  Variables: Variables;
};
