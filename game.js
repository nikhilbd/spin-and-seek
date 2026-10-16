// Main Game State Machine and Orchestrator
(function() {
  'use strict';

  class GameEngine {
    constructor() {
      this.sound = new window.SOUND_MODULE.SoundSystem();
      this.room = null;
      this.wheel = null;

      // Game State
      this.state = 'INTRO'; // INTRO, READY_SPIN_1, SPINNING_1, READY_SPIN_2, SPINNING_2, SEARCHING, ROUND_SUCCESS
      this.firstLetter = null;
      this.lastLetter = null;
      this.targetObjects = [];
      this.primaryTarget = null;
      this.revealedIndices = new Set();
      this.discoveredIds = new Set();
      this.sessionUsedIds = new Set();

      // Stats
      this.score = 0;
      this.streak = 0;
      this.round = 1;
      this.roundStartTime = 0;
      this.hintsUsedThisRound = 0;

      // Settings
      this.difficulty = 'intermediate'; // 'beginner', 'intermediate', 'advanced'
      this.mode = 'casual'; // 'casual' or 'timed'
      this.timerInterval = null;
      this.timeRemaining = 60;

      this._cacheDOM();
      this._initSystems();
      this._bindEvents();
    }

    _cacheDOM() {
      this.dom = {
        wheelOverlay: document.getElementById('wheelOverlay'),
        wheelCanvas: document.getElementById('wheelCanvas'),
        wheelTitle: document.getElementById('wheelTitle'),
        wheelSubtitle: document.getElementById('wheelSubtitle'),
        btnSpin: document.getElementById('btnSpin'),
        roomContainer: document.getElementById('roomContainer'),
        hudTarget: document.getElementById('hudTarget'),
        targetPrompt: document.getElementById('targetPrompt'),
        targetPattern: document.getElementById('targetPattern'),
        letterCountBadge: document.getElementById('letterCountBadge'),
        btnDifficultySelect: document.getElementById('btnDifficultySelect'),
        hudDifficultyIcon: document.getElementById('hudDifficultyIcon'),
        hudDifficultyLabel: document.getElementById('hudDifficultyLabel'),
        difficultyOptions: document.getElementById('difficultyOptions'),
        hudScore: document.getElementById('hudScore'),
        hudStreak: document.getElementById('hudStreak'),
        hudRound: document.getElementById('hudRound'),
        hudTimer: document.getElementById('hudTimer'),
        hudTimerContainer: document.getElementById('hudTimerContainer'),
        btnHint: document.getElementById('btnHint'),
        hintBtnText: document.getElementById('hintBtnText'),
        btnRespin: document.getElementById('btnRespin'),
        btnMute: document.getElementById('btnMute'),
        btnLedger: document.getElementById('btnLedger'),
        btnHelp: document.getElementById('btnHelp'),

        // Modals
        modalIntro: document.getElementById('modalIntro'),
        btnStartGame: document.getElementById('btnStartGame'),
        modalSuccess: document.getElementById('modalSuccess'),
        successTitle: document.getElementById('successTitle'),
        successObjectName: document.getElementById('successObjectName'),
        successObjectHint: document.getElementById('successObjectHint'),
        successScoreBonus: document.getElementById('successScoreBonus'),
        btnNextRound: document.getElementById('btnNextRound'),
        modalLedger: document.getElementById('modalLedger'),
        ledgerList: document.getElementById('ledgerList'),
        ledgerProgress: document.getElementById('ledgerProgress'),
        btnCloseLedger: document.getElementById('btnCloseLedger'),

        // Toast
        toast: document.getElementById('toastNotification')
      };
    }

    _initSystems() {
      this.wheel = new window.WHEEL_MODULE.SpinningWheel(this.dom.wheelCanvas, this.sound);
      this.room = new window.ROOM_MODULE.RoomRenderer(this.dom.roomContainer, this.sound);

      // Handle room object clicks
      this.room.onObjectClick = (clickedObj) => {
        this._handleObjectClick(clickedObj);
      };
    }

    _bindEvents() {
      // Start Game
      this.dom.btnStartGame.addEventListener('click', () => {
        this.dom.modalIntro.classList.add('hidden');
        this.startFirstSpin();
      });

      // Wheel Spin button (or fast-forward if already spinning)
      this.dom.btnSpin.addEventListener('click', () => {
        if (this.wheel && this.wheel.isSpinning) {
          this.wheel.finishSpin();
          return;
        }
        if (this.state === 'READY_SPIN_1') {
          this.executeFirstSpin();
        } else if (this.state === 'READY_SPIN_2') {
          this.executeSecondSpin();
        }
      });

      // Clicking the wheel canvas also spins or fast-forwards an active spin
      if (this.dom.wheelCanvas) {
        this.dom.wheelCanvas.style.cursor = 'pointer';
        this.dom.wheelCanvas.addEventListener('click', () => {
          if (this.wheel && this.wheel.isSpinning) {
            this.wheel.finishSpin();
          } else if (this.state === 'READY_SPIN_1') {
            this.executeFirstSpin();
          } else if (this.state === 'READY_SPIN_2') {
            this.executeSecondSpin();
          }
        });
      }

      // Hint button
      this.dom.btnHint.addEventListener('click', () => {
        this._useHint();
      });

      // Respin button
      this.dom.btnRespin.addEventListener('click', () => {
        if (this.state === 'SEARCHING') {
          this.streak = 0;
          this._updateStatsHUD();
          this.startFirstSpin();
        }
      });

      // Next round button
      this.dom.btnNextRound.addEventListener('click', () => {
        this.dom.modalSuccess.classList.add('hidden');
        this.round++;
        this.startFirstSpin();
      });

      // Sound mute toggle
      this.dom.btnMute.addEventListener('click', () => {
        const isMuted = !this.sound.toggleMute();
        this.dom.btnMute.textContent = isMuted ? '🔇' : '🔊';
        this.dom.btnMute.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
      });

      // Ledger modal
      this.dom.btnLedger.addEventListener('click', () => {
        this._openLedger();
      });
      this.dom.btnCloseLedger.addEventListener('click', () => {
        this.dom.modalLedger.classList.add('hidden');
      });

      // Help modal
      this.dom.btnHelp.addEventListener('click', () => {
        this.dom.modalIntro.classList.remove('hidden');
      });

      // Difficulty selector cards in Intro modal
      if (this.dom.difficultyOptions) {
        this.dom.difficultyOptions.addEventListener('click', (e) => {
          const card = e.target.closest('.difficulty-card');
          if (!card) return;
          const diff = card.getAttribute('data-difficulty');
          if (diff) {
            this.setDifficulty(diff);
            if (this.sound) this.sound.playTick(1.2);
          }
        });

        const cards = this.dom.difficultyOptions.querySelectorAll('.difficulty-card');
        cards.forEach((card) => {
          card.addEventListener('click', () => {
            const diff = card.getAttribute('data-difficulty');
            if (diff) {
              this.setDifficulty(diff);
              if (this.sound) this.sound.playTick(1.2);
            }
          });
        });
      }

      // Quick Difficulty toggle button in top HUD
      if (this.dom.btnDifficultySelect) {
        this.dom.btnDifficultySelect.addEventListener('click', () => {
          const nextDiff = this.difficulty === 'beginner'
            ? 'intermediate'
            : (this.difficulty === 'intermediate' ? 'advanced' : 'beginner');
          this.setDifficulty(nextDiff);
          this._showToast(`Switched to ${this._getDifficultyTitle(nextDiff)}!`, 2500);
          if (this.state === 'SEARCHING' && this.primaryTarget) {
            if (nextDiff === 'beginner' && this.primaryTarget.name.length >= 4) {
              this.revealedIndices.add(1);
              this._renderTargetWord();
              this._updateHintButton();
            }
            this._applyBeginnerGlow();
          }
        });
      }

      // Keyboard shortcuts (Space/Enter to spin, fast-forward spin, or next round)
      window.addEventListener('keydown', (e) => {
        if (!e) return;
        if (e.code === 'Space' || e.code === 'Enter') {
          if (!this.dom.modalSuccess.classList.contains('hidden')) {
            e.preventDefault();
            this.dom.btnNextRound.click();
          } else if (!this.dom.modalIntro.classList.contains('hidden')) {
            e.preventDefault();
            this.dom.btnStartGame.click();
          } else if (!this.dom.wheelOverlay.classList.contains('hidden')) {
            e.preventDefault();
            if (this.wheel && this.wheel.isSpinning) {
              this.wheel.finishSpin();
            } else {
              this.dom.btnSpin.click();
            }
          }
        }
      });
    }

    setDifficulty(diff) {
      if (!['beginner', 'intermediate', 'advanced'].includes(diff)) return;
      this.difficulty = diff;

      // Update cards in modal
      if (this.dom.difficultyOptions) {
        const cards = this.dom.difficultyOptions.querySelectorAll('.difficulty-card');
        cards.forEach(c => {
          if (c.getAttribute('data-difficulty') === diff) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
      }

      // Update HUD pill
      const icons = { beginner: '🌱', intermediate: '⭐', advanced: '🏆' };
      const labels = { beginner: 'Beginner (5+)', intermediate: 'Intermediate (9+)', advanced: 'Advanced (13+)' };
      if (this.dom.hudDifficultyIcon) this.dom.hudDifficultyIcon.textContent = icons[diff];
      if (this.dom.hudDifficultyLabel) this.dom.hudDifficultyLabel.textContent = labels[diff];
    }

    _getDifficultyTitle(diff) {
      const titles = {
        beginner: 'Beginner (Ages 5+)',
        intermediate: 'Intermediate (Ages 9+)',
        advanced: 'Advanced (Ages 13+)'
      };
      return titles[diff] || diff;
    }

    _clearPendingTimers() {
      if (this._searchTransitionTimer) {
        clearTimeout(this._searchTransitionTimer);
        this._searchTransitionTimer = null;
      }
      if (this._successModalTimer) {
        clearTimeout(this._successModalTimer);
        this._successModalTimer = null;
      }
    }

    startFirstSpin() {
      this._clearPendingTimers();
      this.state = 'READY_SPIN_1';
      this.firstLetter = null;
      this.lastLetter = null;
      this.targetObjects = [];
      this.primaryTarget = null;
      this.revealedIndices = new Set();
      this.hintsUsedThisRound = 0;

      // Clear any previous beginner glow
      this._clearBeginnerGlow();
      this.dom.modalSuccess.classList.add('hidden');

      // Show wheel overlay
      this.dom.wheelOverlay.classList.remove('hidden');
      this.dom.wheelTitle.textContent = 'Spin For Starting Letter!';
      this.dom.wheelSubtitle.textContent = 'Spin the carnival wheel to find out what letter your object begins with.';
      this.dom.btnSpin.textContent = 'SPIN WHEEL';
      this.dom.btnSpin.disabled = false;

      // Reset HUD target
      this.dom.targetPattern.innerHTML = '? • • • ?';
      this.dom.letterCountBadge.classList.add('hidden');
      this.dom.targetPrompt.textContent = 'Spin the wheel to begin!';
      this.dom.hintBtnText.textContent = 'Hint';

      this.wheel.clearHighlights();
      this.wheel.resize();
    }

    _getUnplayedPool() {
      const pool = window.ROOM_DATA.getObjectsForDifficulty(this.difficulty);
      let unplayed = pool.filter(o => !this.sessionUsedIds.has(o.id));
      if (unplayed.length === 0) {
        this.sessionUsedIds.clear();
        unplayed = pool;
      }
      return unplayed;
    }

    executeFirstSpin() {
      this.state = 'SPINNING_1';
      this.dom.btnSpin.disabled = false;
      this.dom.btnSpin.textContent = 'FAST-FORWARD ⏩';

      // Pick a random unplayed target from the difficulty pool so no word repeats in a session
      const unplayedPool = this._getUnplayedPool();
      const chosenObj = unplayedPool[Math.floor(Math.random() * unplayedPool.length)];
      this._pendingSessionTarget = chosenObj;
      const chosenFirst = chosenObj.firstLetter;

      this.wheel.spinTo(chosenFirst, (landedLetter) => {
        this.firstLetter = landedLetter;
        this.state = 'READY_SPIN_2';

        // Prepare for second spin
        this.dom.wheelTitle.textContent = `Starts with ${this.firstLetter}!`;
        this.dom.wheelSubtitle.textContent = `Now spin the wheel to determine the ending letter!`;
        this.dom.btnSpin.textContent = 'SPIN ENDING LETTER';
        this.dom.btnSpin.disabled = false;

        // Highlight valid ending letters among unplayed objects for this starting letter
        const unplayedForFirst = this._getUnplayedPool().filter(o => o.firstLetter === this.firstLetter);
        const validLasts = unplayedForFirst.length > 0
          ? Array.from(new Set(unplayedForFirst.map(o => o.lastLetter))).sort()
          : window.ROOM_DATA.getValidLastLetters(this.firstLetter, this.difficulty);
        this.wheel.setHighlightedLetters(validLasts);
      });
    }

    executeSecondSpin() {
      this.state = 'SPINNING_2';
      this.dom.btnSpin.disabled = false;
      this.dom.btnSpin.textContent = 'FAST-FORWARD ⏩';

      const unplayedForFirst = this._getUnplayedPool().filter(o => o.firstLetter === this.firstLetter);
      const chosenTarget = (this._pendingSessionTarget &&
        this._pendingSessionTarget.firstLetter === this.firstLetter &&
        !this.sessionUsedIds.has(this._pendingSessionTarget.id))
        ? this._pendingSessionTarget
        : (unplayedForFirst.length > 0
            ? unplayedForFirst[Math.floor(Math.random() * unplayedForFirst.length)]
            : window.ROOM_DATA.findMatchingObjects(
                this.firstLetter,
                window.ROOM_DATA.getValidLastLetters(this.firstLetter, this.difficulty)[0],
                this.difficulty
              )[0]);
      const chosenLast = chosenTarget.lastLetter;

      this.wheel.spinTo(chosenLast, (landedLetter) => {
        this.lastLetter = landedLetter;
        this.dom.btnSpin.disabled = true;
        this.dom.btnSpin.textContent = `LANDED ON ${this.lastLetter}!`;
        this.targetObjects = window.ROOM_DATA.findMatchingObjects(this.firstLetter, this.lastLetter, this.difficulty);

        // Select the unplayed target for this round and record it in sessionUsedIds immediately
        const unplayedMatches = this.targetObjects.filter(o => !this.sessionUsedIds.has(o.id));
        this.primaryTarget = unplayedMatches.find(o => o.id === chosenTarget.id)
          || unplayedMatches[0]
          || this.targetObjects[0];
        this.sessionUsedIds.add(this.primaryTarget.id);
        this._pendingSessionTarget = null;

        // Initialize revealed indices: first letter (0) and last letter (length - 1)
        this.revealedIndices = new Set([0, this.primaryTarget.name.length - 1]);
        // Also reveal non-letters (e.g. hyphens or spaces)
        for (let i = 0; i < this.primaryTarget.name.length; i++) {
          if (!/[A-Za-z]/.test(this.primaryTarget.name[i])) {
            this.revealedIndices.add(i);
          }
        }

        // Beginner mode (Ages 5+): for words of 4+ letters, reveal 2nd letter immediately (e.g. B O _ K)
        if (this.difficulty === 'beginner' && this.primaryTarget.name.length >= 4) {
          this.revealedIndices.add(1);
        }

        // Smooth transition to search phase
        this._clearPendingTimers();
        this._searchTransitionTimer = setTimeout(() => {
          this._startSearchPhase();
        }, 750);
      });
    }

    _startSearchPhase() {
      this._clearPendingTimers();
      this.state = 'SEARCHING';
      this.roundStartTime = Date.now();

      // Hide wheel overlay and success modal
      this.dom.wheelOverlay.classList.add('hidden');
      this.dom.modalSuccess.classList.add('hidden');

      // Update HUD Target with progressive letter slots
      this._renderTargetWord();

      const letterCount = window.ROOM_DATA.getLetterCount(this.primaryTarget.name);
      this.dom.letterCountBadge.textContent = `${letterCount} Letters`;
      this.dom.letterCountBadge.classList.remove('hidden');

      this.dom.targetPrompt.textContent = `Find the ${letterCount}-letter object starting with "${this.firstLetter}" and ending with "${this.lastLetter}"!`;
      this._updateHintButton();
      this._updateStatsHUD();

      // Promote clue-compatible round targets in SVG z-order so their exact outline is on top
      if (this.room && typeof this.room.setActiveTargets === 'function') {
        const compatibleTargets = this.targetObjects.filter(t => this._isClueCompatible(t));
        this.room.setActiveTargets(compatibleTargets, this.primaryTarget);
      }

      // Apply gentle room glow if in beginner difficulty
      this._applyBeginnerGlow();

      // Fit room in view
      this.room.fitToScreen();

      // Show toast
      this._showToast(`Target: ${this.firstLetter} ... ${this.lastLetter} (${letterCount} letters)!`, 3000);
    }

    _applyBeginnerGlow() {
      this._clearBeginnerGlow();
      if (this.difficulty === 'beginner' && this.primaryTarget) {
        const targetEl = document.querySelector(`.room-object[data-id="${this.primaryTarget.id}"]`);
        if (targetEl) {
          targetEl.classList.add('beginner-target');
        }
      }
    }

    _clearBeginnerGlow() {
      const existing = document.querySelectorAll('.room-object.beginner-target');
      existing.forEach(el => el.classList.remove('beginner-target'));
    }

    _renderTargetWord(newlyRevealedIndex = -1) {
      if (!this.primaryTarget) return;
      const slots = window.ROOM_DATA.getWordSlots(this.primaryTarget.name, Array.from(this.revealedIndices));
      const html = slots.map(slot => {
        if (!slot.isLetter) {
          return `<span class="letter-slot separator">${slot.displayChar}</span>`;
        }
        const isNew = slot.index === newlyRevealedIndex;
        if (slot.revealed) {
          return `<span class="letter-slot revealed ${isNew ? 'just-revealed' : ''}">${slot.char}</span>`;
        } else {
          return `<span class="letter-slot blank">_</span>`;
        }
      }).join('');
      this.dom.targetPattern.innerHTML = html;
    }

    _updateHintButton() {
      if (!this.primaryTarget) {
        this.dom.hintBtnText.textContent = 'Hint';
        return;
      }
      const unrevealed = this._getUnrevealedInnerIndices();
      if (unrevealed.length > 0) {
        this.dom.hintBtnText.textContent = 'Hint (Letter)';
      } else {
        this.dom.hintBtnText.textContent = 'Hint (Spotlight)';
      }
    }

    _getUnrevealedInnerIndices() {
      if (!this.primaryTarget) return [];
      const indices = [];
      const name = this.primaryTarget.name;
      for (let i = 1; i < name.length - 1; i++) {
        if (/[A-Za-z]/.test(name[i]) && !this.revealedIndices.has(i)) {
          indices.push(i);
        }
      }
      // Prioritize any index that disambiguates between same-length compatible candidates (e.g. Telescope vs Telephone)
      const alts = (this.targetObjects || []).filter(
        t => t.id !== this.primaryTarget.id && this._isClueCompatible(t)
      );
      if (alts.length > 0) {
        indices.sort((a, b) => {
          const aDiffers = alts.some(t => (t.name[a] || '').toUpperCase() !== (name[a] || '').toUpperCase()) ? 0 : 1;
          const bDiffers = alts.some(t => (t.name[b] || '').toUpperCase() !== (name[b] || '').toUpperCase()) ? 0 : 1;
          return aDiffers - bDiffers || a - b;
        });
      }
      return indices;
    }

    _isClueCompatible(candidateObj) {
      if (!this.primaryTarget || !candidateObj) return false;
      if (candidateObj.id === this.primaryTarget.id) return true;
      if (
        candidateObj.firstLetter !== this.firstLetter ||
        candidateObj.lastLetter !== this.lastLetter
      ) {
        return false;
      }
      if (candidateObj.name.length !== this.primaryTarget.name.length) {
        return false;
      }
      for (const idx of this.revealedIndices) {
        const c1 = (this.primaryTarget.name[idx] || '').toUpperCase();
        const c2 = (candidateObj.name[idx] || '').toUpperCase();
        if (c1 !== c2) return false;
      }
      return true;
    }

    _matchesAcceptedGroup(targetObj, candidateGroups) {
      if (!targetObj || !candidateGroups || candidateGroups.length === 0) return false;
      const allowed = targetObj.acceptedGroups || (targetObj.group ? [targetObj.group] : []);
      return allowed.some(g => candidateGroups.includes(g));
    }

    _handleObjectClick(clickedObj) {
      if (this.state !== 'SEARCHING' || !this.primaryTarget) return;

      const candidateIds = clickedObj.candidateIds || [clickedObj.id];
      const candidateGroups = clickedObj.candidateGroups || (clickedObj.group ? [clickedObj.group] : []);

      // 1. Direct or SVG point-stack match against primaryTarget
      const isPrimaryHit = candidateIds.includes(this.primaryTarget.id);

      // 2. Co-located or accepted group match for primaryTarget
      const isPrimaryGroupHit = this._matchesAcceptedGroup(this.primaryTarget, candidateGroups);

      // 3. Direct, stack, or group match against any clue-compatible alternative target
      const matchedAltTarget = this.targetObjects.find(
        t => this._isClueCompatible(t) && (
          candidateIds.includes(t.id) || this._matchesAcceptedGroup(t, candidateGroups)
        )
      );

      if (isPrimaryHit || isPrimaryGroupHit || matchedAltTarget) {
        const matchedTarget = (isPrimaryHit || isPrimaryGroupHit)
          ? this.primaryTarget
          : matchedAltTarget;

        const targetEl = document.querySelector(`.room-object[data-id="${matchedTarget.id}"]`) || clickedObj.element;

        // Clear beginner glow on success
        this._clearBeginnerGlow();

        // Reveal all letters on success
        for (let i = 0; i < matchedTarget.name.length; i++) {
          this.revealedIndices.add(i);
        }
        this._renderTargetWord();

        this.state = 'ROUND_SUCCESS';
        this.sound.playSuccess();
        this.room.triggerSuccessAnimation(matchedTarget, targetEl);

        // Calculate score
        const elapsedSec = Math.max(1, Math.round((Date.now() - this.roundStartTime) / 1000));
        const timeBonus = Math.max(0, 1000 - elapsedSec * 25);
        const streakBonus = this.streak * 250;
        const penaltyPerHint = this.difficulty === 'beginner' ? 0 : (this.difficulty === 'intermediate' ? 150 : 250);
        const hintPenalty = this.hintsUsedThisRound * penaltyPerHint;
        const totalRoundPoints = Math.max(300, 1000 + timeBonus + streakBonus - hintPenalty);

        this.score += totalRoundPoints;
        this.streak++;
        this.discoveredIds.add(matchedTarget.id);
        this._updateStatsHUD();

        // Show celebration modal (tracked timer so it never leaks into a subsequent round)
        this._clearPendingTimers();
        this._successModalTimer = setTimeout(() => {
          if (this.state !== 'ROUND_SUCCESS') return;
          this.dom.successTitle.textContent = this.difficulty === 'beginner'
            ? 'Awesome Job! ⭐'
            : 'Brilliant Discovery!';
          this.dom.successObjectName.textContent = `${matchedTarget.name} (${matchedTarget.firstLetter} • • • ${matchedTarget.lastLetter})`;
          this.dom.successObjectHint.textContent = `"${matchedTarget.hint || ''}"`;
          this.dom.successScoreBonus.innerHTML = `
            <div>+${totalRoundPoints} Points</div>
            <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 4px;">Time: ${elapsedSec}s • Streak: ${this.streak} 🔥</div>
          `;
          this.dom.modalSuccess.classList.remove('hidden');
        }, 900);

      } else {
        // WRONG OBJECT
        this.sound.playFail();
        this.room.triggerFailAnimation(clickedObj.element);
        this.streak = 0;
        this._updateStatsHUD();

        const targetLetterCount = window.ROOM_DATA.getLetterCount(this.primaryTarget.name);
        const clickedLetterCount = window.ROOM_DATA.getLetterCount(clickedObj.name);

        if (clickedObj.firstLetter === this.firstLetter && clickedObj.lastLetter === this.lastLetter) {
          this._showToast(`Close! ${clickedObj.name} is ${clickedLetterCount} letters, but we need ${targetLetterCount} letters!`, 4000);
        } else {
          this._showToast(`That's ${clickedObj.name} (${clickedObj.firstLetter}...${clickedObj.lastLetter}) — we need ${this.firstLetter}...${this.lastLetter} (${targetLetterCount} letters)!`, 3500);
        }
      }
    }

    _useHint() {
      if (this.state !== 'SEARCHING' || !this.primaryTarget) return;

      this.hintsUsedThisRound++;
      this.sound.playHint();

      const unrevealed = this._getUnrevealedInnerIndices();
      if (unrevealed.length > 0) {
        // Reveal the next unrevealed letter (prioritizing disambiguating letters)
        const nextIndex = unrevealed[0];
        this.revealedIndices.add(nextIndex);
        this._renderTargetWord(nextIndex);
        this._updateHintButton();

        // Update promoted targets in case revealing this letter narrowed compatible candidates
        if (this.room && typeof this.room.setActiveTargets === 'function') {
          const compatibleTargets = this.targetObjects.filter(t => this._isClueCompatible(t));
          this.room.setActiveTargets(compatibleTargets, this.primaryTarget);
        }

        const revealedChar = this.primaryTarget.name[nextIndex].toUpperCase();
        this._showToast(`💡 Hint: Revealed letter "${revealedChar}"!`, 3500);
      } else {
        // All letters already revealed -> spotlight the object in the room!
        this.room.showHint(this.primaryTarget);
        this._showToast(`🔍 Spotlight Clue: "${this.primaryTarget.hint}"`, 5500);
      }
    }

    _updateStatsHUD() {
      this.dom.hudScore.textContent = this.score.toLocaleString();
      this.dom.hudStreak.textContent = this.streak;
      this.dom.hudRound.textContent = this.round;
    }

    _openLedger() {
      const allObjects = window.ROOM_DATA.ROOM_OBJECTS;
      const total = allObjects.length;
      const foundCount = this.discoveredIds.size;

      this.dom.ledgerProgress.textContent = `${foundCount} / ${total} Discovered (${Math.round((foundCount / total) * 100)}%)`;

      // Group by starting letter
      const grouped = {};
      allObjects.forEach(obj => {
        if (!grouped[obj.firstLetter]) grouped[obj.firstLetter] = [];
        grouped[obj.firstLetter].push(obj);
      });

      let html = '';
      Object.keys(grouped).sort().forEach(letter => {
        html += `<div class="ledger-letter-group"><h4>Letter ${letter}</h4><div class="ledger-items-row">`;
        grouped[letter].forEach(item => {
          const isFound = this.discoveredIds.has(item.id);
          html += `
            <div class="ledger-item-badge ${isFound ? 'found' : 'locked'}">
              <span class="badge-icon">${isFound ? '✓' : '🔒'}</span>
              <span class="badge-name">${item.name}</span>
              <span class="badge-pair">${item.firstLetter}...${item.lastLetter}</span>
            </div>
          `;
        });
        html += `</div></div>`;
      });

      this.dom.ledgerList.innerHTML = html;
      this.dom.modalLedger.classList.remove('hidden');
    }

    _showToast(message, duration = 3000) {
      this.dom.toast.textContent = message;
      this.dom.toast.classList.remove('hidden');
      clearTimeout(this._toastTimeout);
      this._toastTimeout = setTimeout(() => {
        this.dom.toast.classList.add('hidden');
      }, duration);
    }
  }

  // Auto-boot on DOMContentLoaded with event safety guard
  window.addEventListener('DOMContentLoaded', (event = {}) => {
    window.GAME = new GameEngine();
  });

})();
