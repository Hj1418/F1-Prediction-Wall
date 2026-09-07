import React, { useState } from 'react';
import { ExternalLink, Shield, BookOpen, Layers } from 'lucide-react';
import { OFFICIAL_RESOURCES, OfficialResource } from '../../services/educational/officialContent';

interface OfficialUpdatesSectionProps {
  maxItems?: number;
  showCategoryFilter?: boolean;
}

export const OfficialUpdatesSection: React.FC<OfficialUpdatesSectionProps> = ({
  maxItems,
  showCategoryFilter = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Regulations', 'Race Weekend', 'Technical'];

  const filtered = OFFICIAL_RESOURCES.filter(res => {
    if (selectedCategory === 'all') return true;
    return res.category === selectedCategory;
  });

  const displayList = maxItems ? filtered.slice(0, maxItems) : filtered;

  return (
    <section className="official-updates-section" style={{ marginTop: '2.5rem' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--f1-red)',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <Shield size={14} />
            <span>AUTHORITATIVE SOURCES & REGULATIONS</span>
          </div>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              margin: '0.25rem 0 0',
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            Official F1 Updates & Governance
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              margin: '0.2rem 0 0',
            }}
          >
            We explain the fundamentals. For official rulebooks, editorial analysis, and FIA decisions, consult the verified sources below.
          </p>
        </div>

        {showCategoryFilter && (
          <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: active ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                    background: active ? 'rgba(225, 6, 0, 0.12)' : 'var(--bg-surface)',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Structured Articles Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {displayList.map(item => {
          const isFia = item.source === 'FIA';
          return (
            <article
              key={item.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div>
                {/* Source & Category Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.6rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: isFia ? 'rgba(31, 111, 235, 0.15)' : 'rgba(225, 6, 0, 0.15)',
                      color: isFia ? '#58a6ff' : 'var(--f1-red)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.source}
                  </span>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Season {item.verifiedSeason} • {item.verifiedDate}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#fff',
                    margin: '0 0 0.45rem',
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </h3>

                {/* Short Contextual Description */}
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>

              {/* Direct Link to Official Source */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  marginTop: '0.25rem',
                }}
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: isFia ? '#58a6ff' : 'var(--f1-red)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>
                    {isFia ? 'Read Official Regulations' : 'Read Official Article'}
                  </span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default OfficialUpdatesSection;
