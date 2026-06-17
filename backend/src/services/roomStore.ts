import { randomUUID } from "node:crypto";
import type { CanvasStroke, Guess, Participant, Room, RoomSnapshot } from "../models/game.js";
import { RoomError, MAX_PARTICIPANTS } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  return name || "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name?.trim()),
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function selectWord(roomCode: string, words: readonly string[]): string {
  let hash = 5381;
  for (let i = 0; i < roomCode.length; i++) {
    hash = (hash * 33) ^ roomCode.charCodeAt(i);
  }
  const index = Math.abs(hash) % words.length;
  return words[index];
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    participants: [participant],
    hostId: participant.id,
    drawerId: null,
    secretWord: null,
    currentRound: 0,
    canvasStrokes: [],
    guesses: [],
    scores: {},
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName: string) {
  const room = rooms.get(code);

  if (!room) {
    throw new RoomError("NOT_FOUND", "Room not found");
  }

  if (room.status !== "lobby") {
    throw new RoomError("ROOM_CLOSED", "Room is no longer accepting players");
  }

  if (room.participants.length >= MAX_PARTICIPANTS) {
    throw new RoomError("ROOM_FULL", "Room is full");
  }

  const participant = createParticipant(playerName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const isDrawer = viewerParticipantId !== undefined && viewerParticipantId === room.drawerId;

  return {
    code: room.code,
    status: room.status,
    participants: room.participants.map((participant) => ({ ...participant })),
    hostId: room.hostId,
    drawerId: room.drawerId,
    secretWord: room.status === "lobby" ? null : isDrawer ? room.secretWord : undefined,
    roundNumber: room.currentRound,
    canvasStrokes: room.canvasStrokes ?? [],
    guesses: room.guesses ?? [],
    scores: room.scores ?? {},
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}

export function leaveRoom(code: string, participantId: string) {
  const room = rooms.get(code);

  if (!room) {
    throw new RoomError("NOT_FOUND", "Room not found");
  }

  const index = room.participants.findIndex((p) => p.id === participantId);

  if (index === -1) {
    throw new RoomError("NOT_FOUND", "Participant not found in room");
  }

  room.participants.splice(index, 1);

  if (room.hostId === participantId) {
    if (room.participants.length === 0) {
      rooms.delete(code);
      return { success: true, deleted: true };
    }
    room.hostId = room.participants[0].id;
  }

  if (room.participants.length === 0) {
    rooms.delete(code);
    return { success: true, deleted: true };
  }

  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));

  return { success: true, deleted: false, newHostId: room.hostId };
}

export function saveCanvas(code: string, participantId: string, strokes: CanvasStroke[]) {
  const room = rooms.get(code);

  if (!room) {
    throw new RoomError("NOT_FOUND", "Room not found");
  }

  if (room.drawerId !== participantId) {
    throw new RoomError("FORBIDDEN", "Only the drawer can update the canvas");
  }

  room.canvasStrokes = strokes;
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));

  return { success: true };
}

export function submitGuess(code: string, participantId: string, text: string) {
  const room = rooms.get(code);

  if (!room) {
    throw new RoomError("NOT_FOUND", "Room not found");
  }

  if (room.status !== "playing") {
    throw new RoomError("INVALID_STATE", "Game is not in progress");
  }

  if (room.drawerId === participantId) {
    throw new RoomError("FORBIDDEN", "Drawer cannot submit guesses");
  }

  if (!room.secretWord) {
    throw new RoomError("INVALID_STATE", "No secret word set");
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new RoomError("INVALID_INPUT", "Guess cannot be empty");
  }

  const isCorrect = trimmed.toLowerCase() === room.secretWord.toLowerCase();

  const guess: Guess = {
    participantId,
    text: trimmed,
    isCorrect,
    timestamp: now()
  };

  room.guesses.push(guess);

  if (isCorrect && (room.scores[participantId] ?? 0) < 100) {
    room.scores[participantId] = 100;
  }

  if (!isCorrect && !(participantId in room.scores)) {
    room.scores[participantId] = 0;
  }

  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));

  return { success: true, isCorrect, guess };
}

export function startGame(code: string, participantId: string) {
  const room = rooms.get(code);

  if (!room) {
    throw new RoomError("NOT_FOUND", "Room not found");
  }

  if (room.status !== "lobby") {
    throw new RoomError("INVALID_STATE", "Game has already started");
  }

  if (room.hostId !== participantId) {
    throw new RoomError("FORBIDDEN", "Only the host can start the game");
  }

  if (room.participants.length < 2) {
    throw new RoomError("MIN_PLAYERS", "At least 2 players are required to start");
  }

  room.status = "playing";
  room.drawerId = room.hostId;
  room.secretWord = selectWord(room.code, STARTER_WORDS);
  room.currentRound = 1;
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));

  return { success: true };
}
