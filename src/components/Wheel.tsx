import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import confetti from "canvas-confetti";
import type { Participant } from "../types";
import { WHEEL_COLORS } from "../theme";

type Props = {
  participants: Participant[];
  eligible: Participant[];
  onWinner: (winner: Participant) => void;
  size?: number;
};

const Wrap = styled(Box)({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
});

const Pointer = styled("div")({
  position: "absolute",
  top: -4,
  left: "50%",
  transform: "translateX(-50%)",
  width: 0,
  height: 0,
  borderLeft: "18px solid transparent",
  borderRight: "18px solid transparent",
  borderTop: "28px solid #f43f5e",
  zIndex: 2,
  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
});

const Canvas = styled("canvas")<{ $spinning: boolean }>(({ $spinning }) => ({
  borderRadius: "50%",
  background: "#1e293b",
  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  transition: $spinning
    ? "transform 5s cubic-bezier(0.17, 0.67, 0.21, 0.99)"
    : "none",
}));

export default function Wheel({
  participants,
  eligible,
  onWinner,
  size = 480,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);

  useEffect(() => {
    draw();
  }, [participants]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;

    ctx.clearRect(0, 0, size, size);

    if (participants.length === 0) {
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add some names →", cx, cy);
      return;
    }

    const slice = (Math.PI * 2) / participants.length;
    const eligibleIds = new Set(eligible.map((p) => p.id));

    participants.forEach((p, i) => {
      const start = i * slice - Math.PI / 2;
      const end = start + slice;
      const isEligible = eligibleIds.has(p.id);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = isEligible
        ? WHEEL_COLORS[i % WHEEL_COLORS.length]
        : "#475569";
      ctx.globalAlpha = isEligible ? 1 : 0.45;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px -apple-system, sans-serif";
      const label = `${p.emoji} ${p.name}`;
      const shown = label.length > 20 ? label.slice(0, 19) + "…" : label;
      ctx.fillText(shown, radius - 16, 6);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function spin() {
    if (spinning || eligible.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pick winner from eligible, then find their position in the full
    // participants array (the wheel renders all participants).
    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    const winnerIdx = participants.findIndex((p) => p.id === picked.id);
    if (winnerIdx < 0) return;

    setSpinning(true);
    setWinner(null);

    const sliceDeg = 360 / participants.length;
    const targetAngle = -((winnerIdx + 0.5) * sliceDeg);
    const fullSpins = 6;
    const current = rotationRef.current;
    const finalRotation =
      current - (current % 360) + fullSpins * 360 + targetAngle;
    rotationRef.current = finalRotation;
    canvas.style.transform = `rotate(${finalRotation}deg)`;

    window.setTimeout(() => {
      setSpinning(false);
      setWinner(picked);
      onWinner(picked);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }, 5100);
  }

  return (
    <Wrap>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <Pointer />
        <Canvas
          ref={canvasRef}
          width={size}
          height={size}
          $spinning={spinning}
        />
      </Box>
      <Button
        variant="contained"
        size="large"
        onClick={spin}
        disabled={spinning || eligible.length === 0}
        sx={{ minWidth: 200, fontSize: 18, py: 1.5 }}
      >
        {spinning ? "Spinning…" : "Spin 🎯"}
      </Button>
      <Box sx={{ minHeight: 56, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          NEXT DEMO
        </Typography>
        <Typography variant="h4" sx={{ color: "#fbbf24", fontWeight: 700 }}>
          {winner ? `${winner.emoji} ${winner.name}` : "—"}
        </Typography>
      </Box>
    </Wrap>
  );
}
