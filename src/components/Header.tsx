import { Brain, Heart } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
        <div className="relative">
          <Brain className="h-8 w-8 text-primary" />
          <Heart className="h-4 w-4 text-accent-foreground absolute -bottom-1 -right-1 fill-accent" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          MindTrack
        </h1>
      </div>
    </header>
  );
}
