/**
 * CALI WEED — OFFICIAL QR PRODUCT VERIFICATION APPLICATION
 * Integrates 6-Digit Code Verification, Animated Hero Background Control,
 * Lenis Smooth Scroll + GSAP ScrollTrigger, View Transitions API, and Modern Web APIs.
 */

(function () {
  'use strict';

  /* ========================================================================
     1. 6-DIGIT VERIFICATION CODE REGISTRY & STATE
     ======================================================================== */
  const STORAGE_KEY_CUSTOM_CODES = 'cali_weed_custom_codes_v1';
  const config = window.CALI_VERIFICATION_CONFIG || {
    RAW_CODES_LIST: '',
    VALID_PRODUCT_CODES: [],
    CALI_STRAIN_CATALOG: []
  };

  let activeCodesSet = new Set();

  function parseSixDigitCodes(rawString, arrayList) {
    const combined = [
      ...(Array.isArray(arrayList) ? arrayList : []),
      ...String(rawString || '').split(/[\s,;]+/)
    ];
    const validSet = new Set();
    for (const token of combined) {
      const cleaned = String(token).trim();
      if (/^\d{6}$/.test(cleaned)) {
        validSet.add(cleaned);
      }
    }
    return validSet;
  }

  function loadCodeRegistry() {
    let savedRaw = null;
    try {
      savedRaw = localStorage.getItem(STORAGE_KEY_CUSTOM_CODES);
    } catch (e) {
      // Ignore storage access errors in restricted modes
    }

    if (savedRaw && savedRaw.trim().length > 0) {
      activeCodesSet = parseSixDigitCodes(savedRaw, []);
    } else {
      activeCodesSet = parseSixDigitCodes(config.RAW_CODES_LIST, config.VALID_PRODUCT_CODES);
    }
    updateCodesCountersUI();
  }

  function updateCodesCountersUI() {
    const count = activeCodesSet.size;
    const navCountEl = document.getElementById('loaded-codes-count');
    const modalCountEl = document.getElementById('modal-codes-count');
    const textareaEl = document.getElementById('custom-codes-textarea');

    if (navCountEl) navCountEl.textContent = String(count);
    if (modalCountEl) modalCountEl.textContent = String(count);
    if (textareaEl && document.activeElement !== textareaEl) {
      textareaEl.value = Array.from(activeCodesSet).join('\n');
    }

    // Refresh quick sample chips with first 4 valid codes
    const chipsContainer = document.getElementById('sample-code-chips');
    if (chipsContainer) {
      const firstFour = Array.from(activeCodesSet).slice(0, 4);
      chipsContainer.innerHTML = '';
      firstFour.forEach((code) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-chip';
        btn.dataset.sampleCode = code;
        btn.textContent = `#${code} (Valid)`;
        chipsContainer.appendChild(btn);
      });
      const fakeBtn = document.createElement('button');
      fakeBtn.type = 'button';
      fakeBtn.className = 'code-chip chip-invalid';
      fakeBtn.dataset.sampleCode = '999999';
      fakeBtn.textContent = '#999999 (Invalid Test)';
      chipsContainer.appendChild(fakeBtn);
    }
  }

  function getDeterministicBatchInfo(sixDigitCode) {
    const catalog = config.CALI_STRAIN_CATALOG || [];
    const numericVal = parseInt(sixDigitCode, 10) || 0;
    const strain = catalog[numericVal % catalog.length] || {
      name: 'Cali Reserve OG',
      genetics: 'California Heritage Cut',
      type: 'Indica-Dominant Hybrid',
      thc: '26.4%',
      terpenes: 'Myrcene, Limonene, Caryophyllene',
      breeder: 'Vanessa Malwin — Master Horticulture Lead',
      origin: 'Sunny Av., CA 10019',
      url: 'https://cali-weed.com/cannabis-strains/'
    };

    const batchHash = ((numericVal * 2654435761) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    return {
      code: sixDigitCode,
      certificateId: `CW-CA-${sixDigitCode}-${batchHash.slice(0, 4)}`,
      batchNumber: `BATCH-2026-${batchHash.slice(4, 8)}`,
      strainName: strain.name,
      genetics: strain.genetics,
      type: strain.type,
      thc: strain.thc,
      terpenes: strain.terpenes,
      breeder: strain.breeder,
      origin: strain.origin,
      strainUrl: strain.url,
      verifiedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  /* ========================================================================
     2. 6-DIGIT VERIFICATION FORM & WEBOTP API
     (modern-web-guidance: forms & sms-otp-form)
     ======================================================================== */
  const verifyForm = document.getElementById('verify-form');
  const codeInput = document.getElementById('verify-code-input');
  const errorMsgEl = document.getElementById('code-error-msg');
  const resultContainer = document.getElementById('verification-result-container');
  const qrStatusIndicator = document.getElementById('qr-status-indicator');
  const slotBars = document.querySelectorAll('#code-slot-indicators .slot-bar');

  let otpAbortController = null;

  function stopSmsOtpListener() {
    if (otpAbortController) {
      otpAbortController.abort();
      otpAbortController = null;
    }
  }

  async function startSmsOtpListener() {
    if (!codeInput || !('OTPCredential' in window)) {
      return;
    }
    stopSmsOtpListener();
    const ac = new AbortController();
    otpAbortController = ac;

    try {
      const otp = await navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      });
      if (!otp || !otp.code) return;
      codeInput.value = String(otp.code).replace(/\D/g, '').slice(0, 6);
      updateSlotBars(codeInput.value);
      if (verifyForm) {
        verifyForm.requestSubmit();
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  function updateSlotBars(val) {
    const cleanLen = String(val || '').replace(/\D/g, '').length;
    slotBars.forEach((bar, index) => {
      bar.classList.toggle('filled', index < cleanLen);
    });
  }

  function setFieldError(message) {
    if (!codeInput || !errorMsgEl) return;
    codeInput.setCustomValidity(message || '');
    errorMsgEl.textContent = message || '';
    codeInput.classList.toggle('input-error', Boolean(message));
  }

  function validateSixDigitValue(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      return 'Please enter the 6-digit security number from your Cali Weed bag.';
    }
    if (!/^\d{6}$/.test(trimmed)) {
      return 'Your security code must consist of exactly 6 digits (0–9).';
    }
    return '';
  }

  function renderVerificationOutcome(sixDigitCode) {
    const isAuthentic = activeCodesSet.has(sixDigitCode);

    const updateDOM = () => {
      if (!resultContainer) return;

      if (isAuthentic) {
        const info = getDeterministicBatchInfo(sixDigitCode);
        if (qrStatusIndicator) {
          qrStatusIndicator.textContent = `VERIFIED // #${sixDigitCode}`;
          qrStatusIndicator.style.color = '#00ed00';
        }
        resultContainer.innerHTML = `
          <div class="verification-result status-authentic" role="region" aria-label="Authentic Product Verification Certificate">
            <div class="result-banner">
              <div class="result-icon" aria-hidden="true">✓</div>
              <div>
                <div class="result-title" style="color: #00ed00;">AUTHENTIC CALI WEED PRODUCT</div>
                <div class="result-subtitle">Security Code <strong>#${info.code}</strong> is registered and verified in our California database.</div>
              </div>
            </div>

            <div class="telemetry-grid">
              <div class="telemetry-cell">
                <span class="telemetry-key">Certificate ID</span>
                <span class="telemetry-val">${info.certificateId}</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-key">California Strain</span>
                <span class="telemetry-val">${info.strainName} (${info.thc} THC)</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-key">Genetic Lineage</span>
                <span class="telemetry-val">${info.genetics}</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-key">Production Batch</span>
                <span class="telemetry-val">${info.batchNumber}</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-key">Lead Horticulture</span>
                <span class="telemetry-val">${info.breeder}</span>
              </div>
              <div class="telemetry-cell">
                <span class="telemetry-key">Origin &amp; Timestamp</span>
                <span class="telemetry-val">${info.origin} • ${info.verifiedAt}</span>
              </div>
            </div>

            <div class="result-actions">
              <a href="${info.strainUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                <span>View ${info.strainName} on Cali-Weed.com</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a href="https://cali-weed.com/" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
                <span>Official Cali Weed Store</span>
              </a>
            </div>
          </div>
        `;
      } else {
        if (qrStatusIndicator) {
          qrStatusIndicator.textContent = `ALERT // UNRECOGNIZED #${sixDigitCode}`;
          qrStatusIndicator.style.color = '#f87171';
        }
        resultContainer.innerHTML = `
          <div class="verification-result status-counterfeit" role="region" aria-label="Unrecognized Product Code Warning">
            <div class="result-banner">
              <div class="result-icon" aria-hidden="true">✕</div>
              <div>
                <div class="result-title" style="color: #fca5a5;">WARNING: CODE #${sixDigitCode} NOT RECOGNIZED</div>
                <div class="result-subtitle">This 6-digit number does not match any authorized Cali Weed production batch.</div>
              </div>
            </div>

            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.85rem;">
              Please double-check all 6 digits on your bag's security label. If the code still fails verification, your product may be an unauthorized counterfeit. Only purchase genuine genetics via <a href="https://cali-weed.com/" target="_blank" rel="noopener noreferrer" style="color: #fff; text-decoration: underline;">cali-weed.com</a> or authorized retailers.
            </p>

            <div class="result-actions">
              <a href="https://cali-weed.com/contact-us/" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="border-color: #ef4444; color: #fca5a5;">
                <span>Report Suspected Counterfeit</span>
              </a>
              <a href="https://cali-weed.com/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                <span>Shop Authentic at Cali-Weed.com</span>
              </a>
            </div>
          </div>
        `;
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => updateDOM());
    } else {
      updateDOM();
    }
  }

  if (codeInput && verifyForm) {
    // Active Typing ('input' event): Clear existing errors only & update 6-slot indicator
    codeInput.addEventListener('input', () => {
      const digitsOnly = codeInput.value.replace(/\D/g, '').slice(0, 6);
      if (codeInput.value !== digitsOnly) {
        codeInput.value = digitsOnly;
      }
      setFieldError('');
      updateSlotBars(digitsOnly);
    });

    // Exiting Field ('blur' event): Validate once user finishes interaction
    codeInput.addEventListener('blur', () => {
      if (codeInput.value.trim().length > 0) {
        const error = validateSixDigitValue(codeInput.value);
        setFieldError(error);
      }
    });

    // Form Submission ('submit' event)
    verifyForm.addEventListener('submit', (event) => {
      stopSmsOtpListener();
      event.preventDefault();

      const error = validateSixDigitValue(codeInput.value);
      if (error) {
        setFieldError(error);
        codeInput.focus();
        return;
      }

      setFieldError('');
      const cleanCode = codeInput.value.trim();
      renderVerificationOutcome(cleanCode);
    });

    // Sample code chips click handler
    const sampleChipsWrapper = document.getElementById('sample-code-chips');
    if (sampleChipsWrapper) {
      sampleChipsWrapper.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-sample-code]');
        if (!chip) return;
        const sampleCode = chip.getAttribute('data-sample-code');
        codeInput.value = sampleCode;
        setFieldError('');
        updateSlotBars(sampleCode);
        verifyForm.requestSubmit();
      });
    }
  }

  /* ========================================================================
     3. HERO ANIMATION BACKGROUND CONTROLLER
     ======================================================================== */
  const heroFrame = document.getElementById('cali-hero-frame');
  const btnCinemaToggle = document.getElementById('btn-cinema-toggle');
  const btnHeroSkip = document.getElementById('btn-hero-skip');
  const btnHeroPlay = document.getElementById('btn-hero-play');
  const btnHeroRestart = document.getElementById('btn-hero-restart');

  let heroPaused = false;

  function sendHeroAction(action) {
    if (!heroFrame) return;
    try {
      if (heroFrame.contentWindow && heroFrame.contentWindow.caliHero && typeof heroFrame.contentWindow.caliHero[action] === 'function') {
        heroFrame.contentWindow.caliHero[action]();
        return;
      }
    } catch (e) {
      // Fallback to postMessage if cross-origin/file protocol blocks direct access
    }
    try {
      if (heroFrame.contentWindow) {
        heroFrame.contentWindow.postMessage({ action }, '*');
      }
    } catch (e) {}
  }

  if (btnCinemaToggle) {
    btnCinemaToggle.addEventListener('click', () => {
      const isCinema = document.body.classList.toggle('cinema-mode');
      btnCinemaToggle.classList.toggle('active-cinema', isCinema);
      btnCinemaToggle.querySelector('span').textContent = isCinema ? 'Exit Cinema View' : 'Cinema View';
    });
  }

  if (btnHeroSkip) {
    btnHeroSkip.addEventListener('click', () => {
      sendHeroAction('skip');
    });
  }

  if (btnHeroPlay) {
    btnHeroPlay.addEventListener('click', () => {
      if (heroPaused) {
        sendHeroAction('resume');
        heroPaused = false;
        btnHeroPlay.querySelector('span').textContent = 'Pause';
        btnHeroPlay.setAttribute('aria-pressed', 'false');
      } else {
        sendHeroAction('pause');
        heroPaused = true;
        btnHeroPlay.querySelector('span').textContent = 'Play';
        btnHeroPlay.setAttribute('aria-pressed', 'true');
      }
    });
  }

  if (btnHeroRestart) {
    btnHeroRestart.addEventListener('click', () => {
      sendHeroAction('restart');
      heroPaused = false;
      if (btnHeroPlay) {
        btnHeroPlay.querySelector('span').textContent = 'Pause';
        btnHeroPlay.setAttribute('aria-pressed', 'false');
      }
    });
  }

  window.addEventListener('message', (event) => {
    if (!event.data || !event.data.type) return;
    if (event.data.type === 'cali:state') {
      heroPaused = Boolean(event.data.paused);
      if (btnHeroPlay) {
        btnHeroPlay.querySelector('span').textContent = heroPaused ? 'Play' : 'Pause';
        btnHeroPlay.setAttribute('aria-pressed', String(heroPaused));
      }
    }
  });

  /* ========================================================================
     4. NATIVE MODAL DIALOGS & LIGHT-DISMISS FALLBACK
     (modern-web-guidance: dialog & light-dismiss-a-dialog)
     ======================================================================== */
  const imprintDialog = document.getElementById('imprint-dialog');
  const codesDialog = document.getElementById('codes-dialog');

  function openModalDialog(dialogEl) {
    if (!dialogEl || typeof dialogEl.showModal !== 'function') return;
    updateCodesCountersUI();
    dialogEl.showModal();
  }

  document.getElementById('open-imprint-dialog-btn')?.addEventListener('click', () => openModalDialog(imprintDialog));
  document.getElementById('footer-imprint-btn')?.addEventListener('click', () => openModalDialog(imprintDialog));
  document.getElementById('open-codes-manager-btn')?.addEventListener('click', () => openModalDialog(codesDialog));
  document.getElementById('manage-codes-inline-btn')?.addEventListener('click', () => openModalDialog(codesDialog));
  document.getElementById('footer-codes-btn')?.addEventListener('click', () => openModalDialog(codesDialog));

  // Reset returnValue on close (modern-web-guidance: dialog)
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });
  }

  // Fallback for browsers without native dialog[closedby="any"] support
  if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  // Code List Manager Actions
  document.getElementById('save-codes-btn')?.addEventListener('click', () => {
    const textareaEl = document.getElementById('custom-codes-textarea');
    if (!textareaEl) return;
    activeCodesSet = parseSixDigitCodes(textareaEl.value, []);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_CODES, Array.from(activeCodesSet).join('\n'));
    } catch (e) {}
    updateCodesCountersUI();
    codesDialog?.close();
  });

  document.getElementById('reset-codes-btn')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_CODES);
    } catch (e) {}
    loadCodeRegistry();
  });

  document.getElementById('download-codes-js-btn')?.addEventListener('click', () => {
    const codesArray = Array.from(activeCodesSet);
    const fileContent = `/**
 * CALI WEED — OFFICIAL 6-DIGIT PRODUCT VERIFICATION CODE LIST
 * Generated from the Cali Weed Code List Manager
 */

const RAW_CODES_LIST = \`
${codesArray.join('\n')}
\`;

const VALID_PRODUCT_CODES = ${JSON.stringify(codesArray, null, 2)};

const CALI_STRAIN_CATALOG = ${JSON.stringify(config.CALI_STRAIN_CATALOG || [], null, 2)};

window.CALI_VERIFICATION_CONFIG = {
  RAW_CODES_LIST,
  VALID_PRODUCT_CODES,
  CALI_STRAIN_CATALOG
};
`;
    const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codes.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  /* ========================================================================
     5. LENIS SMOOTH SCROLL, GSAP SCROLLTRIGGER & MICRO-INTERACTIONS
     ======================================================================== */
  function initCreativeMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll Progress Bar
    const progressEl = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
      if (!progressEl) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      progressEl.style.transform = `scaleX(${ratio})`;
    }, { passive: true });

    if (prefersReducedMotion) return;

    // Initialize Lenis Physics Smooth Scroll + GSAP ScrollTrigger
    if (typeof window.Lenis !== 'undefined' && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.8
      });

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // Animate Scrollytelling Cards
      const cards = gsap.utils.toArray('.scrolly-card');
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            delay: (i % 4) * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }

    // Magnetic Button Effect
    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    magneticButtons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        if (typeof window.gsap === 'undefined') return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.22,
          y: y * 0.22,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        if (typeof window.gsap === 'undefined') return;
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.35)'
        });
      });
    });

    // Custom Fluid Cursor Follower
    const cursor = document.getElementById('custom-cursor');
    if (cursor && window.matchMedia('(pointer: fine)').matches) {
      let mouseX = -100, mouseY = -100;
      let cursorX = -100, cursorY = -100;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      document.querySelectorAll('a, button, input, .code-chip').forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
      });

      function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.16;
        cursorY += (mouseY - cursorY) * 0.16;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
      }
      requestAnimationFrame(animateCursor);
    }
  }

  /* ========================================================================
     6. INITIALIZATION & QR URL PARAMETER AUTO-FILL
     ======================================================================== */
  loadCodeRegistry();
  startSmsOtpListener();
  initCreativeMotion();

  // Check if QR code scan passed ?code=123456 or ?c=123456 in URL
  const params = new URLSearchParams(window.location.search);
  const prefilledCode = params.get('code') || params.get('c') || params.get('pin');
  if (prefilledCode && codeInput && verifyForm) {
    const clean = prefilledCode.replace(/\D/g, '').slice(0, 6);
    if (clean.length > 0) {
      codeInput.value = clean;
      updateSlotBars(clean);
      if (clean.length === 6) {
        renderVerificationOutcome(clean);
      }
    }
  }
})();
