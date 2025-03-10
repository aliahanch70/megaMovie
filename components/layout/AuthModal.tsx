'use client'; // 👈 این خط ضروری است!

import { useLoginModal } from '@/contexts/LoginModalContext';
import LoginPage from '@/app/auth/login/page';

export default function AuthModal() {
  const { isOpen, closeLogin } = useLoginModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-3">
      <div className=" relative">
        <button className=" absolute top-2 right-2 text-red-500 text-lg" onClick={closeLogin}>
            <span >Close</span>
          ✕
        </button>
        <LoginPage />
      </div>
    </div>
  );
}
