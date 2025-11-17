
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Activity, ShieldCheck, ScanLine, Star, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AuthForm } from '@/components/features/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [openAuthDialog, setOpenAuthDialog] = useState(false);

  const handleCheckProductClick = () => {
    if (user) {
      router.push('/check');
    } else {
      setOpenAuthDialog(true);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-24 overflow-hidden">
      {/* Hero Section */}
      <section className="w-full pt-20 md:pt-32 lg:pt-40 text-center animate-slide-down [animation-delay:200ms] animate-fade-in">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight">
              Transform Your Nutrition with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                AI Power
              </span>
            </h1>
            <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl animate-fade-in [animation-delay:400ms]">
              Upload a food label for instant AI analysis of ingredients, health, and dietary suitability. Make smarter choices, effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-fade-in [animation-delay:600ms]">
              <Dialog open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
                 <Button onClick={handleCheckProductClick} size="lg" className="rounded-full text-lg py-7 px-8 shadow-lg shadow-primary/40 hover:scale-105 transition-transform">
                    <ScanLine className="mr-2 h-5 w-5" />
                    Check a Product
                </Button>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">Welcome to EatInformed</DialogTitle>
                        <DialogDescription className="text-center">
                            Sign in or create an account to get started.
                        </DialogDescription>
                    </DialogHeader>
                    <AuthForm onAuthSuccess={() => {
                        setOpenAuthDialog(false);
                        router.push('/check');
                    }} />
                </DialogContent>
              </Dialog>
              <Button asChild variant="outline" size="lg" className="rounded-full text-lg py-7 px-8 hover:bg-white/5 hover:scale-105 transition-transform">
                <Link href="#how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24">
         <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground font-semibold">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why You&apos;ll Love EatInformed</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              We provide the tools you need for food clarity.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
             <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Instant Analysis"
              description="Get results in seconds. Our AI quickly processes label images to give you immediate health insights."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-accent" />}
              title="Safety & Allergens"
              description="We flag controversial ingredients and clearly list potential allergens so you can eat with confidence."
            />
             <FeatureCard
              icon={<Star className="h-8 w-8 text-yellow-400" />}
              title="Simple Health Score"
              description="Our easy-to-understand 1-5 rating helps you quickly assess a product's overall healthiness."
            />
          </div>
         </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-12 md:py-24 bg-secondary/30 rounded-3xl">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground font-semibold">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Simple Steps to Food Clarity</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discovering what&apos;s in your food has never been easier.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
            <FeatureCard
              icon={<UploadCloud className="h-8 w-8 text-primary" />}
              title="1. Upload Photo"
              description="Snap a picture of the food package's ingredient list and nutritional label. Clear photos work best!"
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-primary" />}
              title="2. AI Analysis"
              description="Our advanced AI uses OCR to read the label, then cross-references ingredients with our extensive database."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-primary" />}
              title="3. Get Results"
              description="Receive a health rating, pros & cons, and warnings about harmful or banned ingredients."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
             <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground font-semibold">Pricing</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Completely Free, For Everyone
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Our mission is to make nutritional information accessible. EatInformed is free to use, supported by non-intrusive ads on the results page.
            </p>
          </div>
           <div className="mx-auto w-full max-w-sm space-y-2 mt-4">
               <Button onClick={handleCheckProductClick} size="lg" className="w-full shadow-lg rounded-full">
                  <ScanLine className="mr-2 h-5 w-5" />
                  Start Scanning Now
              </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-start gap-4">
              <div className="bg-secondary p-3 rounded-full">
                  {icon}
              </div>
              <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
              </div>
          </div>
        </div>
    </div>
  );
}
