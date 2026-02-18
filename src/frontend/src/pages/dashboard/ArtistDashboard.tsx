import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerArtist } from '../../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import ArtistOnboarding from '../../components/artist/ArtistOnboarding';
import DashboardHome from './DashboardHome';
import DashboardMedia from './DashboardMedia';
import DashboardDonations from './DashboardDonations';

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: artist, isLoading: profileLoading, isFetched } = useGetCallerArtist();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && artist === null) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, artist]);

  if (isInitializing || profileLoading) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Artist Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your profile, uploads, and donations</p>
        </div>

        {artist === null ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete your artist profile to access the dashboard.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="home" className="space-y-6">
            <TabsList>
              <TabsTrigger value="home">Overview</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>

            <TabsContent value="home">
              <DashboardHome artist={artist!} />
            </TabsContent>

            <TabsContent value="media">
              <DashboardMedia />
            </TabsContent>

            <TabsContent value="donations">
              <DashboardDonations />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ArtistOnboarding
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        existingProfile={artist}
        isEdit={false}
      />
    </>
  );
}
