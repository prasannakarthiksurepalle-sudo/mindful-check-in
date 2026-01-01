import { useState } from 'react';
import { Header } from '@/components/Header';
import { MoodInput } from '@/components/MoodInput';
import { MoodResult } from '@/components/MoodResult';
import { StressTrendChart } from '@/components/StressTrendChart';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import { MoodAnalysis } from '@/types/mood';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<MoodAnalysis | null>(null);
  const { addEntry } = useMoodHistory();
  const { toast } = useToast();

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setCurrentResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: { text },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result: MoodAnalysis = {
        ...data,
        userText: text,
      };

      setCurrentResult(result);
      addEntry(result);

      toast({
        title: 'Check-in complete',
        description: 'Your mood has been analyzed and saved.',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Failed to analyze your mood. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCheckIn = () => {
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 pb-16">
        {/* Hero Section */}
        {!currentResult && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How's your mind today?
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Spill it like a message to a friend.
            </p>
          </div>
        )}

        {/* Input Section */}
        {!currentResult ? (
          <div className="mb-8">
            <MoodInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Your Results</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewCheckIn}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                New Check-in
              </Button>
            </div>
            <MoodResult analysis={currentResult} />
          </div>
        )}

        {/* Trend Chart */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <StressTrendChart />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            MindTrack is not a substitute for professional mental health care.
            <br />
            If you're in crisis, please reach out to a mental health professional.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
