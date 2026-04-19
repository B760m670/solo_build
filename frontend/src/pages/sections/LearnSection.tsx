import { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import {
  BookOpenIcon,
  StarIcon,
  DiamondIcon,
  WalletIcon,
  GiftIcon,
  SwapArrowsIcon,
  CrownIcon,
  CheckIcon,
  LightbulbIcon,
  ChevronRightIcon,
} from '../../components/Icons';

/* ─── Lesson data ─── */

interface LessonParagraph {
  kind: 'p';
  text: string;
}

interface LessonHeading {
  kind: 'h';
  text: string;
}

interface LessonTip {
  kind: 'tip';
  text: string;
}

type LessonBlock = LessonParagraph | LessonHeading | LessonTip;

interface Lesson {
  id: string;
  titleKey: string;
  descKey: string;
  icon: typeof BookOpenIcon;
  tint: string;
  iconBg: string;
  readMinutes: number;
  body: LessonBlock[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tk = (s: string) => s as any;

const LESSONS: Lesson[] = [
  {
    id: 'stars',
    titleKey: 'learnStarsTitle',
    descKey: 'learnStarsDesc',
    icon: StarIcon,
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.12)',
    readMinutes: 2,
    body: [
      { kind: 'p', text: 'learnStarsP1' },
      { kind: 'h', text: 'learnStarsH1' },
      { kind: 'p', text: 'learnStarsP2' },
      { kind: 'h', text: 'learnStarsH2' },
      { kind: 'p', text: 'learnStarsP3' },
      { kind: 'tip', text: 'learnStarsTip' },
    ],
  },
  {
    id: 'ton',
    titleKey: 'learnTonTitle',
    descKey: 'learnTonDesc',
    icon: DiamondIcon,
    tint: 'var(--teal)',
    iconBg: 'rgba(0,212,170,0.10)',
    readMinutes: 3,
    body: [
      { kind: 'p', text: 'learnTonP1' },
      { kind: 'h', text: 'learnTonH1' },
      { kind: 'p', text: 'learnTonP2' },
      { kind: 'h', text: 'learnTonH2' },
      { kind: 'p', text: 'learnTonP3' },
      { kind: 'tip', text: 'learnTonTip' },
    ],
  },
  {
    id: 'tonconnect',
    titleKey: 'learnTonConnectTitle',
    descKey: 'learnTonConnectDesc',
    icon: WalletIcon,
    tint: 'var(--accent)',
    iconBg: 'rgba(108,99,255,0.10)',
    readMinutes: 2,
    body: [
      { kind: 'p', text: 'learnTonConnectP1' },
      { kind: 'h', text: 'learnTonConnectH1' },
      { kind: 'p', text: 'learnTonConnectP2' },
      { kind: 'tip', text: 'learnTonConnectTip' },
    ],
  },
  {
    id: 'gifts',
    titleKey: 'learnGiftsTitle',
    descKey: 'learnGiftsDesc',
    icon: GiftIcon,
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.12)',
    readMinutes: 2,
    body: [
      { kind: 'p', text: 'learnGiftsP1' },
      { kind: 'h', text: 'learnGiftsH1' },
      { kind: 'p', text: 'learnGiftsP2' },
      { kind: 'tip', text: 'learnGiftsTip' },
    ],
  },
  {
    id: 'dex',
    titleKey: 'learnDexTitle',
    descKey: 'learnDexDesc',
    icon: SwapArrowsIcon,
    tint: 'var(--teal)',
    iconBg: 'rgba(0,212,170,0.10)',
    readMinutes: 3,
    body: [
      { kind: 'p', text: 'learnDexP1' },
      { kind: 'h', text: 'learnDexH1' },
      { kind: 'p', text: 'learnDexP2' },
      { kind: 'h', text: 'learnDexH2' },
      { kind: 'p', text: 'learnDexP3' },
      { kind: 'tip', text: 'learnDexTip' },
    ],
  },
  {
    id: 'plus',
    titleKey: 'learnPlusTitle',
    descKey: 'learnPlusDesc',
    icon: CrownIcon,
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.12)',
    readMinutes: 2,
    body: [
      { kind: 'p', text: 'learnPlusP1' },
      { kind: 'h', text: 'learnPlusH1' },
      { kind: 'p', text: 'learnPlusP2' },
      { kind: 'tip', text: 'learnPlusTip' },
    ],
  },
];

/* ─── Completion tracking (localStorage) ─── */

const STORAGE_KEY = 'unisouq_learn_completed';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

/* ─── Lesson view ─── */

