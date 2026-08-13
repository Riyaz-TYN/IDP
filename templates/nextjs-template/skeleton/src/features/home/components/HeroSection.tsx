interface HeroSectionProps {
  title: string;
  description: string;
}

export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="mb-4 inline-block rounded-full bg-tyn-navy-light px-4 py-1 text-sm text-tyn-yellow font-semibold tracking-widest uppercase">
        The Yellow Network
      </div>

      <h1 className="text-5xl font-black text-white mb-4 leading-tight">
        {title}
      </h1>

      <p className="text-lg text-gray-400 max-w-xl mb-10">
        {description}
      </p>

      <div className="flex items-center gap-3">
        <span className="inline-block h-2 w-2 rounded-full bg-tyn-yellow animate-pulse" />
        <span className="text-sm text-gray-500">Ready to build</span>
      </div>
    </section>
  );
}
