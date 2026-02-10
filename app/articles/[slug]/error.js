'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // לוג של השגיאה לשרת או לקונסול
    console.error("קריסה בדף כתבה:", error);
  }, [error]);

  return (
    <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right', background: '#fff' }}>
      <h2 style={{ color: 'red' }}>קרתה שגיאה טכנית בטעינת הכתבה</h2>
      <p>כדי שאוכל לעזור, בבקשה תעתיק/תצלם את הטקסט למטה:</p>
      <div style={{ 
        background: '#f4f4f4', 
        padding: '10px', 
        borderRadius: '5px', 
        fontSize: '12px', 
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        direction: 'ltr',
        textAlign: 'left'
      }}>
        <strong>Message:</strong> {error.message} <br/><br/>
        <strong>Digest:</strong> {error.digest} <br/><br/>
        <strong>Stack:</strong> {error.stack}
      </div>
      <button 
        onClick={() => window.location.reload()} 
        style={{ marginTop: '20px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px' }}
      >
        רענן דף
      </button>
    </div>
  );
}