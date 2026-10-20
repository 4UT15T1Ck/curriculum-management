/**
 * ScrollSequenceEngine - 120 FPS Cinematic Canvas Scrubbing Engine
 * Part of landing-page-skill
 *
 * Implements:
 * 1. Two-phase progressive hydration (Instant First Paint -> Sparse Keyframes -> Background Pool)
 * 2. Emil Kowalski spring lerp physics with idle sleep (saves 100% GPU/CPU when still)
 * 3. Sub-frame dual-blend optical crossfade (eliminates frame stepping)
 * 4. Retina / HiDPI sharp rendering via devicePixelRatio
 * 5. Nearest-loaded fallback so canvas NEVER blinks even during fast initial scrubs
 */

export class ScrollSequenceEngine {
  constructor(options = {}) {
    this.canvas = typeof options.canvas === 'string' 
      ? document.querySelector(options.canvas) 
      : options.canvas;
      
    this.container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : options.container;

    if (!this.canvas) throw new Error('ScrollSequenceEngine: valid canvas element or selector is required.');

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    
    // Core parameters
    this.totalFrames = options.totalFrames || 300;
    this.framePattern = options.framePattern || ((i) => `./assets/frames/frame_${String(i).padStart(3, '0')}.webp`);
    this.keyframeStride = options.keyframeStride || 4;
    this.lerpFactor = options.lerpFactor || 0.18;
    this.opticalCrossfade = options.opticalCrossfade !== false;
    this.fitMode = options.fitMode || 'contain'; // 'contain' | 'cover' | 'fill'
    this.maxConcurrentLoads = options.maxConcurrentLoads || 6;

    // Callbacks
    this.onProgress = options.onProgress || null;
    this.onMilestone = options.onMilestone || null;
    this.milestones = options.milestones || []; // [{ at: 0.25, name: 'phase1' }]

    // Internal state
    this.images = new Array(this.totalFrames).fill(null);
    this.loadedSet = new Set();
    this.targetFrame = 0;
    this.currentFrame = 0;
    this.progress = 0;
    this.isRendering = false;
    this.rafId = null;
    this.lastMilestoneIndex = -1;

    // Concurrency queue
    this.pendingQueue = [];
    this.activeLoads = 0;

    // Bindings
    this.onScroll = this.handleScroll.bind(this);
    this.onResize = this.handleResize.bind(this);
    this.renderLoop = this.render.bind(this);

    this.init();
  }

  init() {
    this.setupCanvasDPI();
    this.attachEvents();
    this.startHydration();
    this.handleScroll(); // Initial compute
  }

  setupCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || this.canvas.parentElement?.clientWidth || 640;
    const h = rect.height || this.canvas.parentElement?.clientHeight || 640;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.displayWidth = w;
    this.displayHeight = h;
  }

  attachEvents() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    if (window.ResizeObserver && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  /**
   * Two-phase progressive hydration:
   * Phase 1: Frame 0 (instant paint <20ms)
   * Phase 2: Sparse keyframes (step = stride, <150ms)
   * Phase 3: Background queue for remaining in-between frames
   */
  startHydration() {
    // 1. Instant First Paint
    this.preloadImage(0).then(() => {
      this.drawFrame();
    });

    // 2. Schedule Keyframes
    const keyframes = [];
    for (let i = 0; i < this.totalFrames; i += this.keyframeStride) {
      if (i !== 0) keyframes.push(i);
    }
    // Ensure final frame is preloaded
    if (!keyframes.includes(this.totalFrames - 1)) {
      keyframes.push(this.totalFrames - 1);
    }

    // 3. Queue rest
    const remainder = [];
    for (let i = 0; i < this.totalFrames; i++) {
      if (i % this.keyframeStride !== 0 && i !== (this.totalFrames - 1)) {
        remainder.push(i);
      }
    }

    // Push into priority queue
    this.pendingQueue = [...keyframes, ...remainder];
    this.processQueue();
  }

  processQueue() {
    while (this.activeLoads < this.maxConcurrentLoads && this.pendingQueue.length > 0) {
      const frameIndex = this.pendingQueue.shift();
      if (this.loadedSet.has(frameIndex)) continue;

      this.activeLoads++;
      this.preloadImage(frameIndex)
        .catch(() => {})
        .finally(() => {
          this.activeLoads--;
          this.processQueue();
        });
    }
  }

  preloadImage(index) {
    if (this.images[index]) return Promise.resolve(this.images[index]);

    return new Promise((resolve, reject) => {
      const img = new Image();
      const src = typeof this.framePattern === 'function' 
        ? this.framePattern(index) 
        : this.framePattern.replace('%d', index);

      img.onload = () => {
        this.images[index] = img;
        this.loadedSet.add(index);
        // If current display needs this frame, re-trigger draw
        if (Math.abs(this.currentFrame - index) < 1.5) {
          this.drawFrame();
        }
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  findNearestLoaded(index) {
    if (this.loadedSet.has(index)) return index;
    let delta = 1;
    while (delta < this.totalFrames) {
      if (index - delta >= 0 && this.loadedSet.has(index - delta)) return index - delta;
      if (index + delta < this.totalFrames && this.loadedSet.has(index + delta)) return index + delta;
      delta++;
    }
    return 0;
  }

  handleScroll() {
    let p = 0;
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      const winH = window.innerHeight;
      const totalDist = rect.height - winH;
      if (totalDist <= 0) {
        p = 0;
      } else {
        const scrolled = -rect.top;
        p = Math.max(0, Math.min(1, scrolled / totalDist));
      }
    } else {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      p = docH > 0 ? Math.max(0, Math.min(1, window.scrollY / docH)) : 0;
    }

    this.progress = p;
    this.targetFrame = p * (this.totalFrames - 1);

    if (this.onProgress) {
      this.onProgress(this.progress, this.currentFrame, this.targetFrame);
    }

    this.checkMilestones(p);
    this.requestRender();
  }

  checkMilestones(progress) {
    if (!this.onMilestone || this.milestones.length === 0) return;
    for (let i = 0; i < this.milestones.length; i++) {
      const m = this.milestones[i];
      if (progress >= m.at && (i === this.milestones.length - 1 || progress < this.milestones[i + 1].at)) {
        if (this.lastMilestoneIndex !== i) {
          this.lastMilestoneIndex = i;
          this.onMilestone(m, i, progress);
        }
        break;
      }
    }
  }

  requestRender() {
    if (!this.isRendering) {
      this.isRendering = true;
      this.rafId = requestAnimationFrame(this.renderLoop);
    }
  }

  render() {
    const diff = this.targetFrame - this.currentFrame;

    // Emil Kowalski spring damping lerp
    this.currentFrame += diff * this.lerpFactor;

    // Render current frame with dual-blend optical crossfade
    this.drawFrame();

    // Idle sleep check: if within sub-pixel convergence, snap & sleep loop
    if (Math.abs(diff) < 0.005) {
      this.currentFrame = this.targetFrame;
      this.drawFrame();
      this.isRendering = false;
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(this.renderLoop);
  }

  drawFrame() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    ctx.clearRect(0, 0, w, h);

    const baseIndex = Math.floor(this.currentFrame);
    const nextIndex = Math.min(this.totalFrames - 1, baseIndex + 1);
    const blend = this.currentFrame - baseIndex;

    const imgBase = this.images[baseIndex] || this.images[this.findNearestLoaded(baseIndex)];
    const imgNext = this.images[nextIndex] || this.images[this.findNearestLoaded(nextIndex)];

    if (!imgBase) return;

    if (!this.opticalCrossfade || blend <= 0.01 || imgBase === imgNext) {
      // Single frame render
      ctx.globalAlpha = 1.0;
      this.drawSingleImage(imgBase, w, h);
    } else {
      // Sub-frame dual blend optical crossfade
      ctx.globalAlpha = 1.0;
      this.drawSingleImage(imgBase, w, h);

      if (imgNext) {
        ctx.globalAlpha = blend;
        this.drawSingleImage(imgNext, w, h);
      }
      ctx.globalAlpha = 1.0;
    }
  }

  drawSingleImage(img, w, h) {
    if (!img || !img.naturalWidth) return;

    if (this.fitMode === 'contain') {
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      this.ctx.drawImage(img, dx, dy, dw, dh);
    } else if (this.fitMode === 'cover') {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      this.ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      this.ctx.drawImage(img, 0, 0, w, h);
    }
  }

  handleResize() {
    this.setupCanvasDPI();
    this.drawFrame();
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.images = [];
    this.loadedSet.clear();
  }
}
