// Rate limiting del worker, extraido de index.ts para poder testearlo y para
// dejar el store desacoplado.
//
// El store por defecto es en memoria (por isolate del worker): suficiente para
// frenar abuso basico, NO durable entre isolates/regiones. Para un control
// durable en produccion, implementar un RateLimitStore respaldado por KV o D1 y
// pasarlo a enforceRateLimit sin cambiar la logica de conteo.

export type RateLimitRecord = { count: number; resetAt: number };

export type RateLimitStore = {
  get(key: string): RateLimitRecord | undefined;
  set(key: string, value: RateLimitRecord): void;
};

export function createMemoryRateLimitStore(): RateLimitStore {
  const map = new Map<string, RateLimitRecord>();
  return {
    get: (key) => map.get(key),
    set: (key, value) => {
      map.set(key, value);
    },
  };
}

// Registra un golpe en la ventana y devuelve true si la clave SUPERA el limite
// (es decir, debe rechazarse). Reinicia el contador cuando la ventana expira.
export function hitRateLimit(store: RateLimitStore, key: string, limit: number, windowMs: number, now: number): boolean {
  const current = store.get(key);
  const next: RateLimitRecord =
    !current || current.resetAt <= now ? { count: 1, resetAt: now + windowMs } : { count: current.count + 1, resetAt: current.resetAt };
  store.set(key, next);
  return next.count > limit;
}

// Construye las claves de rate limit por IP, email y telefono (ya saneados).
export function rateLimitKeys(scope: string, parts: { ip: string; email?: string; phone?: string }): string[] {
  return [
    `${scope}:ip:${parts.ip}`,
    parts.email ? `${scope}:email:${parts.email}` : "",
    parts.phone ? `${scope}:phone:${parts.phone}` : "",
  ].filter(Boolean);
}
