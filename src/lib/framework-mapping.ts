import { supabase } from "./supabase";
import { logger } from "./logger";

export interface FrameworkMetric {
  id: string;
  description: string;
  disclosures: string[];
}

export interface FrameworkDefinition {
  id: string;
  version: string;
  name: string;
  metrics: FrameworkMetric[];
}

/**
 * Load a framework definition by ID and version.
 * Definitions are stored in the `framework_definitions` table.
 */
export async function loadFrameworkDefinition(
  id: string,
  version: string,
): Promise<FrameworkDefinition | null> {
  try {
    const { data, error } = await supabase
      .from("framework_definitions")
      .select("*")
      .eq("id", id)
      .eq("version", version)
      .single();
    if (error) throw error;
    return (data as unknown) as FrameworkDefinition;
  } catch (error) {
    logger.error("Failed to load framework definition", error);
    return null;
  }
}

/**
 * Compare two framework definitions and return overlap statistics.
 */
export function compareFrameworks(a: FrameworkDefinition, b: FrameworkDefinition) {
  const metricsA = new Set(a.metrics.map((m) => m.id));
  const metricsB = new Set(b.metrics.map((m) => m.id));
  const overlap = Array.from(metricsA).filter((id) => metricsB.has(id));
  return {
    overlapCount: overlap.length,
    totalA: metricsA.size,
    totalB: metricsB.size,
  };
}
