import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required")
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required")
});

export const roomCodeParamsSchema = z.object({
  code: z.string()
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export const leaveRoomSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required")
});

export const startGameSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required")
});

const pointSchema = z.object({
  x: z.number(),
  y: z.number()
});

const canvasStrokeSchema = z.object({
  id: z.string().min(1),
  points: z.array(pointSchema).min(2),
  color: z.string(),
  width: z.number()
});

export const canvasUpdateSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  strokes: z.array(canvasStrokeSchema)
});

export const submitGuessSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  text: z.string().trim().min(1, "Guess cannot be empty")
});

export const endRoundSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required")
});

export const restartSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required")
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
