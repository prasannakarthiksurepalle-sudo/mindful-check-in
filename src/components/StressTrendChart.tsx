import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import { TrendingUp, Calendar } from 'lucide-react';

export function StressTrendChart() {
  const { getLast7Days, hasHistory } = useMoodHistory();
  const chartData = useMemo(() => getLast7Days(), [getLast7Days]);
  
  const hasAnyData = chartData.some(d => d.hasData);

  if (!hasAnyData) {
    return (
      <div className="card-soft">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">7-Day Stress Trend</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            No data yet. Complete a check-in to start tracking.
          </p>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const score = payload[0].value;
      let stressLevel = 'Low';
      let color = 'text-stress-low';
      
      if (score > 6) {
        stressLevel = 'High';
        color = 'text-stress-high';
      } else if (score > 3) {
        stressLevel = 'Moderate';
        color = 'text-stress-medium';
      }

      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-elevated">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className={`text-lg font-bold ${color}`}>
            {score}/10 <span className="text-sm font-normal">({stressLevel})</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-soft">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">7-Day Stress Trend</h3>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
            <XAxis 
              dataKey="shortDate" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 10]} 
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="stressScore"
              fill="url(#stressGradient)"
              stroke="none"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="stressScore"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4, stroke: 'hsl(var(--card))' }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-stress-low" />
          Low (0-3)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-stress-medium" />
          Moderate (4-6)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-stress-high" />
          High (7-10)
        </span>
      </div>
    </div>
  );
}
