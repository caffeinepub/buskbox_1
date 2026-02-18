import { useGetMediaItemsByArtist } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, TrendingUp, Info } from 'lucide-react';

export default function DashboardDonations() {
  const { identity } = useInternetIdentity();
  const artistId = identity?.getPrincipal().toString();
  const { data: media = [] } = useGetMediaItemsByArtist(artistId);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent" />
              Total Donations
            </CardTitle>
            <CardDescription>Lifetime earnings from your uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">$0.00</div>
            <p className="text-sm text-muted-foreground mt-2">
              Start receiving donations by connecting your Stripe account
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-1" />
              Total Uploads
            </CardTitle>
            <CardDescription>Media items available for donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{media.length}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {media.length === 0 ? 'Upload your first track to get started' : 'Keep sharing your music!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Your latest supporter contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Donation history will appear here once you start receiving support from your fans.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-Item Donations</CardTitle>
          <CardDescription>Breakdown by media item</CardDescription>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Upload media items to start tracking donations per upload.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {media.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground">0 donations</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$0.00</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
