import confetti from "canvas-confetti";

export const celebrate = (): void => {
  const duration = 1400;
  const end = Date.now() + duration;

  const colors = ["#00d4ff", "#8b5cf6", "#3b82f6", "#a78bfa"];

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.9 },
      colors,
      scalar: 0.9,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.9 },
      colors,
      scalar: 0.9,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 80,
    spread: 95,
    startVelocity: 45,
    origin: { y: 0.7 },
    colors,
    scalar: 1.1,
  });

  requestAnimationFrame(frame);
};
