
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, PartyPopper } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <PartyPopper className="mr-3 h-8 w-8 text-primary" />
            Welcome to NutriScan!
          </CardTitle>
          <CardDescription className="text-lg">
            We're glad to have you here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/300x200.png"
              data-ai-hint="celebration confetti"
              alt="Welcome illustration"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
          <p className="text-muted-foreground">
            You're all set to start exploring and making healthier food choices.
            What would you like to do next?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="shadow-md hover:shadow-primary/40 transition-shadow">
              <Link href="/check">
                <Smile className="mr-2 h-5 w-5" />
                Scan a Product
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
