import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import '../globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Baltic Foot — Venetos Liaudanskienės podologijos kabinetai',
  description:
    'Profesionali podologijos priežiūra Lietuvoje. Saugus aparatinis pedikiūras, įaugusio nago korekcija Titano Siūlu, probleminių pėdų procedūros. Registruokitės: +370 699 80980',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
