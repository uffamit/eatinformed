
'use client';

import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { extractIngredients, type ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients';
import { assessHealthSafety, type AssessHealthSafetyOutput } from '@/ai/flows/assess-health-safety';
import ResultsDisplay from '@/components/features/ResultsDisplay';
import { Loader2, UploadCloud, FileScan, Sparkles } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [ingredientsData, setIngredientsData] = useState<ExtractIngredientsOutput | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessHealthSafetyOutput | null>(null);

  const [progressMessage, setProgressMessage] = useState<string>('');
  const [imagePreviewUrlForResults, setImagePreviewUrlForResults] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');


  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
      setError(null); 
    }
  }, [error, toast]);

  const handleCheckProductAgain = () => {
    setShowPopup(false);
    // TODO: Add logic here to reset the form and clear results if needed.
    // This is a good place to reset all relevant states for a new analysis.
    setFile(null);
    setImagePreviewUrl(null);
    setIngredientsData(null);
    setAssessmentData(null);
    setImagePreviewUrlForResults(null);
    setError(null);
    setProgressMessage('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).');
        setFile(null);
        setImagePreviewUrl(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Maximum size is 5MB.');
        setFile(null);
        setImagePreviewUrl(null);
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setIngredientsData(null); 
      setAssessmentData(null); 
      setShowPopup(false); // Ensure any previous popup is closed
      setImagePreviewUrlForResults(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !imagePreviewUrl) {
      setError('Please select an image file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIngredientsData(null);
    setAssessmentData(null);
    setShowPopup(false);
    setImagePreviewUrlForResults(imagePreviewUrl); // Set this for results display regardless of outcome

    let currentIngredientsData: ExtractIngredientsOutput | null = null;
    let currentAssessmentData: AssessHealthSafetyOutput | null = null;

    try {
      setProgressMessage('Extracting ingredients from image...');
      const extracted = await extractIngredients({ photoDataUri: imagePreviewUrl });
      
      let noUsefulIngredients = false;
      const extractedIngredientsText = extracted?.ingredients?.trim().toLowerCase() || "";
      const extractedNutritionText = extracted?.nutritionInformation?.trim().toLowerCase() || "";

      if (!extractedIngredientsText && !extractedNutritionText) {
        noUsefulIngredients = true;
      } else {
        const knownFailurePhrases = [
          "no ingredients found", "unable to extract ingredients", "ingredients not found",
          "could not extract ingredients", "no ingredients extracted", "no ingredients provided",
          "no ingredient information found", "ingredient list not visible", "no ingredients detected",
          "no nutritional information found", "unable to extract nutritional information",
        ];
        
        const ingredientsFail = !extractedIngredientsText || knownFailurePhrases.some(phrase => extractedIngredientsText.includes(phrase));
        const nutritionFail = !extractedNutritionText || knownFailurePhrases.some(phrase => extractedNutritionText.includes(phrase));
        
        if (ingredientsFail && nutritionFail) {
            noUsefulIngredients = true;
        }
      }

      if (noUsefulIngredients) {
        currentIngredientsData = {
            ingredients: "No ingredients or nutritional information found in the image.",
            nutritionInformation: "",
            status: extracted?.status || 'no_data' 
        };
        currentAssessmentData = {
          rating: 0,
          pros: ["None (no data available to assess)."],
          cons: ["None (no data available to assess)."],
          warnings: ["Unable to evaluate due to missing or unreadable label. Please upload a clear image."],
        };
      } else {
        currentIngredientsData = extracted;
        setProgressMessage('Assessing health & safety...');
        const assessment = await assessHealthSafety({ ingredients: extracted.ingredients });
        currentAssessmentData = assessment;
        setProgressMessage('Analysis complete!');
        toast({
          title: 'Analysis Complete',
          description: 'Product information processed successfully.',
        });
      }
      
      setIngredientsData(currentIngredientsData);
      setAssessmentData(currentAssessmentData);

      // Check for the specific 0-rating condition to show the new popup
      if (currentAssessmentData && currentAssessmentData.rating === 0 && currentAssessmentData.warnings?.includes("Unable to evaluate due to missing or unreadable label. Please upload a clear image.")) {
        setPopupMessage("Unable to process the image. The label is missing or too blurry to read. Please upload a clear image of the product label showing ingredients and nutritional information.");
        setShowPopup(true);
      }

    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorMessage = err.message || 'An unexpected error occurred during analysis.';
      setError(errorMessage);
      setIngredientsData(null);
      setAssessmentData(null); // Clear assessment data on general error too
    } finally {
      setIsLoading(false);
      // Clear progress message only if no specific popup is shown and no general error occurred
      if (!showPopup && !error) { 
         setProgressMessage('');
      }
    }
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center flex items-center justify-center">
            <FileScan className="mr-2 h-7 w-7 text-primary" />
            Check Your Food Product
          </CardTitle>
          <CardDescription className="text-center">
            Upload a clear photo of the packaged food's label (ingredients & nutritional info).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="food-image" className="text-base">Upload Food Label Image</Label>
              <div className="flex items-center justify-center w-full">
                <label
                    htmlFor="food-image"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-border hover:border-primary transition-colors"
                >
                    {imagePreviewUrl ? (
                        <Image src={imagePreviewUrl} alt="Preview" width={200} height={200} className="max-h-56 w-auto object-contain rounded-md" />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
                        </div>
                    )}
                    <Input id="food-image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
            
            <Button type="submit" className="w-full text-lg py-6 shadow-md hover:shadow-primary/40 transition-shadow" disabled={isLoading || !file}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Product
                </>
              )}
            </Button>
            {isLoading && progressMessage && (
              <p className="text-sm text-primary text-center animate-pulse">{progressMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Conditionally render ResultsDisplay only if there is assessmentData and no popup is active */}
      {!showPopup && assessmentData && (ingredientsData || assessmentData.rating === 0) && (
        <ResultsDisplay 
            ingredientsData={ingredientsData} 
            assessmentData={assessmentData} 
            imagePreviewUrl={imagePreviewUrlForResults} />
      )}

      <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processing Error</AlertDialogTitle>
            <AlertDialogDescription>
              {popupMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCheckProductAgain}>Check Product Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
