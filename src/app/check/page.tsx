'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
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

export default function CheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [ingredientsData, setIngredientsData] = useState<ExtractIngredientsOutput | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessHealthSafetyOutput | null>(null);

  const [progressMessage, setProgressMessage] = useState<string>('');

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
      setError(null); // Reset error after showing toast
    }
  }, [error, toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Basic file type validation
      if (!selectedFile.type.startsWith('image/')) {
        setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).');
        setFile(null);
        setImagePreviewUrl(null);
        return;
      }
      // Basic file size validation (e.g., 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
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
      setIngredientsData(null); // Reset previous results
      setAssessmentData(null); // Reset previous results
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

    try {
      setProgressMessage('Extracting ingredients from image...');
      const extracted = await extractIngredients({ photoDataUri: imagePreviewUrl });
      setIngredientsData(extracted);
      
      if (!extracted.ingredients || extracted.ingredients.trim() === "") {
        throw new Error("Could not extract ingredients from the image. Please try a clearer image or ensure the ingredients list is visible.");
      }
      
      setProgressMessage('Assessing health & safety...');
      const assessment = await assessHealthSafety({ ingredients: extracted.ingredients });
      setAssessmentData(assessment);
      
      setProgressMessage('Analysis complete!');
      toast({
        title: 'Analysis Complete',
        description: 'Product information processed successfully.',
      });

    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorMessage = err.message || 'An unexpected error occurred during analysis.';
      setError(errorMessage);
      setIngredientsData(null);
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
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

      {ingredientsData && assessmentData && (
        <ResultsDisplay ingredientsData={ingredientsData} assessmentData={assessmentData} imagePreviewUrl={imagePreviewUrl} />
      )}
    </div>
  );
}
