import { useEffect, useState } from 'react';

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export function SuccessConfetti() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const pieces: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setConfetti(pieces);

    // Clean up after animation
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-2 h-2 rounded-full animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
