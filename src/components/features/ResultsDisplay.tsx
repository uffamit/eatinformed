
'use client';

import type { ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients-types';
import type { AssessHealthSafetyOutput } from '@/ai/flows/assess-health-safety-types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, Leaf, Info, ListChecks, Target, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface ResultsDisplayProps {
  ingredientsData: ExtractIngredientsOutput | null;
  assessmentData: AssessHealthSafetyOutput | null;
  imagePreviewUrl?: string | null; 
}

export default function ResultsDisplay({ ingredientsData, assessmentData, imagePreviewUrl }: ResultsDisplayProps) {
  if (!assessmentData) { // Assessment data is the primary driver for display
    return null;
  }

  const isZeroRatingScenario = assessmentData.rating === 0 && 
                                 assessmentData.warnings?.includes("Unable to evaluate due to missing or unreadable label. Please upload a clear image.");

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
        <span className="ml-2 text-2xl font-bold">{rating.toFixed(1)}/5</span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl mt-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">
            {isZeroRatingScenario ? "Analysis Incomplete" : "Scan Results"}
        </CardTitle>
        {imagePreviewUrl && (
          <div className="mt-4 flex justify-center">
            <img src={imagePreviewUrl} alt="Scanned food label" className="max-h-48 rounded-md border object-contain" />
          </div>
        )}
        <div className="mt-4 flex flex-col items-center">
         {renderStars(assessmentData.rating)}
         <p className="text-muted-foreground mt-1">Health & Safety Rating</p>
         {isZeroRatingScenario && (
            <CardDescription className="mt-2 text-destructive">
                No ingredients or nutritional information found in the image.
            </CardDescription>
         )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Pros" icon={<ThumbsUp className="h-6 w-6 text-green-500" />} items={assessmentData.pros} variant="pros" isZeroRating={isZeroRatingScenario} />
          <InfoCard title="Cons" icon={<ThumbsDown className="h-6 w-6 text-red-500" />} items={assessmentData.cons} variant="cons" isZeroRating={isZeroRatingScenario} />
        </div>

        {assessmentData.warnings && assessmentData.warnings.length > 0 && (
          <InfoCard title="Warnings" icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />} items={assessmentData.warnings} variant="warnings" isZeroRating={isZeroRatingScenario}/>
        )}
        
        {!isZeroRatingScenario && ingredientsData && (
            <>
                <Separator />
                <DisclosureSection title="Ingredients List" icon={<ListChecks className="h-5 w-5 text-primary" />}>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{ingredientsData.ingredients?.join(', ') || 'No ingredients extracted.'}</p>
                </DisclosureSection>

                <DisclosureSection title="Nutritional Information" icon={<Target className="h-5 w-5 text-primary" />}>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{ingredientsData.nutritionInformation || 'No nutritional information extracted.'}</p>
                </DisclosureSection>
            </>
        )}
        
        <Separator />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center"><Info className="h-5 w-5 mr-2 text-primary" /> Dietary Information</h3>
          {assessmentData.dietaryInfo && (assessmentData.dietaryInfo.summary || assessmentData.dietaryInfo.allergens?.length > 0) ? (
            <>
              {assessmentData.dietaryInfo.summary && <p className="text-sm text-muted-foreground">{assessmentData.dietaryInfo.summary}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {assessmentData.dietaryInfo.isVegan && (
                  <Badge variant="outline" className="text-green-700 border-green-500/80 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/50">
                    Vegan
                  </Badge>
                )}
                {assessmentData.dietaryInfo.isVegetarian && !assessmentData.dietaryInfo.isVegan && (
                   <Badge variant="outline" className="text-green-700 border-green-500/80 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/50">
                    Vegetarian
                  </Badge>
                )}
                {assessmentData.dietaryInfo.isGlutenFree && (
                   <Badge variant="outline" className="text-green-700 border-green-500/80 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/50">
                    Gluten-Free
                  </Badge>
                )}
                {assessmentData.dietaryInfo.allergens?.map((allergen) => (
                  <Badge key={allergen} variant="destructive">
                    Contains {allergen}
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Dietary information could not be determined from the provided label.
            </p>
          )}
        </div>

      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
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

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  variant: 'pros' | 'cons' | 'warnings';
  isZeroRating?: boolean;
}

function InfoCard({ title, icon, items, variant, isZeroRating }: InfoCardProps) {
  let textColor = "text-foreground";
  if (variant === "pros" && !isZeroRating) textColor = "text-green-700 dark:text-green-400";
  if (variant === "cons" && !isZeroRating) textColor = "text-red-700 dark:text-red-400";
  if (variant === "warnings" && !isZeroRating) textColor = "text-yellow-700 dark:text-yellow-500";
  if (isZeroRating) textColor = "text-muted-foreground";
  
  let ItemIcon = Leaf;
  if (variant === "pros" && !isZeroRating) ItemIcon = ThumbsUp;
  if (variant === "cons" && !isZeroRating) ItemIcon = ThumbsDown;
  if (variant === "warnings") ItemIcon = AlertTriangle; // Keep AlertTriangle for warnings even in 0-rating


  return (
    <Card className="shadow-md_ hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center font-headline">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <ul className={`space-y-1 text-sm list-inside ${textColor}`}>
            {items.map((item, index) => (
              <li key={index} className="flex items-start">
                 {/* For 0-rating specific messages, don't show item icon if it's one of the placeholder texts */}
                {!(isZeroRating && (item.startsWith("None (no data") || item.startsWith("Unable to evaluate"))) &&
                    <ItemIcon className={`h-4 w-4 mr-2 mt-0.5 shrink-0 ${textColor === "text-foreground" ? "text-primary" : "" }`} />
                }
                {/* If it IS a zero-rating specific message, add a generic Info icon or similar if desired, or no icon */}
                {isZeroRating && (item.startsWith("None (no data") || item.startsWith("Unable to evaluate")) &&
                    <Info className={`h-4 w-4 mr-2 mt-0.5 shrink-0 ${textColor}`} /> 
                }
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} identified.</p>
        )}
      </CardContent>
    </Card>
  );
}


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface DisclosureSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function DisclosureSection({ title, icon, children }: DisclosureSectionProps) {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center">
                        {icon}
                        <span className="ml-2">{title}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    {children}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
