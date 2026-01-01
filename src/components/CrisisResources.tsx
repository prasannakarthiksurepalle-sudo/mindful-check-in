import { AlertTriangle, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const resources = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7',
    phone: '988',
    url: 'https://988lifeline.org',
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741',
    phone: '741741',
    url: 'https://www.crisistextline.org',
    isText: true,
  },
  {
    name: 'SAMHSA National Helpline',
    description: 'Treatment referral service',
    phone: '1-800-662-4357',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
  },
];

export function CrisisResources() {
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-destructive/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-destructive">
            You're experiencing high stress
          </h3>
          <p className="text-sm text-destructive/80 mt-1">
            It's okay to ask for help. Here are some resources available to you:
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {resources.map((resource) => (
          <div 
            key={resource.name}
            className="bg-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {resource.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {resource.description}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a href={`tel:${resource.phone.replace(/-/g, '')}`}>
                  {resource.isText ? (
                    <MessageCircle className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  {resource.isText ? 'Text' : 'Call'}
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Visit website</span>
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
