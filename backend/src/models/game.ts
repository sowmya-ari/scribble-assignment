export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface CanvasStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface Guess {
  participantId: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  hostId: string;
  drawerId: string | null;
  secretWord: string | null;
  currentRound: number;
  canvasStrokes: CanvasStroke[];
  guesses: Guess[];
  scores: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  hostId: string;
  drawerId: string | null;
  secretWord?: string | null;
  roundNumber: number;
  canvasStrokes: CanvasStroke[];
  guesses: Guess[];
  scores: Record<string, number>;
  availableWords: string[];
  roles: ParticipantRole[];
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}

export class RoomError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const MAX_PARTICIPANTS = 8;
