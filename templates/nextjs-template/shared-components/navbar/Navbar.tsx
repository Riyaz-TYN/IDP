interface NavbarProps {
  appName: string;
}

export function Navbar({ appName }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-tyn-navy-dark border-b border-tyn-navy-light">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-tyn-yellow">
          <span className="font-black text-tyn-navy text-sm">Y</span>
        </span>
        <span className="font-black text-white text-lg tracking-tight">
          {appName}
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-400">
        <a href="/" className="hover:text-tyn-yellow transition-colors">Home</a>
        <a href="/docs" className="hover:text-tyn-yellow transition-colors">Docs</a>
        <span className="text-tyn-yellow font-semibold text-xs uppercase tracking-widest">
          TYN Internal
        </span>
      </div>
    </nav>
  );
}
