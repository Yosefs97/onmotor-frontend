// components/AuthNewsletterBox.jsx
'use client';
import React from 'react';
import NewsletterBox from './NewsletterBox';
import AuthBox from './AuthBox';

export default function AuthNewsletterBox({ mode = 'inline', view = 'both' }) {
  return (
    <div className="py-0">
      {(view === 'both' || view === 'newsletter') && <NewsletterBox mode={mode} />}
      
    </div>
  );
}
