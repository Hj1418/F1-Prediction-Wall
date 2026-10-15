import React from 'react';
import { QuizAttemptRecord } from '../../types/quiz';
import { getTierDetails, getQuizCategory } from '../../services/quiz/quizRegistry';
import { History, ArrowLeft, ChevronRight, Award, Calendar, Layers } from 'lucide-react';

interface QuizHistoryViewProps {
  attempts: QuizAttemptRecord[];
  onSelectAttempt: (attemptId: string) => void;
  onBackToQuiz: () => void;
}

export const QuizHistoryView: React.FC<QuizHistoryViewProps> = ({
  attempts,
  onSelectAttempt,
  onBackToQuiz,
}) => {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
        }}
      >
        <button
          type="button"
          onClick={onBackToQuiz}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO QUIZ</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} style={{ color: 'var(--f1-red)' }} />
          <h2 style={{ fontSize: '1.15rem', margin: 0, letterSpacing: '0.04em' }}>
            YOUR QUIZ ATTEMPT HISTORY
          </h2>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Award size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
            NO COMPLETED ATTEMPTS YET
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem' }}>
            Take your first motorsport knowledge quiz to discover your fan identity and build your attempt history.
          </p>
          <button
            type="button"
            onClick={onBackToQuiz}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--f1-red)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            START FIRST QUIZ
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {attempts.map(att => {
            const tier = getTierDetails(att.fanIdentityTier);
            const dateStr = att.completedAt
              ? new Date(att.completedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Completed';

            return (
              <div
                key={att.attemptId}
                onClick={() => onSelectAttempt(att.attemptId)}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                }}
              >
                {/* Left Column: Identity + Date */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        borderRadius: '4px',
                        backgroundColor: `${tier.color}22`,
                        color: tier.color,
                        border: `1px solid ${tier.color}44`,
                      }}
                    >
                      {att.fanIdentityTier}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {dateStr}
                    </span>
                  </div>

                  {/* Category Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {(att.selectedCategories || []).map(catId => {
                      const meta = getQuizCategory(catId);
                      return (
                        <span
                          key={catId}
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {meta?.displayName || catId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Score + Review Chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        color: tier.color,
                        lineHeight: 1,
                        marginBottom: '0.25rem',
                      }}
                    >
                      {att.percentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {att.score} / {att.totalQuestions} correct
                    </div>
                  </div>

                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
