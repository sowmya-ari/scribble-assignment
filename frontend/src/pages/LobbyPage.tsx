import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, error, isLoading, isSessionRestored } = useRoomState();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        const snapshot = await roomStore.fetchRoom();
        if (snapshot && snapshot.status !== "lobby") {
          navigate("/game", { replace: true });
        }
      } catch {
        setRefreshError("Failed to refresh room");
      }
    }

    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [navigate, roomStore, room]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshError(null);
      await roomStore.fetchRoom();
    } catch (caughtError) {
      setRefreshError(caughtError instanceof Error ? caughtError.message : "Unable to refresh room");
    }
  }, [roomStore]);

  const handleStartGame = useCallback(async () => {
    try {
      setRefreshError(null);
      await roomStore.startGame();
      navigate("/game");
    } catch (caughtError) {
      setRefreshError(caughtError instanceof Error ? caughtError.message : "Unable to start game");
    }
  }, [navigate, roomStore]);

  const handleLeaveRoom = useCallback(async () => {
    try {
      await roomStore.leaveRoom();
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate, roomStore]);

  if (!room || !participantId) {
    return null;
  }

  const isHost = room.hostId === participantId;
  const canStart = isHost && room.participants.length >= 2;

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title={`Participants (${room.participants.length})`}>
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>
                    {participant.name}
                    {room.hostId === participant.id ? <span className="host-badge"> Host</span> : null}
                  </span>
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p className="status-line" style={{ backgroundColor: isLoading ? '#fef3c7' : '#e0e7ff', color: isLoading ? '#b45309' : '#3730a3' }}>
            {isLoading ? "Refreshing players..." : "Ready to play"}
          </p>
          <p style={{ marginTop: '8px' }}>{error ?? refreshError ?? "Waiting for the host to start the game."}</p>
        </Card>
      </div>

      <div className="button-row button-row--spread">
        <button className="button button--secondary" disabled={isLoading} onClick={handleLeaveRoom}>
          Leave Room
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="button button--secondary" disabled={isLoading} onClick={handleRefresh}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
          {isHost ? (
            <button className="button button--primary" disabled={!canStart || isLoading} onClick={handleStartGame}>
              {room.participants.length < 2 ? `Need ${2 - room.participants.length} more` : "Start Game"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
