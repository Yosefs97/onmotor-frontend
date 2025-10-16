//app\forum\NewPostButton.jsx
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthModal } from '@/contexts/AuthModalProvider';
import { getCurrentUser } from '@/utils/auth'; // ✅ שימוש בפונקציה מרוכזת

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

    const user = getCurrentUser(); // ✅ דרך תקנית ואחידה
    if (user) {
      router.push(`/forum/${params.category}/new`);
    } else {
      openModal('inline', 'הירשם/התחבר לצורך פתיחת דיון חדש');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      פתח דיון חדש - (לצורך כך הירשם/התחבר בחלון שנפתח)
    </button>
  );
}
