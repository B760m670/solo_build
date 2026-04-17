import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { HeartIcon, MessageIcon, TrashIcon, ArrowUpIcon, UsersIcon, FireIcon } from '../../components/Icons';
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
const TIER_STYLE: Record<string, { color: string; bg: string }> = {
  NEW: { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)' },
  TRUSTED: { color: 'var(--teal)', bg: 'rgba(0,212,170,0.08)' },
  EXPERT: { color: 'var(--accent)', bg: 'rgba(108,99,255,0.08)' },
  ELITE: { color: 'var(--gold)', bg: 'rgba(245,200,66,0.08)' },
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
        className="w-full text-xs resize-none outline-none rounded-btn p-2.5"
        style={{
          backgroundColor: 'var(--surface2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        }}
      />
      {err && <p className="text-[10px] mt-1" style={{ color: '#ff6b6b' }}>{err}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
          {body.length}/2000
        </span>
        <button
          onClick={submit}
          disabled={!body.trim() || create.isPending}
          className="px-4 py-2 text-[11px] font-bold rounded-btn flex items-center gap-1.5 transition-opacity active:opacity-80"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            opacity: !body.trim() || create.isPending ? 0.4 : 1,
          }}
        >
          <ArrowUpIcon size={12} color="#fff" />
          {t('publish')}
        </button>
      </div>
    </div>
  );
}

/* ─── Comment sheet ─── */
function CommentsSheet({ post, onClose }: { post: Post; onClose: () => void }) {
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
    <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-[20px] p-4 max-h-[70vh] flex flex-col"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageIcon size={16} color="var(--accent)" />
          <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
            {t('comments')} ({post.commentCount})
          </p>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3">
          {comments.data?.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                style={{ backgroundColor: 'var(--surface2)' }}
              >
                {c.user?.avatarUrl ? (
                  <img src={c.user.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                    {c.user?.firstName?.[0] ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>
                  {c.user?.firstName ?? 'User'}
                </p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text)' }}>
                  {c.body}
                </p>
              </div>
            </div>
          ))}
          {comments.data?.length === 0 && (
            <div className="flex flex-col items-center py-6">
              <MessageIcon size={24} color="var(--text-muted)" />
              <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                {t('noComments')}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={t('addComment')}
            maxLength={1000}
            className="flex-1 px-3 py-2.5 text-xs rounded-btn outline-none"
            style={{
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
          <button
            onClick={submit}
            disabled={!body.trim() || addComment.isPending}
            className="px-3 py-2.5 text-[11px] font-bold rounded-btn transition-opacity active:opacity-80"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              opacity: !body.trim() ? 0.4 : 1,
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
  const tier = post.author?.reputationTier ? TIER_STYLE[post.author.reputationTier] : null;
  const isBoosted = post.boostedUntil && new Date(post.boostedUntil) > new Date();

  return (
    <div
      className="rounded-card overflow-hidden transition-transform"
      style={{
        backgroundColor: 'var(--surface)',
        border: isBoosted ? '1px solid var(--gold)' : '1px solid var(--border)',
      }}
    >
      {/* Boosted indicator */}
      {isBoosted && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5"
          style={{ backgroundColor: 'rgba(245,200,66,0.06)' }}
        >
          <FireIcon size={10} color="var(--gold)" />
          <span className="text-[8px] uppercase tracking-wider font-bold" style={{ color: 'var(--gold)' }}>
            Boosted
          </span>
        </div>
      )}

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{ backgroundColor: 'var(--surface2)' }}
          >
            {post.author?.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                <span className="font-normal" style={{ color: 'var(--text-muted)' }}> @{post.author.username}</span>
              )}
            </p>
            {tier && (
              <span
                className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                style={{ backgroundColor: tier.bg, color: tier.color }}
              >
                {post.author!.reputationTier}
              </span>
            )}
          </div>
          {isMine && (
            <button
              onClick={() => del.mutate(post.id)}
              className="p-1.5 rounded-btn transition-opacity active:opacity-60"
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <TrashIcon size={14} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {/* Body */}
        <p className="text-xs whitespace-pre-wrap leading-relaxed mb-2.5" style={{ color: 'var(--text)' }}>
          {post.body}
        </p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="w-full rounded-btn mb-2.5"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => like.mutate(post.id)}
            className="flex items-center gap-1.5 text-[11px] font-medium py-1.5 transition-transform active:scale-95"
            style={{
              color: post.likedByMe ? '#ff6b6b' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <HeartIcon size={15} color={post.likedByMe ? '#ff6b6b' : 'var(--text-muted)'} filled={post.likedByMe} />
            {post.likeCount}
          </button>
          <button
            onClick={() => onComment(post)}
            className="flex items-center gap-1.5 text-[11px] font-medium py-1.5 transition-transform active:scale-95"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <MessageIcon size={15} color="var(--text-muted)" />
            {post.commentCount}
          </button>
        </div>
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
        title={t('sectionCommunity')}
        subtitle={t('sectionCommunityDesc')}
        onBack={onBack}
        backLabel={t('back')}
      />

      <NewPost />

      {feed.isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}
      {feed.data && feed.data.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <UsersIcon size={32} color="var(--text-muted)" />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{t('emptyFeed')}</p>
        </div>
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
