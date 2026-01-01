import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface MoodInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export function MoodInput({ onSubmit, isLoading }: MoodInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="card-soft space-y-4">
        <div className="space-y-2">
          <label htmlFor="mood-input" className="sr-only">
            Share how you're feeling
          </label>
          <Textarea
            id="mood-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I've been feeling a bit overwhelmed lately with work deadlines..."
            className="input-friendly min-h-[120px] resize-none text-base leading-relaxed"
            disabled={isLoading}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {text.length}/2000 characters
          </p>
        </div>
        
        <Button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="btn-primary w-full gap-2 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Check In
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to submit
        </p>
      </div>
    </form>
  );
}
