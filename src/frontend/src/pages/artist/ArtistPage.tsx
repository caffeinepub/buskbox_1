import { useParams, Link } from '@tanstack/react-router';
import { useGetArtist, useGetMediaItemsByArtist, useIsDonationsEnabled } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Music } from 'lucide-react';
import MediaCard from '../../components/media/MediaCard';
import MediaGrid from '../../components/media/MediaGrid';

export default function ArtistPage() {
  const { artistId } = useParams({ from: '/artist/$artistId' });
  const { data: artist, isLoading: artistLoading } = useGetArtist(artistId);
  const { data: media = [], isLoading: mediaLoading } = useGetMediaItemsByArtist(artistId);
  const { data: donationsEnabled = false } = useIsDonationsEnabled(artistId);

  if (artistLoading) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Loading artist profile...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Artist not found</p>
            <Button asChild className="mt-4">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = artist.avatar?.getDirectURL() || '/assets/generated/default-artist-avatar.dim_512x512.png';

  return (
    <div className="container py-12">
      {/* Artist Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage src={avatarUrl} alt={artist.displayName} />
            <AvatarFallback className="text-4xl">{artist.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{artist.displayName}</h1>
              {donationsEnabled && (
                <Badge variant="default">Donations Enabled</Badge>
              )}
            </div>

            {artist.bio && (
              <p className="text-lg text-muted-foreground mb-4 whitespace-pre-wrap">{artist.bio}</p>
            )}

            {artist.externalLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artist.externalLinks.map((link, i) => (
                  <Button key={i} variant="outline" size="sm" asChild>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Link
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Artist Media */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Music className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Uploads</h2>
          <Badge variant="secondary">{media.length}</Badge>
        </div>

        {mediaLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading media...</p>
          </div>
        ) : media.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No uploads yet</p>
            </CardContent>
          </Card>
        ) : (
          <MediaGrid>
            {media.map((item) => (
              <MediaCard key={item.id} media={item} artist={artist} donationsEnabled={donationsEnabled} />
            ))}
          </MediaGrid>
        )}
      </div>
    </div>
  );
}
