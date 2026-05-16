'use client';

import { useState, useRef, useEffect, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analyzeProduct } from '@/ai/flows/product-analysis';
import { type ProductAnalysisOutput } from '@/ai/flows/product-analysis-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, Camera, RefreshCw, AlertCircle, ScanLine } from 'lucide-react';
import ResultsDisplay from '@/components/features/ResultsDisplay';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function CheckPageClient() {
  const { toast } = useToast();

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('Analyzing product...');
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<ProductAnalysisOutput | null>(null);
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
    setHasCameraPermission(null);
  }, []);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);
  
  const getCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access. Please use the upload option.',
        });
        return;
    }
    
    // Prefer the rear-facing camera for scanning product labels on mobile.
    const videoConstraints = {
      video: { facingMode: 'environment' }
    };

    try {
      // First, try to get the rear camera
      const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.warn('Failed to get rear camera, trying default camera:', err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
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
          description: 'Could not access camera. Please enable permissions in your browser settings.',
        });
      }
    }
  }, [toast]);
  
  const handleTabChange = useCallback((value: string) => {
    if (value === 'camera' && hasCameraPermission === null) {
      getCameraPermission();
    } else if (value !== 'camera' && streamRef.current) {
      stopCameraStream();
    }
  }, [getCameraPermission, hasCameraPermission, stopCameraStream]);


  const resizeAndCompressImage = (dataUri: string, callback: (resizedUri: string) => void) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_DIM = 1024;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.95));
      } else {
        callback(dataUri);
      }
    };
    img.src = dataUri;
  };

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        resizeAndCompressImage(dataUri, (compressedUri) => {
          setImagePreviewUrl(compressedUri);
        });
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
      
      const MAX_DIM = 1024;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, width, height);
        const dataUri = canvas.toDataURL('image/jpeg', 0.95);
        setImagePreviewUrl(dataUri);
        stopCameraStream();
      }
    }
  };

  const handleScan = useCallback(async (photoDataUri: string) => {
    setIsLoading(true);
    setLoadingStep('Analyzing product label...');
    setError(null);
    setAnalysisData(null);
    
    try {
      const result = await analyzeProduct(photoDataUri);

      if (result.status !== 'success') {
        if (result.status === 'unreadable') {
          setError('The image was unreadable. Please upload or capture a clearer photo of the product label.');
        } else if (result.status === 'no_data') {
          setError("We couldn't find any ingredient or nutrition text on the label. Please try a different image.");
        }
        setIsLoading(false);
        return;
      }
      
      setAnalysisData(result);

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
    stopCameraStream();
    setImagePreviewUrl(null);
    setAnalysisData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (analysisData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResultsDisplay ingredientsData={analysisData} assessmentData={analysisData} imagePreviewUrl={imagePreviewUrl} />
        <div className="text-center mt-12 mb-8">
          <Button onClick={handleReset} size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
            <RefreshCw className="mr-2 h-5 w-5" />
            Scan Another Product
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-xl mx-auto bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl mt-10">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center justify-center text-foreground drop-shadow-sm">
              <ScanLine className="mr-3 h-8 w-8 text-primary"/>
              Scan a Product
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground/80">
            {imagePreviewUrl ? "Confirm the image is clear, then start the analysis." : "Upload a clear image of a food label or use your camera to get an instant health analysis."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-6 py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-medium text-foreground">{loadingStep}</p>
                <p className="text-sm text-muted-foreground">This may take a moment.</p>
              </div>
            </motion.div>
          ) : imagePreviewUrl ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-6 py-6"
            >
              <p className="font-semibold text-lg text-foreground">Is this image clear?</p>
              <motion.div whileHover={{ scale: 1.05 }} className="relative rounded-xl overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20">
                <Image 
                  src={imagePreviewUrl} 
                  alt="Selected food label preview" 
                  width={240}
                  height={240}
                  className="max-h-60 w-auto object-contain bg-black/40"
                />
              </motion.div>
              <p className="text-sm text-muted-foreground text-center px-4">
                A clear photo of the ingredients list provides the best results.
              </p>
              <div className="flex w-full justify-center space-x-4 pt-4">
                <Button variant="outline" onClick={handleReset} className="rounded-full border-white/10 hover:bg-white/5">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={() => handleScan(imagePreviewUrl!)} className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40">
                  <ScanLine className="mr-2 h-4 w-4" />
                  Analyze Image
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/5 rounded-full p-1">
                  <TabsTrigger value="upload" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    <UploadCloud className="mr-2 h-5 w-5"/> Upload Image
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    <Camera className="mr-2 h-5 w-5" /> Use Camera
                  </TabsTrigger>
                </TabsList>
                <div className="mt-8">
                  <TabsContent value="upload" className="m-0">
                      <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={cn(
                          "flex flex-col items-center justify-center space-y-4 p-10 border-2 border-dashed rounded-2xl transition-all duration-300",
                          isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-white/20 hover:border-primary/50 hover:bg-white/5"
                        )}
                      >
                          <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                            <UploadCloud className="h-10 w-10" />
                          </div>
                          <div className="text-center">
                            <Label htmlFor="file-upload" className="text-lg font-semibold text-primary cursor-pointer hover:underline">
                                Click to upload an image
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-muted-foreground/60 px-2 py-1 bg-white/5 rounded-md">PNG, JPG, or WEBP</p>
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
                  <TabsContent value="camera" className="m-0">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
                      <video ref={videoRef} className="w-full aspect-video object-cover" autoPlay muted playsInline />
                      <canvas ref={canvasRef} className="hidden" />
                      {hasCameraPermission === false && (
                          <div className="p-6">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                  Please allow camera access in your browser to use this feature.
                                </AlertDescription>
                            </Alert>
                          </div>
                      )}
                       {hasCameraPermission === true && (
                           <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                              <Button onClick={handleCapture} size="lg" className="rounded-full shadow-lg shadow-black/50 backdrop-blur-md bg-primary/90 hover:bg-primary border border-white/20 hover:scale-105 transition-transform">
                                  <Camera className="mr-2 h-5 w-5" /> Capture Image
                              </Button>
                           </div>
                       )}
                       {hasCameraPermission === null && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                              <p className="text-sm text-white/80">Requesting camera access...</p>
                          </div>
                       )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          )}
          </AnimatePresence>
          {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
