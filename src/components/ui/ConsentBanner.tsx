/**
 * GDPR / Cookie consent banner.
 * Shown when consent.enabled === true and user has not yet decided.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsentConfig } from '@/config/runtime';
import { bootstrapAnalytics, setConsent } from '@/lib/analytics';

export const ConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const cfg = getConsentConfig();

  useEffect(() => {
    if (!cfg.enabled) return;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(cfg.storageKey) : null;
      if (!stored) {
        setVisible(true);
      } else {
        bootstrapAnalytics();
      }
    } catch {
      setVisible(true);
    }
  }, [cfg.enabled, cfg.storageKey]);

  if (!cfg.enabled || !visible) return null;

  const handleAccept = () => {
    setConsent(true);
    setVisible(false);
  };
  const handleReject = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={cfg.title}
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 backdrop-blur shadow-2xl"
    >
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{cfg.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {cfg.body}{' '}
            {cfg.learnMoreLabel && cfg.learnMoreHref ? (
              <Link to={cfg.learnMoreHref} className="text-primary underline">
                {cfg.learnMoreLabel}
              </Link>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReject}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {cfg.rejectLabel}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {cfg.acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
