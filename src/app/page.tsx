
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Activity, ShieldCheck, Loader2 } from 'lucide-react';
import { NutriScanLogo } from '@/components/icons/NutriScanLogo';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'; 
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';


interface AuthAwareLinkButtonProps {
  currentUser: User | null;
  isLoadingAuth: boolean;
  href: string;
  buttonText: string;
  icon?: React.ReactNode;
  buttonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
  buttonSize?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
}

const AuthAwareLinkButton: React.FC<AuthAwareLinkButtonProps> = ({
  currentUser,
  isLoadingAuth,
  href,
  buttonText,
  icon,
  buttonVariant = "default",
  buttonSize = "lg",
  className = "",
}) => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handleButtonClick = () => {
    if (currentUser) {
      router.push(href);
    } else {
      setShowDialog(true);
    }
  };

  if (isLoadingAuth) {
    return (
      <Button variant={buttonVariant} size={buttonSize} className={className} disabled>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {buttonText}
      </Button>
    );
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <Button variant={buttonVariant} size={buttonSize} className={className} onClick={handleButtonClick}>
        {icon}
        {buttonText}
      </Button>
      {!currentUser && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to access this feature. Please log in or create an account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild onClick={() => { setShowDialog(false); router.push('/login'); }}>
               <span className="cursor-pointer">Log In</span>
            </AlertDialogAction>
            <AlertDialogAction asChild onClick={() => { setShowDialog(false); router.push('/signup'); }}>
               <span className="cursor-pointer">Sign Up</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
};


export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center text-center space-y-12">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]"> {/* Adjusted grid for potentially smaller logo */}
            <div className="flex flex-col justify-center space-y-4 text-left">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  NutriScan: Know Your Food's Truth
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Upload a photo of any packaged food label. Our AI instantly extracts ingredients, analyzes health impacts, and gives you a clear 1-5 rating. Make informed choices, effortlessly.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <AuthAwareLinkButton
                  currentUser={currentUser}
                  isLoadingAuth={isLoadingAuth}
                  href="/check"
                  buttonText="Check a Product Now"
                  icon={<UploadCloud className="mr-2 h-5 w-5" />}
                  buttonSize="lg"
                  className="shadow-lg hover:shadow-primary/50 transition-shadow"
                />
                <Button asChild variant="outline" size="lg">
                  <Link href="#how-it-works">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto flex justify-center items-center aspect-square sm:w-full lg:order-last lg:max-w-[250px] shadow-xl bg-muted/30 p-8 rounded-xl"> {/* Adjusted max-w for logo */}
              <NutriScanLogo width={200} height={200} /> {/* Explicit size */}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Simple Steps to Food Clarity</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discovering what's in your food has never been easier. Follow these simple steps.
              </p>
            </div>
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
              description="Receive a 1-5 health rating, pros & cons, and warnings about harmful or banned ingredients."
            />
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Ready to Scan Your First Product?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Empower your choices with clear, unbiased information. It's free, fast, and easy.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
             <AuthAwareLinkButton
                currentUser={currentUser}
                isLoadingAuth={isLoadingAuth}
                href="/check"
                buttonText="Start Scanning"
                icon={<UploadCloud className="mr-2 h-5 w-5" />}
                buttonSize="lg"
                className="w-full shadow-lg hover:shadow-primary/50 transition-shadow"
              />
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
    <Card className="text-left shadow-lg hover:shadow-xl transition-shadow_transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold pt-2 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
