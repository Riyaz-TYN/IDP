{%- if values.sharedNavbar %}
import { Navbar } from '@/shared/components/Navbar';
{%- endif %}
import { HeroSection } from '@/features/home/components/HeroSection';
{%- if values.sharedButton %}
import { Button } from '@/shared/components/Button';
{%- endif %}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-tyn-navy">
      {%- if values.sharedNavbar %}
      <Navbar appName="${{ values.name }}" />
      {%- endif %}

      <HeroSection
        title="${{ values.name }}"
        description="${{ values.description }}"
      />

      {%- if values.sharedButton %}
      <div className="flex justify-center gap-4 py-8">
        <Button variant="primary">Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
      {%- endif %}
    </main>
  );
}
