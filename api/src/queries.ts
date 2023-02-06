/**
 * MySQL queries
 */

import { Pool } from "mysql2/promise";

type HookSQL = {
  Id: number;
  Url: string;
};

export const listHooks = async (
  pool: Pool,
  eventType: string
): Promise<Array<{ url: string; id: number }>> => {
  const [rows] = await pool.query(
    "SELECT H.Id, H.Url FROM Hooks H LEFT JOIN HookEventTypes HE ON H.EventType = HE.Id WHERE HE.Name = ?",
    [eventType]
  );
  if (!rows || !Array.isArray(rows)) return [];
  if (rows.length === 0) return [];
  const data = rows as HookSQL[];
  return data.map((r) => ({
    id: r.Id,
    url: r.Url,
  }));
};

export const validateIncomingEventType = async (
  pool: Pool,
  eventType: string
): Promise<boolean> => {
  const [rows] = await pool.query(
    "SELECT Id FROM HookEventTypes WHERE Name = ?",
    [eventType]
  );
  if (!rows || !Array.isArray(rows)) return false;
  if (rows.length === 0) return false;

  return true;
};
