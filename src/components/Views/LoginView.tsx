import React, { useState } from 'react';
import { Shield, Hexagon } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const LoginView: React.FC = () => {
  const { loginUser, registerUser, isAuthLoading, authError } = useEunomiaStore();
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      await registerUser(email, password, displayName);
    } else {
      await loginUser(email, password);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)'
    }}>
      <div className="rule-all" style={{
        width: '400px',
        backgroundColor: 'var(--bg-panel)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Brand Logo & Wordmark */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--accent-bronze)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <Hexagon size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em', marginBottom: '4px' }}>
            Eunomia
          </h1>
          <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Archival System
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="badge-tampered" style={{ width: '100%', marginBottom: '16px', padding: '8px', textAlign: 'center' }}>
            {authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>DISPLAY NAME</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="rule-all"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          )}

          <div>
            <label className="font-mono" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rule-all"
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                outline: 'none',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div>
            <label className="font-mono" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>PASSWORD (ARGON2ID KEY)</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rule-all"
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                outline: 'none',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}
          >
            {isAuthLoading ? (
              <span className="font-mono" style={{ opacity: 0.8 }}>PROCESSING...</span>
            ) : (
              <>
                <Shield size={16} />
                <span className="font-mono">{isRegister ? 'REGISTER & SEAL KEY' : 'AUTHENTICATE SESSION'}</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setEmail('');
              setPassword('');
              setDisplayName('');
              useEunomiaStore.setState({ authError: null });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Already have an account? Sign In.' : 'Need a new archive key? Register.'}
          </button>
        </div>
      </div>
    </div>
  );
};
