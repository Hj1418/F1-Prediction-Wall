import React, { useState } from 'react';
import { QuizResultPayload } from '../../types/quiz';
import { getTierDetails, getQuizCategory } from '../../services/quiz/quizRegistry';
import { shareQuizResult } from '../../services/quiz/quizSharing';
import {
  Trophy,
  Share2,
  RotateCcw,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
} from 'lucide-react';

interface QuizResultsViewProps {
  result: QuizResultPayload;
  onRetakeQuiz: () => void;
  onViewHistory: () => void;
  username?: string;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  result,
  onRetakeQuiz,
  onViewHistory,
  username,
}) => {
  const tier = getTierDetails(result.fanIdentityTier);
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [isSharing, setIsSharing] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const categories = Object.values(result.categoryBreakdown || {});
  const filteredQuestions = result.questions.filter(q => {
    if (filterMode === 'correct') return q.isCorrect;
    if (filterMode === 'incorrect') return !q.isCorrect;
    return true;
  });

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const shareRes = await shareQuizResult(result, username);
      if (shareRes.method === 'clipboard' && shareRes.success) {
        setShareToast('Result copied to clipboard!');
        setTimeout(() => setShareToast(null), 3000);
      } else if (shareRes.method === 'download' && shareRes.success) {
        setShareToast('Share card downloaded!');
        setTimeout(() => setShareToast(null), 3000);
      }
    } catch (_e) {
      setShareToast('Failed to generate share card.');
      setTimeout(() => setShareToast(null), 3000);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* 1. Hero Identity Banner */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          border: `1.5px solid ${tier.color}66`,
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: `0 0 35px -8px ${tier.color}33`,
          marginBottom: '2rem',
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '100%',
            background: `radial-gradient(circle at top, ${tier.color}25 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: `${tier.color}20`,
              border: `1px solid ${tier.color}55`,
              color: tier.color,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} />
            MOTORSPORT FAN IDENTITY
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.03em',
              margin: '0 0 0.5rem 0',
              textTransform: 'uppercase',
            }}
          >
            {tier.title}
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              margin: '0 auto 1.75rem auto',
              lineHeight: 1.5,
            }}
          >
            {tier.description}
          </p>

          {/* Big Score Counter */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '0.75rem',
              padding: '0.85rem 2rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
            }}
          >
            <span
              style={{
                fontSize: '2.5rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                color: tier.color,
                lineHeight: 1,
              }}
            >
              {result.percentage}%
            </span>
            <span
              style={{
                fontSize: '1.05rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              {result.score} / {result.totalQuestions} CORRECT
            </span>
          </div>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.4rem',
                backgroundColor: 'var(--f1-red)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(225, 6, 0, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <Share2 size={16} />
              <span>{isSharing ? 'GENERATING CARD...' : 'SHARE RESULT'}</span>
            </button>

            <button
              type="button"
              onClick={onRetakeQuiz}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.4rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCcw size={16} />
              <span>RETAKE QUIZ</span>
            </button>

            <button
              type="button"
              onClick={onViewHistory}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.4rem',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <History size={16} />
              <span>VIEW HISTORY</span>
            </button>
          </div>

          {shareToast && (
            <div
              style={{
                marginTop: '1rem',
                color: 'var(--telemetry-green)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
              }}
            >
              ✓ {shareToast}
            </div>
          )}
        </div>
      </div>

      {/* 2. Category Performance Breakdown */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Trophy size={18} style={{ color: 'var(--telemetry-amber)' }} />
          <h2 style={{ fontSize: '1.15rem', margin: 0, letterSpacing: '0.04em' }}>
            DISCIPLINE MASTERY BREAKDOWN
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {categories.map(cat => {
            const meta = getQuizCategory(cat.categoryId);
            return (
              <div
                key={cat.categoryId}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        borderRadius: '3px',
                        backgroundColor: `${meta?.color || '#3b82f6'}22`,
                        color: meta?.color || '#3b82f6',
                      }}
                    >
                      {meta?.badge || 'TG'}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      {cat.categoryName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: cat.percentage >= 80 ? 'var(--telemetry-green)' : cat.percentage >= 50 ? 'var(--telemetry-yellow)' : 'var(--text-muted)',
                    }}
                  >
                    {cat.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '5px',
                    backgroundColor: 'var(--bg-input)',
                    borderRadius: '2.5px',
                    overflow: 'hidden',
                    marginBottom: '0.4rem',
                  }}
                >
                  <div
                    style={{
                      width: `${cat.percentage}%`,
                      height: '100%',
                      backgroundColor: meta?.color || 'var(--f1-red)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    textAlign: 'right',
                  }}
                >
                  {cat.correct} of {cat.total} correct
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Question-by-Question Review */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={18} style={{ color: 'var(--telemetry-cyan)' }} />
            <h2 style={{ fontSize: '1.15rem', margin: 0, letterSpacing: '0.04em' }}>
              VERIFIED ANSWER REVIEW
            </h2>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: filterMode === 'all' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: filterMode === 'all' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              ALL ({result.questions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('incorrect')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: filterMode === 'incorrect' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                color: filterMode === 'incorrect' ? '#ef4444' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              MISSED ({result.questions.filter(q => !q.isCorrect).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('correct')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: filterMode === 'correct' ? 'rgba(0, 230, 118, 0.15)' : 'transparent',
                color: filterMode === 'correct' ? 'var(--telemetry-green)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              CORRECT ({result.questions.filter(q => q.isCorrect).length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredQuestions.map((q, idx) => {
            const meta = getQuizCategory(q.categoryId);

            return (
              <div
                key={q.questionId}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: `1px solid ${q.isCorrect ? 'rgba(0, 230, 118, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {q.isCorrect ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--telemetry-green)' }} />
                    ) : (
                      <XCircle size={18} style={{ color: 'var(--f1-red)' }} />
                    )}
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        borderRadius: '3px',
                        backgroundColor: `${meta?.color || '#3b82f6'}22`,
                        color: meta?.color || '#3b82f6',
                      }}
                    >
                      {meta?.badge || q.categoryId}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {q.topic} {q.context ? `• ${q.context}` : ''}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: q.isCorrect ? 'var(--telemetry-green)' : 'var(--f1-red)',
                    }}
                  >
                    {q.isCorrect ? 'CORRECT' : q.selectedOptionId ? 'INCORRECT' : 'SKIPPED'}
                  </span>
                </div>

                {/* Question */}
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 1rem 0',
                    lineHeight: 1.45,
                    textTransform: 'none',
                    letterSpacing: 'normal',
                  }}
                >
                  {q.question}
                </h3>

                {/* Options display */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  {q.options.map(opt => {
                    const isUserChoice = q.selectedOptionId === opt.id;
                    const isCorrectAnswer = q.correctOptionId === opt.id;

                    let bg = 'rgba(255, 255, 255, 0.02)';
                    let border = '1px solid var(--border-subtle)';
                    let textColor = 'var(--text-secondary)';

                    if (isCorrectAnswer) {
                      bg = 'rgba(0, 230, 118, 0.12)';
                      border = '1px solid var(--telemetry-green)';
                      textColor = '#ffffff';
                    } else if (isUserChoice && !q.isCorrect) {
                      bg = 'rgba(239, 68, 68, 0.12)';
                      border = '1px solid var(--f1-red)';
                      textColor = '#ffffff';
                    }

                    return (
                      <div
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: bg,
                          border: border,
                          fontSize: '0.84rem',
                          color: textColor,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            color: isCorrectAnswer ? 'var(--telemetry-green)' : isUserChoice ? 'var(--f1-red)' : 'var(--text-muted)',
                          }}
                        >
                          {opt.id.toUpperCase()}:
                        </span>
                        <span style={{ flex: 1, fontWeight: isCorrectAnswer || isUserChoice ? 700 : 400 }}>
                          {opt.text}
                        </span>
                        {isCorrectAnswer && <CheckCircle2 size={14} style={{ color: 'var(--telemetry-green)', flexShrink: 0 }} />}
                        {isUserChoice && !isCorrectAnswer && <XCircle size={14} style={{ color: 'var(--f1-red)', flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    borderLeft: `3px solid ${q.isCorrect ? 'var(--telemetry-green)' : 'var(--f1-red)'}`,
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      color: '#ffffff',
                      marginBottom: '0.35rem',
                    }}
                  >
                    FACTUAL EXPLANATION:
                  </div>
                  {q.explanation}

                  {q.sourceUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={q.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: 'var(--telemetry-cyan)',
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono)',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Official Verification Source</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
