export function generateTeamCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const alnum = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  const getRandom = (pool: string, len: number) => {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    let str = "";
    for (let i = 0; i < len; i++) {
      str += pool[bytes[i] % pool.length];
    }
    return str;
  };

  return `${getRandom(letters, 3)}-${getRandom(alnum, 4)}`;
}

export function newId(prefix?: string): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let randomHex = "";
  for (let i = 0; i < bytes.length; i++) {
    randomHex += bytes[i].toString(16).padStart(2, "0");
  }
  const ts = Date.now().toString(36);
  const id = `${ts}_${randomHex}`;
  return prefix ? `${prefix}_${id}` : id;
}
