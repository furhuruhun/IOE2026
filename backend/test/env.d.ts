declare module "*?raw" {
  const content: string;
  export default content;
}

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    JWT_SECRET: string;
    FILE_SIGNING_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    JWT_TTL_SECONDS?: string;
    FILE_URL_TTL_SECONDS?: string;
    APP_TZ?: string;
  }
}
