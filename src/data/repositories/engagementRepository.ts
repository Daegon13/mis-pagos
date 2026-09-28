import type { SQLiteDatabase } from "expo-sqlite";
import type { SpaceStage } from "@/domain/engagement";

export async function advanceSpace(db: SQLiteDatabase, candidate: SpaceStage) {
  // Conditional update is atomic: stale loads cannot lower persisted progress
  // or repeat a surprise. No financial table is written here.
  const result = await db.runAsync(
    "UPDATE engagement_progress SET stage = ? WHERE id = 1 AND stage < ?",
    candidate, candidate,
  );
  const row = await db.getFirstAsync<{ stage: SpaceStage }>(
    "SELECT stage FROM engagement_progress WHERE id = 1",
  );
  if (row === null) throw new Error("Missing engagement progress");
  return { stage: row.stage, surprise: candidate === 2 && result.changes === 1 };
}
