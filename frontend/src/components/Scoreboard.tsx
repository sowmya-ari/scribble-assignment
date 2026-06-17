import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function Scoreboard() {
  const { room } = useRoomState();

  const scores = room?.scores ?? {};
  const participants = room?.participants ?? [];

  const entries = participants
    .map((p) => ({ id: p.id, name: p.name, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  if (entries.length === 0) {
    return (
      <Card title="Scoreboard">
        <div className="placeholder-block" style={{ backgroundColor: "#f9fafb" }}>
          <div className="placeholder-row">
            <span>Waiting for players...</span>
            <strong>0</strong>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Scoreboard">
      <ul className="scoreboard">
        {entries.map((entry) => (
          <li key={entry.id} className="scoreboard__item">
            <span className="scoreboard__name">{entry.name}</span>
            <strong className="scoreboard__score">{entry.score}</strong>
          </li>
        ))}
      </ul>
    </Card>
  );
}
