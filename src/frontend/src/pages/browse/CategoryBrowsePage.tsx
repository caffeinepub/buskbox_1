import { useParams } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useGetMediaItemsByCategory } from '../../hooks/useQueries';
import { MediaCategory } from '../../backend';
import MediaCard from '../../components/media/MediaCard';
import MediaGrid from '../../components/media/MediaGrid';
import SearchBar from '../../components/search/SearchBar';
import { Music, Mic, Video } from 'lucide-react';

export default function CategoryBrowsePage() {
  const { category } = useParams({ from: '/category/$category' });
  const [searchQuery, setSearchQuery] = useState('');

  const categoryEnum = category as MediaCategory;
  const { data: media = [], isLoading } = useGetMediaItemsByCategory(categoryEnum);

  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return media;

    const query = searchQuery.toLowerCase();
    return media.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [media, searchQuery]);

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
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No media found matching your search.' : 'No media in this category yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
          </div>
          <MediaGrid>
            {filteredMedia.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </MediaGrid>
        </>
      )}
    </div>
  );
}
