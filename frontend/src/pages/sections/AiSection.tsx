import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { SparklesIcon, TrashIcon, ArrowUpIcon, CrownIcon, InfinityIcon, ChevronRightIcon } from '../../components/Icons';
import {
  useAiUsage,
  useAiChats,
  useAiChat,
  useAiSend,
  useAiDeleteChat,
  type AiMessage,
} from '../../hooks/useAi';

/* ─── Message bubble ─── */
function Bubble({ msg }: { msg: AiMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2.5`}>
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
          style={{ backgroundColor: 'rgba(108,99,255,0.12)' }}
        >
          <SparklesIcon size={12} color="var(--accent)" />
        </div>
      )}
      <div
        className="max-w-[80%] px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap"
        style={{
          backgroundColor: isUser ? 'var(--accent)' : 'var(--surface)',
          color: isUser ? '#fff' : 'var(--text)',
          border: isUser ? 'none' : '1px solid var(--border)',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

/* ─── Chat view ─── */
function ChatView({ chatId, onBack }: { chatId: string | null; onBack: () => void }) {
  const { t } = useTranslation();
  const chat = useAiChat(chatId);
  const send = useAiSend();
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<AiMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allMessages = [...(chat.data?.messages ?? []), ...localMessages];

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [allMessages.length]);

  useEffect(() => {
    setLocalMessages([]);
    setActiveChatId(chatId);
  }, [chatId]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || send.isPending) return;
    setInput('');

    const userMsg: AiMessage = {
      id: `local-${Date.now()}`,
      chatId: activeChatId ?? '',
      role: 'user',
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);

    try {
      const result = await send.mutateAsync({
        message: msg,
        chatId: activeChatId ?? undefined,
      });
      if (!activeChatId) setActiveChatId(result.chatId);
      const assistantMsg: AiMessage = {
        id: `local-reply-${Date.now()}`,
        chatId: result.chatId,
        role: 'assistant',
        content: result.reply,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const errMsg: AiMessage = {
        id: `local-err-${Date.now()}`,
        chatId: activeChatId ?? '',
        role: 'assistant',
        content: e instanceof Error ? e.message : 'Error',
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="shrink-0 px-4 pt-2 pb-2">
        <button
          onClick={onBack}
          className="text-[11px] flex items-center gap-1 py-1 transition-opacity active:opacity-60"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronRightIcon size={14} color="var(--text-muted)" className="rotate-180" />
          {t('back')}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-2">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16">
            <div
              className="w-16 h-16 rounded-card flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)' }}
            >
              <SparklesIcon size={28} color="var(--accent)" />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              {t('aiWelcome')}
            </p>
            <p className="text-[11px] mt-1.5 text-center max-w-[260px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {t('aiWelcomeDesc')}
            </p>
          </div>
        )}
        {allMessages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}
        {send.isPending && (
          <div className="flex justify-start mb-2.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
              style={{ backgroundColor: 'rgba(108,99,255,0.12)' }}
            >
              <SparklesIcon size={12} color="var(--accent)" />
            </div>
            <div
              className="px-3.5 py-2.5 text-xs"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px 16px 16px 4px',
                color: 'var(--text-muted)',
              }}
            >
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-4 pt-2">
        <div
          className="flex items-end gap-2 rounded-card p-2"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('aiPlaceholder')}
            rows={1}
            maxLength={4000}
            className="flex-1 text-xs resize-none outline-none bg-transparent leading-relaxed"
            style={{ color: 'var(--text)', minHeight: '36px', maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || send.isPending}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity active:opacity-80"
            style={{
              backgroundColor: !input.trim() || send.isPending ? 'var(--surface2)' : 'var(--accent)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowUpIcon size={16} color={!input.trim() || send.isPending ? 'var(--text-muted)' : '#fff'} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export function AiSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const usage = useAiUsage();
  const chats = useAiChats();
  const deleteChat = useAiDeleteChat();
  const [activeChatId, setActiveChatId] = useState<string | null | 'new'>(null);

  if (activeChatId !== null) {
    return (
      <ChatView
        chatId={activeChatId === 'new' ? null : activeChatId}
        onBack={() => setActiveChatId(null)}
      />
    );
  }

  return (
    <div className="px-4 pt-2 pb-24">
      <SectionHeader
        title={t('sectionAi')}
        subtitle={t('sectionAiDesc')}
        onBack={onBack}
        backLabel={t('back')}
      />

      {/* Usage info */}
      {usage.data && (
        <div
          className="rounded-card p-3.5 mb-4 flex items-center gap-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0"
            style={{ backgroundColor: usage.data.isPlusActive ? 'rgba(245,200,66,0.12)' : 'rgba(108,99,255,0.12)' }}
          >
            {usage.data.isPlusActive ? (
              <InfinityIcon size={20} color="var(--gold)" />
            ) : (
              <SparklesIcon size={20} color="var(--accent)" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>
              {usage.data.isPlusActive ? 'Unlimited' : `${usage.data.remaining}/${usage.data.limit} free`}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {usage.data.isPlusActive
                ? 'Plus member'
                : `${usage.data.used} requests used`}
            </p>
          </div>
          {!usage.data.isPlusActive && usage.data.remaining === 0 && (
            <span
              className="text-[9px] font-bold px-2.5 py-1.5 rounded-btn flex items-center gap-1"
              style={{ backgroundColor: 'var(--gold)', color: '#000' }}
            >
              <CrownIcon size={10} color="#000" />
              {t('upgradePlus')}
            </span>
          )}
        </div>
      )}

      {/* New chat button */}
      <button
        onClick={() => setActiveChatId('new')}
        className="w-full py-3.5 text-sm font-bold rounded-btn mb-5 flex items-center justify-center gap-2 transition-opacity active:opacity-80"
        style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        <SparklesIcon size={16} color="#fff" />
        {t('newChat')}
      </button>

      {/* Chat history */}
      {chats.data && chats.data.length > 0 && (
        <>
          <p className="text-[11px] font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {t('chatHistory')}
          </p>
          <div className="flex flex-col gap-2">
            {chats.data.map((c) => (
              <div
                key={c.id}
                className="rounded-card p-3 flex items-center gap-3 transition-transform active:scale-[0.98]"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => setActiveChatId(c.id)}
              >
                <div
                  className="w-8 h-8 rounded-btn flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(108,99,255,0.08)' }}
                >
                  <SparklesIcon size={14} color="var(--accent)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {c.title}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat.mutate(c.id);
                  }}
                  className="p-1.5 rounded-btn transition-opacity active:opacity-60 shrink-0"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <TrashIcon size={14} color="var(--text-muted)" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