function LessonView({
  lesson,
  onBack,
  onComplete,
  completed,
}: {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (id: string) => void;
  completed: boolean;
}) {
  const { t } = useTranslation();
  const Icon = lesson.icon;

  return (
    <>
      <SectionHeader
        title={t(tk(lesson.titleKey))}
        subtitle={`${lesson.readMinutes} ${t('minRead')}`}
        onBack={onBack}
        backLabel={t('sectionLearn')}
      />

      <div
        className="rounded-card p-5 mb-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `linear-gradient(135deg, ${lesson.tint} 0%, transparent 60%)` }}
        />
        <div className="relative flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-btn flex items-center justify-center"
            style={{ backgroundColor: lesson.iconBg }}
          >
            <Icon size={20} color={lesson.tint} />
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {t(tk(lesson.descKey))}
          </p>
        </div>

        <div className="relative flex flex-col gap-3">
          {lesson.body.map((block, i) => {
            if (block.kind === 'h') {
              return (
                <p
                  key={i}
                  className="text-[13px] font-bold mt-2"
                  style={{ color: 'var(--text)' }}
                >
                  {t(tk(block.text))}
                </p>
              );
            }
            if (block.kind === 'tip') {
              return (
                <div
                  key={i}
                  className="rounded-btn p-3 flex gap-2.5 mt-2"
                  style={{
                    backgroundColor: 'rgba(245,200,66,0.06)',
                    border: '1px solid rgba(245,200,66,0.15)',
                  }}
                >
                  <LightbulbIcon size={14} color="var(--gold)" className="mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text)' }}>
                    {t(tk(block.text))}
                  </p>
                </div>
              );
            }
            return (
              <p
                key={i}
                className="text-[12px] leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t(tk(block.text))}
              </p>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onComplete(lesson.id)}
        disabled={completed}
        className="w-full py-3 text-[12px] font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
        style={{
          backgroundColor: completed ? 'var(--surface2)' : 'var(--accent)',
          color: completed ? 'var(--teal)' : '#fff',
          border: completed ? '1px solid var(--border)' : 'none',
          cursor: completed ? 'default' : 'pointer',
        }}
      >
        {completed ? (
          <>
            <CheckIcon size={14} color="var(--teal)" />
            {t('lessonCompleted')}
          </>
        ) : (
          <>
            <CheckIcon size={14} color="#fff" />
            {t('markLessonRead')}
          </>
        )}
      </button>
    </>
  );
}

/* ─── Hub view ─── */

function LearnHub({
  onSelect,
  completed,
}: {
  onSelect: (id: string) => void;
  completed: Set<string>;
}) {
  const { t } = useTranslation();
  const done = completed.size;
  const total = LESSONS.length;
  const progressPct = Math.round((done / total) * 100);

  return (
    <>
      {/* Progress strip */}
      <div
        className="rounded-card p-4 mb-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, transparent 60%)' }}
        />
        <div className="relative flex items-center justify-between mb-2">
          <p className="display-label">{t('learnProgress')}</p>
          <p className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>
            {done} / {total}
          </p>
        </div>
        <div
          className="relative h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--surface2)' }}
        >
          <div
            className="h-full transition-all"
            style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <div className="flex flex-col gap-2.5">
        {LESSONS.map((l) => {
          const Icon = l.icon;
          const isDone = completed.has(l.id);
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l.id)}
              className="w-full text-left rounded-card p-4 flex items-center gap-3 relative overflow-hidden transition-transform active:scale-[0.99]"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{ background: `linear-gradient(135deg, ${l.tint} 0%, transparent 60%)` }}
              />
              <div
                className="relative w-10 h-10 rounded-btn flex items-center justify-center shrink-0"
                style={{ backgroundColor: l.iconBg }}
              >
                <Icon size={18} color={l.tint} />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {t(tk(l.titleKey))}
                  </p>
                  {isDone && <CheckIcon size={12} color="var(--teal)" />}
                </div>
                <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                  {l.readMinutes} {t('minRead')} · {t(tk(l.descKey))}
                </p>
              </div>
              <ChevronRightIcon size={14} color="var(--text-muted)" className="relative shrink-0" />
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ─── Main ─── */

export function LearnSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());

  useEffect(() => {
    saveCompleted(completed);
  }, [completed]);

  const activeLesson = activeId ? LESSONS.find((l) => l.id === activeId) ?? null : null;

  const markComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="px-4 pt-2 pb-24">
      {activeLesson ? (
        <LessonView
          lesson={activeLesson}
          onBack={() => setActiveId(null)}
          onComplete={markComplete}
          completed={completed.has(activeLesson.id)}
        />
      ) : (
        <>
          <SectionHeader
            title={t('sectionLearn')}
            subtitle={t('sectionLearnDesc')}
            onBack={onBack}
            backLabel={t('back')}
          />
          <LearnHub onSelect={setActiveId} completed={completed} />
        </>
      )}
    </div>
  );
}
