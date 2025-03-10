// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/Navbar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LoadingBar from '@/components/LoadingBar';
import { Toaster } from "react-hot-toast";
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import { LoginModalProvider , useLoginModal } from "@/contexts/LoginModalContext";
import LoginModalWrapper from "@/components/layout/LoginModalWrapper";


const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: '%s | Dashboard App',
      default: 'Dashboard App',
    },
    description: 'A modern dashboard application with dark theme',
    // اضافه کردن متای سفارشی
    other: {
      'google-site-verification': '5C3M59mTnqop0xGg_gqVyuh1p-OTZ9hrTKGapAKDdgg',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
          <LoginModalProvider>
            <Suspense fallback={<><Loading/></>}>
              <Navbar />
              <LoadingBar />
              {children}
              <LoginModalWrapper /> {/* حالا AuthModal در کلاینت اجرا می‌شود */}


            </Suspense>
          </LoginModalProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}

