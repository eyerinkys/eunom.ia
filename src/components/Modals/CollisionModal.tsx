import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const CollisionModal: React.FC = () => {
  const { collisionState, resolveCollision } = useEunomiaStore();

  if (!collisionState) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 28, 33, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110
      }}
    >
      <div 
        className="rule-all"
        style={{
          width: '400px',
          backgroundColor: '#FFF',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertCircle size={20} color="var(--accent-red)" />
          <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700 }}>
            Filename Collision Detected
          </h3>
        </div>
        
        <p className="font-sans" style={{ fontSize: '14px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
          A file named <strong className="font-mono" style={{ fontSize: '13px' }}>{collisionState.filename}</strong> already exists in this folder.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            type="button"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => resolveCollision('replace')}
          >
            Replace Existing File (Create vN)
          </button>
          
          <button 
            type="button"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--bg-panel)' }}
            onClick={() => resolveCollision('keep_both')}
          >
            Keep Both (Auto-Rename)
          </button>
          
          <button 
            type="button"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', border: 'none' }}
            onClick={() => resolveCollision('cancel')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
