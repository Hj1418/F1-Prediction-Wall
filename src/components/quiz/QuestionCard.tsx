import React, { useEffect, useCallback } from 'react';
import { PublicQuizQuestion } from '../../types/quiz';
import { getQuizCategory } from '../../services/quiz/quizRegistry';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface QuestionCardProps {
  question: PublicQuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  userAnswers: Record<string, string>;
  allQuestions: PublicQuizQuestion[];
  onJumpToQuestion: (index: number) => void;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting = false,
  userAnswers,
  allQuestions,
  onJumpToQuestion,
}) => {
  const categoryMeta = getQuizCategory(question.categoryId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const answeredCount = Object.keys(userAnswers).length;

  // Keyboard navigation & option selection: 1-4 or A-D, Left/Right arrow
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['1', 'A'].includes(key) && question.options[0]) {
        onSelectOption(question.questionId, question.options[0].id);
      } else if (['2', 'B'].includes(key) && question.options[1]) {
        onSelectOption(question.questionId, question.options[1].id);
      } else if (['3', 'C'].includes(key) && question.options[2]) {
        onSelectOption(question.questionId, question.options[2].id);
      } else if (['4', 'D'].includes(key) && question.options[3]) {
        onSelectOption(question.questionId, question.options[3].id);
      } else if (e.key === 'ArrowRight' && !isLast) {
        onNext();
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        onPrevious();
      }
    },
    [question, isFirst, isLast, onSelectOption, onNext, onPrevious]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Top Progress & Category Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.6rem',
              fontSize: '0.72rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              backgroundColor: `${categoryMeta?.color || '#3b82f6'}22`,
              color: categoryMeta?.color || '#3b82f6',
              border: `1px solid ${categoryMeta?.color || '#3b82f6'}44`,
            }}
          >
            {categoryMeta?.badge || question.categoryId.toUpperCase()}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            {question.categoryName || categoryMeta?.displayName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            QUESTION {currentIndex + 1} OF {totalQuestions}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: categoryMeta?.color || 'var(--f1-red)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* Main Question Card Container */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '1.5rem',
        }}
      >
        {/* Context / Topic Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            {question.topic}
          </span>
          {question.context && (
            <span
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--text-secondary)',
              }}
            >
              • {question.context}
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2
          style={{
            fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
            fontWeight: 800,
            lineHeight: 1.4,
            color: '#ffffff',
            margin: '0 0 1.75rem 0',
            textTransform: 'none',
            letterSpacing: 'normal',
          }}
        >
          {question.question}
        </h2>

        {/* Four Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {question.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const letter = OPTION_KEYS[idx] || option.id.toUpperCase();

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(question.questionId, option.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.1rem 1.25rem',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1.5px solid ${isSelected ? (categoryMeta?.color || 'var(--f1-red)') : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isSelected ? `0 0 15px -4px ${categoryMeta?.color || 'var(--f1-red)'}40` : 'none',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                {/* Option Letter Pill */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    flexShrink: 0,
                    backgroundColor: isSelected ? (categoryMeta?.color || 'var(--f1-red)') : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? (categoryMeta?.color || 'var(--f1-red)') : 'var(--border-medium)'}`,
                  }}
                >
                  {letter}
                </div>

                {/* Option Text */}
                <span
                  style={{
                    flex: 1,
                    fontSize: '0.96rem',
                    fontWeight: isSelected ? 700 : 500,
                    lineHeight: 1.45,
                  }}
                >
                  {option.text}
                </span>

                {/* Radio indicator */}
                <div style={{ flexShrink: 0, color: isSelected ? (categoryMeta?.color || 'var(--f1-red)') : 'var(--text-muted)' }}>
                  {isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            backgroundColor: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: isFirst ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.4 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronLeft size={16} />
          <span>PREVIOUS</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                letterSpacing: '0.06em',
                backgroundColor: 'var(--f1-red)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 20px rgba(225, 6, 0, 0.45)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isSubmitting ? 'SUBMITTING ANSWERS...' : 'COMPLETE & REVEAL RESULTS'}</span>
              <CheckCircle2 size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.5rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                letterSpacing: '0.05em',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>NEXT</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Jump Navigator Tray */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            marginBottom: '0.85rem',
          }}
        >
          <span>QUICK QUESTION NAVIGATOR</span>
          <span>
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(15, totalQuestions)}, 1fr)`,
            gap: '0.4rem',
          }}
        >
          {allQuestions.map((q, idx) => {
            const isAnswered = Boolean(userAnswers[q.questionId]);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.questionId}
                type="button"
                onClick={() => onJumpToQuestion(idx)}
                title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                style={{
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '4px',
                  border: isCurrent
                    ? '2px solid #ffffff'
                    : isAnswered
                    ? '1px solid var(--telemetry-green)'
                    : '1px solid var(--border-subtle)',
                  backgroundColor: isCurrent
                    ? 'var(--bg-surface-elevated)'
                    : isAnswered
                    ? 'rgba(0, 230, 118, 0.15)'
                    : 'rgba(255, 255, 255, 0.02)',
                  color: isCurrent ? '#ffffff' : isAnswered ? 'var(--telemetry-green)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
