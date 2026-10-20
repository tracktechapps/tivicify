import { useEffect } from 'react';
import { audioEnhancer } from '../services/audioEnhancer';

interface TVNavigationOptions {
  enabled: boolean;
  onBack?: () => void;
  onEnter?: () => void;
  soundEffects?: boolean;
}

export function useTVNavigation({ enabled, onBack, soundEffects = false }: TVNavigationOptions = { enabled: true }) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;

      // Handle Back Button (Android TV remote back button sends 'Escape' or 'BrowserBack')
      if (e.key === 'Escape' || e.key === 'BrowserBack' || e.key === 'GoBack') {
        if (onBack) {
          e.preventDefault();
          if (soundEffects) audioEnhancer.playNavigationTick();
          onBack();
          return;
        }
      }

      // If user is currently typing in an input or textarea, don't hijack arrow keys
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      ) {
        if (e.key === 'Escape') {
          activeElement.blur();
        }
        return;
      }

      const focusableSelector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), .tv-focusable';

      const focusables = Array.from(
        document.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          el.offsetParent !== null
        );
      });

      if (focusables.length === 0) return;

      // Spatial navigation for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        if (!activeElement || !focusables.includes(activeElement)) {
          focusables[0].focus();
          focusables[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          if (soundEffects) audioEnhancer.playNavigationTick();
          return;
        }

        const currentRect = activeElement.getBoundingClientRect();
        let closestEl: HTMLElement | null = null;
        let minDistance = Infinity;

        focusables.forEach((el) => {
          if (el === activeElement) return;
          const rect = el.getBoundingClientRect();

          let isCandidate = false;
          let dist = 0;

          if (e.key === 'ArrowRight' && rect.left >= currentRect.right - 10) {
            isCandidate = true;
            dist = Math.hypot(rect.left - currentRect.right, rect.top - currentRect.top);
          } else if (e.key === 'ArrowLeft' && rect.right <= currentRect.left + 10) {
            isCandidate = true;
            dist = Math.hypot(currentRect.left - rect.right, rect.top - currentRect.top);
          } else if (e.key === 'ArrowDown' && rect.top >= currentRect.bottom - 10) {
            isCandidate = true;
            dist = Math.hypot(rect.left - currentRect.left, rect.top - currentRect.bottom);
          } else if (e.key === 'ArrowUp' && rect.bottom <= currentRect.top + 10) {
            isCandidate = true;
            dist = Math.hypot(rect.left - currentRect.left, currentRect.top - rect.bottom);
          }

          if (isCandidate && dist < minDistance) {
            minDistance = dist;
            closestEl = el;
          }
        });

        if (closestEl) {
          (closestEl as HTMLElement).focus();
          (closestEl as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
          if (soundEffects) audioEnhancer.playNavigationTick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onBack, soundEffects]);
}
