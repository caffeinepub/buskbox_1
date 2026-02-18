import { useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccess() {
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/payment-success' }) as { mediaId?: string };

  useEffect(() => {
    // Invalidate donation-related queries after successful payment
    queryClient.invalidateQueries({ queryKey: ['mediaItem'] });
    queryClient.invalidateQueries({ queryKey: ['artistMedia'] });
  }, [queryClient]);

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>Your donation was successful</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Your support means the world to the artist. Thank you for helping independent musicians thrive!
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
              {search.mediaId && (
                <Button variant="outline" asChild>
                  <Link to="/category/$category" params={{ category: 'recording' }}>Discover More Music</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
