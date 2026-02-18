import { useState } from 'react';
import { useUploadMediaItem } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob, MediaCategory, type MediaItemInput } from '../../backend';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';

interface FileUpload {
  file: File;
  title: string;
  description: string;
  category: MediaCategory;
  tags: string;
  progress: number;
}

export default function MediaUploadForm() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const uploadMutation = useUploadMediaItem();
  const { identity } = useInternetIdentity();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newUploads: FileUpload[] = selectedFiles.map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      category: MediaCategory.recording,
      tags: '',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newUploads]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFile = (index: number, updates: Partial<FileUpload>) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const handleUpload = async () => {
    if (!identity) {
      toast.error('Please login to upload media');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    for (const [index, fileUpload] of files.entries()) {
      try {
        const bytes = new Uint8Array(await fileUpload.file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          updateFile(index, { progress: percentage });
        });

        const mediaInput: MediaItemInput = {
          title: fileUpload.title,
          description: fileUpload.description,
          category: fileUpload.category,
          tags: fileUpload.tags.split(',').map(t => t.trim()).filter(Boolean),
          file: blob,
          artistId: identity.getPrincipal(),
          created: BigInt(Date.now() * 1000000)
        };

        await uploadMutation.mutateAsync(mediaInput);
        toast.success(`${fileUpload.title} uploaded successfully!`);
      } catch (error: any) {
        toast.error(`Failed to upload ${fileUpload.title}: ${error.message}`);
      }
    }

    setFiles([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
        <CardDescription>Share your recordings, live sessions, or videos with the world</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to select files</p>
              <p className="text-xs text-muted-foreground">Support for audio and video files</p>
            </div>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="audio/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </Label>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            {files.map((fileUpload, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={fileUpload.title}
                          onChange={(e) => updateFile(index, { title: e.target.value })}
                          placeholder="Track title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={fileUpload.description}
                          onChange={(e) => updateFile(index, { description: e.target.value })}
                          placeholder="Describe your track..."
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={fileUpload.category}
                            onValueChange={(value) => updateFile(index, { category: value as MediaCategory })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MediaCategory.recording}>Recording</SelectItem>
                              <SelectItem value={MediaCategory.liveSession}>Live Session</SelectItem>
                              <SelectItem value={MediaCategory.video}>Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Tags (comma-separated)</Label>
                          <Input
                            value={fileUpload.tags}
                            onChange={(e) => updateFile(index, { tags: e.target.value })}
                            placeholder="jazz, acoustic, live"
                          />
                        </div>
                      </div>

                      {fileUpload.progress > 0 && fileUpload.progress < 100 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{fileUpload.progress}%</span>
                          </div>
                          <Progress value={fileUpload.progress} />
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="ml-4"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="w-full">
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
