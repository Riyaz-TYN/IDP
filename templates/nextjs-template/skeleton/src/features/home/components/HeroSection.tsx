import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroSectionProps {
  title: string;
  description: string;
}

export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-surface-page">
      <Badge variant="outline" className="mb-6 uppercase tracking-widest text-tiny">
        The Yellow Network · NiFo
      </Badge>

      <h1 className="text-h1 text-ink-heading mb-4 max-w-2xl">
        {title}
      </h1>

      <p className="text-body text-ink-muted max-w-xl mb-10">
        {description}
      </p>

      <div className="flex items-center gap-3">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </div>
    </section>
  );
}
