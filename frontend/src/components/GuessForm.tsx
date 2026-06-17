import { useState } from "react";

interface GuessFormProps {
  disabled?: boolean;
  onSubmitGuess?: (text: string) => Promise<boolean>;
}

export function GuessForm({ disabled = false, onSubmitGuess }: GuessFormProps) {
  const [guessText, setGuessText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "incorrect" | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSubmitGuess || guessText.trim().length === 0) return;

    setIsSubmitting(true);
    setError(null);
    setLastResult(null);

    try {
      const isCorrect = await onSubmitGuess(guessText);
      setGuessText("");
      setLastResult(isCorrect ? "correct" : "incorrect");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit guess";
      if (message.toLowerCase().includes("empty")) {
        setError("Guess cannot be empty");
      } else if (message.toLowerCase().includes("drawer")) {
        setError("Drawer cannot submit guesses");
      } else {
        setError(message);
      }
      setLastResult("incorrect");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => {
            setGuessText(event.target.value);
            setError(null);
            setLastResult(null);
          }}
          placeholder="Type your guess here..."
          disabled={disabled || isSubmitting}
        />
      </label>
      {error ? <p className="form__error" style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "4px" }}>{error}</p> : null}
      {lastResult === "correct" ? <p style={{ color: "#16a34a", fontSize: "0.875rem", marginTop: "4px" }}>Correct!</p> : null}
      {lastResult === "incorrect" ? <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "4px" }}>Incorrect</p> : null}
      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={disabled || isSubmitting || guessText.trim().length === 0}>
          {isSubmitting ? "Submitting..." : "Submit Guess"}
        </button>
      </div>
    </form>
  );
}
