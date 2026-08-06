import React from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const BreadcrumbBar: React.FC = () => {
  const { setCurrentFolderId, breadcrumbs } = useEunomiaStore();

  const crumbs = breadcrumbs.length > 0 ? breadcrumbs : [{ id: 'root', name: 'ROOT' }];

  return (
    <div 
      style={{
        padding: '12px 24px',
        backgroundColor: 'var(--bg-canvas)',
        borderBottom: '1.5px solid #E1E2E9',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)'
      }}
    >
      <Folder size={14} color="var(--accent-bronze)" />
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.id}>
            {idx > 0 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            <button
              onClick={() => setCurrentFolderId(crumb.id)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: isLast ? 700 : 500,
                color: isLast ? 'var(--text-primary)' : 'var(--accent-bronze)',
                textDecoration: isLast ? 'none' : 'underline',
                cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
