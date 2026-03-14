import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'LernenAI — AI-Powered SEO & ASO Consulting Agency',
  description: 'AI-powered SEO and App Store Optimization. We help websites and mobile apps rank higher organically. Book a free AI audit today.',
  keywords: 'SEO consulting, ASO optimization, app store optimization, AI SEO agency, organic growth',
  openGraph: {
    title: 'LernenAI — AI-Powered SEO & ASO Consulting',
    description: 'AI-powered SEO and App Store Optimization. We help websites and mobile apps dominate search rankings organically.',
    siteName: 'LernenAI',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
