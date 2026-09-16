import React from 'react';
import { ShieldCheck, Info, ExternalLink } from 'lucide-react';
import { SourceProvenanceMetadata, SourceAuthorityLevel } from '../../types/dataContract';

interface SourceProvenanceBadgeProps {
  provenance?: SourceProvenanceMetadata;
  customSourceId?: string;
  customAttribution?: string;
  authorityLevel?: SourceAuthorityLevel;
}

export const SourceProvenanceBadge: React.FC<SourceProvenanceBadgeProps> = ({
  provenance,
  customSourceId,
  customAttribution,
  authorityLevel = 'OFFICIAL',
}) => {
  const sourceId = provenance?.sourceId || customSourceId || 'official-motorsport';
  const attribution = provenance?.attribution || customAttribution || 'Official Motorsport Sanctioning Body';
  const authLevel = provenance?.authorityLevel || authorityLevel;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.3rem 0.65rem',
        borderRadius: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
      }}
      title={`Data Provenance Source: ${sourceId} (${authLevel})`}
    >
      <ShieldCheck size={13} style={{ color: '#10b981', flexShrink: 0 }} />
      <span>
        Authoritative Data: <strong style={{ color: 'var(--text-secondary)' }}>{attribution}</strong>
      </span>
      {provenance?.version && (
        <span style={{ opacity: 0.7 }}>• v{provenance.version}</span>
      )}
    </div>
  );
};
