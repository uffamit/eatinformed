'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function CheckPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl">
            <Wrench className="mr-2 h-7 w-7 text-primary" />
            Feature Under Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The product scanning feature is temporarily disabled while we resolve a server issue. Please check back later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
