import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  appName: string;
}

export function Navbar({ appName }: NavbarProps) {
  return (
    <nav
      className="flex items-center justify-between px-8 h-comp-lg shadow-panel"
      style={{ backgroundColor: '#10233F' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-md font-black text-sm"
          style={{ backgroundColor: '#22D3EE', color: '#071A2F' }}
        >
          N
        </div>
        <span className="font-semibold text-white text-body tracking-tight">
          {appName}
        </span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        <a href="/"     className="text-label text-white/70 hover:text-white transition-colors">Home</a>
        <a href="/docs" className="text-label text-white/70 hover:text-white transition-colors">Docs</a>
        <Badge variant="outline" className="border-white/30 text-white/80 bg-white/10">
          TYN Internal
        </Badge>
      </div>
    </nav>
  );
}
