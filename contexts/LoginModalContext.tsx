"use client";

import { createContext, useContext, useState } from "react";

type LoginModalContextType = {
  isOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openLogin = () => setIsOpen(true);
  const closeLogin = () => setIsOpen(false);

  return (
    <LoginModalContext.Provider value={{ isOpen, openLogin, closeLogin }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal باید داخل LoginModalProvider استفاده شود");
  }
  return context;
}
