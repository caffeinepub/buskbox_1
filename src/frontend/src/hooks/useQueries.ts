import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ArtistProfile, MediaItem, MediaItemDTO, MediaCategory, MediaItemInput, ShoppingItem, StripeConfiguration } from '../backend';
import { Principal } from '@dfinity/principal';

// Artist queries
export function useGetCallerArtist() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ArtistProfile | null>({
    queryKey: ['currentArtist'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerArtist();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched
  };
}

export function useGetArtist(artistId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile | null>({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      if (!actor || !artistId) return null;
      return actor.getArtist(Principal.fromText(artistId));
    },
    enabled: !!actor && !isFetching && !!artistId
  });
}

export function useOnboardArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ArtistProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.onboardArtist(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentArtist'] });
    }
  });
}

export function useUpdateArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ArtistProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArtist(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentArtist'] });
    }
  });
}

// Media queries
export function useGetAllMediaItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MediaItem[]>({
    queryKey: ['allMedia'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMediaItems();
    },
    enabled: !!actor && !isFetching
  });
}

export function useGetMediaItemsByArtist(artistId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<MediaItem[]>({
    queryKey: ['artistMedia', artistId],
    queryFn: async () => {
      if (!actor || !artistId) return [];
      return actor.getMediaItemsByArtist(Principal.fromText(artistId));
    },
    enabled: !!actor && !isFetching && !!artistId
  });
}

export function useGetMediaItemsByCategory(category: MediaCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<MediaItem[]>({
    queryKey: ['categoryMedia', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMediaItemsByCategory(category);
    },
    enabled: !!actor && !isFetching
  });
}

export function useGetMediaItem(mediaId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<MediaItemDTO | null>({
    queryKey: ['mediaItem', mediaId],
    queryFn: async () => {
      if (!actor || !mediaId) return null;
      return actor.getMediaItem(mediaId);
    },
    enabled: !!actor && !isFetching && !!mediaId
  });
}

export function useUploadMediaItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaInput: MediaItemInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadMediaItem(mediaInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMedia'] });
      queryClient.invalidateQueries({ queryKey: ['artistMedia'] });
      queryClient.invalidateQueries({ queryKey: ['categoryMedia'] });
    }
  });
}

export function useDeleteMediaItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMediaItem(mediaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMedia'] });
      queryClient.invalidateQueries({ queryKey: ['artistMedia'] });
      queryClient.invalidateQueries({ queryKey: ['categoryMedia'] });
    }
  });
}

// Stripe queries
export function useIsDonationsEnabled(artistId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['donationsEnabled', artistId],
    queryFn: async () => {
      if (!actor || !artistId) return false;
      return actor.isDonationsEnabled(Principal.fromText(artistId));
    },
    enabled: !!actor && !isFetching && !!artistId
  });
}

export function useAddStripeAccessToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStripeAccessToken(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentArtist'] });
      queryClient.invalidateQueries({ queryKey: ['donationsEnabled'] });
    }
  });
}

export function useRevokeStripeAccessToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeStripeAccessToken();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentArtist'] });
      queryClient.invalidateQueries({ queryKey: ['donationsEnabled'] });
    }
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    }
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ items, successUrl, cancelUrl }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    }
  });
}

export function useGetStripeSessionStatus(sessionId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['stripeSessionStatus', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId
  });
}
