import React from 'react';
import { QuizCategory, QuizDifficultyLevel } from '../../types/quiz';
import { getDifficultyConfig, DEFAULT_QUIZ_QUESTION_COUNT } from '../../services/quiz/quizRegistry';
import { Check, Layers, ArrowRight, ShieldCheck, Zap, AlertTriangle, Compass, Award } from 'lucide-react';
import './CategorySelector.css';

interface CategorySelectorProps {
  categories: (QuizCategory & { availableQuestions: number })[];
  selectedCategoryIds: string[];
  selectedDifficulty: QuizDifficultyLevel;
  onSelectDifficulty: (difficulty: QuizDifficultyLevel) => void;
  onToggleCategory: (categoryId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onStartQuiz: () => void;
  isLoading?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryIds,
  selectedDifficulty,
  onSelectDifficulty,
  onToggleCategory,
  onSelectAll,
  onClearAll,
  onStartQuiz,
  isLoading = false,
}) => {
  const selectedSet = new Set(selectedCategoryIds);
  const selectedCount = selectedCategoryIds.length;

  const totalAvailableQuestions = categories
    .filter(c => selectedSet.has(c.id))
    .reduce((sum, c) => sum + (c.availableQuestions || 0), 0);

  const hasInsufficientInventory = selectedCount > 0 && totalAvailableQuestions < DEFAULT_QUIZ_QUESTION_COUNT;
  const isStartDisabled = selectedCount === 0 || hasInsufficientInventory || isLoading;

  const difficultyLevels: { id: QuizDifficultyLevel; icon: any; accentColor: string }[] = [
    { id: 'rookie', icon: Compass, accentColor: '#38bdf8' },
    { id: 'apex', icon: Zap, accentColor: '#fbbf24' },
    { id: 'race_analyst', icon: Award, accentColor: '#f43f5e' },
  ];

  const activeDifficultyConfig = getDifficultyConfig(selectedDifficulty);

  return (
    <div className="quiz-setup-container">
      {/* 1. Difficulty Level Selector (Compact) */}
      <div className="quiz-setup-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} style={{ color: 'var(--color-accent, #FF4B33)' }} />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Quiz Difficulty Ceiling
            </h2>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}
          >
            Tier ceiling controls question pool
          </span>
        </div>

        <div className="difficulty-grid">
          {difficultyLevels.map(lvl => {
            const config = getDifficultyConfig(lvl.id);
            const isSelected = selectedDifficulty === lvl.id;
            const Icon = lvl.icon;

            return (
              <div
                key={lvl.id}
                id={`difficulty-choice-${lvl.id}`}
                onClick={() => onSelectDifficulty(lvl.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onSelectDifficulty(lvl.id);
                  }
                }}
                className="difficulty-card"
                style={{
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated, #1c2027)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1.5px solid ${isSelected ? lvl.accentColor : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                  boxShadow: isSelected ? `0 0 14px -3px ${lvl.accentColor}40` : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Icon size={15} style={{ color: lvl.accentColor }} />
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {config.title}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '0.12rem 0.4rem',
                        fontSize: '0.64rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        borderRadius: '4px',
                        backgroundColor: `${lvl.accentColor}22`,
                        color: lvl.accentColor,
                        border: `1px solid ${lvl.accentColor}44`,
                      }}
                    >
                      {config.label.split(':')[0].toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35, margin: '0 0 0.45rem 0' }}>
                    {config.description}
                  </p>
                </div>

                <div
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? lvl.accentColor : 'var(--text-muted)',
                    fontWeight: 700,
                    borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                    paddingTop: '0.35rem',
                  }}
                >
                  {config.ceilingDescription}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Motorsport Disciplines (Compact Multi-Column Grid) */}
      <div className="quiz-setup-card">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} style={{ color: 'var(--color-accent, #FF4B33)' }} />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Select Motorsport Disciplines
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: selectedCount > 0 ? 'rgba(255, 75, 51, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCount > 0 ? 'var(--color-accent, #FF4B33)' : 'var(--text-muted)',
                }}
              >
                {selectedCount} of {categories.length} Selected
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Select one or more. Questions are balanced evenly across your selections (20 total).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              id="btn-select-all-categories"
              type="button"
              onClick={onSelectAll}
              style={{
                padding: '0.32rem 0.65rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                borderRadius: 'var(--radius-sm, 4px)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              SELECT ALL
            </button>
            <button
              id="btn-clear-categories"
              type="button"
              onClick={onClearAll}
              style={{
                padding: '0.32rem 0.65rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                borderRadius: 'var(--radius-sm, 4px)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
            >
              CLEAR
            </button>
          </div>
        </div>

        {/* 4-column responsive grid on desktop */}
        <div className="categories-grid">
          {categories.map(category => {
            const isSelected = selectedSet.has(category.id);
            const hasQuestions = (category.availableQuestions || 0) > 0;

            return (
              <div
                key={category.id}
                id={`category-choice-${category.id}`}
                onClick={() => hasQuestions && onToggleCategory(category.id)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={hasQuestions ? 0 : -1}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (hasQuestions) onToggleCategory(category.id);
                  }
                }}
                className="category-card"
                style={{
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated, #1c2027)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1.5px solid ${isSelected ? category.color : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                  cursor: hasQuestions ? 'pointer' : 'not-allowed',
                  opacity: hasQuestions ? 1 : 0.5,
                  boxShadow: isSelected ? `0 0 12px -3px ${category.color}40` : 'none',
                }}
              >
                {/* Top Row: Badge + Name + Checkbox */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.12rem 0.42rem',
                          fontSize: '0.64rem',
                          fontWeight: 900,
                          fontFamily: 'var(--font-mono)',
                          borderRadius: '4px',
                          backgroundColor: `${category.color}22`,
                          color: category.color,
                          border: `1px solid ${category.color}44`,
                          flexShrink: 0,
                        }}
                      >
                        {category.badge}
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {category.displayName}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1.5px solid ${isSelected ? category.color : 'rgba(255, 255, 255, 0.2)'}`,
                        backgroundColor: isSelected ? category.color : 'transparent',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                        marginLeft: '0.35rem',
                      }}
                    >
                      {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.73rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.3,
                      margin: '0 0 0.4rem 0',
                    }}
                  >
                    {category.description}
                  </p>
                </div>

                {/* Question Pool Indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.35rem',
                    borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ShieldCheck size={12} style={{ color: 'var(--telemetry-green, #10B981)' }} />
                    Eligible Pool
                  </span>
                  <span style={{ color: category.availableQuestions > 0 ? 'var(--text-primary)' : 'var(--f1-red)', fontWeight: 700 }}>
                    {category.availableQuestions}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insufficient Question Pool Warning Banner */}
      {hasInsufficientInventory && (
        <div
          style={{
            marginBottom: '0.85rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--f1-red, #e10600)',
            borderRadius: 'var(--radius-md, 8px)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            Insufficient eligible questions ({totalAvailableQuestions} available, {DEFAULT_QUIZ_QUESTION_COUNT} required) for selected disciplines under the {activeDifficultyConfig.title} ceiling. Please select additional disciplines or choose a higher difficulty ceiling.
          </span>
        </div>
      )}

      {/* 3. Action Bar (Sticky & Compact) */}
      <div className="quiz-setup-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  padding: '0.12rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.04em',
                }}
              >
                {activeDifficultyConfig.title.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {totalAvailableQuestions} eligible questions
              </span>
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
              {selectedCount > 0
                ? `${DEFAULT_QUIZ_QUESTION_COUNT} Questions (${selectedCount} ${selectedCount === 1 ? 'discipline' : 'disciplines'}${selectedCount === 4 ? ' • 5 each' : ''})`
                : 'Select at least one motorsport discipline'}
            </div>
          </div>
        </div>

        <button
          id="btn-start-quiz-attempt"
          type="button"
          onClick={onStartQuiz}
          disabled={isStartDisabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.65rem 1.6rem',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            letterSpacing: '0.06em',
            background: isStartDisabled ? 'var(--bg-input, #1e232b)' : 'var(--gradient-flame, linear-gradient(135deg, #FF7A00 0%, #FF003C 100%))',
            color: isStartDisabled ? 'var(--text-muted, #64748b)' : '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-sm, 4px)',
            cursor: isStartDisabled ? 'not-allowed' : 'pointer',
            boxShadow: isStartDisabled ? 'none' : '0 0 20px rgba(255, 122, 0, 0.45)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isLoading ? 'GENERATING ATTEMPT...' : 'START 20-QUESTION ATTEMPT'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;
