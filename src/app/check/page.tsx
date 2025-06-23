'use client';

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { extractIngredients, type ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients';
import { assessHealthSafety, type AssessHealthSafetyOutput } from '@/ai/flows/assess-health-safety';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, Camera, RefreshCw, AlertCircle, ScanLine } from 'lucide-react';
import ResultsDisplay from '@/components/features/ResultsDisplay';

export default function CheckPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredientsData, setIngredientsData] = useState<ExtractIngredientsOutput | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessHealthSafetyOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to access this page.',
      });
    }
  }, [user, authLoading, router, toast]);

  // Request camera permission when camera tab is activated
  const handleTabChange = (value: string) => {
    if (value === 'camera' && hasCameraPermission === null) {
      getCameraPermission();
    }
  };

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
    }
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreviewUrl(dataUri);
        handleScan(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setImagePreviewUrl(dataUri);
        handleScan(dataUri);
      }
    }
  };

  const handleScan = useCallback(async (photoDataUri: string) => {
    setIsLoading(true);
    setError(null);
    setIngredientsData(null);
    setAssessmentData(null);
    
    try {
      // Step 1: Extract ingredients from image
      const extracted = await extractIngredients({ photoDataUri });
      setIngredientsData(extracted);

      // Step 2: Assess health safety based on extracted ingredients
      const assessment = await assessHealthSafety({ ingredients: extracted.ingredients });
      setAssessmentData(assessment);

    } catch (e: any) {
      console.error('Scan failed:', e);
      setError('An unexpected error occurred during analysis. The AI service may be temporarily unavailable. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: e.message || 'Could not process the image.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const handleReset = () => {
    setImagePreviewUrl(null);
    setIngredientsData(null);
    setAssessmentData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (assessmentData) {
    return (
      <div>
        <ResultsDisplay ingredientsData={ingredientsData} assessmentData={assessmentData} imagePreviewUrl={imagePreviewUrl} />
        <div className="text-center mt-6">
          <Button onClick={handleReset} size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Scan Another Product
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <ScanLine className="mr-3 h-8 w-8 text-primary"/>
            Scan a Product
        </CardTitle>
        <CardDescription>
          Upload a clear image of a food label or use your camera to get an instant health analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Analyzing your product...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        ) : (
          <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <UploadCloud className="mr-2 h-5 w-5"/> Upload Image
              </TabsTrigger>
              <TabsTrigger value="camera">
                <Camera className="mr-2 h-5 w-5" /> Use Camera
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6">
                <div className="flex flex-col items-center space-y-4 p-6 border-2 border-dashed rounded-lg">
                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                    <Label htmlFor="file-upload" className="text-lg font-semibold text-primary cursor-pointer hover:underline">
                        Click to upload an image
                    </Label>
                    <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP</p>
                    <Input
                        id="file-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                </div>
            </TabsContent>
            <TabsContent value="camera" className="mt-6">
              <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === false && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera access in your browser to use this feature.
                        </AlertDescription>
                    </Alert>
                )}
                 {hasCameraPermission && (
                     <div className="mt-4 flex justify-center">
                        <Button onClick={handleCapture} size="lg">
                            <Camera className="mr-2 h-5 w-5" /> Capture Image
                        </Button>
                     </div>
                 )}
              </div>
            </TabsContent>
          </Tabs>
        )}
        {error && (
            <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
