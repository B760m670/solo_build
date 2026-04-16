import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Post, PostComment } from '@unisouq/shared';

export function useFeed() {
  return useQuery<Post[]>({
    queryKey: ['social', 'feed'],
    queryFn: () => api.get<Post[]>('/social/feed'),
  });
}

export function usePostComments(postId: string | null) {
  return useQuery<PostComment[]>({
    queryKey: ['social', 'comments', postId],
    queryFn: () => api.get<PostComment[]>(`/social/posts/${postId}/comments`),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, imageUrl }: { body: string; imageUrl?: string }) =>
      api.post<Post>('/social/posts', { body, imageUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api.post<{ liked: boolean }>(`/social/posts/${postId}/like`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) =>
      api.post<PostComment>(`/social/posts/${postId}/comments`, { body }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['social', 'comments', vars.postId] });
      qc.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

export function useBoostPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, hours }: { postId: string; hours: number }) =>
      api.post<Post>(`/social/posts/${postId}/boost`, { hours }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social', 'feed'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.delete<{ ok: boolean }>(`/social/posts/${postId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}
