/**
 * CALI WEED — OFFICIAL PRODUCT VERIFICATION & FIREWORKS SCRIPT
 * 1. Plays introductory brand animation.
 * 2. Reveals verification panel with dynamic circular percentage ring (0% -> 100%).
 * 3. Bursts into "VERIFIED" status with a high-performance particle fireworks show.
 * 4. Seamlessly redirects to https://cali-weed.com/ without distracting countdown text.
 */

(function () {
  'use strict';

  const TARGET_URL = 'https://cali-weed.com/';
  const CIRCULAR_PERIMETER = 377; // 2 * Math.PI * 60

  const heroFrame = document.getElementById('cali-hero-frame');
  const overlay = document.getElementById('verification-overlay');
  const certCard = document.getElementById('cert-card');
  const topBrand = document.getElementById('top-brand');
  const skipBtn = document.getElementById('skip-btn');

  const dialFill = document.getElementById('dial-fill');
  const dialPercent = document.getElementById('dial-percent');
  const dialSub = document.getElementById('dial-sub');
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const titleText = document.getElementById('title-text');
  const certDesc = document.getElementById('cert-desc');
  const statusVal = document.getElementById('status-val');
  const redirectBtn = document.getElementById('redirect-btn');

  let verificationTriggered = false;
  let fireworksRunning = false;

  // Set initial stroke-dashoffset to 100% empty
  if (dialFill) {
    dialFill.style.strokeDashoffset = CIRCULAR_PERIMETER;
  }

  // =========================================================================
  // FIREWORKS PARTICLE ENGINE (HIGH PERFORMANCE 2D CANVAS)
  // =========================================================================
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let fireworks = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const PALETTE = [
    '#00ed00', '#10b981', '#38bdf8', '#fbbf24', '#ffffff', '#4ade80', '#22d3ee'
  ];

  class Firework {
    constructor(startX, startY, targetX, targetY) {
      this.x = startX;
      this.y = startY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.speed = 12 + Math.random() * 4;
      this.angle = Math.atan2(targetY - startY, targetX - startX);
      this.distanceToTarget = Math.hypot(targetX - startX, targetY - startY);
      this.distanceTraveled = 0;
      this.coordinates = [];
      this.coordinateCount = 3;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;
      this.distanceTraveled = Math.hypot(this.x + vx - this.coordinates[0][0], this.y + vy - this.coordinates[0][1]);
      this.x += vx;
      this.y += vy;

      if (this.distanceTraveled >= this.distanceToTarget || this.y <= this.targetY) {
        createExplosion(this.targetX, this.targetY, this.color);
        fireworks.splice(index, 1);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.coordinates = [];
      this.coordinateCount = 5;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = Math.random() * Math.PI * 2;
      this.speed = 2 + Math.random() * 8;
      this.friction = 0.94;
      this.gravity = 1.1;
      this.alpha = 1;
      this.decay = 0.012 + Math.random() * 0.02;
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;

      if (this.alpha <= 0.05) {
        particles.splice(index, 1);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  function createExplosion(x, y, baseColor) {
    let particleCount = 70;
    while (particleCount--) {
      const color = Math.random() > 0.3 ? baseColor : PALETTE[Math.floor(Math.random() * PALETTE.length)];
      particles.push(new Particle(x, y, color));
    }
  }

  function launchFireworkSalvo() {
    const w = canvas.width;
    const h = canvas.height;

    // Launch multiple celebratory shells
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const startX = w * 0.2 + Math.random() * (w * 0.6);
        const targetX = w * 0.15 + Math.random() * (w * 0.7);
        const targetY = h * 0.12 + Math.random() * (h * 0.38);
        fireworks.push(new Firework(startX, h, targetX, targetY));
      }, i * 220);
    }
  }

  function animateFireworks() {
    if (!fireworksRunning) return;
    requestAnimationFrame(animateFireworks);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].draw();
      particles[i].update(i);
    }
  }

  function triggerFireworksShow() {
    fireworksRunning = true;
    animateFireworks();
    launchFireworkSalvo();

    // Additional wave of fireworks
    setTimeout(() => launchFireworkSalvo(), 900);
    setTimeout(() => launchFireworkSalvo(), 1800);
  }

  // =========================================================================
  // PROGRESS DIAL & VERIFICATION SEQUENCE
  // =========================================================================
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

  function runCircularProgress(onComplete) {
    let currentPercent = 0;
    const duration = 2400; // 2.4s smooth circular scan
    const start = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);

      // Smooth ease-out curve
      const eased = Math.sin((progress * Math.PI) / 2);
      currentPercent = Math.min(100, Math.floor(eased * 100));

      if (dialPercent) {
        dialPercent.textContent = currentPercent + '%';
      }

      if (dialFill) {
        const offset = CIRCULAR_PERIMETER - (CIRCULAR_PERIMETER * (currentPercent / 100));
        dialFill.style.strokeDashoffset = offset;
      }

      // At 98%+, snap into verified burst
      if (currentPercent >= 98 || progress >= 1) {
        if (dialPercent) dialPercent.textContent = '100%';
        if (dialFill) dialFill.style.strokeDashoffset = 0;
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function startVerificationSequence() {
    if (verificationTriggered) return;
    verificationTriggered = true;

    // Hide skip button once intro completes
    if (skipBtn) {
      skipBtn.style.opacity = '0';
      skipBtn.style.pointerEvents = 'none';
    }

    // Reveal top brand header & overlay
    if (topBrand) topBrand.classList.add('visible');
    if (overlay) overlay.classList.add('active');

    // Run circular ring from 0% -> 100%
    runCircularProgress(() => {
      // 1. Switch to "VERIFIED" state
      if (certCard) certCard.classList.add('state-verified');
      if (statusText) statusText.textContent = 'VERIFIED AUTHENTIC';
      if (titleText) titleText.textContent = 'VERIFIED ORIGINAL';
      if (certDesc) {
        certDesc.textContent = 'Official packaging seal matched & confirmed. This product is an authentic laboratory-certified California original.';
      }
      if (statusVal) {
        statusVal.textContent = '100% Authentic Genuine';
        statusVal.style.color = '#00ed00';
      }

      // 2. Launch Fireworks explosion
      triggerFireworksShow();

      // 3. Auto-redirect to cali-weed.com (without countdown text)
      setTimeout(() => {
        window.location.href = TARGET_URL;
      }, 5500);
    });
  }

  // Skip button handler
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

  // Direct button click
  if (redirectBtn) {
    redirectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = TARGET_URL;
    });
  }

  // Listen to postMessage from the animation iframe
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'cali:intro-complete') {
      startVerificationSequence();
    }
  });

  // Safety fallback if iframe message is blocked (intro length is ~20.2s)
  setTimeout(() => {
    if (!verificationTriggered) {
      startVerificationSequence();
    }
  }, 21000);

  initBatchDetails();
})();
