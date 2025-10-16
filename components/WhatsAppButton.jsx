// /components/WhatsAppButton.jsx
'use client';
import React from 'react';

const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function WhatsAppButton({ message, label = "צור קשר ב-WhatsApp" }) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition inline-block"
    >
      {label}
    </a>
  );
}
