// app/forum/NewPostButton.jsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthModal } from '@/contexts/AuthModalProvider';
import { getCurrentUser } from '@/utils/auth';
import { FaPlus } from 'react-icons/fa';

export default function NewPostButton() {
  const router = useRouter();
  const params = useParams();
  const [isClient, setIsClient] = useState(false);
  const { openModal } = useAuthModal();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = () => {
    if (!isClient) return;

    const user = getCurrentUser();
    if (user) {
      // ✅ משתמש מחובר – מעבר לעמוד פתיחת דיון חדש
      router.push(`/forum/${params.slug}/new`);
    } else {
      // ❌ משתמש לא מחובר – פתיחת מודאל התחברות
      openModal('inline', 'עליך להתחבר כדי לפתוח דיון חדש');
    }
  };

  return (
    <div className="flex justify-end mt-4 mb-6">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 bg-[#e60000] hover:bg-[#ff3333] text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        <FaPlus className="text-sm" />
        <span>פתח דיון חדש</span>
      </button>
    </div>
  );
}
