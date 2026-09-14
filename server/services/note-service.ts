import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serializeNote } from "@/lib/serializers";
import type { NoteInput, NoteUpdateInput } from "@/lib/validation/note";
import { noteRepository } from "@/server/repositories/note-repository";
import { getOwnedApplication } from "@/server/services/application-service";

async function getOwnedNote(id: string, userId: string) {
  const note = await noteRepository.findById(id);
  if (!note) {
    throw new AppError("NOT_FOUND", "Note not found.");
  }
  if (note.userId !== userId) {
    throw new AppError("NOT_FOUND", "Note not found.");
  }
  return note;
}

export async function listApplicationNotes(userId: string, applicationId: string) {
  await getOwnedApplication(applicationId, userId);
  const notes = await noteRepository.listForApplication(applicationId);
  return { notes: notes.map(serializeNote) };
}

export async function createNote(
  userId: string,
  applicationId: string,
  input: NoteInput,
) {
  await getOwnedApplication(applicationId, userId);
  const note = await noteRepository.create(userId, applicationId, input);
  logger.info("note.created", { userId, applicationId, noteId: note.id });
  return serializeNote(note);
}

export async function updateNote(userId: string, id: string, input: NoteUpdateInput) {
  await getOwnedNote(id, userId);
  const note = await noteRepository.update(id, input);
  logger.info("note.updated", { userId, noteId: id });
  return serializeNote(note);
}

export async function deleteNote(userId: string, id: string) {
  await getOwnedNote(id, userId);
  await noteRepository.delete(id);
  logger.info("note.deleted", { userId, noteId: id });
  return { ok: true };
}
