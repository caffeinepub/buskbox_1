import { useParams } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useGetMediaWithArtistDonationContext } from '../../hooks/useQueries';
import { MediaCategory } from '../../backend';
import MediaCard from '../../components/media/MediaCard';
import MediaGrid from '../../components/media/MediaGrid';
import SearchBar from '../../components/search/SearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Mic, Video, AlertCircle } from 'lucide-react';

export default function CategoryBrowsePage() {
  const { category } = useParams({ from: '/category/$category' });
  const [searchQuery, setSearchQuery] = useState('');

  const categoryEnum = category as MediaCategory;
  const { data: enrichedMedia = [], isLoading, isError } = useGetMediaWithArtistDonationContext();

  // Filter by category
  const categoryMedia = useMemo(() => {
    return enrichedMedia.filter((dto) => dto.media.mediaItem.category === categoryEnum);
  }, [enrichedMedia, categoryEnum]);

  // Filter by search query
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return categoryMedia;

    const query = searchQuery.toLowerCase();
    return categoryMedia.filter((dto) => {
      const item = dto.media.mediaItem;
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [categoryMedia, searchQuery]);

  const getCategoryInfo = () => {
    switch (categoryEnum) {
      case MediaCategory.video:
        return {
          title: 'Videos',
          description: 'Music videos and visual performances',
          icon: Video
        };
      case MediaCategory.liveSession:
        return {
          title: 'Live Sessions',
          description: 'Raw performances and acoustic sets',
          icon: Mic
        };
      default:
        return {
          title: 'Recordings',
          description: 'Studio tracks and original compositions',
          icon: Music
        };
    }
  };

  const categoryInfo = getCategoryInfo();
  const Icon = categoryInfo.icon;

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">{categoryInfo.title}</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">{categoryInfo.description}</p>

        <div className="max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, description, or tags..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load media. Please try again later.</p>
          </CardContent>
        </Card>
      ) : filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No media found matching your search.' : 'No media in this category yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <MediaGrid>
          {filteredMedia.map((dto) => (
            <MediaCard 
              key={dto.media.mediaItem.id} 
              media={dto.media.mediaItem} 
              artist={dto.artist.profile}
              donationsEnabled={dto.artist.profile.donationsEnabled && !!dto.artist.profile.stripeAccessToken}
            />
          ))}
        </MediaGrid>
      )}
    </div>
  );
}
