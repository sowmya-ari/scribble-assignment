import type { RoomSnapshot } from "../services/api";
import { Card } from "./Card";
import { GuessHistory } from "./GuessHistory";
import { Scoreboard } from "./Scoreboard";

interface ResultViewProps {
  room: RoomSnapshot;
  participantId: string | null;
  onRestart?: () => void;
}

export function ResultView({ room, participantId, onRestart }: ResultViewProps) {
  const isHost = participantId !== null && participantId === room.hostId;

  return (
    <section className="panel result-view">
      <div className="result-view__header">
        <span className="section-kicker">Round {room.roundNumber} — Finished</span>
        <h1 className="result-view__title">Round Results</h1>
      </div>

      <div className="result-view__layout">
        <aside className="result-view__sidebar result-view__sidebar--left">
          <Card title="Final Scores">
            <Scoreboard />
          </Card>
        </aside>

        <div className="result-view__main">
          <Card title="The Word Was">
            <p className="result-view__secret-word">{room.secretWord ?? "???"}</p>
          </Card>

          {room.canvasStrokes.length > 0 ? (
            <Card title="Final Canvas">
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Canvas snapshot from the round.
              </p>
            </Card>
          ) : null}
        </div>

        <aside className="result-view__sidebar result-view__sidebar--right">
          <Card title="Guess History">
            <GuessHistory guesses={room.guesses} participants={room.participants} />
          </Card>
        </aside>
      </div>

      <div className="button-row">
        {isHost ? (
          <button className="button button--primary" onClick={onRestart}>
            Restart Game
          </button>
        ) : null}
      </div>
    </section>
  );
}
