import React from 'react';
import { QuizCategory } from '../../types/quiz';
import { Check, Layers, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface CategorySelectorProps {
  categories: (QuizCategory & { availableQuestions: number })[];
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onStartQuiz: () => void;
  isLoading?: boolean;
}

const GROUP_ORDER = ['Formula Racing', 'Motorcycle Racing', 'Endurance Racing', 'GT Racing'] as const;

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onSelectAll,
  onClearAll,
  onStartQuiz,
  isLoading = false,
}) => {
  const selectedSet = new Set(selectedCategoryIds);
  const selectedCount = selectedCategoryIds.length;

  // Group categories
  const groupedCategories = GROUP_ORDER.map(group => ({
    groupName: group,
    items: categories.filter(c => c.grouping === group),
  })).filter(g => g.items.length > 0);

  const totalAvailableQuestions = categories
    .filter(c => selectedSet.has(c.id))
    .reduce((sum, c) => sum + (c.availableQuestions || 0), 0);

  const isStartDisabled = selectedCount === 0 || totalAvailableQuestions === 0 || isLoading;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Selector Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Layers size={18} style={{ color: 'var(--color-accent, #FF4B33)' }} />
            <h2 style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '0.04em' }}>
              SELECT MOTORSPORT DISCIPLINES
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Choose one or more categories. Each attempt contains a maximum of 15 questions balanced evenly across your selections.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onSelectAll}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            SELECT ALL
          </button>
          <button
            type="button"
            onClick={onClearAll}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Category Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {groupedCategories.map(group => (
          <div key={group.groupName}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '0.85rem',
                paddingLeft: '0.25rem',
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '14px',
                  backgroundColor: 'var(--color-accent, #FF4B33)',
                  borderRadius: '2px',
                }}
              />
              <h3
                style={{
                  fontSize: '0.88rem',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {group.groupName}
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.9rem',
              }}
            >
              {group.items.map(category => {
                const isSelected = selectedSet.has(category.id);
                const hasQuestions = (category.availableQuestions || 0) > 0;

                return (
                  <div
                    key={category.id}
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
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '1.15rem',
                      backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                      border: `1.5px solid ${isSelected ? category.color : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: hasQuestions ? 'pointer' : 'not-allowed',
                      opacity: hasQuestions ? 1 : 0.5,
                      boxShadow: isSelected ? `0 0 15px -4px ${category.color}40` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Top Row: Badge + Name + Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-mono)',
                            borderRadius: '4px',
                            backgroundColor: `${category.color}22`,
                            color: category.color,
                            border: `1px solid ${category.color}44`,
                          }}
                        >
                          {category.badge}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                          {category.displayName}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1.5px solid ${isSelected ? category.color : 'var(--border-medium)'}`,
                          backgroundColor: isSelected ? category.color : 'transparent',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                        margin: '0 0 0.85rem 0',
                      }}
                    >
                      {category.description}
                    </p>

                    {/* Question Pool Indicator */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.6rem',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={13} style={{ color: 'var(--telemetry-green)' }} />
                        Verified Pool
                      </span>
                      <span style={{ color: category.availableQuestions > 0 ? 'var(--text-primary)' : 'var(--f1-red)' }}>
                        {category.availableQuestions} questions
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: '1.5rem',
          marginTop: '2rem',
          padding: '1.15rem 1.5rem',
          backgroundColor: 'rgba(11, 13, 16, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border, #292F38)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Allocation Target
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {selectedCount > 0
                ? `${Math.min(15, totalAvailableQuestions)} Questions (${selectedCount} ${selectedCount === 1 ? 'discipline' : 'disciplines'})`
                : 'No disciplines selected'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartQuiz}
          disabled={isStartDisabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.75rem',
            fontSize: '0.92rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            letterSpacing: '0.06em',
            background: isStartDisabled ? 'var(--bg-input)' : 'var(--gradient-flame)',
            color: isStartDisabled ? 'var(--text-muted)' : '#070809',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: isStartDisabled ? 'not-allowed' : 'pointer',
            boxShadow: isStartDisabled ? 'none' : 'var(--shadow-flame)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isLoading ? 'GENERATING ATTEMPT...' : 'START ATTEMPT'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
