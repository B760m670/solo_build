import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import {
  useFeed,
  useCreatePost,
  useToggleLike,
  useAddComment,
  usePostComments,
  useDeletePost,
} from '../../hooks/useSocial';
import type { Post } from '@unisouq/shared';

/* ─── Tier badge ─── */
const TIER_COLORS: Record<string, string> = {
  NEW: 'var(--text-muted)',
  TRUSTED: 'var(--teal)',
  EXPERT: 'var(--accent)',
  ELITE: 'var(--gold)',
};

/* ─── Create post ─── */
function NewPost() {
  const { t } = useTranslation();
  const create = useCreatePost();
  const [body, setBody] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!body.trim()) return;
    setErr(null);
    try {
      await create.mutateAsync({ body: body.trim() });
      setBody('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div
      className="rounded-card p-3 mb-4"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t('writePost')}
        rows={3}
        maxLength={2000}
        className="w-full text-xs resize-none outline-none rounded-btn p-2"
        style={{
          backgroundColor: 'var(--surface2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        }}
      />
      {err && <p className="text-[10px] mt-1" style={{ color: '#ff6b6b' }}>{err}</p>}
      <div className="flex justify-end mt-2">
        <button
          onClick={submit}
          disabled={!body.trim() || create.isPending}
          className="px-4 py-2 text-[11px] font-semibold rounded-btn"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            opacity: !body.trim() || create.isPending ? 0.5 : 1,
          }}
        >
          {t('publish')}
        </button>
      </div>
    </div>
  );
}

/* ─── Comment sheet ─── */
function CommentsSheet({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const comments = usePostComments(post.id);
  const addComment = useAddComment();
  const [body, setBody] = useState('');

  const submit = async () => {
    if (!body.trim()) return;
    await addComment.mutateAsync({ postId: post.id, body: body.trim() });
    setBody('');
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-card p-4 max-h-[70vh] flex flex-col"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-bold mb-3" style={{ color: 'var(--text)' }}>
          {t('comments')} ({post.commentCount})
        </p>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3">
          {comments.data?.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--surface2)' }}
              >
                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                  {c.user?.firstName?.[0] ?? '?'}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>
                  {c.user?.firstName ?? 'User'}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text)' }}>
                  {c.body}
                </p>
              </div>
            </div>
          ))}
          {comments.data?.length === 0 && (
            <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
              {t('noComments')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('addComment')}
            maxLength={1000}
            className="flex-1 px-3 py-2 text-xs rounded-btn outline-none"
            style={{
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
          <button
            onClick={submit}
            disabled={!body.trim() || addComment.isPending}
            className="px-3 py-2 text-[11px] font-semibold rounded-btn"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              opacity: !body.trim() ? 0.5 : 1,
            }}
          >
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Post card ─── */
function PostCard({
  post,
  currentUserId,
  onComment,
}: {
  post: Post;
  currentUserId: string;
  onComment: (post: Post) => void;
}) {
  const like = useToggleLike();
  const del = useDeletePost();
  const isMine = post.authorId === currentUserId;

  return (
    <div
      className="rounded-card p-3"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'var(--surface2)' }}
        >
          {post.author?.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
              {post.author?.firstName?.[0] ?? '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>
            {post.author?.firstName ?? 'User'}
            {post.author?.username && (
              <span style={{ color: 'var(--text-muted)' }}> @{post.author.username}</span>
            )}
          </p>
          {post.author?.reputationTier && (
            <span
              className="text-[8px] uppercase tracking-wide"
              style={{ color: TIER_COLORS[post.author.reputationTier] ?? 'var(--text-muted)' }}
            >
              {post.author.reputationTier}
            </span>
          )}
        </div>
        {isMine && (
          <button
            onClick={() => del.mutate(post.id)}
            className="text-[10px]"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Body */}
      <p className="text-xs whitespace-pre-wrap mb-2" style={{ color: 'var(--text)' }}>
        {post.body}
      </p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="w-full rounded-btn mb-2"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => like.mutate(post.id)}
          className="flex items-center gap-1 text-[11px]"
          style={{
            color: post.likedByMe ? 'var(--accent)' : 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={post.likedByMe ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {post.likeCount}
        </button>
        <button
          onClick={() => onComment(post)}
          className="flex items-center gap-1 text-[11px]"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post.commentCount}
        </button>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function SocialSection({
  onBack,
  currentUserId,
}: {
  onBack: () => void;
  currentUserId: string;
}) {
  const { t } = useTranslation();
  const feed = useFeed();
  const [commenting, setCommenting] = useState<Post | null>(null);

  return (
    <div className="px-4 pt-2 pb-24">
      <SectionHeader
        title={t('sectionSocial')}
        subtitle={t('sectionSocialDesc')}
        onBack={onBack}
        backLabel={t('back')}
      />

      <NewPost />

      {feed.isLoading && (
        <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
          {t('loading')}
        </p>
      )}
      {feed.data && feed.data.length === 0 && (
        <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
          {t('emptyFeed')}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {feed.data?.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            currentUserId={currentUserId}
            onComment={setCommenting}
          />
        ))}
      </div>

      {commenting && (
        <CommentsSheet
          post={commenting}
          onClose={() => setCommenting(null)}
        />
      )}
    </div>
  );
}
