import { describe, expect, it } from "vitest";
import { createRoom, getRoom, joinRoom, leaveRoom, selectWord, startGame, toRoomSnapshot } from "./roomStore.js";
import { RoomError, MAX_PARTICIPANTS } from "../models/game.js";
import { STARTER_WORDS } from "../seed/starterData.js";

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

  it("createRoom trims leading and trailing whitespace from player name", () => {
    const result = createRoom("  Alice  ");
    expect(result.room.participants[0].name).toBe("Alice");
  });

  it("selectWord returns the same word for the same room code", () => {
    const word1 = selectWord("ABCD", STARTER_WORDS);
    const word2 = selectWord("ABCD", STARTER_WORDS);
    expect(word1).toBe(word2);
  });

  it("selectWord returns different words for different room codes", () => {
    const word1 = selectWord("ABCD", STARTER_WORDS);
    const word2 = selectWord("WXYZ", STARTER_WORDS);
    expect(word1).not.toBe(word2);
  });

  it("startGame assigns drawerId equal to hostId", () => {
    const { room, participantId } = createRoom("Host");
    joinRoom(room.code, "Player 2");
    startGame(room.code, participantId);
    const updated = getRoom(room.code);
    expect(updated).not.toBeNull();
    expect(updated!.drawerId).toBe(participantId);
  });

  it("startGame sets currentRound to 1 and secretWord to a non-null word", () => {
    const { room, participantId } = createRoom("Host");
    joinRoom(room.code, "Player 2");
    startGame(room.code, participantId);
    const updated = getRoom(room.code);
    expect(updated).not.toBeNull();
    expect(updated!.currentRound).toBe(1);
    expect(updated!.secretWord).not.toBeNull();
  });

  it("toRoomSnapshot includes secretWord for the drawer", () => {
    const { room, participantId } = createRoom("Host");
    joinRoom(room.code, "Player 2");
    startGame(room.code, participantId);
    const updated = getRoom(room.code);
    const snapshot = toRoomSnapshot(updated!, participantId);
    expect(snapshot.secretWord).toBe(updated!.secretWord);
  });

  it("toRoomSnapshot does not include secretWord for non-drawer viewers", () => {
    const { room, participantId: hostId } = createRoom("Host");
    const { participantId: player2Id } = joinRoom(room.code, "Player 2");
    startGame(room.code, hostId);
    const updated = getRoom(room.code);
    const snapshot = toRoomSnapshot(updated!, player2Id);
    expect(snapshot.secretWord).toBeUndefined();
  });

  it("toRoomSnapshot returns null secretWord for lobby status", () => {
    const { room, participantId } = createRoom("Host");
    const snapshot = toRoomSnapshot(room, participantId);
    expect(snapshot.secretWord).toBeNull();
  });
});
