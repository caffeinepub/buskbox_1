import { useState } from 'react';
import { useOnboardArtist, useUpdateArtist } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalBlob, type ArtistProfile } from '../../backend';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

interface ArtistOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProfile?: ArtistProfile | null;
  isEdit?: boolean;
}

export default function ArtistOnboarding({ open, onOpenChange, existingProfile, isEdit = false }: ArtistOnboardingProps) {
  const [displayName, setDisplayName] = useState(existingProfile?.displayName || '');
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [externalLinks, setExternalLinks] = useState(existingProfile?.externalLinks.join('\n') || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onboardMutation = useOnboardArtist();
  const updateMutation = useUpdateArtist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Please enter your display name');
      return;
    }

    try {
      let avatarBlob = existingProfile?.avatar || ExternalBlob.fromURL('/assets/generated/default-artist-avatar.dim_512x512.png');

      if (avatarFile) {
        const bytes = new Uint8Array(await avatarFile.arrayBuffer());
        avatarBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const profile: ArtistProfile = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: avatarBlob,
        externalLinks: externalLinks.split('\n').filter(link => link.trim()),
        donationsEnabled: existingProfile?.donationsEnabled || false,
        stripeAccessToken: existingProfile?.stripeAccessToken
      };

      if (isEdit) {
        await updateMutation.mutateAsync(profile);
        toast.success('Profile updated successfully!');
      } else {
        await onboardMutation.mutateAsync(profile);
        toast.success('Welcome to BuskBox!');
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar must be less than 5MB');
        return;
      }
      setAvatarFile(file);
    }
  };

  const isLoading = onboardMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Profile' : 'Create Your Artist Profile'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your artist information' : 'Set up your profile to start sharing your music'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your artist name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your music..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              {avatarFile && (
                <span className="text-sm text-muted-foreground">{avatarFile.name}</span>
              )}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="links">External Links (one per line)</Label>
            <Textarea
              id="links"
              value={externalLinks}
              onChange={(e) => setExternalLinks(e.target.value)}
              placeholder="https://instagram.com/yourname&#10;https://youtube.com/yourchannel"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Profile' : 'Create Profile'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
