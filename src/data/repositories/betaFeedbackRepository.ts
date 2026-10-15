import type { SQLiteDatabase } from "expo-sqlite";
import { BETA_QUESTIONS, type BetaAnswers } from "@/features/help/betaFeedbackQuestions";

export async function loadBetaFeedback(db: SQLiteDatabase): Promise<{ answers: BetaAnswers; comment: string }> {
  const rows = await db.getAllAsync<{ question_id: string; option_id: string }>(
    "SELECT question_id, option_id FROM beta_feedback_answers");
  const comment = await db.getFirstAsync<{ body: string }>("SELECT body FROM beta_feedback_comment WHERE id = 1");
  return { answers: Object.fromEntries(rows.map(row => [row.question_id, row.option_id])), comment: comment?.body ?? "" };
}

export async function saveBetaAnswer(db: SQLiteDatabase, questionId: string, optionId: string, now = new Date()) {
  const question = BETA_QUESTIONS.find(item => item.id === questionId);
  if (!question?.options.some(option => option.id === optionId)) throw new Error("Respuesta no válida.");
  const timestamp = now.toISOString();
  await db.runAsync(`INSERT INTO beta_feedback_answers (question_id, option_id, answered_at, updated_at)
    VALUES (?, ?, ?, ?) ON CONFLICT(question_id) DO UPDATE SET
    option_id = excluded.option_id, updated_at = excluded.updated_at`, questionId, optionId, timestamp, timestamp);
}

export async function saveBetaComment(db: SQLiteDatabase, body: string, now = new Date()) {
  if (body.length > 1000) throw new Error("Comentario demasiado largo.");
  await db.runAsync(`INSERT INTO beta_feedback_comment (id, body, updated_at) VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`, body, now.toISOString());
}
