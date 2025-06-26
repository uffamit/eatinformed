
'use client';

import type { ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients-types';
import type { AssessHealthSafetyOutput } from '@/ai/flows/assess-health-safety-types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, ListChecks, FileText, ClipboardX, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Share2 } from 'lucide-react';

interface ResultsDisplayProps {
  ingredientsData: ExtractIngredientsOutput | null;
  assessmentData: AssessHealthSafetyOutput | null;
  imagePreviewUrl?: string | null; 
}

const ResultSection = ({ title, icon, children, hidden = false }: { title: string, icon: React.ReactNode, children: React.ReactNode, hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold flex items-center mb-3 text-foreground/90">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="pl-8 text-sm text-foreground">{children}</div>
    </div>
  );
};

const BulletList = ({ items, variant }: { items: string[], variant: 'pros' | 'cons' | 'warnings' | 'suitability' }) => {
  const iconMap = {
    pros: <CheckCircle className="h-4 w-4 text-green-500" />,
    cons: <XCircle className="h-4 w-4 text-red-500" />,
    warnings: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    suitability: <XCircle className="h-4 w-4 text-muted-foreground" />,
  };
  const textColorMap = {
    pros: 'text-green-800 dark:text-green-300',
    cons: 'text-red-800 dark:text-red-400',
    warnings: 'text-yellow-800 dark:text-yellow-400',
    suitability: 'text-muted-foreground',
  };

  return (
    <ul className={`space-y-2 ${textColorMap[variant]}`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <div className="mr-2 mt-0.5 shrink-0">{iconMap[variant]}</div>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};


export default function ResultsDisplay({ ingredientsData, assessmentData, imagePreviewUrl }: ResultsDisplayProps) {
  if (!assessmentData) {
    return null;
  }

  const isZeroRatingScenario = assessmentData.rating === 0;
  const dietInfo = assessmentData.dietaryInfo;
  const nutrition = ingredientsData?.nutrition;

  const renderStars = (rating: number) => {
    const totalStars = 5;
    return (
      <div className="flex items-center">
        {[...Array(totalStars)].map((_, index) => (
          <Star
            key={index}
            className={`h-7 w-7 ${index < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
          />
        ))}
        <span className="ml-2 text-2xl font-bold">{rating > 0 ? `${rating.toFixed(1)}/5` : 'N/A'}</span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl mt-8">
      <CardHeader className="text-center">
        {imagePreviewUrl && (
          <div className="mb-6 flex justify-center">
            <img 
              src={imagePreviewUrl} 
              alt="Scanned product label"
              className="max-h-60 w-auto rounded-md border object-contain"
            />
          </div>
        )}
        <CardTitle className="text-3xl font-headline">
            {isZeroRatingScenario ? "Analysis Incomplete" : "Analysis Complete"}
        </CardTitle>
        <CardDescription className="mt-1">
          {isZeroRatingScenario 
            ? assessmentData.warnings[0] || "Could not analyze the product." 
            : assessmentData.dietaryInfo.summary
          }
        </CardDescription>
        <div className="mt-4 flex flex-col items-center">
         {renderStars(assessmentData.rating)}
         <p className="text-muted-foreground mt-1">Health Rating</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 md:px-6">
        <Separator />

        <ResultSection title="Dietary Suitability" icon={<ClipboardX className="h-5 w-5 text-primary" />} hidden={!dietInfo?.suitability || dietInfo.suitability.length === 0}>
          <BulletList items={dietInfo?.suitability || []} variant="suitability" />
        </ResultSection>

        <ResultSection title="Pros" icon={<ThumbsUp className="h-5 w-5 text-primary" />} hidden={!assessmentData.pros || assessmentData.pros.length === 0 || isZeroRatingScenario}>
           <BulletList items={assessmentData.pros} variant="pros" />
        </ResultSection>

        <ResultSection title="Cons" icon={<ThumbsDown className="h-5 w-5 text-primary" />} hidden={!assessmentData.cons || assessmentData.cons.length === 0 || isZeroRatingScenario}>
          <BulletList items={assessmentData.cons} variant="cons" />
        </ResultSection>

        <ResultSection title="Warnings" icon={<AlertTriangle className="h-5 w-5 text-primary" />} hidden={!assessmentData.warnings || assessmentData.warnings.length === 0 || (isZeroRatingScenario && assessmentData.warnings[0]?.includes('Unable to evaluate'))}>
          <BulletList items={assessmentData.warnings} variant="warnings" />
        </ResultSection>
        
        <ResultSection title="Allergen Information" icon={<ShieldAlert className="h-5 w-5 text-primary" />} hidden={!dietInfo?.allergens || dietInfo.allergens.length === 0}>
           <p className="font-medium text-destructive">Contains or may contain: {dietInfo?.allergens?.join(', ')}.</p>
        </ResultSection>
        
        <ResultSection title="Full Ingredient List" icon={<ListChecks className="h-5 w-5 text-primary" />} hidden={!ingredientsData?.ingredients || ingredientsData.ingredients.length === 0}>
          <p className="text-sm text-foreground whitespace-pre-wrap">{ingredientsData?.ingredients?.join(', ')}</p>
        </ResultSection>
        
        <ResultSection title="Nutritional Information" icon={<FileText className="h-5 w-5 text-primary" />} hidden={!nutrition?.rawText}>
          <p className="text-sm text-foreground whitespace-pre-wrap">{nutrition?.rawText}</p>
        </ResultSection>
      
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4 pt-6">
        <div className="flex space-x-2">
            <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share Results</Button>
        </div>
        <p className="text-xs text-muted-foreground px-4 text-center">
          Disclaimer: Information provided by EatInformed is for general guidance only and not a substitute for professional medical or nutritional advice. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or diet. Ingredient data and regulations can change; verify critical information with product packaging and official sources.
        </p>
        <div className="w-full h-24 bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground text-sm mt-4">
            [ Placeholder for Non-Intrusive Ad ]
        </div>
      </CardFooter>
    </Card>
  );
}
