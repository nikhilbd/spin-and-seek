// Canvas-based Carnival Wheel with Physics, Flapper Animation, and High-DPI Rendering
(function(exports) {
  'use strict';

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const NUM_SEGMENTS = 26;
  const SEGMENT_ANGLE = (Math.PI * 2) / NUM_SEGMENTS;

  // Rich Victorian antique palette: brass, crimson, navy, emerald, amber, amethyst, teal, plum
  const PALETTE = [
    '#9b2226', '#ae2012', '#bb3e03', '#ca6702', '#ee9b00', '#e9d8a6',
    '#94d2bd', '#0a9396', '#005f73', '#1d3557', '#457b9d', '#2a9d8f',
    '#e76f51', '#f4a261', '#e9c46a', '#8338ec', '#3a86ff', '#588157',
    '#344e41', '#6b705c', '#a5a58d', '#b5838d', '#6d597a', '#355070',
    '#7209b7', '#4361ee'
  ];

  class SpinningWheel {
    constructor(canvas, soundSystem) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.soundSystem = soundSystem;

      this.rotation = 0; // Current rotation angle in radians
      this.isSpinning = false;
      this.highlightedLetters = new Set();
      this.flapperAngle = 0; // Flapper deflection angle
      this.lastPegIndex = -1;

      this.onSpinEnd = null;

      this._initCanvas();
      this.draw();
    }

    _initCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(rect.width || 420, rect.height || 420);

      this.width = size;
      this.height = size;
      this.canvas.width = size * dpr;
      this.canvas.height = size * dpr;
      this.ctx.scale(dpr, dpr);

      this.centerX = size / 2;
      this.centerY = size / 2;
      this.radius = size * 0.44;
    }

    resize() {
      this._initCanvas();
      this.draw();
    }

    setHighlightedLetters(letters) {
      this.highlightedLetters = new Set((letters || []).map(l => l.toUpperCase()));
      this.draw();
    }

    clearHighlights() {
      this.highlightedLetters.clear();
      this.draw();
    }

    /**
     * Determines which letter is currently under the pointer at 12 o'clock (-PI / 2).
     */
    getCurrentLetter() {
      const pointerAngle = -Math.PI / 2;
      let effectiveAngle = (pointerAngle - this.rotation) % (Math.PI * 2);
      if (effectiveAngle < 0) effectiveAngle += Math.PI * 2;
      const index = Math.floor(effectiveAngle / SEGMENT_ANGLE) % NUM_SEGMENTS;
      return ALPHABET[index];
    }

    /**
     * Calculate target angle to land squarely on targetLetter.
     */
    _calculateTargetRotation(targetLetter, extraSpins = 6) {
      const targetIndex = ALPHABET.indexOf(targetLetter.toUpperCase());
      if (targetIndex === -1) return this.rotation + extraSpins * Math.PI * 2;

      // Pointer is at -PI / 2 (top)
      // Segment center is at (targetIndex + 0.5) * SEGMENT_ANGLE
      // (targetIndex + 0.5) * SEGMENT_ANGLE + targetRotation == -PI / 2 (mod 2PI)
      const pointerAngle = -Math.PI / 2;
      const segmentCenter = (targetIndex + 0.5) * SEGMENT_ANGLE;

      // Subtle random offset within the segment for organic feel (+/- 25% of slice)
      const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.5);

      // Desired normalized angle:
      let desiredAngle = (pointerAngle - segmentCenter + jitter) % (Math.PI * 2);
      if (desiredAngle < 0) desiredAngle += Math.PI * 2;

      // Current normalized angle:
      let currentNormalized = this.rotation % (Math.PI * 2);
      if (currentNormalized < 0) currentNormalized += Math.PI * 2;

      let forwardDelta = desiredAngle - currentNormalized;
      if (forwardDelta < 0) forwardDelta += Math.PI * 2;

      // Total target angle with multiple dramatic revolutions
      return this.rotation + (extraSpins * Math.PI * 2) + forwardDelta;
    }

    /**
     * Spin the wheel to land on targetLetter.
     * @param {string} targetLetter 
     * @param {Function} onEnd 
     */
    spinTo(targetLetter, onEnd) {
      if (this.isSpinning) return;
      this.isSpinning = true;
      this.onSpinEnd = onEnd;

      const startRotation = this.rotation;
      const targetRotation = this._calculateTargetRotation(targetLetter, 4 + Math.floor(Math.random() * 2));
      const totalDelta = targetRotation - startRotation;
      this._targetRotation = targetRotation;

      const duration = 2600 + Math.random() * 400; // Snappy 2.6 - 3.0 seconds
      const startTime = performance.now();

      let lastTickRotation = startRotation;

      const animate = (currentTime) => {
        if (!this.isSpinning) return;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Custom quintic ease-out with lingering finish
        const easeOut = 1 - Math.pow(1 - progress, 4.0);
        this.rotation = startRotation + totalDelta * easeOut;

        // Peg collision check for flapper and sound
        const pointerAngle = -Math.PI / 2;
        let currentEffective = (pointerAngle - this.rotation) % (Math.PI * 2);
        if (currentEffective < 0) currentEffective += Math.PI * 2;

        const currentPeg = Math.floor(currentEffective / SEGMENT_ANGLE);
        if (currentPeg !== this.lastPegIndex) {
          const speed = (this.rotation - lastTickRotation) / 16;
          this.flapperAngle = -0.38; // deflect pointer
          if (this.soundSystem) {
            this.soundSystem.playTick(Math.min(speed * 30, 4));
          }
          this.lastPegIndex = currentPeg;
        } else {
          // Flapper springs back smoothly
          this.flapperAngle *= 0.82;
        }

        lastTickRotation = this.rotation;
        this.draw();

        if (progress < 1) {
          this._rafId = requestAnimationFrame(animate);
        } else {
          this.finishSpin();
        }
      };

      this._rafId = requestAnimationFrame(animate);
    }

    finishSpin() {
      if (!this.isSpinning) return;
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
      this.isSpinning = false;
      if (typeof this._targetRotation === 'number') {
        this.rotation = this._targetRotation;
      }
      this.flapperAngle = 0;
      this.draw();

      const landedLetter = this.getCurrentLetter();
      if (this.soundSystem) {
        this.soundSystem.playLand();
      }

      if (typeof this.onSpinEnd === 'function') {
        const cb = this.onSpinEnd;
        this.onSpinEnd = null;
        cb(landedLetter);
      }
    }

    draw() {
      const ctx = this.ctx;
      const cx = this.centerX;
      const cy = this.centerY;
      const r = this.radius;

      ctx.clearRect(0, 0, this.width, this.height);

      // Outer ornate brass ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
      const brassGrad = ctx.createRadialGradient(cx, cy, r + 5, cx, cy, r + 20);
      brassGrad.addColorStop(0, '#5a3d1b');
      brassGrad.addColorStop(0.4, '#c6923b');
      brassGrad.addColorStop(0.7, '#f7d77d');
      brassGrad.addColorStop(1, '#3b2507');
      ctx.fillStyle = brassGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fill();
      ctx.restore();

      // Outer rim studs / rivets
      ctx.save();
      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const studAngle = i * SEGMENT_ANGLE + this.rotation;
        const sx = cx + Math.cos(studAngle) * (r + 10);
        const sy = cy + Math.sin(studAngle) * (r + 10);
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fce4a6';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fill();
      }
      ctx.restore();

      // Draw segments
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation);

      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const startAngle = i * SEGMENT_ANGLE;
        const endAngle = startAngle + SEGMENT_ANGLE;
        const letter = ALPHABET[i];
        const isHighlighted = this.highlightedLetters.has(letter);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, startAngle, endAngle);
        ctx.closePath();

        // Base color
        ctx.fillStyle = isHighlighted ? '#e63946' : PALETTE[i % PALETTE.length];
        ctx.fill();

        // Highlight ring pulse if selected
        if (isHighlighted) {
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw Letter Text
        ctx.save();
        ctx.rotate(startAngle + SEGMENT_ANGLE / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.round(r * 0.12)}px 'Cinzel', 'Georgia', serif`;

        if (isHighlighted) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffe66d';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 4;
        }
        ctx.fillText(letter, r * 0.88, 0);
        ctx.restore();
      }

      // Draw pegs on the outer perimeter between segments
      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const pegAngle = i * SEGMENT_ANGLE;
        const px = Math.cos(pegAngle) * (r - 2);
        const py = Math.sin(pegAngle) * (r - 2);

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fce4a6';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fill();
      }

      ctx.restore(); // Restore center translation

      // Inner ornate hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2);
      const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.24);
      hubGrad.addColorStop(0, '#f9e29d');
      hubGrad.addColorStop(0.5, '#b8860b');
      hubGrad.addColorStop(0.85, '#5c3a07');
      hubGrad.addColorStop(1, '#2c1802');
      ctx.fillStyle = hubGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fill();

      // Gem center stone (sapphire/ruby)
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.1, 0, Math.PI * 2);
      const gemGrad = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, r * 0.1);
      gemGrad.addColorStop(0, '#ff758f');
      gemGrad.addColorStop(0.4, '#c9184a');
      gemGrad.addColorStop(1, '#590d22');
      ctx.fillStyle = gemGrad;
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Top Flapper Needle (Pointer at 12 o'clock)
      ctx.save();
      ctx.translate(cx, cy - r - 6);
      ctx.rotate(this.flapperAngle);

      ctx.beginPath();
      ctx.moveTo(-10, -18);
      ctx.lineTo(10, -18);
      ctx.lineTo(0, 22); // Points down into the wheel
      ctx.closePath();

      const needleGrad = ctx.createLinearGradient(-10, -18, 10, 22);
      needleGrad.addColorStop(0, '#ffe066');
      needleGrad.addColorStop(0.5, '#d4a373');
      needleGrad.addColorStop(1, '#a98467');
      ctx.fillStyle = needleGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.strokeStyle = '#4a2810';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Needle mounting pin
      ctx.beginPath();
      ctx.arc(0, -14, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb703';
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  exports.SpinningWheel = SpinningWheel;
})(typeof exports !== 'undefined' ? exports : (window.WHEEL_MODULE = {}));
