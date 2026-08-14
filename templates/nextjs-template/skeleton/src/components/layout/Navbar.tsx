import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  appName: string;
}

export function Navbar({ appName }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
          <span className="font-black text-primary-foreground text-sm">Y</span>
        </div>
        <span className="font-bold text-foreground text-base tracking-tight">{appName}</span>
      </div>

      <div className="flex items-center gap-6">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
        <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a>
        <Badge variant="outline">TYN Internal</Badge>
      </div>
    </nav>
  );
}
