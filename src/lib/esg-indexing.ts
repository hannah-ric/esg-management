import { supabase } from "./supabase";
import { logger } from "./logger";
import type { ESGDataPoint } from "./esg-data-services";

/**
 * Generate an embedding for the provided text using the Supabase edge
 * function `supabase-functions-embed-text`.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-embed-text",
      { body: { text } },
    );
    if (error) throw error;
    return (data as any).embedding as number[];
  } catch (error) {
    logger.error("Failed to generate embedding", error);
    return null;
  }
}

/**
 * Index an ESG data point for semantic search.
 * This stores the embedding in the `esg_data_embeddings` table.
 */
export async function indexESGDataPoint(dataPoint: ESGDataPoint): Promise<void> {
  const embedding = await generateEmbedding(
    `${dataPoint.metric_id} ${dataPoint.value} ${dataPoint.context ?? ""}`,
  );
  if (!embedding) return;
  try {
    const { error } = await supabase.from("esg_data_embeddings").upsert({
      data_point_id: dataPoint.id,
      embedding,
    });
    if (error) throw error;
  } catch (error) {
    logger.error("Failed to index ESG data point", error);
  }
}
