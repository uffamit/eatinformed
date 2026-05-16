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
import { motion } from 'framer-motion';

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
    <div className="flex flex-col items-center space-y-32 overflow-hidden pb-20">
      {/* Hero Section */}
      <section className="w-full pt-20 md:pt-32 lg:pt-40 text-center relative z-10">
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center space-y-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight drop-shadow-lg">
              Transform Your Nutrition with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-green-400 to-accent">
                AI Power
              </span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-[700px] text-muted-foreground text-lg md:text-2xl drop-shadow-md"
            >
              Upload a food label for instant AI analysis of ingredients, health, and dietary suitability. Make smarter choices, effortlessly.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <Dialog open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
                 <Button onClick={handleCheckProductClick} size="lg" className="rounded-full text-lg py-7 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                    <ScanLine className="mr-2 h-6 w-6" />
                    Check a Product
                </Button>
                <DialogContent className="max-w-md bg-card/90 backdrop-blur-xl border-border">
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
              <Button asChild variant="outline" size="lg" className="rounded-full text-lg py-7 px-8 hover:bg-white/5 hover:scale-105 transition-all duration-300 border-white/10">
                <Link href="#how-it-works">
                  Learn More
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 relative z-10">
         <div className="container px-4 md:px-6">
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
           >
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-semibold border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why You&apos;ll Love EatInformed</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              We provide the tools you need for food clarity.
            </p>
          </motion.div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
             <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Instant Analysis"
              description="Get results in seconds. Our AI quickly processes label images to give you immediate health insights."
              delay={0.1}
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-primary" />}
              title="Safety & Allergens"
              description="We flag controversial ingredients and clearly list potential allergens so you can eat with confidence."
              delay={0.2}
            />
             <FeatureCard
              icon={<Star className="h-8 w-8 text-primary" />}
              title="Simple Health Score"
              description="Our easy-to-understand 1-5 rating helps you quickly assess a product's overall healthiness."
              delay={0.3}
            />
          </div>
         </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-16 md:py-32 bg-secondary/30 rounded-[3rem] relative z-10 border border-white/5 backdrop-blur-sm">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-semibold border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Simple Steps to Food Clarity</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discovering what&apos;s in your food has never been easier.
            </p>
          </motion.div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-16">
            <FeatureCard
              icon={<UploadCloud className="h-8 w-8 text-primary" />}
              title="1. Upload Photo"
              description="Snap a picture of the food package's ingredient list and nutritional label. Clear photos work best!"
              delay={0.1}
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-primary" />}
              title="2. AI Analysis"
              description="Our advanced AI uses OCR to read the label, then cross-references ingredients with our extensive database."
              delay={0.2}
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-primary" />}
              title="3. Get Results"
              description="Receive a health rating, pros & cons, and warnings about harmful or banned ingredients."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container grid items-center justify-center gap-4 px-4 text-center md:px-6"
        >
          <div className="space-y-4">
             <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-semibold border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">Pricing</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Completely Free, For Everyone
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Our mission is to make nutritional information accessible. EatInformed is free to use, supported by non-intrusive ads on the results page.
            </p>
          </div>
           <div className="mx-auto w-full max-w-sm space-y-2 mt-8">
               <Button onClick={handleCheckProductClick} size="lg" className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 rounded-full py-7 text-lg hover:scale-105 transition-all duration-300">
                  <ScanLine className="mr-2 h-6 w-6" />
                  Start Scanning Now
              </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative p-8 rounded-3xl bg-secondary/40 border border-white/5 backdrop-blur-md shadow-xl hover:bg-secondary/60 hover:border-primary/30 transition-all duration-300"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center text-center sm:items-start sm:text-left gap-6">
            <div className="bg-background/80 p-4 rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    </motion.div>
  );
}
