import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "../components/Canvas";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { api, type CanvasStroke } from "../services/api";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, isSessionRestored } = useRoomState();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [canvasStrokes, setCanvasStrokes] = useState<CanvasStroke[]>([]);

  useEffect(() => {
    if (isSessionRestored && !room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room, isSessionRestored]);

  useEffect(() => {
    if (!room) {
      return;
    }

    async function poll() {
      try {
        const updated = await roomStore.fetchRoom();
        if (updated) {
          setCanvasStrokes(updated.canvasStrokes ?? []);
        }
      } catch {
        // polling error — will retry on next interval
      }
    }

    poll();
    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [roomStore, room]);

  const handleStrokesChange = useCallback(
    async (strokes: CanvasStroke[]) => {
      setCanvasStrokes(strokes);
      if (!room || !participantId) return;
      try {
        await api.saveCanvas(room.code, participantId, strokes);
      } catch {
        // Canvas save failed — will retry on next draw action
      }
    },
    [room, participantId]
  );

  const handleGuessSubmit = useCallback(
    async (text: string) => {
      if (!room || !participantId) return false;
      const result = await api.submitGuess(room.code, participantId, text);
      if (result.success) {
        await roomStore.fetchRoom();
      }
      return result.isCorrect;
    },
    [room, participantId, roomStore]
  );

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const isDrawer = participantId !== null && participantId === room.drawerId;

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round {room.roundNumber}</span>
          <h1 className="game-page__title">Guess the Word!</h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Card title={`Players (${room.participants.length})`}>
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span className="player-list__badge">
                    {participant.name}
                    {room.drawerId === participant.id ? <span className="drawer-badge">Drawer</span> : null}
                  </span>
                  <span className="player-list__meta">
                    {participant.id === room.hostId ? "Host" : "Joined"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Scoreboard />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            {isDrawer && room.secretWord ? (
              <div className="secret-word">{room.secretWord}</div>
            ) : null}
            <Canvas
              isDrawer={isDrawer}
              strokes={canvasStrokes}
              onStrokesChange={handleStrokesChange}
              roomCode={room.code}
              participantId={participantId}
            />
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Your Guess">
            {isDrawer ? (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>You are the drawer — you cannot submit guesses.</p>
            ) : (
              <GuessForm onSubmitGuess={handleGuessSubmit} />
            )}
          </Card>
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
