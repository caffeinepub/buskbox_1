import { useState } from 'react';
import { useGetCallerArtist, useAddStripeAccessToken, useRevokeStripeAccessToken } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeConnectionCard() {
  const { data: artist, isLoading } = useGetCallerArtist();
  const addToken = useAddStripeAccessToken();
  const revokeToken = useRevokeStripeAccessToken();

  const [stripeToken, setStripeToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const isConnected = !!artist?.stripeAccessToken;

  const handleConnect = async () => {
    if (!stripeToken.trim()) {
      toast.error('Please enter your Stripe access token');
      return;
    }

    try {
      await addToken.mutateAsync(stripeToken);
      toast.success('Stripe account connected successfully!');
      setStripeToken('');
      setShowTokenInput(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect Stripe account');
    }
  };

  const handleDisconnect = async () => {
    try {
      await revokeToken.mutateAsync();
      toast.success('Stripe account disconnected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect Stripe account');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Connection
            </CardTitle>
            <CardDescription>Connect your Stripe account to receive donations</CardDescription>
          </div>
          {isConnected ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your Stripe account is connected. Donations are enabled on your media items.
              </AlertDescription>
            </Alert>
            <Button variant="destructive" onClick={handleDisconnect} disabled={revokeToken.isPending}>
              {revokeToken.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect Stripe'
              )}
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                Connect your Stripe account to enable donations. You'll receive 90% of each donation (10% platform fee).
              </AlertDescription>
            </Alert>

            {!showTokenInput ? (
              <Button onClick={() => setShowTokenInput(true)}>
                Connect Stripe Account
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripeToken">Stripe Access Token</Label>
                  <Input
                    id="stripeToken"
                    type="password"
                    value={stripeToken}
                    onChange={(e) => setStripeToken(e.target.value)}
                    placeholder="sk_live_..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your access token from your Stripe dashboard
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleConnect} disabled={addToken.isPending}>
                    {addToken.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowTokenInput(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
