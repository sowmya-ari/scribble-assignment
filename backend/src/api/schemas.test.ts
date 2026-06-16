import { describe, expect, it } from "vitest";
import { createRoomSchema, joinRoomSchema, leaveRoomSchema, roomCodeParamsSchema, startGameSchema } from "./schemas.js";

describe("schemas", () => {
  it("createRoomSchema accepts a valid body with playerName", () => {
    const result = createRoomSchema.parse({ playerName: "Alice" });

    expect(result.playerName).toBe("Alice");
  });

  it("createRoomSchema rejects empty playerName", () => {
    expect(() => createRoomSchema.parse({ playerName: "" })).toThrow();
  });

  it("createRoomSchema rejects missing playerName", () => {
    expect(() => createRoomSchema.parse({})).toThrow();
  });

  it("joinRoomSchema accepts valid body", () => {
    const result = joinRoomSchema.parse({ playerName: "Bob" });
    expect(result.playerName).toBe("Bob");
  });

  it("joinRoomSchema rejects empty playerName", () => {
    expect(() => joinRoomSchema.parse({ playerName: "" })).toThrow();
  });

  it("leaveRoomSchema rejects missing participantId", () => {
    expect(() => leaveRoomSchema.parse({})).toThrow();
  });

  it("startGameSchema rejects missing participantId", () => {
    expect(() => startGameSchema.parse({})).toThrow();
  });

  it("roomCodeParamsSchema rejects missing code", () => {
    expect(() => roomCodeParamsSchema.parse({})).toThrow();
  });
});
