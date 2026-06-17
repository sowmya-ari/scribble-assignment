import { describe, expect, it } from "vitest";
import { canvasUpdateSchema, createRoomSchema, joinRoomSchema, leaveRoomSchema, roomCodeParamsSchema, startGameSchema, submitGuessSchema } from "./schemas.js";

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

  it("createRoomSchema rejects whitespace-only playerName", () => {
    expect(() => createRoomSchema.parse({ playerName: "   " })).toThrow();
  });

  it("joinRoomSchema accepts valid body", () => {
    const result = joinRoomSchema.parse({ playerName: "Bob" });
    expect(result.playerName).toBe("Bob");
  });

  it("joinRoomSchema rejects empty playerName", () => {
    expect(() => joinRoomSchema.parse({ playerName: "" })).toThrow();
  });

  it("joinRoomSchema rejects whitespace-only playerName", () => {
    expect(() => joinRoomSchema.parse({ playerName: "   " })).toThrow();
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

  it("canvasUpdateSchema accepts valid body with participantId and strokes", () => {
    const result = canvasUpdateSchema.parse({
      participantId: "p1",
      strokes: [{ id: "s1", points: [{ x: 0, y: 0 }, { x: 10, y: 10 }], color: "#000000", width: 3 }]
    });
    expect(result.participantId).toBe("p1");
    expect(result.strokes).toHaveLength(1);
  });

  it("canvasUpdateSchema rejects missing participantId", () => {
    expect(() => canvasUpdateSchema.parse({ strokes: [] })).toThrow();
  });

  it("canvasUpdateSchema rejects stroke with fewer than 2 points", () => {
    expect(() =>
      canvasUpdateSchema.parse({
        participantId: "p1",
        strokes: [{ id: "s1", points: [{ x: 0, y: 0 }], color: "#000000", width: 3 }]
      })
    ).toThrow();
  });

  it("submitGuessSchema accepts valid body", () => {
    const result = submitGuessSchema.parse({ participantId: "p1", text: "pizza" });
    expect(result.participantId).toBe("p1");
    expect(result.text).toBe("pizza");
  });

  it("submitGuessSchema trims text", () => {
    const result = submitGuessSchema.parse({ participantId: "p1", text: "  pizza  " });
    expect(result.text).toBe("pizza");
  });

  it("submitGuessSchema rejects empty text", () => {
    expect(() => submitGuessSchema.parse({ participantId: "p1", text: "" })).toThrow();
  });

  it("submitGuessSchema rejects whitespace-only text", () => {
    expect(() => submitGuessSchema.parse({ participantId: "p1", text: "   " })).toThrow();
  });

  it("submitGuessSchema rejects missing participantId", () => {
    expect(() => submitGuessSchema.parse({ text: "pizza" })).toThrow();
  });
});
