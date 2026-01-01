import { MoodAnalysis } from '@/types/mood';
import { StressGauge } from './StressGauge';
import { CrisisResources } from './CrisisResources';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MoodResultProps {
  analysis: MoodAnalysis;
}

export function MoodResult({ analysis }: MoodResultProps) {
  const getSentimentIcon = () => {
    switch (analysis.sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentColor = () => {
    switch (analysis.sentiment) {
      case 'positive':
        return 'bg-stress-low/20 text-stress-low border-stress-low/30';
      case 'negative':
        return 'bg-stress-high/20 text-stress-high border-stress-high/30';
      default:
        return 'bg-stress-medium/20 text-stress-medium border-stress-medium/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Result Card */}
      <div className="card-soft">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Stress Gauge */}
          <div className="flex-shrink-0">
            <StressGauge score={analysis.stressScore} />
          </div>
          
          {/* Sentiment & Mood */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={`${getSentimentColor()} gap-1.5 px-3 py-1 text-sm font-medium border`}
              >
                {getSentimentIcon()}
                <span className="capitalize">{analysis.sentiment}</span>
              </Badge>
              <Badge 
                variant="secondary" 
                className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20"
              >
                #{analysis.moodTag}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Analyzed at {new Date(analysis.timestamp).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* High Stress Alert */}
      {analysis.stressScore >= 8 && (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CrisisResources />
        </div>
      )}

      {/* Suggestions */}
      <div className="card-soft animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-accent rounded-lg">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Suggestions for You</h3>
        </div>
        
        <ul className="space-y-3">
          {analysis.suggestions.map((suggestion, index) => (
            <li 
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-foreground/90">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
