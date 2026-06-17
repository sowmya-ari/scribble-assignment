import type { Guess, Participant } from "../services/api";

interface GuessHistoryProps {
  guesses: Guess[];
  participants: Participant[];
}

export function GuessHistory({ guesses, participants }: GuessHistoryProps) {
  if (guesses.length === 0) {
    return (
      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
        No guesses yet.
      </p>
    );
  }

  const participantNames = new Map(participants.map((p) => [p.id, p.name]));

  return (
    <ul className="guess-history">
      {guesses.map((guess, index) => {
        const name = participantNames.get(guess.participantId) ?? "Unknown";
        return (
          <li key={index} className={`guess-history__item ${guess.isCorrect ? "guess-history__item--correct" : ""}`}>
            <span className="guess-history__name">{name}</span>
            <span className="guess-history__text">{guess.text}</span>
            {guess.isCorrect ? <span className="guess-history__badge">Correct</span> : null}
          </li>
        );
      })}
    </ul>
  );
}
