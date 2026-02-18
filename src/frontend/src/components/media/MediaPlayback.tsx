import { AlertCircle } from 'lucide-react';
import { MediaCategory } from '../../backend';
import type { ExternalBlob } from '../../backend';

interface MediaPlaybackProps {
  category: MediaCategory;
  file: ExternalBlob;
  title: string;
}

export default function MediaPlayback({ category, file, title }: MediaPlaybackProps) {
  const mediaUrl = file?.getDirectURL();

  if (!mediaUrl) {
    return (
      <div className="aspect-video bg-muted flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Media file not available</p>
        </div>
      </div>
    );
  }

  if (category === MediaCategory.video) {
    return (
      <div className="aspect-video bg-black">
        <video
          controls
          className="w-full h-full"
          preload="metadata"
          title={title}
        >
          <source src={mediaUrl} />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  // For recording and liveSession categories, use audio player
  return (
    <div className="aspect-video bg-muted flex items-center justify-center p-4">
      <audio
        controls
        className="w-full max-w-md"
        preload="metadata"
        title={title}
      >
        <source src={mediaUrl} />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
