import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/Navbar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LoadingBar from '@/components/LoadingBar';
import { Toaster } from "react-hot-toast";


const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: '%s | Dashboard App',
      default: 'Dashboard App'
    },
    description: 'A modern dashboard application with dark theme',
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
            <Navbar />
            <LoadingBar />
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}