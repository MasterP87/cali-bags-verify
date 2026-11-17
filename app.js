/**
 * CALI WEED — OFFICIAL PRODUCT VERIFICATION & AUTO-REDIRECT SCRIPT
 * Plays full-screen introductory animation, reveals animated authenticity certificate,
 * and seamlessly redirects to cali-weed.com.
 */

(function () {
  'use strict';

  const TARGET_URL = 'https://cali-weed.com/';
  const REDIRECT_DELAY_MS = 6000; // 6 seconds to view the verified original certificate

  const heroFrame = document.getElementById('cali-hero-frame');
  const overlay = document.getElementById('verification-overlay');
  const topBrand = document.getElementById('top-brand');
  const skipBtn = document.getElementById('skip-btn');
  const countdownText = document.getElementById('countdown-seconds');
  const progressFill = document.getElementById('progress-fill');
  const redirectBtn = document.getElementById('redirect-btn');

  let verificationTriggered = false;
  let countdownTimer = null;
  let progressInterval = null;

  // Generate randomized California batch security id for the authentic seal
  function initBatchDetails() {
    const certEl = document.getElementById('cert-id');
    const timeEl = document.getElementById('verified-timestamp');

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    if (certEl) {
      certEl.textContent = `CW-CA-${randomSuffix}`;
    }

    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  function startVerificationSequence() {
    if (verificationTriggered) return;
    verificationTriggered = true;

    // Hide skip button once intro finishes
    if (skipBtn) {
      skipBtn.style.opacity = '0';
      skipBtn.style.pointerEvents = 'none';
    }

    // Reveal top brand badge and verification overlay with animated checkmark
    if (topBrand) topBrand.classList.add('visible');
    if (overlay) overlay.classList.add('active');

    // Start auto-redirect countdown
    let remainingMs = REDIRECT_DELAY_MS;
    const startTime = performance.now();

    progressInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progressPercent = Math.min(100, (elapsed / REDIRECT_DELAY_MS) * 100);
      if (progressFill) {
        progressFill.style.width = progressPercent + '%';
      }

      const secondsLeft = Math.max(1, Math.ceil((REDIRECT_DELAY_MS - elapsed) / 1000));
      if (countdownText) {
        countdownText.textContent = secondsLeft;
      }

      if (elapsed >= REDIRECT_DELAY_MS) {
        clearInterval(progressInterval);
        performRedirect();
      }
    }, 50);
  }

  function performRedirect() {
    if (countdownTimer) clearInterval(countdownTimer);
    if (progressInterval) clearInterval(progressInterval);
    window.location.href = TARGET_URL;
  }

  // Skip animation listener
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      try {
        if (heroFrame && heroFrame.contentWindow) {
          heroFrame.contentWindow.postMessage({ action: 'skip' }, '*');
        }
      } catch (e) {}
      startVerificationSequence();
    });
  }

  // Immediate redirect button click
  if (redirectBtn) {
    redirectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performRedirect();
    });
  }

  // Listen to postMessage from the animation iframe
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'cali:intro-complete') {
      startVerificationSequence();
    }
  });

  // Fallback safety: The intro animation takes ~20.2 seconds.
  // In case postMessage is blocked by any browser security policy, auto-trigger after 21s.
  setTimeout(() => {
    if (!verificationTriggered) {
      startVerificationSequence();
    }
  }, 21000);

  initBatchDetails();
})();
