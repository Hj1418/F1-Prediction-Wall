import React, { useState, useEffect } from 'react';
import { StrategyDecisionPoint, StrategyActionOption, TireCompound } from '../../types/strategy';
import { Radio, ArrowRight, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DecisionPanelProps {
  decisionPoint: StrategyDecisionPoint;
  totalSteps: number;
  currentStepIndex: number;
  isSubmitting: boolean;
  onCommitAction: (actionId: string) => void;
}

const COMPOUND_COLORS: Record<TireCompound, string> = {
  soft: '#FF3025',
  medium: '#FFB000',
  hard: '#F8FAFC',
  intermediate: '#10B981',
  wet: '#3B82F6'
};

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  decisionPoint,
  totalSteps,
  currentStepIndex,
  isSubmitting,
  onCommitAction
}) => {
  const [selectedActionId, setSelectedActionId] = useState<string>('');

  // Reset selection when decision point changes
  useEffect(() => {
    setSelectedActionId('');
  }, [decisionPoint.id]);

  // Keyboard shortcut listeners (keys 1-9 to select, Enter to confirm)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= decisionPoint.availableActions.length) {
        setSelectedActionId(decisionPoint.availableActions[num - 1].id);
      } else if (e.key === 'Enter' && selectedActionId) {
        e.preventDefault();
        onCommitAction(selectedActionId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [decisionPoint.availableActions, selectedActionId, isSubmitting, onCommitAction]);

  const handleSelect = (actionId: string) => {
    if (isSubmitting) return;
    setSelectedActionId(actionId);
  };

  const handleConfirm = () => {
    if (!selectedActionId || isSubmitting) return;
    onCommitAction(selectedActionId);
  };

  return (
    <div className="decision-panel">
      {/* Decision Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={16} style={{ color: 'var(--flame-orange, #FF5500)' }} />
            <span style={{ fontFamily: 'var(--font-display, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 700, color: 'var(--flame-amber, #FF8A00)' }}>
              {totalSteps > 1
                ? `STAGE ${currentStepIndex + 1} OF ${totalSteps} // ACTIVE STRATEGY CALL`
                : 'PIT WALL TACTICAL DECISION'}
            </span>
          </div>

          {totalSteps > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    height: '6px',
                    borderRadius: '999px',
                    transition: 'all 0.3s ease',
                    width: idx === currentStepIndex ? '28px' : idx < currentStepIndex ? '18px' : '10px',
                    backgroundColor: idx < currentStepIndex ? '#00e676' : idx === currentStepIndex ? 'var(--flame-orange, #FF5500)' : 'rgba(255, 255, 255, 0.15)'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <h2 className="decision-prompt-title">
          {decisionPoint.prompt}
        </h2>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.6, margin: 0 }}>
          {decisionPoint.contextDescription}
        </p>
      </div>

      {/* Action Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-display, sans-serif)' }}>
            Available Strategic Options
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
            Keys [1 - {decisionPoint.availableActions.length}] / Click
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {decisionPoint.availableActions.map((option: StrategyActionOption, index: number) => {
            const isSelected = selectedActionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                disabled={isSubmitting}
                className={`decision-option-card ${isSelected ? 'decision-option-card--selected' : ''}`}
              >
                {/* Header: Key shortcut, Title, Risk Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="decision-key-box">
                      {index + 1}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF', letterSpacing: '0.02em' }}>
                      {option.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Compound Badge if Pit action */}
                    {option.targetCompound && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono, monospace)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          border: `1px solid ${COMPOUND_COLORS[option.targetCompound] || '#FFF'}`,
                          color: COMPOUND_COLORS[option.targetCompound] || '#FFF',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {option.targetCompound}
                      </span>
                    )}

                    {/* Risk Level Badge */}
                    {option.riskLevel && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-display, sans-serif)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: option.riskLevel === 'high' ? 'rgba(244, 43, 22, 0.2)' : option.riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: option.riskLevel === 'high' ? '#FF3025' : option.riskLevel === 'medium' ? '#FFB000' : '#10B981',
                          border: `1px solid ${option.riskLevel === 'high' ? 'rgba(244, 43, 22, 0.4)' : option.riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                        }}
                      >
                        {option.riskLevel === 'high' ? (
                          <AlertTriangle size={10} />
                        ) : option.riskLevel === 'low' ? (
                          <ShieldCheck size={10} />
                        ) : (
                          <Zap size={10} />
                        )}
                        {option.riskLevel} Risk
                      </span>
                    )}
                  </div>
                </div>

                {/* Tactical Description */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.5, margin: 0, paddingLeft: '2rem' }}>
                  {option.description}
                </p>

                {/* Intent/Rationale */}
                {option.tacticalIntent && (
                  <div style={{ paddingLeft: '2rem', fontSize: '0.72rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--flame-amber, #FF8A00)', fontWeight: 600 }}>Tactic:</span>
                    <span>{option.tacticalIntent}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Area */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #848B96)' }}>
          {selectedActionId ? (
            <span style={{ color: '#FFFFFF' }}>
              Selected: <strong style={{ color: 'var(--flame-yellow, #FFB000)' }}>{decisionPoint.availableActions.find(a => a.id === selectedActionId)?.label}</strong>
            </span>
          ) : (
            <span>Select a strategic call to broadcast to the pit wall</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedActionId || isSubmitting}
          className="decision-commit-btn"
        >
          {isSubmitting ? (
            <>
              <div style={{ width: '16px', height: '16px', border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>Broadcasting Call...</span>
            </>
          ) : (
            <>
              <span>Confirm Strategy Call</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
