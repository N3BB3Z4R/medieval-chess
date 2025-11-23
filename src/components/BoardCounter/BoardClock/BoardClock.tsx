import './BoardClock.css'
import { useEffect, useState } from "react";

interface BoardClockProps {
  active: boolean;
  initialTimeSeconds?: number; // Total time in seconds (e.g., 300 for 5 minutes)
  incrementSeconds?: number; // Increment added after each turn
  onTimeUp?: () => void; // Callback when time runs out
}

const BoardClock: React.FC<BoardClockProps> = ({ 
  active, 
  initialTimeSeconds = 300, // Default 5 minutes
  incrementSeconds = 0,
  onTimeUp 
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialTimeSeconds);
  const [hasAddedIncrement, setHasAddedIncrement] = useState(false);

  // Calculate minutes and seconds from total
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Reset when initialTimeSeconds changes (new game)
  useEffect(() => {
    setTotalSeconds(initialTimeSeconds);
    setHasAddedIncrement(false);
  }, [initialTimeSeconds]);

  // Add increment when turn becomes active (only once per activation)
  useEffect(() => {
    if (active && incrementSeconds > 0 && !hasAddedIncrement) {
      setTotalSeconds(prev => prev + incrementSeconds);
      setHasAddedIncrement(true);
    }
    if (!active) {
      setHasAddedIncrement(false); // Reset for next turn
    }
  }, [active, incrementSeconds, hasAddedIncrement]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (active && totalSeconds > 0) {
      timer = setTimeout(() => {
        setTotalSeconds(prev => {
          const newTime = prev - 1;
          if (newTime === 0 && onTimeUp) {
            onTimeUp();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [active, totalSeconds, onTimeUp]);

  // Warning state for low time
  const isLowTime = totalSeconds <= 20;
  const isCriticalTime = totalSeconds <= 10;

  return (
    <div 
      className={`board-clock ${isLowTime ? 'board-clock--low' : ''} ${isCriticalTime ? 'board-clock--critical' : ''}`}
    >
      {minutes}:{seconds < 10 ? '0' + seconds : seconds}
    </div>
  )
}

export default BoardClock

