import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, ExternalLink, Music, Heart, CheckCircle2, XCircle } from 'lucide-react';
import type { ArtistProfile } from '../../backend';
import { useGetMediaItemsByArtist } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import ArtistOnboarding from '../../components/artist/ArtistOnboarding';
import StripeConnectionCard from '../../components/stripe/StripeConnectionCard';

interface DashboardHomeProps {
  artist: ArtistProfile;
}

export default function DashboardHome({ artist }: DashboardHomeProps) {
  const { identity } = useInternetIdentity();
  const artistId = identity?.getPrincipal().toString();
  const { data: media = [] } = useGetMediaItemsByArtist(artistId);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const avatarUrl = artist.avatar?.getDirectURL() || '/assets/generated/default-artist-avatar.dim_512x512.png';

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Profile</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={artist.displayName} />
                <AvatarFallback className="text-2xl">{artist.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{artist.displayName}</h3>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link to="/artist/$artistId" params={{ artistId: artistId || '' }}>
                    View Public Profile
                  </Link>
                </Button>
              </div>
            </div>

            {artist.bio && (
              <p className="text-sm text-muted-foreground">{artist.bio}</p>
            )}

            {artist.externalLinks.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">External Links:</p>
                {artist.externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your BuskBox overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Total Uploads</span>
              </div>
              <Badge variant="secondary" className="text-lg">
                {media.length}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Donations Status</span>
              </div>
              {artist.donationsEnabled ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Disabled
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stripe Connection */}
        <div className="md:col-span-2">
          <StripeConnectionCard />
        </div>
      </div>

      <ArtistOnboarding
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        existingProfile={artist}
        isEdit={true}
      />
    </>
  );
}
