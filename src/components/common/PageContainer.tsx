import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string | number;
  noPadding?: boolean;
}

/**
 * Standardized Page Container
 * Ensures uniform 1320px max-width, horizontal centering,
 * and responsive side padding across all pages, sections, and headers.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = '1320px',
  noPadding = false,
  style,
  ...props
}) => {
  return (
    <div
      className={`page-container ${className}`.trim()}
      style={{
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        width: '100%',
        margin: '0 auto',
        padding: noPadding ? 0 : undefined,
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageContainer;
