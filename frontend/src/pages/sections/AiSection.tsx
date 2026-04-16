import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SparklesIcon, TrashIcon, ArrowUpIcon, CrownIcon, InfinityIcon, ChevronRightIcon, ClockIcon, PlusIcon } from '../../components/Icons';
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

/* ─── History sidebar ─── */
function HistoryPanel({
  onClose,
  onSelect,
  onNew,
}: {
  onClose: () => void;
  onSelect: (chatId: string) => void;
  onNew: () => void;
}) {
  const { t } = useTranslation();
  const chats = useAiChats();
  const deleteChat = useAiDeleteChat();

  return (
    <div className="fixed inset-0 z-40 flex" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-[280px] h-full overflow-y-auto flex flex-col"
        style={{ backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{t('chatHistory')}</p>
          <button onClick={onClose} className="text-[11px]" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            {t('close')}
          </button>
        </div>

        {/* New chat button */}
        <button
          onClick={onNew}
          className="mx-3 mt-3 mb-2 py-2.5 text-[11px] font-bold rounded-btn flex items-center justify-center gap-1.5 transition-opacity active:opacity-80"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <PlusIcon size={14} color="#fff" />
          {t('newChat')}
        </button>

        <div className="flex-1 px-3 pb-3">
          {chats.data?.map((c) => (
            <div
              key={c.id}
              className="rounded-btn p-2.5 mb-1.5 flex items-center gap-2.5 transition-colors"
              style={{ backgroundColor: 'var(--surface2)', cursor: 'pointer' }}
              onClick={() => onSelect(c.id)}
            >
              <SparklesIcon size={12} color="var(--accent)" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                  {c.title}
                </p>
                <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {new Date(c.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteChat.mutate(c.id); }}
                className="p-1 shrink-0 transition-opacity active:opacity-60"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <TrashIcon size={11} color="var(--text-muted)" />
              </button>
            </div>
          ))}
          {chats.data?.length === 0 && (
            <p className="text-[10px] text-center py-6" style={{ color: 'var(--text-muted)' }}>
              {t('nothingHere')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Suggestion chips ─── */
const SUGGESTIONS_EN = [
  'Write a post for my social page',
  'Give me a creative business idea',
  'Translate this text to Arabic',
  'Help me brainstorm a gift name',
];
const SUGGESTIONS_RU = [
  'Напиши пост для моей страницы',
  'Предложи креативную бизнес-идею',
  'Переведи текст на арабский',
  'Помоги придумать название подарка',
];

/* ─── Main section ─── */
export function AiSection({ onBack }: { onBack: () => void }) {
  const { t, lang } = useTranslation();
  const usage = useAiUsage();
  const send = useAiSend();
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<AiMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing chat when selected from history
  const loadedChat = useAiChat(activeChatId);
  const serverMessages = loadedChat.data?.messages ?? [];

  // Clear local messages once the server has caught up
  // (server will contain the messages we added locally)
  useEffect(() => {
    if (serverMessages.length > 0 && localMessages.length > 0) {
      setLocalMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverMessages.length]);

  const allMessages = [...serverMessages, ...localMessages];

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [allMessages.length]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
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

  const startNewChat = () => {
    setActiveChatId(null);
    setLocalMessages([]);
    setHistoryOpen(false);
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setLocalMessages([]);
    setHistoryOpen(false);
  };

  const suggestions = lang === 'ru' ? SUGGESTIONS_RU : SUGGESTIONS_EN;
  const isEmpty = allMessages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-2 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[11px] flex items-center gap-1 py-1 transition-opacity active:opacity-60"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronRightIcon size={14} color="var(--text-muted)" className="rotate-180" />
          {t('back')}
        </button>

        <div className="flex items-center gap-2">
          {/* Usage indicator */}
          {usage.data && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-btn" style={{ backgroundColor: 'var(--surface)' }}>
              {usage.data.isPlusActive ? (
                <InfinityIcon size={12} color="var(--gold)" />
              ) : (
                <span className="text-[9px] font-bold" style={{ color: usage.data.remaining === 0 ? '#ff6b6b' : 'var(--teal)' }}>
                  {usage.data.remaining}/{usage.data.limit}
                </span>
              )}
            </div>
          )}

          {/* New chat */}
          <button
            onClick={startNewChat}
            className="w-8 h-8 rounded-btn flex items-center justify-center transition-opacity active:opacity-60"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
            title={t('newChat')}
          >
            <PlusIcon size={14} color="var(--text-muted)" />
          </button>

          {/* History */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="w-8 h-8 rounded-btn flex items-center justify-center transition-opacity active:opacity-60"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
            title={t('chatHistory')}
          >
            <ClockIcon size={14} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-2">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center pt-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
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

            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-[320px]">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-[10px] px-3 py-2 rounded-card transition-all active:scale-95"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Plus upsell */}
            {usage.data && !usage.data.isPlusActive && usage.data.remaining === 0 && (
              <div
                className="mt-6 rounded-card p-3 flex items-center gap-2"
                style={{ backgroundColor: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.15)' }}
              >
                <CrownIcon size={16} color="var(--gold)" />
                <span className="text-[10px] font-semibold" style={{ color: 'var(--gold)' }}>
                  {t('upgradePlus')}
                </span>
              </div>
            )}
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

      {/* Input bar */}
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
            onClick={() => handleSend()}
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

      {/* History sidebar */}
      {historyOpen && (
        <HistoryPanel
          onClose={() => setHistoryOpen(false)}
          onSelect={selectChat}
          onNew={startNewChat}
        />
      )}
    </div>
  );
}
