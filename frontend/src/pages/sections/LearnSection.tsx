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
  CloseIcon,
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

interface QuizChoice {
  textKey: string;
  correct: boolean;
}

interface QuizQuestion {
  questionKey: string;
  choices: QuizChoice[];
}

interface Lesson {
  id: string;
  titleKey: string;
  descKey: string;
  icon: typeof BookOpenIcon;
  tint: string;
  iconBg: string;
  readMinutes: number;
  body: LessonBlock[];
  quiz: QuizQuestion[];
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
    quiz: [
      {
        questionKey: 'learnStarsQ1',
        choices: [
          { textKey: 'learnStarsQ1A', correct: true },
          { textKey: 'learnStarsQ1B', correct: false },
          { textKey: 'learnStarsQ1C', correct: false },
        ],
      },
      {
        questionKey: 'learnStarsQ2',
        choices: [
          { textKey: 'learnStarsQ2A', correct: false },
          { textKey: 'learnStarsQ2B', correct: true },
          { textKey: 'learnStarsQ2C', correct: false },
        ],
      },
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
    quiz: [
      {
        questionKey: 'learnTonQ1',
        choices: [
          { textKey: 'learnTonQ1A', correct: true },
          { textKey: 'learnTonQ1B', correct: false },
          { textKey: 'learnTonQ1C', correct: false },
        ],
      },
      {
        questionKey: 'learnTonQ2',
        choices: [
          { textKey: 'learnTonQ2A', correct: false },
          { textKey: 'learnTonQ2B', correct: false },
          { textKey: 'learnTonQ2C', correct: true },
        ],
      },
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
    quiz: [
      {
        questionKey: 'learnTonConnectQ1',
        choices: [
          { textKey: 'learnTonConnectQ1A', correct: false },
          { textKey: 'learnTonConnectQ1B', correct: true },
          { textKey: 'learnTonConnectQ1C', correct: false },
        ],
      },
      {
        questionKey: 'learnTonConnectQ2',
        choices: [
          { textKey: 'learnTonConnectQ2A', correct: true },
          { textKey: 'learnTonConnectQ2B', correct: false },
          { textKey: 'learnTonConnectQ2C', correct: false },
        ],
      },
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
    quiz: [
      {
        questionKey: 'learnGiftsQ1',
        choices: [
          { textKey: 'learnGiftsQ1A', correct: true },
          { textKey: 'learnGiftsQ1B', correct: false },
          { textKey: 'learnGiftsQ1C', correct: false },
        ],
      },
      {
        questionKey: 'learnGiftsQ2',
        choices: [
          { textKey: 'learnGiftsQ2A', correct: false },
          { textKey: 'learnGiftsQ2B', correct: true },
          { textKey: 'learnGiftsQ2C', correct: false },
        ],
      },
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
    quiz: [
      {
        questionKey: 'learnDexQ1',
        choices: [
          { textKey: 'learnDexQ1A', correct: true },
          { textKey: 'learnDexQ1B', correct: false },
          { textKey: 'learnDexQ1C', correct: false },
        ],
      },
      {
        questionKey: 'learnDexQ2',
        choices: [
          { textKey: 'learnDexQ2A', correct: false },
          { textKey: 'learnDexQ2B', correct: false },
          { textKey: 'learnDexQ2C', correct: true },
        ],
      },
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
    quiz: [
      {
        questionKey: 'learnPlusQ1',
        choices: [
          { textKey: 'learnPlusQ1A', correct: true },
          { textKey: 'learnPlusQ1B', correct: false },
          { textKey: 'learnPlusQ1C', correct: false },
        ],
      },
      {
        questionKey: 'learnPlusQ2',
        choices: [
          { textKey: 'learnPlusQ2A', correct: false },
          { textKey: 'learnPlusQ2B', correct: true },
          { textKey: 'learnPlusQ2C', correct: false },
        ],
      },
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

/* ─── Quiz panel ─── */

type QuizAnswer = { choiceIdx: number; correct: boolean };

function QuizPanel({
  lesson,
  completed,
  onPass,
}: {
  lesson: Lesson;
  completed: boolean;
  onPass: () => void;
}) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});

  const total = lesson.quiz.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const allAnswered = answeredCount === total;
  const allCorrect = allAnswered && correctCount === total;

  const handlePick = (qIdx: number, cIdx: number, correct: boolean) => {
    if (answers[qIdx]) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: { choiceIdx: cIdx, correct } }));
  };

  const handleReset = () => {
    setAnswers({});
  };

  return (
    <div
      className="rounded-card p-4 mb-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: `linear-gradient(135deg, ${lesson.tint} 0%, transparent 60%)` }}
      />
      <div className="relative flex items-center justify-between mb-4">
        <p className="display-label">{t('quizTitle')}</p>
        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          {answeredCount} / {total}
        </p>
      </div>

      <div className="relative flex flex-col gap-5">
        {lesson.quiz.map((q, qIdx) => {
          const answer = answers[qIdx];
          return (
            <div key={qIdx}>
              <p className="text-[12px] font-bold mb-2.5" style={{ color: 'var(--text)' }}>
                {qIdx + 1}. {t(tk(q.questionKey))}
              </p>
              <div className="flex flex-col gap-1.5">
                {q.choices.map((c, cIdx) => {
                  const isPicked = answer?.choiceIdx === cIdx;
                  const showState = !!answer;
                  let bg = 'var(--surface2)';
                  let border = 'var(--border)';
                  let color = 'var(--text)';
                  let trailing: React.ReactNode = null;
                  if (showState) {
                    if (c.correct) {
                      bg = 'rgba(0,212,170,0.10)';
                      border = 'rgba(0,212,170,0.35)';
                      color = 'var(--teal)';
                      trailing = <CheckIcon size={12} color="var(--teal)" />;
                    } else if (isPicked) {
                      bg = 'rgba(255,107,107,0.10)';
                      border = 'rgba(255,107,107,0.35)';
                      color = 'var(--coral)';
                      trailing = <CloseIcon size={12} color="var(--coral)" />;
                    } else {
                      color = 'var(--text-muted)';
                    }
                  }
                  return (
                    <button
                      key={cIdx}
                      onClick={() => handlePick(qIdx, cIdx, c.correct)}
                      disabled={!!answer}
                      className="w-full text-left px-3 py-2 rounded-btn flex items-center justify-between gap-2 transition-colors"
                      style={{
                        backgroundColor: bg,
                        border: `1px solid ${border}`,
                        color,
                        cursor: answer ? 'default' : 'pointer',
                      }}
                    >
                      <span className="text-[11px] leading-snug">{t(tk(c.textKey))}</span>
                      {trailing}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {allAnswered && !allCorrect && (
        <div className="relative mt-4 flex items-center gap-2">
          <p className="text-[11px] flex-1" style={{ color: 'var(--coral)' }}>
            {t('quizUnlockNeeded')}
          </p>
          <button
            onClick={handleReset}
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-btn"
            style={{
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {t('quizRetry')}
          </button>
        </div>
      )}

      {allCorrect && !completed && (
        <button
          onClick={onPass}
          className="relative w-full mt-4 py-3 text-[12px] font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
          style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}
        >
          <CheckIcon size={14} color="#000" />
          {t('quizFinishPerfect')}
        </button>
      )}

      {completed && (
        <div
          className="relative mt-4 py-3 text-[12px] font-bold rounded-btn flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--surface2)', color: 'var(--teal)', border: '1px solid var(--border)' }}
        >
          <CheckIcon size={14} color="var(--teal)" />
          {t('lessonCompleted')}
        </div>
      )}
    </div>
  );
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

      <QuizPanel
        lesson={lesson}
        completed={completed}
        onPass={() => onComplete(lesson.id)}
      />
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
