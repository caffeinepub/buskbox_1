import { useGetMediaItemsByArtist, useDeleteMediaItem } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Music, Mic, Video, Trash2, Loader2 } from 'lucide-react';
import { MediaCategory } from '../../backend';
import MediaUploadForm from '../../components/media/MediaUploadForm';
import { toast } from 'sonner';

export default function DashboardMedia() {
  const { identity } = useInternetIdentity();
  const artistId = identity?.getPrincipal().toString();
  const { data: media = [], isLoading } = useGetMediaItemsByArtist(artistId);
  const deleteMutation = useDeleteMediaItem();

  const handleDelete = async (mediaId: string, title: string) => {
    try {
      await deleteMutation.mutateAsync(mediaId);
      toast.success(`"${title}" deleted successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete media');
    }
  };

  const getCategoryIcon = (category: MediaCategory) => {
    switch (category) {
      case MediaCategory.video:
        return <Video className="h-4 w-4" />;
      case MediaCategory.liveSession:
        return <Mic className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: MediaCategory) => {
    switch (category) {
      case MediaCategory.video:
        return 'Video';
      case MediaCategory.liveSession:
        return 'Live Session';
      default:
        return 'Recording';
    }
  };

  return (
    <div className="space-y-6">
      <MediaUploadForm />

      <Card>
        <CardHeader>
          <CardTitle>Your Uploads</CardTitle>
          <CardDescription>Manage your media library</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No uploads yet. Upload your first track above!
            </div>
          ) : (
            <div className="space-y-4">
              {media.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            {getCategoryIcon(item.category)}
                            {getCategoryLabel(item.category)}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{item.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your media item.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id, item.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
