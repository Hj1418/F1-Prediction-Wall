import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, className = '' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={`info-tooltip-wrapper ${className}`}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={e => {
        e.stopPropagation();
        setVisible(prev => !prev);
      }}
      title={text}
    >
      <HelpCircle size={13} color="var(--text-muted)" style={{ marginLeft: '0.25rem' }} />
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1c2230',
            color: '#fff',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            lineHeight: 1.35,
            width: '210px',
            textAlign: 'center',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
            border: '1px solid var(--border-medium)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};
