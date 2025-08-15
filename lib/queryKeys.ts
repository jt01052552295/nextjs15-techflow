// lib/queryKeys.ts
export const qk = {
  posts: (q?: string, sort?: string) =>
    ['posts', { q: q ?? '', sort: sort ?? 'latest' }] as const,
  post: (id: string) => ['post', id] as const,
  comments: (postId: string) => ['comments', postId] as const,
};
