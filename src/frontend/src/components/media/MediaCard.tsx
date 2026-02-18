import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Music, Video, Mic } from 'lucide-react';
import type { MediaItem, ArtistProfile } from '../../backend';
import { MediaCategory } from '../../backend';
import DonateDialog from '../donations/DonateDialog';
import MediaPlayback from './MediaPlayback';
import { useState } from 'react';
import { useIsStripeConfigured } from '../../hooks/useQueries';

interface MediaCardProps {
  media: MediaItem;
  artist?: ArtistProfile;
  donationsEnabled?: boolean;
  showPlayback?: boolean;
}

export default function MediaCard({ media, artist, donationsEnabled = false, showPlayback = false }: MediaCardProps) {
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const { data: isStripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();

  const getCategoryIcon = () => {
    switch (media.category) {
      case MediaCategory.video:
        return <Video className="h-4 w-4" />;
      case MediaCategory.liveSession:
        return <Mic className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = () => {
    switch (media.category) {
      case MediaCategory.video:
        return 'Video';
      case MediaCategory.liveSession:
        return 'Live Session';
      default:
        return 'Recording';
    }
  };

  const avatarUrl = artist?.avatar?.getDirectURL() || '/assets/generated/default-artist-avatar.dim_512x512.png';

  // Donations are available if artist has enabled them AND Stripe is configured globally
  const isDonationAvailable = donationsEnabled && isStripeConfigured && !stripeLoading;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {showPlayback ? (
          <MediaPlayback category={media.category} file={media.file} title={media.title} />
        ) : (
          <div className="aspect-video bg-muted relative">
            <img
              src="/assets/generated/media-placeholder-thumb.dim_1280x720.png"
              alt={media.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 right-2 gap-1">
              {getCategoryIcon()}
              {getCategoryLabel()}
            </Badge>
          </div>
        )}

        <CardContent className="pt-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{media.title}</h3>
            {media.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{media.description}</p>
            )}
          </div>

          {artist && (
            <Link
              to="/artist/$artistId"
              params={{ artistId: media.artistId.toString() }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={artist.displayName} />
                <AvatarFallback>{artist.displayName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{artist.displayName}</span>
            </Link>
          )}

          {media.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {media.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          {isDonationAvailable ? (
            <Button onClick={() => setShowDonateDialog(true)} className="w-full gap-2">
              <Heart className="h-4 w-4" />
              Support Artist
            </Button>
          ) : (
            <div className="w-full text-center text-sm text-muted-foreground py-2">
              {donationsEnabled ? 'Donations coming soon' : 'Donations not available'}
            </div>
          )}
        </CardFooter>
      </Card>

      {artist && (
        <DonateDialog
          open={showDonateDialog}
          onOpenChange={setShowDonateDialog}
          mediaId={media.id}
          mediaTitle={media.title}
          artistName={artist.displayName}
        />
      )}
    </>
  );
}
