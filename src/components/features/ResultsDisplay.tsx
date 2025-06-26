
'use client';

import type { ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients-types';
import type { AssessHealthSafetyOutput } from '@/ai/flows/assess-health-safety-types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, ListChecks, FileText, ClipboardX, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Share2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NutritionChart from './NutritionChart';

interface ResultsDisplayProps {
  ingredientsData: ExtractIngredientsOutput | null;
  assessmentData: AssessHealthSafetyOutput | null;
  imagePreviewUrl?: string | null; 
}

const ResultSection = ({ title, icon, children, hidden = false }: { title: string, icon: React.ReactNode, children: React.ReactNode, hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <div className="py-4">
      <h3 className="text-xl font-bold flex items-center mb-4 text-foreground/90">
        {icon}
        <span className="ml-3">{title}</span>
      </h3>
      <div className="pl-10 text-base text-muted-foreground">{children}</div>
    </div>
  );
};

const BulletList = ({ items, variant }: { items: string[], variant: 'pros' | 'cons' | 'warnings' | 'suitability' }) => {
  const iconMap = {
    pros: <CheckCircle className="h-5 w-5 text-green-500" />,
    cons: <XCircle className="h-5 w-5 text-red-500" />,
    warnings: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    suitability: <XCircle className="h-5 w-5 text-muted-foreground" />,
  };
  
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <div className="mr-3 mt-0.5 shrink-0">{iconMap[variant]}</div>
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
  const hasStructuredNutrition = nutrition?.nutrients && nutrition.nutrients.length > 0;

  const renderStars = (rating: number) => {
    const totalStars = 5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(totalStars)].map((_, index) => (
          <Star
            key={index}
            className={`h-8 w-8 ${index < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
          />
        ))}
        <span className="ml-3 text-3xl font-bold">{rating > 0 ? `${rating.toFixed(1)}/5` : 'N/A'}</span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30 mt-8">
      <CardHeader className="text-center p-8">
        {imagePreviewUrl && (
          <div className="mb-6 flex justify-center">
            <img 
              src={imagePreviewUrl} 
              alt="Scanned product label"
              className="max-h-60 w-auto rounded-lg border-2 border-white/10 object-contain"
            />
          </div>
        )}
        <CardTitle className="text-4xl font-black">
            {isZeroRatingScenario ? "Analysis Incomplete" : "Analysis Complete"}
        </CardTitle>
        <div className="mt-6 flex flex-col items-center gap-2">
         {renderStars(assessmentData.rating)}
         <p className="text-muted-foreground text-lg">Health Rating</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-8">
        <Separator className="bg-white/10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <ResultSection title="Dietary Suitability" icon={<ClipboardX className="h-6 w-6 text-primary" />} hidden={!dietInfo?.suitability || dietInfo.suitability.length === 0}>
                <BulletList items={dietInfo?.suitability || []} variant="suitability" />
            </ResultSection>

            <ResultSection title="Warnings" icon={<AlertTriangle className="h-6 w-6 text-yellow-400" />} hidden={!assessmentData.warnings || assessmentData.warnings.length === 0 || (isZeroRatingScenario && assessmentData.warnings[0]?.includes('Unable to evaluate'))}>
                <BulletList items={assessmentData.warnings} variant="warnings" />
            </ResultSection>

            <ResultSection title="Pros" icon={<ThumbsUp className="h-6 w-6 text-green-500" />} hidden={!assessmentData.pros || assessmentData.pros.length === 0 || isZeroRatingScenario}>
               <BulletList items={assessmentData.pros} variant="pros" />
            </ResultSection>

            <ResultSection title="Cons" icon={<ThumbsDown className="h-6 w-6 text-red-500" />} hidden={!assessmentData.cons || assessmentData.cons.length === 0 || isZeroRatingScenario}>
              <BulletList items={assessmentData.cons} variant="cons" />
            </ResultSection>
        </div>
        
        <Separator className="bg-white/10" />

        <ResultSection title="Allergen Information" icon={<ShieldAlert className="h-6 w-6 text-primary" />} hidden={!dietInfo?.allergens || dietInfo.allergens.length === 0}>
           <p className="font-medium text-lg text-yellow-300">Contains or may contain: {dietInfo?.allergens?.join(', ')}.</p>
        </ResultSection>
        
        <Separator className="bg-white/10" />

        <ResultSection title="Full Ingredient List" icon={<ListChecks className="h-6 w-6 text-primary" />} hidden={!ingredientsData?.ingredients || ingredientsData.ingredients.length === 0}>
          <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{ingredientsData?.ingredients?.join(', ')}</p>
        </ResultSection>
        
        <Separator className="bg-white/10" />
        
        <ResultSection title="Nutritional Information" icon={<FileText className="h-6 w-6 text-primary" />} hidden={!nutrition || (!hasStructuredNutrition && !nutrition.rawText)}>
          {hasStructuredNutrition ? (
            <div className="overflow-hidden rounded-md border border-white/10 bg-black/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/10">
                    <TableHead className="font-bold text-lg text-white">Nutrient</TableHead>
                    <TableHead className="text-right font-bold text-lg text-white">{nutrition.servingSizeLabel ? `Per ${nutrition.servingSizeLabel.split(':')[1]?.trim() || 'Serving'}` : 'Per Serving'}</TableHead>
                    <TableHead className="text-right font-bold text-lg text-white">Per 100mL/g</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nutrition.nutrients?.map((item, index) => (
                    <TableRow key={index} className="border-b-0">
                      <TableCell className="font-medium">{item.nutrient}</TableCell>
                      <TableCell className="text-right">{item.perServing ?? 'N/A'}</TableCell>
                      <TableCell className="text-right">{item.per100mL ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{nutrition?.rawText}</p>
          )}
          {hasStructuredNutrition && <NutritionChart data={nutrition.nutrients!} servingSizeLabel={nutrition.servingSizeLabel} />}
        </ResultSection>
      
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4 p-8">
        <div className="flex space-x-4">
            <Button variant="outline" className="rounded-full"><Share2 className="mr-2 h-4 w-4" /> Share Results</Button>
        </div>
        <p className="text-xs text-muted-foreground/60 px-4 text-center mt-4">
          Disclaimer: Information provided by EatInformed is for general guidance only and not a substitute for professional medical or nutritional advice. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or diet. Ingredient data and regulations can change; verify critical information with product packaging and official sources.
        </p>
        <div className="w-full h-24 bg-white/5 rounded-md flex items-center justify-center text-muted-foreground/50 text-sm mt-6 border border-white/10">
            [ Placeholder for Non-Intrusive Ad ]
        </div>
      </CardFooter>
    </Card>
  );
}
