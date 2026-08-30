import HeroSection from '@/sections/home/HeroSection';
import TrustedIndicators from '@/sections/home/TrustedIndicators';
import FeaturedCollectionBanner from '@/sections/home/FeaturedCollectionBanner';
import CollectionShowcase from '@/sections/home/CollectionShowcase';
import AboutTeaser from '@/sections/home/AboutTeaser';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrustedIndicators />
      <FeaturedCollectionBanner />
      <CollectionShowcase />
      <AboutTeaser />
    </main>
  );
}
