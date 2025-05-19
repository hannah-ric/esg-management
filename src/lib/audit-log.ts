import { supabase } from "./supabase";
import { logger } from "./logger";

export interface AuditLogEntry {
  id?: string;
  entity_type: string;
  entity_id: string;
  action: "create" | "update" | "delete" | "view";
  user_id: string;
  user_role?: string | null;
  timestamp: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  source: string;
}

/**
 * Record an audit log entry.
 * This function should be called whenever ESG data changes.
 */
export async function recordAuditLog(
  params: Omit<AuditLogEntry, "id" | "timestamp" | "user_id" | "user_role">,
): Promise<boolean> {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("User not authenticated");
    const entry: AuditLogEntry = {
      ...params,
      user_id: user.id,
      user_role: (user.user_metadata as any)?.role ?? null,
      timestamp: new Date().toISOString(),
    };
    const { error } = await supabase.from("audit_logs").insert(entry);
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error("Failed to record audit log", error);
    return false;
  }
}

export interface AuditLogFilters {
  entityType?: string;
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
}

/**
 * Query audit logs with optional filters.
 */
export async function queryAuditLogs(
  filters: AuditLogFilters = {},
): Promise<AuditLogEntry[]> {
  try {
    let query = supabase.from("audit_logs").select("*");
    if (filters.entityType) query = query.eq("entity_type", filters.entityType);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.action) query = query.eq("action", filters.action);
    if (filters.from) query = query.gte("timestamp", filters.from);
    if (filters.to) query = query.lte("timestamp", filters.to);
    const { data, error } = await query.order("timestamp", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error("Failed to query audit logs", error);
    return [];
  }
}

/**
 * Export audit logs to a CSV string.
 */
export function exportAuditLogsCsv(entries: AuditLogEntry[]): string {
  const headers = [
    "timestamp",
    "entity_type",
    "entity_id",
    "action",
    "user_id",
    "user_role",
    "source",
    "before",
    "after",
  ];
  const rows = entries.map((e) =>
    [
      e.timestamp,
      e.entity_type,
      e.entity_id,
      e.action,
      e.user_id,
      e.user_role ?? "",
      e.source,
      JSON.stringify(e.before ?? {}),
      JSON.stringify(e.after ?? {}),
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Export audit logs to a simple PDF. Uses dynamic import to avoid increasing
 * bundle size if PDF generation is unused.
 */
export async function exportAuditLogsPdf(
  entries: AuditLogEntry[],
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  let page = doc.addPage();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();
  let y = height - 20;
  page.drawText("Audit Log Report", { x: 50, y, size: 16, font });
  y -= 30;
  for (const entry of entries) {
    const line = `${entry.timestamp} ${entry.action} ${entry.entity_type} ${entry.entity_id}`;
    page.drawText(line, { x: 50, y, size: 10, font });
    y -= 12;
    if (y < 40) {
      page = doc.addPage();
      y = page.getSize().height - 20;
    }
  }
  return doc.save();
}
