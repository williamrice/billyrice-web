import Footer from '@/components//Footer';
import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from '@/components/ui/sonner';
import ConditionalNavBar from '@/components/ConditionalNavBar';
import { SITE_URL } from '@/lib/site';
import {
  getDeviconSetting,
  getProjectsSetting,
} from '@/features/settings/queries/settings';
import { PublicSettingsProvider } from '@/features/settings/components/PublicSettingsProvider';

import '@/app/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Billy Rice — Software Engineer & Technical Leader',
    template: '%s | Billy Rice',
  },
  description:
    'Software engineer and technical leader focused on implementation, software design, and dependable systems.',
  keywords: [
    'software developer lexington ky',
    'full-stack developer kentucky',
    'react developer',
    'next.js developer',
    'web development lexington ky',
    'node.js developer',
    'typescript developer',
    'postgresql developer',
  ],
  openGraph: {
    title: 'Billy Rice - Software Developer',
    description:
      'Full-stack software developer portfolio featuring web applications and software solutions.',
    url: SITE_URL,
    siteName: 'Billy Rice Portfolio',
    images: [
      {
        url: '/images/william_headshot_500x500.jpg',
        width: 500,
        height: 500,
        alt: 'Billy Rice - Software Developer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: 'Billy Rice - Software Developer',
    description:
      'Full-stack software developer portfolio featuring web applications and software solutions.',
    images: ['/images/william_headshot_500x500.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deviconSetting, projectsSetting] = await Promise.all([
    getDeviconSetting(),
    getProjectsSetting(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link
          rel="dns-prefetch"
          href="https://williamarice-web.s3.amazonaws.com"
        />
        <link rel="dns-prefetch" href="https://cdn.credly.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      </head>
      <body className="w-full">
        <PublicSettingsProvider settings={{ devicons: deviconSetting }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <div className="flex min-h-dvh flex-col items-center">
          <header>
            <ConditionalNavBar projectsEnabled={projectsSetting.enabled} />
          </header>
          <main
            id="main-content"
            className="w-full min-w-0 flex-1"
            tabIndex={-1}
          >
            {children}
          </main>
          <Toaster />
          <Footer />
        </div>
        </PublicSettingsProvider>
        <GoogleAnalytics gaId="G-Y46TG9779R" />
      </body>
    </html>
  );
}
