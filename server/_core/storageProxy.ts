import type { Express } from "express";

// Legacy Manus storage proxy — no longer used (Supabase Storage returns public URLs directly)
export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", (_req, res) => {
    res.status(410).send("Storage proxy deprecated");
  });
}
