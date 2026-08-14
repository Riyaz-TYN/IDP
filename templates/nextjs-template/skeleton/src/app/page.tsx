import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/features/home/components/HeroSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar appName="${{ values.name }}" />
      <HeroSection
        title="${{ values.name }}"
        description="${{ values.description }}"
      />
    </main>
  );
}
