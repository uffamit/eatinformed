'use client';

import { useState, useRef, useEffect, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { extractIngredients } from '@/ai/flows/extract-ingredients';
import { type ExtractIngredientsOutput } from '@/ai/flows/extract-ingredients-types';
import { assessHealthSafety } from '@/ai/flows/assess-health-safety';
import { type AssessHealthSafetyOutput } from '@/ai/flows/assess-health-safety-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, Camera, RefreshCw, AlertCircle, ScanLine } from 'lucide-react';
import ResultsDisplay from '@/components/features/ResultsDisplay';
import { cn } from '@/lib/utils';

export function CheckPageClient() {
  const { toast } = useToast();

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredientsData, setIngredientsData] = useState<ExtractIngredientsOutput | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessHealthSafetyOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to stop the camera stream and release resources
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Reset permission state so it can be re-requested if the user revisits the tab.
    setHasCameraPermission(null);
  }, []);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);
  
  const getCameraPermission = useCallback(async () => {
    // Prefer the rear-facing camera for scanning product labels on mobile.
    const videoConstraints = {
      video: { facingMode: 'environment' }
    };

    try {
      // First, try to get the rear camera
      const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      streamRef.current = stream; // Store the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error('Failed to get rear camera, trying default camera:', err);
      // If the rear camera fails (e.g., on a desktop), fall back to any available camera.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream; // Store the stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (fallbackErr) {
        console.error('Error accessing any camera:', fallbackErr);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Could not access camera. Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    }
  }, [toast]);
  
  // Request camera permission when camera tab is activated, and clean up when leaving it.
  const handleTabChange = useCallback((value: string) => {
    if (value === 'camera' && hasCameraPermission === null) {
      getCameraPermission();
    } else if (value !== 'camera') {
      stopCameraStream();
    }
  }, [getCameraPermission, hasCameraPermission, stopCameraStream]);


  const processFile = (file: File | null | undefined) => {
    if (file) {
      const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!acceptedTypes.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PNG, JPG, or WEBP image.',
        });
        return;
      }
      // Security: Limit file size to 10MB to prevent DoS attacks
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSizeInBytes) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please upload an image smaller than 10MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreviewUrl(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
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
        stopCameraStream(); // Stop the camera after capture
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
      const extracted = await extractIngredients({ image: photoDataUri });

      // Step 1a: Check extraction status before proceeding
      if (extracted.status !== 'success') {
        if (extracted.status === 'unreadable') {
          setError('The image was unreadable. Please upload or capture a clearer photo of the product label.');
        } else if (extracted.status === 'no_data') {
          setError("We couldn't find any ingredient or nutrition text on the label. Please try a different image.");
        }
        setIngredientsData(extracted); // Still set data to show raw text if available
        setIsLoading(false);
        return; // Stop the process
      }
      
      setIngredientsData(extracted);

      // Step 2: Assess health safety based on extracted ingredients
      const ingredientsList = extracted.ingredients ? extracted.ingredients.join(', ') : '';
      const assessment = await assessHealthSafety({ ingredients: ingredientsList });
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
    stopCameraStream(); // Ensure camera is off on reset
    setImagePreviewUrl(null);
    setIngredientsData(null);
    setAssessmentData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (assessmentData) {
    return (
      <div>
        <ResultsDisplay ingredientsData={ingredientsData} assessmentData={assessmentData} imagePreviewUrl={imagePreviewUrl} />
        <div className="text-center mt-8">
          <Button onClick={handleReset} size="lg" className="rounded-full">
            <RefreshCw className="mr-2 h-5 w-5" />
            Scan Another Product
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle as="h1" className="text-3xl font-headline flex items-center justify-center">
            <ScanLine className="mr-3 h-8 w-8 text-primary"/>
            Scan a Product
        </CardTitle>
        <CardDescription>
          {imagePreviewUrl ? "Confirm the image is clear, then start the analysis." : "Upload a clear image of a food label or use your camera to get an instant health analysis."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Analyzing your product...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        ) : imagePreviewUrl ? (
          <div className="flex flex-col items-center space-y-4 p-4">
            <p className="font-semibold text-lg">Is this image clear?</p>
            <img 
              src={imagePreviewUrl} 
              alt="Selected food label preview" 
              className="max-h-60 w-auto rounded-md border-2 border-primary object-contain"
            />
            <p className="text-sm text-muted-foreground text-center">
              A clear photo of the ingredients list provides the best results.
            </p>
            <div className="flex w-full justify-center space-x-4 pt-4">
              <Button variant="outline" onClick={handleReset} className="rounded-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => handleScan(imagePreviewUrl!)} className="rounded-full">
                <ScanLine className="mr-2 h-4 w-4" />
                Analyze Image
              </Button>
            </div>
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
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-2 p-6 border-2 border-dashed rounded-lg transition-colors",
                    isDragging ? "border-primary bg-primary/10" : "border-white/20"
                  )}
                >
                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                    <Label htmlFor="file-upload" className="text-lg font-semibold text-primary cursor-pointer hover:underline">
                        Click to upload an image
                    </Label>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
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
                        <Button onClick={handleCapture} size="lg" className="rounded-full">
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
