import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './portfolio.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kartikey Upadhyay | Full-Stack Developer & AI Engineer',
  description:
    'Portfolio of Kartikey Upadhyay — BCA (AI & ML) student at JECRC University, Jaipur. Full-Stack MERN Developer, Google Gemini AI Builder, and 100+ LeetCode DSA problem solver.',
  keywords: [
    'Kartikey Upadhyay',
    'Full Stack Developer',
    'AI Engineer',
    'JECRC University',
    'NutriZen',
    'MYGPT',
    'LeetCode',
    'Gemini API',
    'React Developer',
    'Node.js Developer',
  ],
  authors: [{ name: 'Kartikey Upadhyay' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
