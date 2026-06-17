import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasStroke } from "../services/api";

interface CanvasProps {
  isDrawer: boolean;
  strokes: CanvasStroke[];
  onStrokesChange: (strokes: CanvasStroke[]) => void;
  roomCode: string;
  participantId: string | null;
}

function generateId() {
  return crypto.randomUUID();
}

export function Canvas({ isDrawer, strokes, onStrokesChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }

    if (currentStroke.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, currentStroke]);

  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);
    currentStrokeRef.current = [point];
    setCurrentStroke([point]);
    setIsDrawing(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || !isDrawer) return;
    const point = getCanvasPoint(event);
    currentStrokeRef.current = [...currentStrokeRef.current, point];

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const points = currentStrokeRef.current;
    if (points.length < 2) return;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!isDrawing || !isDrawer) return;
    setIsDrawing(false);

    const finalStroke = currentStrokeRef.current;
    if (finalStroke.length >= 2) {
      const newStroke: CanvasStroke = {
        id: generateId(),
        points: finalStroke,
        color: "#000000",
        width: 3
      };
      onStrokesChange([...strokes, newStroke]);
    }
    currentStrokeRef.current = [];
    setCurrentStroke([]);
  }

  function handleClear() {
    onStrokesChange([]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          cursor: isDrawer ? "crosshair" : "default",
          touchAction: "none",
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: "3 / 2"
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {isDrawer ? (
        <button className="button button--secondary" onClick={handleClear} type="button">
          Clear Canvas
        </button>
      ) : null}
    </div>
  );
}
