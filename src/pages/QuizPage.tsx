import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/quiz/quizService';
import {
  QuizCategory,
  QuizDifficultyLevel,
  PublicQuizQuestion,
  QuizResultPayload,
  QuizAttemptRecord,
} from '../types/quiz';
import { CategorySelector } from '../components/quiz/CategorySelector';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { QuizResultsView } from '../components/quiz/QuizResultsView';
import { QuizHistoryView } from '../components/quiz/QuizHistoryView';
import { UpcomingQuizFeatures } from '../components/quiz/UpcomingQuizFeatures';
import { PageHeader } from '../components/common/PageHeader';
import {
  Brain,
  Sparkles,
  ArrowRight,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LogIn,
} from 'lucide-react';

type QuizStage = 'intro' | 'categories' | 'active' | 'results' | 'history';

export const QuizPage: React.FC = () => {
  const { attemptId: urlAttemptId } = useParams<{ attemptId?: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, openLoginModal } = useAuth();
  const activeUserId = currentUser?.userId || '';

  // State
  const [stage, setStage] = useState<QuizStage>('intro');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficultyLevel>('apex');
  const [categories, setCategories] = useState<(QuizCategory & { availableQuestions: number })[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<PublicQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [resultPayload, setResultPayload] = useState<QuizResultPayload | null>(null);
  const [historyAttempts, setHistoryAttempts] = useState<QuizAttemptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState(false);

  // SEO
  useEffect(() => {
    document.title = 'Get Your Racing Tag | GRDX Knowledge Challenge';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'GRDX — Discover how much you know about motorsport, take on verified racing questions across 8 disciplines, and earn a tag that represents your knowledge.'
      );
    }
  }, []);

  // Load Categories & History on Mount / Difficulty change
  useEffect(() => {
    const init = async () => {
      try {
        const cats = await quizService.getCategories(selectedDifficulty);
        setCategories(cats);
        // Default select all available if none selected yet
        setSelectedCategoryIds(prev => {
          if (prev.length === 0) {
            return cats.filter(c => c.availableQuestions > 0).map(c => c.id);
          }
          return prev;
        });

        if (activeUserId) {
          const history = await quizService.getUserQuizHistory(activeUserId);
          setHistoryAttempts(history);
        } else {
          setHistoryAttempts([]);
        }

        // If URL has attemptId, load that attempt directly
        if (urlAttemptId) {
          const pastResult = await quizService.getQuizAttemptResult(urlAttemptId, activeUserId);
          if (pastResult) {
            setResultPayload(pastResult);
            setStage('results');
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to initialize quiz engine.');
      }
    };
    init();
  }, [activeUserId, urlAttemptId, selectedDifficulty]);

  // Stage A -> Stage B: Go to Category Selection
  const handleStartFromIntro = () => {
    setErrorMessage(null);
    setStage('categories');
  };

  // Category Toggle
  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryIds(categories.map(c => c.id));
  };

  const handleClearCategories = () => {
    setSelectedCategoryIds([]);
  };

  // Stage B -> Stage C: Start Attempt
  const handleStartAttempt = async () => {
    if (!currentUser || !currentUser.userId) {
      setErrorMessage('Please sign in with your racer account to start your official motorsport quiz attempt.');
      openLoginModal('/quiz');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setErrorMessage('Please select at least one motorsport discipline.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const startRes = await quizService.startQuizAttempt({
        userId: currentUser.userId,
        categoryIds: selectedCategoryIds,
        difficultyLevel: selectedDifficulty,
      });

      setCurrentAttemptId(startRes.attemptId);
      setActiveQuestions(startRes.questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setStage('active');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start quiz attempt.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stage C: Answering & Navigation
  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < activeQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Final Submission
  const handleSubmitQuiz = async (force: boolean = false) => {
    if (!currentAttemptId) return;

    if (!currentUser || !currentUser.userId) {
      setErrorMessage('Your session expired. Please sign in to securely submit your quiz answers and save your fan identity.');
      openLoginModal('/quiz');
      return;
    }

    const unansweredCount = activeQuestions.length - Object.keys(userAnswers).length;
    if (unansweredCount > 0 && !force) {
      setShowUnansweredConfirm(true);
      return;
    }

    setShowUnansweredConfirm(false);

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const scored = await quizService.submitQuizAttempt({
        attemptId: currentAttemptId,
        userId: currentUser.userId,
        answers: userAnswers,
      });

      setResultPayload(scored);
      setStage('results');

      // Refresh history in background
      const updatedHistory = await quizService.getUserQuizHistory(currentUser.userId);
      setHistoryAttempts(updatedHistory);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit quiz attempt. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stage D Actions
  const handleRetakeQuiz = () => {
    setResultPayload(null);
    setCurrentAttemptId(null);
    setActiveQuestions([]);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setStage('categories');
  };

  const handleViewHistory = async () => {
    try {
      setIsLoading(true);
      const history = await quizService.getUserQuizHistory(activeUserId);
      setHistoryAttempts(history);
      setStage('history');
    } finally {
      setIsLoading(false);
    }
  };

  // Inspect Past Attempt
  const handleSelectPastAttempt = async (attemptId: string) => {
    try {
      setIsLoading(true);
      const pastResult = await quizService.getQuizAttemptResult(attemptId, activeUserId);
      if (pastResult) {
        setResultPayload(pastResult);
        setStage('results');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load past attempt.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2.5rem' }}>
      {/* Universal Page Header */}
      <div style={{ marginBottom: '1rem' }}>
        <PageHeader
          eyebrow="THE GRDX KNOWLEDGE CHALLENGE"
          title="GET YOUR RACING TAG"
          subtitle="Discover how much you know about motorsport, take on verified racing questions, and earn a tag that represents your knowledge."
          backTo={{ label: 'Home', path: '/' }}
        />
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto 1rem auto',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--f1-red)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.84rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Unanswered confirmation modal */}
      {showUnansweredConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <AlertTriangle size={24} style={{ color: 'var(--telemetry-amber)' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>UNANSWERED QUESTIONS</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              You have {activeQuestions.length - Object.keys(userAnswers).length} unanswered{' '}
              {activeQuestions.length - Object.keys(userAnswers).length === 1 ? 'question' : 'questions'}. Are you sure you want to finalize your attempt now?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowUnansweredConfirm(false)}
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                REVIEW QUESTIONS
              </button>
              <button
                type="button"
                onClick={() => handleSubmitQuiz(true)}
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  backgroundColor: 'var(--f1-red)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                SUBMIT ANYWAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE A: INTRO */}
      {stage === 'intro' && (
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              padding: '1.75rem 1.75rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(225, 6, 0, 0.15)',
                border: '1px solid rgba(225, 6, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                color: 'var(--f1-red)',
              }}
            >
              <Brain size={24} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--f1-red)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.35rem',
              }}
            >
              <span>THE GRDX KNOWLEDGE CHALLENGE</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: '0.45rem',
                letterSpacing: '0.02em',
                lineHeight: 1.2,
              }}
            >
              GET YOUR RACING TAG
            </h1>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                maxWidth: '580px',
                margin: '0 auto 0.4rem auto',
                lineHeight: 1.5,
              }}
            >
              Discover how much you know about motorsport, take on verified racing questions, and earn a tag that represents your knowledge.
            </p>

            <div
              style={{
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--telemetry-cyan)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '0.85rem',
              }}
            >
              Your knowledge. Your tag. Your GRDX profile.
            </div>

            {/* Feature Pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}
              >
                <ShieldCheck size={13} style={{ color: 'var(--telemetry-green)' }} />
                <span>170 Verified Questions</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}
              >
                <CheckCircle2 size={13} style={{ color: 'var(--telemetry-cyan)' }} />
                <span>Standard 20-Question Challenge</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Sparkles size={13} style={{ color: 'var(--telemetry-amber)' }} />
                <span>Instant Scoring & Identity Card</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                id="btn-get-racing-tag"
                type="button"
                onClick={handleStartFromIntro}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.65rem 1.8rem',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  backgroundColor: 'var(--f1-red)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(225, 6, 0, 0.45)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>GET YOUR RACING TAG</span>
                <ArrowRight size={16} />
              </button>

              {historyAttempts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStage('history')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.84rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <History size={15} />
                  <span>PAST ATTEMPTS ({historyAttempts.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE B: CATEGORY SELECTION */}
      {stage === 'categories' && (
        <div>
          {!currentUser && (
            <div
              style={{
                maxWidth: '1040px',
                margin: '0 auto 0.85rem auto',
                padding: '0.75rem 1.15rem',
                backgroundColor: 'rgba(225, 6, 0, 0.08)',
                border: '1px solid rgba(225, 6, 0, 0.3)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--f1-red)', fontSize: '0.76rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  <ShieldCheck size={15} /> RACER SIGN-IN REQUIRED
                </div>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Sign in with your GRDX racer account to start an official attempt, record verified scores, and unlock quiz achievements on your profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openLoginModal('/quiz')}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              >
                <LogIn size={13} /> Sign In
              </button>
            </div>
          )}
          <CategorySelector
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onToggleCategory={handleToggleCategory}
            onSelectAll={handleSelectAllCategories}
            onClearAll={handleClearCategories}
            onStartQuiz={handleStartAttempt}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* STAGE C: ACTIVE QUIZ */}
      {stage === 'active' && activeQuestions.length > 0 && (
        <QuestionCard
          question={activeQuestions[currentQuestionIndex]}
          currentIndex={currentQuestionIndex}
          totalQuestions={activeQuestions.length}
          selectedOptionId={userAnswers[activeQuestions[currentQuestionIndex].questionId] || null}
          onSelectOption={handleSelectOption}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          onSubmit={() => handleSubmitQuiz(false)}
          isSubmitting={isLoading}
          userAnswers={userAnswers}
          allQuestions={activeQuestions}
          onJumpToQuestion={handleJumpToQuestion}
        />
      )}

      {/* STAGE D: RESULTS */}
      {stage === 'results' && resultPayload && (
        <QuizResultsView
          result={resultPayload}
          onRetakeQuiz={handleRetakeQuiz}
          onViewHistory={handleViewHistory}
          username={currentUser?.username}
        />
      )}

      {/* STAGE E: HISTORY */}
      {stage === 'history' && (
        <QuizHistoryView
          attempts={historyAttempts}
          onSelectAttempt={handleSelectPastAttempt}
          onBackToQuiz={() => setStage('categories')}
        />
      )}

      {/* Upcoming Features & Expansion Roadmap */}
      {(stage === 'intro' || stage === 'categories' || stage === 'results') && (
        <UpcomingQuizFeatures />
      )}
    </div>
  );
};

export default QuizPage;
