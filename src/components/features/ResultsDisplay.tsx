
'use client';

import type { ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients';
import type { AssessHealthSafetyOutput } from '@/ai/flows/assess-health-safety';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, Leaf, Info, ListChecks, Target, Skull, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface ResultsDisplayProps {
  ingredientsData: ExtractIngredientsOutput | null;
  assessmentData: AssessHealthSafetyOutput | null;
  imagePreviewUrl?: string | null; 
}

export default function ResultsDisplay({ ingredientsData, assessmentData, imagePreviewUrl }: ResultsDisplayProps) {
  if (!ingredientsData || !assessmentData) {
    return null;
  }

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
        <CardTitle className="text-3xl font-headline">Scan Results</CardTitle>
        {imagePreviewUrl && (
          <div className="mt-4 flex justify-center">
            <img src={imagePreviewUrl} alt="Scanned food label" className="max-h-48 rounded-md border object-contain" />
          </div>
        )}
        <div className="mt-4 flex flex-col items-center">
         {renderStars(assessmentData.rating)}
         <p className="text-muted-foreground mt-1">Health & Safety Rating</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Pros" icon={<ThumbsUp className="h-6 w-6 text-green-500" />} items={assessmentData.pros} variant="pros" />
          <InfoCard title="Cons" icon={<ThumbsDown className="h-6 w-6 text-red-500" />} items={assessmentData.cons} variant="cons" />
        </div>

        {assessmentData.warnings && assessmentData.warnings.length > 0 && (
          <InfoCard title="Warnings" icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />} items={assessmentData.warnings} variant="warnings" />
        )}
        
        <Separator />

        <DisclosureSection title="Ingredients List" icon={<ListChecks className="h-5 w-5 text-primary" />}>
          <p className="text-sm text-foreground whitespace-pre-wrap">{ingredientsData.ingredients || 'No ingredients extracted.'}</p>
        </DisclosureSection>

        <DisclosureSection title="Nutritional Information" icon={<Target className="h-5 w-5 text-primary" />}>
          <p className="text-sm text-foreground whitespace-pre-wrap">{ingredientsData.nutritionInformation || 'No nutritional information extracted.'}</p>
        </DisclosureSection>
        
        <Separator />

        <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><Info className="h-5 w-5 mr-2 text-primary" /> Dietary Information</h3>
            <p className="text-sm text-muted-foreground">
                Allergen flags and dietary preference matching will be shown here in a future update. For example: "Contains: Gluten, Dairy. Suitable for Vegetarians."
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">Gluten-Free</Badge>
                <Badge variant="outline">Vegan</Badge>
                <Badge variant="destructive">Contains Peanuts</Badge>
            </div>
        </div>


      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <div className="flex space-x-2">
            <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share Results</Button>
        </div>
        <p className="text-xs text-muted-foreground px-4 text-center">
          Disclaimer: Information provided by NutriScan is for general guidance only and not a substitute for professional medical or nutritional advice. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or diet. Ingredient data and regulations can change; verify critical information with product packaging and official sources.
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
}

function InfoCard({ title, icon, items, variant }: InfoCardProps) {
  let textColor = "text-foreground";
  if (variant === "pros") textColor = "text-green-700 dark:text-green-400";
  if (variant === "cons") textColor = "text-red-700 dark:text-red-400";
  if (variant === "warnings") textColor = "text-yellow-700 dark:text-yellow-500";
  
  let ItemIcon = Leaf;
  if (variant === "pros") ItemIcon = ThumbsUp;
  if (variant === "cons") ItemIcon = ThumbsDown;
  if (variant === "warnings") ItemIcon = AlertTriangle;


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
                <ItemIcon className={`h-4 w-4 mr-2 mt-0.5 shrink-0 ${textColor === "text-foreground" ? "text-primary" : "" }`} />
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
