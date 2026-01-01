import { useMemo } from 'react';

interface StressGaugeProps {
  score: number;
}

export function StressGauge({ score }: StressGaugeProps) {
  const { color, label, emoji } = useMemo(() => {
    if (score <= 3) {
      return { color: 'text-stress-low', label: 'Low Stress', emoji: '😌' };
    } else if (score <= 6) {
      return { color: 'text-stress-medium', label: 'Moderate Stress', emoji: '😐' };
    } else {
      return { color: 'text-stress-high', label: 'High Stress', emoji: '😰' };
    }
  }, [score]);

  // Calculate the rotation angle for the needle (0-10 maps to -90 to 90 degrees)
  const rotation = (score / 10) * 180 - 90;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Gauge */}
      <div className="relative w-36 h-20 overflow-hidden">
        {/* Gauge background - semi-circle */}
        <div 
          className="absolute inset-0 rounded-t-full"
          style={{
            background: `conic-gradient(
              from 180deg at 50% 100%,
              hsl(var(--stress-low)) 0deg,
              hsl(var(--stress-low)) 36deg,
              hsl(var(--stress-medium)) 72deg,
              hsl(var(--stress-medium)) 108deg,
              hsl(var(--stress-high)) 144deg,
              hsl(var(--stress-high)) 180deg
            )`,
          }}
        />
        
        {/* Inner circle to create the arc effect */}
        <div className="absolute left-1/2 bottom-0 w-24 h-12 bg-card rounded-t-full -translate-x-1/2" />
        
        {/* Needle */}
        <div 
          className="absolute left-1/2 bottom-0 w-1 h-14 origin-bottom transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-full h-10 bg-foreground rounded-full" />
        </div>
        
        {/* Center point */}
        <div className="absolute left-1/2 bottom-0 w-4 h-4 bg-foreground rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* Score display */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${color} tabular-nums`}>
          {score}
          <span className="text-lg font-normal text-muted-foreground">/10</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}
