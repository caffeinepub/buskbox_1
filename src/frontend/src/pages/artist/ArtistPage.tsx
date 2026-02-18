import { useParams } from '@tanstack/react-router';
import { useGetArtist, useGetMediaItemsByArtist, useIsStripeConfigured } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Heart } from 'lucide-react';
import MediaGrid from '../../components/media/MediaGrid';
import MediaCard from '../../components/media/MediaCard';

export default function ArtistPage() {
  const { artistId } = useParams({ from: '/artist/$artistId' });
  const { data: artist, isLoading: artistLoading } = useGetArtist(artistId);
  const { data: mediaItems = [], isLoading: mediaLoading } = useGetMediaItemsByArtist(artistId);
  const { data: isStripeConfigured } = useIsStripeConfigured();

  if (artistLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Artist not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = artist.avatar?.getDirectURL() || '/assets/generated/default-artist-avatar.dim_512x512.png';
  const donationsAvailable = artist.donationsEnabled && isStripeConfigured;

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Artist Profile Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={artist.displayName} />
              <AvatarFallback className="text-2xl">{artist.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">{artist.displayName}</CardTitle>
                  {donationsAvailable && (
                    <Badge variant="default" className="mt-2 gap-1">
                      <Heart className="h-3 w-3" />
                      Donations Enabled
                    </Badge>
                  )}
                </div>
              </div>
              {artist.bio && (
                <CardDescription className="text-base whitespace-pre-wrap">{artist.bio}</CardDescription>
              )}
              {artist.externalLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {artist.externalLinks.map((link, i) => (
                    <Button key={i} variant="outline" size="sm" asChild>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <ExternalLink className="h-3 w-3" />
                        Link {i + 1}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Artist's Media */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Uploads</h2>
          {mediaLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video" />
                  <CardContent className="pt-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mediaItems.length > 0 ? (
            <MediaGrid>
              {mediaItems.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  artist={artist}
                  donationsEnabled={artist.donationsEnabled}
                  showPlayback={true}
                />
              ))}
            </MediaGrid>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No uploads yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
