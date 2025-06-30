import type { Metadata } from 'next';
import { CheckPageClient } from '@/components/features/ImageUploadForm';

export const metadata: Metadata = {
  title: 'Check a Product - Instant AI Food Label Analysis',
  description: 'Use your camera or upload an image of a food label to get an instant, AI-powered analysis of its ingredients, health score, and dietary suitability.',
  keywords: ['food label scanner', 'nutrition checker', 'ingredient analysis', 'AI nutritionist', 'health score'],
  alternates: {
    canonical: '/check',
  },
};

export default function CheckPage() {
  return <CheckPageClient />;
}
