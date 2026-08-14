import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroSectionProps {
  title: string;
  description: string;
}

export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <Badge variant="outline" className="mb-6 tracking-widest uppercase text-xs">
        The Yellow Network
      </Badge>

      <h1 className="text-5xl font-black text-foreground mb-4 leading-tight">
        {title}
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl mb-10">
        {description}
      </p>

      <div className="flex items-center gap-4">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </div>
    </section>
  );
}
