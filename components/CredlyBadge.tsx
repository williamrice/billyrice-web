'use client';

import Script from 'next/script';

// Extend the Window interface to include Credly
declare global {
  interface Window {
    Credly?: {
      initialize: () => void;
    };
  }
}

interface CredlyBadgeProps {
  badgeId: string;
  title: string;
}

export default function CredlyBadge({ badgeId, title }: CredlyBadgeProps) {
  return (
    <>
      <Script
        id={`credly-script-${badgeId}`}
        src="https://cdn.credly.com/assets/utilities/embed.js"
        strategy="afterInteractive"
        onLoad={() => window.Credly?.initialize()}
      />
      <div className="mx-auto" aria-label={title}>
        <div
          data-iframe-width="150"
          data-iframe-height="270"
          data-share-badge-id={badgeId}
          data-share-badge-host="https://www.credly.com"
        />
      </div>
    </>
  );
}
