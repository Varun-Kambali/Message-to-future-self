'use client'
import React, { useState, useEffect } from 'react'

export type RecipientType = 'self' | 'someone_else';

interface RecipientSelectorProps {
  onTypeChange: (type: RecipientType) => void;
  onEmailChange: (email: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function RecipientSelector({ onTypeChange, onEmailChange, onValidationChange }: RecipientSelectorProps) {
  const [recipientType, setRecipientType] = useState<RecipientType>('self');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // Notify parent of type change
  useEffect(() => {
    onTypeChange(recipientType);
    if (recipientType === 'self') {
      onValidationChange(true);
      setError('');
    } else {
      validateEmail(email); // Re-run validation for current email
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientType]);

  const validateEmail = (val: string) => {
    if (!val) {
      setError('Email is required');
      onValidationChange(false);
      return;
    }
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rx.test(val)) {
      setError('Please enter a valid email address');
      onValidationChange(false);
    } else {
      setError('');
      onValidationChange(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setEmail(val);
    onEmailChange(val);
    validateEmail(val);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'var(--display)', fontSize: '20px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px' }}>
        Who is this message for?
      </h3>
      <p style={{ fontFamily: 'var(--body)', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Choose whether this capsule is a gift to yourself, or to someone else you cherish.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: recipientType === 'someone_else' ? '24px' : '0' }}>
        <button
          onClick={() => setRecipientType('self')}
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: recipientType === 'self' ? 'rgba(212,168,83,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${recipientType === 'self' ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
          <div style={{ fontFamily: 'var(--body)', fontWeight: 500, fontSize: '14px', color: recipientType === 'self' ? 'var(--accent)' : 'var(--text-main)' }}>
            My future self
          </div>
        </button>

        <button
          onClick={() => setRecipientType('someone_else')}
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: recipientType === 'someone_else' ? 'rgba(212,168,83,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${recipientType === 'someone_else' ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💌</div>
          <div style={{ fontFamily: 'var(--body)', fontWeight: 500, fontSize: '14px', color: recipientType === 'someone_else' ? 'var(--accent)' : 'var(--text-main)' }}>
            Someone else
          </div>
        </button>
      </div>

      {recipientType === 'someone_else' && (
        <div style={{ animation: 'slideUp 0.3s ease forwards' }}>
          <label style={{ display: 'block', fontFamily: 'var(--body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Recipient&apos;s email address
          </label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="theirstory@example.com"
            className="input-modern"
            style={{
              borderColor: error ? 'var(--accent-2)' : undefined,
            }}
          />
          {error && (
            <div style={{ color: 'var(--accent-2)', fontSize: '12px', marginTop: '6px', fontFamily: 'var(--body)' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
