// Room Renderer, Photographic Engine, and Viewport Navigation
// "Spin & Seek: The Cluttered Curiosity Parlor" (Photorealistic Edition)
(function(exports) {
  'use strict';

  function renderShapeMarkup(obj, className) {
    const { shape, x, y, rx = 36, ry = 32 } = obj;
    if (!shape) {
      return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="${className}"/>`;
    }

    switch (shape.type) {
      case 'rect':
        return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${shape.rx || 6}" ry="${shape.ry || 6}" class="${className}"/>`;
      case 'circle':
        return `<circle cx="${shape.cx || x}" cy="${shape.cy || y}" r="${shape.r || rx}" class="${className}"/>`;
      case 'path':
        return `<path d="${shape.d}" class="${className}"/>`;
      case 'polygon':
        return `<polygon points="${shape.points}" class="${className}"/>`;
      case 'ellipse':
      default:
        return `<ellipse cx="${shape.cx || x}" cy="${shape.cy || y}" rx="${shape.rx || rx}" ry="${shape.ry || ry}" class="${className}"/>`;
    }
  }

  function getObjectArea(obj) {
    const { shape, rx = 32, ry = 32 } = obj;
    if (shape) {
      if (shape.type === 'rect' && shape.width && shape.height) {
        return shape.width * shape.height;
      }
      if (shape.type === 'circle' && shape.r) {
        return Math.PI * shape.r * shape.r;
      }
      if (shape.type === 'ellipse' && (shape.rx || rx) && (shape.ry || ry)) {
        return Math.PI * (shape.rx || rx) * (shape.ry || ry);
      }
      const raw = shape.d || shape.points || '';
      if (raw) {
        // Compute shoelace polygon area of the primary subpath (or average across subpaths)
        const subpaths = raw.trim().split(/(?=M)/i).filter(Boolean);
        let totalArea = 0;
        for (const sub of subpaths) {
          const nums = (sub.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
          const n = Math.floor(nums.length / 2);
          if (n >= 3) {
            let shoelace = 0;
            for (let i = 0; i < n; i++) {
              const x1 = nums[i * 2];
              const y1 = nums[i * 2 + 1];
              const x2 = nums[((i + 1) % n) * 2];
              const y2 = nums[((i + 1) % n) * 2 + 1];
              shoelace += (x1 * y2 - x2 * y1);
            }
            totalArea += Math.max(1, Math.abs(shoelace) / 2);
          }
        }
        if (totalArea > 0) {
          return subpaths.length > 1 ? (totalArea / subpaths.length) : totalArea;
        }
      }
    }
    return Math.PI * rx * ry;
  }

  function getSortedRoomObjects(objects) {
    return objects.slice().sort((a, b) => {
      // 1. Floor (zIndex < 0) and large background containers render behind foreground items
      const aTier = (typeof a.zIndex === 'number' && a.zIndex < 0) ? -1 : (a.isContainer ? 0 : 1);
      const bTier = (typeof b.zIndex === 'number' && b.zIndex < 0) ? -1 : (b.isContainer ? 0 : 1);
      if (aTier !== bTier) {
        return aTier - bTier;
      }
      // 2. Within each tier, larger objects always go behind smaller objects so that
      // smaller items contained within (or overlapping) larger items are in the foreground.
      return getObjectArea(b) - getObjectArea(a);
    });
  }

  function createObjectHotspot(obj) {
    const { id, name, firstLetter, lastLetter, x, y, group = '', isContainer = false } = obj;

    return `
      <g class="room-object" data-id="${id}" data-name="${name}" data-first="${firstLetter}" data-last="${lastLetter}" data-group="${group}" data-container="${isContainer ? 'true' : 'false'}">
        <!-- Transparent generous hit area -->
        ${renderShapeMarkup(obj, 'hotspot-hit')}
        <!-- High-visibility golden silhouette outline on hover -->
        ${renderShapeMarkup(obj, 'hotspot-glow')}
        <!-- Anchor for particle celebration & spotlight -->
        <circle cx="${x}" cy="${y}" r="2" class="hotspot-anchor" opacity="0" pointer-events="none"/>
      </g>
    `;
  }

  class RoomRenderer {
    constructor(containerOrId) {
      this.container = typeof containerOrId === 'string'
        ? document.getElementById(containerOrId)
        : containerOrId;

      if (!this.container) {
        throw new Error(`Room container #${containerOrId} not found`);
      }

      // Native dimensions of the high-res photorealistic parlor
      this.roomWidth = 1376;
      this.roomHeight = 768;

      // Viewport transform state
      this.scale = 1;
      this.minScale = 0.5;
      this.maxScale = 3.5;
      this.panX = 0;
      this.panY = 0;
      this.isPanning = false;
      this.startX = 0;
      this.startY = 0;

      // Callback
      this.onObjectClick = null;
      this._initialOrder = [];

      this._init();
    }

    _init() {
      this._render();
      this._bindEvents();
      requestAnimationFrame(() => this.fitToScreen());
    }

    _render() {
      const rawObjects = window.ROOM_DATA ? window.ROOM_DATA.ROOM_OBJECTS : [];
      const sortedObjects = getSortedRoomObjects(rawObjects);

      this.container.innerHTML = `
        <div class="room-viewport" id="roomViewport">
          <svg id="roomSvg" viewBox="0 0 ${this.roomWidth} ${this.roomHeight}" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="successGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComponentTransfer in="blur" result="coloredBlur">
                  <feFuncA type="linear" slope="2.5"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffd166" stop-opacity="0.6"/>
                <stop offset="70%" stop-color="#ffd166" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#ffd166" stop-opacity="0"/>
              </radialGradient>
            </defs>

            <!-- Photorealistic Curiosity Parlor Background -->
            <image id="roomPhotoBg" href="curiosity_parlor.jpg" x="0" y="0" width="${this.roomWidth}" height="${this.roomHeight}" preserveAspectRatio="none" />

            <!-- Interactive Objects & Hotspots Layer -->
            <g id="objectsLayer">
              ${sortedObjects.map(createObjectHotspot).join('')}
            </g>

            <!-- Spotlight / Hint Radar Overlay -->
            <g id="spotlightLayer" style="pointer-events: none;">
              <circle id="hintRadar" cx="-100" cy="-100" r="50" fill="url(#radarGrad)" stroke="#ffd166" stroke-width="3" opacity="0"/>
            </g>
          </svg>
        </div>

        <!-- Viewport Controls HUD -->
        <div class="viewport-hud">
          <button id="btnZoomIn" class="hud-btn" title="Zoom In">+</button>
          <button id="btnZoomOut" class="hud-btn" title="Zoom Out">−</button>
          <button id="btnZoomFit" class="hud-btn" title="Fit Room">⛶</button>
        </div>
      `;

      this.viewport = this.container.querySelector('#roomViewport');
      this.svg = this.container.querySelector('#roomSvg');
      this.hintRadar = this.container.querySelector('#hintRadar');
      this.objectsLayer = this.container.querySelector('#objectsLayer');
      this._initialOrder = Array.from(this.objectsLayer.querySelectorAll('.room-object'));
    }

    /**
     * Marks active round targets while preserving natural back-to-front z-order
     * so an object is only hovered/outlined when the cursor is over its visible,
     * non-occluded portion.
     */
    setActiveTargets(targetObjects = [], primaryTarget = null) {
      if (!this.objectsLayer) return;

      this._initialOrder.forEach(el => {
        el.classList.remove('active-target');
      });

      const toMark = [...targetObjects];
      if (primaryTarget && !toMark.includes(primaryTarget)) {
        toMark.push(primaryTarget);
      }

      toMark.forEach(obj => {
        if (!obj) return;
        const el = this.objectsLayer.querySelector(`.room-object[data-id="${obj.id}"]`);
        if (el) {
          el.classList.add('active-target');
        }
      });
    }

    _bindEvents() {
      // Zoom via mouse wheel
      this.viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(delta, e.clientX, e.clientY);
      }, { passive: false });

      // Pan via drag (allowed anywhere in the room; distinguish click vs drag by distance)
      this._pointerDown = false;
      this._downX = 0;
      this._downY = 0;
      this._dragDistance = 0;

      this.viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || e.target.closest('.viewport-hud')) return;
        this._pointerDown = true;
        this.isPanning = false;
        this._downX = e.clientX;
        this._downY = e.clientY;
        this._dragDistance = 0;
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this._pointerDown) return;
        const dist = Math.hypot(e.clientX - this._downX, e.clientY - this._downY);
        this._dragDistance = Math.max(this._dragDistance, dist);
        if (this._dragDistance >= 5) {
          this.isPanning = true;
          this.viewport.style.cursor = 'grabbing';
          this.panX = e.clientX - this.startX;
          this.panY = e.clientY - this.startY;
          this._clampPan();
          this._updateTransform();
        }
      });

      window.addEventListener('mouseup', () => {
        this._pointerDown = false;
        this.isPanning = false;
        this.viewport.style.cursor = 'grab';
      });

      // Touch interactions (pinch-zoom and pan for mobile/tablets)
      let initialDist = 0;
      let initialScale = 1;
      this.viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          if (e.target.closest('.viewport-hud')) return;
          this._pointerDown = true;
          this.isPanning = false;
          this._downX = e.touches[0].clientX;
          this._downY = e.touches[0].clientY;
          this._dragDistance = 0;
          this.startX = e.touches[0].clientX - this.panX;
          this.startY = e.touches[0].clientY - this.panY;
        } else if (e.touches.length === 2) {
          this._pointerDown = false;
          this.isPanning = false;
          initialDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          initialScale = this.scale;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && this._pointerDown) {
          const dist = Math.hypot(e.touches[0].clientX - this._downX, e.touches[0].clientY - this._downY);
          this._dragDistance = Math.max(this._dragDistance, dist);
          if (this._dragDistance >= 5) {
            this.isPanning = true;
            this.panX = e.touches[0].clientX - this.startX;
            this.panY = e.touches[0].clientY - this.startY;
            this._clampPan();
            this._updateTransform();
          }
        } else if (e.touches.length === 2 && initialDist > 0) {
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const ratio = currentDist / initialDist;
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          this.zoom(ratio / (this.scale / initialScale), midX, midY);
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this._pointerDown = false;
        this.isPanning = false;
        initialDist = 0;
      });

      // Object click delegation with full stack & group resolution
      this.objectsLayer.addEventListener('click', (e) => {
        // Ignore click if user was dragging to pan the room
        if (this._dragDistance >= 6) {
          this._dragDistance = 0;
          return;
        }
        const itemEl = e.target.closest('.room-object');
        if (!itemEl) return;
        const id = itemEl.getAttribute('data-id');
        const name = itemEl.getAttribute('data-name');
        const first = itemEl.getAttribute('data-first');
        const last = itemEl.getAttribute('data-last');
        const group = itemEl.getAttribute('data-group') || '';

        // Gather all .room-object elements under the click point (handles containers & stacked items)
        const candidateIds = [id];
        const candidateGroups = group ? [group] : [];
        if (typeof document.elementsFromPoint === 'function' && (e.clientX || e.clientY)) {
          const elsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
          elsAtPoint.forEach(el => {
            const roomObj = el.closest && el.closest('.room-object');
            if (roomObj) {
              const cid = roomObj.getAttribute('data-id');
              const cgroup = roomObj.getAttribute('data-group');
              if (cid && !candidateIds.includes(cid)) candidateIds.push(cid);
              if (cgroup && !candidateGroups.includes(cgroup)) candidateGroups.push(cgroup);
            }
          });
        }

        if (typeof this.onObjectClick === 'function') {
          this.onObjectClick({
            id,
            name,
            firstLetter: first,
            lastLetter: last,
            group,
            candidateIds,
            candidateGroups,
            element: itemEl
          });
        }
      });

      // Developer/Inspector helper: Shift+Click or Alt+Click prints coordinates to console
      this.svg.addEventListener('click', (e) => {
        if (e.shiftKey || e.altKey) {
          const pt = this.svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(this.svg.getScreenCTM().inverse());
          console.log(`[INSPECTOR] x: ${Math.round(svgP.x)}, y: ${Math.round(svgP.y)}`);
        }
      });

      // Viewport HUD Controls
      this.container.querySelector('#btnZoomIn').addEventListener('click', () => this.zoom(1.25));
      this.container.querySelector('#btnZoomOut').addEventListener('click', () => this.zoom(0.8));
      this.container.querySelector('#btnZoomFit').addEventListener('click', () => this.fitToScreen());

      window.addEventListener('resize', () => this.fitToScreen());
    }

    _clampPan() {
      const vRect = this.viewport.getBoundingClientRect();
      const scaledWidth = this.roomWidth * this.scale;
      const scaledHeight = this.roomHeight * this.scale;

      const minX = Math.min(0, vRect.width - scaledWidth);
      const maxX = Math.max(0, (vRect.width - scaledWidth) / 2);
      const minY = Math.min(0, vRect.height - scaledHeight);
      const maxY = Math.max(0, (vRect.height - scaledHeight) / 2);

      this.panX = Math.min(maxX, Math.max(minX, this.panX));
      this.panY = Math.min(maxY, Math.max(minY, this.panY));
    }

    _updateTransform() {
      this.svg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
      this.svg.style.transformOrigin = '0 0';
    }

    zoom(delta, clientX, clientY) {
      const vRect = this.viewport.getBoundingClientRect();
      const originX = clientX !== undefined ? (clientX - vRect.left) : (vRect.width / 2);
      const originY = clientY !== undefined ? (clientY - vRect.top) : (vRect.height / 2);

      const oldScale = this.scale;
      const newScale = Math.min(this.maxScale, Math.max(this.minScale, oldScale * delta));
      if (newScale === oldScale) return;

      this.panX = originX - (originX - this.panX) * (newScale / oldScale);
      this.panY = originY - (originY - this.panY) * (newScale / oldScale);
      this.scale = newScale;

      this._clampPan();
      this._updateTransform();
    }

    fitToScreen() {
      const vRect = this.viewport.getBoundingClientRect();
      const scaleX = vRect.width / this.roomWidth;
      const scaleY = vRect.height / this.roomHeight;
      this.scale = Math.min(scaleX, scaleY) * 0.98;
      this.minScale = Math.min(0.5, this.scale * 0.85);

      this.panX = (vRect.width - this.roomWidth * this.scale) / 2;
      this.panY = (vRect.height - this.roomHeight * this.scale) / 2;
      this._updateTransform();
    }

    centerOnObject(obj) {
      if (!obj) return;
      const vRect = this.viewport.getBoundingClientRect();
      this.scale = Math.max(1.6, this.scale);

      this.panX = (vRect.width / 2) - (obj.x * this.scale);
      this.panY = (vRect.height / 2) - (obj.y * this.scale);
      this._clampPan();
      this._updateTransform();
    }

    triggerSuccessAnimation(obj, element) {
      if (!element) return;

      // Burst particles in SVG (must not intercept clicks)
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'celebration-particles');
      g.setAttribute('pointer-events', 'none');
      g.style.pointerEvents = 'none';
      g.setAttribute('transform', `translate(${obj.x}, ${obj.y})`);

      const colors = ['#ffd166', '#ef233c', '#06d6a0', '#118ab2', '#ffbe0b', '#ffffff'];
      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        const dist = 35 + Math.random() * 55;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
        circle.setAttribute('r', 3 + Math.random() * 4);
        circle.setAttribute('fill', colors[i % colors.length]);

        const animX = Math.cos(angle) * dist;
        const animY = Math.sin(angle) * dist;
        if (typeof circle.animate === 'function') {
          circle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${animX}px, ${animY}px) scale(0)`, opacity: 0 }
          ], {
            duration: 950,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            fill: 'forwards'
          });
        }

        g.appendChild(circle);
      }

      this.svg.appendChild(g);
      setTimeout(() => {
        g.remove();
      }, 1050);
    }

    triggerFailAnimation(element) {
      if (!element) return;
      const glow = element.querySelector('.hotspot-glow');
      if (glow && typeof glow.animate === 'function') {
        glow.animate([
          { stroke: '#ef233c', fill: 'rgba(239, 35, 60, 0.25)', strokeWidth: '3px' },
          { stroke: '#ef233c', fill: 'rgba(239, 35, 60, 0.1)', strokeWidth: '1px' },
          { stroke: 'transparent', fill: 'transparent' }
        ], {
          duration: 600,
          easing: 'ease-out'
        });
      }
    }

    showHint(obj) {
      if (!obj) return;
      this.centerOnObject(obj);

      this.hintRadar.setAttribute('cx', obj.x);
      this.hintRadar.setAttribute('cy', obj.y);
      this.hintRadar.setAttribute('opacity', '1');

      if (typeof this.hintRadar.animate === 'function') {
        this.hintRadar.animate([
          { r: 25, opacity: 1, strokeWidth: '6px' },
          { r: 95, opacity: 0, strokeWidth: '1px' }
        ], {
          duration: 1300,
          iterations: 3,
          easing: 'ease-out'
        }).onfinish = () => {
          this.hintRadar.setAttribute('opacity', '0');
        };
      }
    }
  }

  exports.RoomRenderer = RoomRenderer;
})(typeof exports !== 'undefined' ? exports : (window.ROOM_MODULE = {}));
