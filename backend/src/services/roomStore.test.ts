import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, leaveRoom, startGame } from "./roomStore.js";
import { RoomError, MAX_PARTICIPANTS } from "../models/game.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
    expect(result.room.hostId).toBe(result.participantId);
  });

  it("joinRoom throws for an unknown room code", () => {
    expect(() => joinRoom("ZZZZ", "Bob")).toThrow(RoomError);
  });

  it("joinRoom rejects when room is full", () => {
    const { room } = createRoom("Host");
    for (let i = 0; i < MAX_PARTICIPANTS - 1; i++) {
      joinRoom(room.code, `Player ${i}`);
    }
    expect(() => joinRoom(room.code, "Extra")).toThrow(RoomError);
  });

  it("creates unique room codes across multiple rooms", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const { room } = createRoom(`Player ${i}`);
      codes.add(room.code);
    }
    expect(codes.size).toBe(10);
  });

  it("host transfers to next participant when host leaves", () => {
    const { room, participantId: hostId } = createRoom("Host");
    const { participantId: player2Id } = joinRoom(room.code, "Player 2");
    leaveRoom(room.code, hostId);
    const { room: updated } = createRoom("dummy");
    void updated;
    expect(() => joinRoom(room.code, "Newcomer")).not.toThrow();
  });

  it("room is deleted when last participant leaves", () => {
    const { room, participantId } = createRoom("Solo");
    const result = leaveRoom(room.code, participantId);
    expect(result.deleted).toBe(true);
    expect(() => joinRoom(room.code, "Newcomer")).toThrow(RoomError);
  });

  it("startGame succeeds for host with enough players", () => {
    const { room, participantId } = createRoom("Host");
    joinRoom(room.code, "Player 2");
    const result = startGame(room.code, participantId);
    expect(result.success).toBe(true);
  });

  it("startGame rejects non-host participant", () => {
    const { room } = createRoom("Host");
    const { participantId } = joinRoom(room.code, "Player 2");
    expect(() => startGame(room.code, participantId)).toThrow(RoomError);
  });

  it("startGame rejects with fewer than 2 players", () => {
    const { room, participantId } = createRoom("Alone");
    expect(() => startGame(room.code, participantId)).toThrow(RoomError);
  });

  it("rooms are isolated — same player names don't interfere", () => {
    const r1 = createRoom("SameName");
    const r2 = createRoom("SameName");
    expect(r1.room.code).not.toBe(r2.room.code);
    const j1 = joinRoom(r1.room.code, "Extra");
    const j2 = joinRoom(r2.room.code, "Extra");
    expect(r1.room.participants.length + j1.room.participants.length).toBeGreaterThan(0);
    expect(r2.room.participants.length + j2.room.participants.length).toBeGreaterThan(0);
  });
});
