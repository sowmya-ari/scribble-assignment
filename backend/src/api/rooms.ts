import { Router } from "express";
import {
  canvasUpdateSchema,
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  leaveRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameSchema,
  submitGuessSchema
} from "./schemas.js";
import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  saveCanvas,
  startGame,
  submitGuess,
  toRoomSnapshot
} from "../services/roomStore.js";
import { RoomError } from "../models/game.js";

function handleRoomError(error: unknown): never {
  if (error instanceof RoomError) {
    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      ROOM_CLOSED: 409,
      ROOM_FULL: 409,
      INVALID_STATE: 409,
      FORBIDDEN: 403,
      MIN_PLAYERS: 400
    };
    throw new HttpError(statusMap[error.code] ?? 400, error.message);
  }
  throw error;
}

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);

      try {
        const result = joinRoom(code.toUpperCase(), playerName);
        response.json({
          participantId: result.participantId,
          room: toRoomSnapshot(result.room, result.participantId)
        });
      } catch (joinError) {
        handleRoomError(joinError);
      }
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/leave", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = leaveRoomSchema.parse(request.body);

      try {
        const result = leaveRoom(code.toUpperCase(), participantId);
        response.json(result);
      } catch (leaveError) {
        handleRoomError(leaveError);
      }
    } catch (error) {
      next(error);
    }
  });

  router.put("/:code/canvas", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, strokes } = canvasUpdateSchema.parse(request.body);

      try {
        const result = saveCanvas(code.toUpperCase(), participantId, strokes);
        response.json(result);
      } catch (canvasError) {
        handleRoomError(canvasError);
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/guesses", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, text } = submitGuessSchema.parse(request.body);

      try {
        const result = submitGuess(code.toUpperCase(), participantId, text);
        response.json(result);
      } catch (guessError) {
        handleRoomError(guessError);
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameSchema.parse(request.body);

      try {
        const result = startGame(code.toUpperCase(), participantId);
        response.json(result);
      } catch (startError) {
        handleRoomError(startError);
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
}
