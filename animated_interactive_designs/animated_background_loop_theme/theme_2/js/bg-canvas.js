// js/bg-canvas.js
// Floating Elements Theme — subtle spark field + ripple bursts (reacts to "bg-pulse")

(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const CONFIG = {
    density: prefersReduced ? 0.000035 : 0.00007,
    maxParticles: prefersReduced ? 55 : 120,

    // float motion
    baseSpeed: prefersReduced ? 0.06 : 0.11,
    jitter: prefersReduced ? 0.01 : 0.02,
    friction: 0.992,

    // cursor interaction (very soft, like “air current”)
    mouseRadius: prefersReduced ? 120 : 190,
    mouseForce: prefersReduced ? 0.15 : 0.30,

    // visuals
    minR: 0.7,
    maxR: 2.4,
    alpha: 0.95,

    // subtle linking (optional): keep minimal for this theme
    linkDist: prefersReduced ? 85 : 105,
    linkAlpha: 0.10,

    // ripple rings
    rippleGrow: prefersReduced ? 4.5 : 6.5,
    rippleBand: prefersReduced ? 22 : 28,
  };

  // --- HiDPI canvas sizing ---
  let cssW = 0, cssH = 0, dpr = 1;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const rand = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    cssW = Math.max(1, Math.floor(rect.width));
    cssH = Math.max(1, Math.floor(rect.height));
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    const newW = Math.floor(cssW * dpr);
    const newH = Math.floor(cssH * dpr);

    if (canvas.width !== newW || canvas.height !== newH) {
      canvas.width = newW;
      canvas.height = newH;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  }

  // --- Particles ---
  const particles = [];
  const mouse = { x: 0, y: 0, active: false };

  function particleCountForArea() {
    const target = Math.floor(cssW * cssH * CONFIG.density);
    return clamp(target, 28, CONFIG.maxParticles);
  }

  function resetParticles() {
    particles.length = 0;
    const n = particleCountForArea();

    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const kind =
        t < 0.45 ? "cyan" :
        t < 0.78 ? "violet" :
        "magenta";

      particles.push({
        x: rand(0, cssW),
        y: rand(0, cssH),
        vx: rand(-CONFIG.baseSpeed, CONFIG.baseSpeed),
        vy: rand(-CONFIG.baseSpeed, CONFIG.baseSpeed),
        r: rand(CONFIG.minR, CONFIG.maxR),
        kind,
        phase: rand(0, Math.PI * 2),
      });
    }
  }

  function colorFor(kind, a) {
    if (kind === "cyan") return `rgba(47,247,255,${a})`;
    if (kind === "violet") return `rgba(124,92,255,${a})`;
    return `rgba(255,79,216,${a})`;
  }

  // --- Ripples (from bg-pulse + clicks) ---
  const ripples = [];

  function addRipple(type, detail = {}) {
    const cx =
      typeof detail.x === "number" ? detail.x :
      mouse.active ? mouse.x : cssW * 0.5;

    const cy =
      typeof detail.y === "number" ? detail.y :
      mouse.active ? mouse.y : cssH * 0.5;

    const energy = clamp(Number(detail.energy ?? 0.8), 0.2, 2.2);

    let color = "rgba(47,247,255,0.28)"; // cyan
    if (type === "success") color = "rgba(176,255,0,0.22)";
    if (type === "error") color = "rgba(255,95,31,0.26)";
    if (type === "loading") color = "rgba(255,79,216,0.20)";

    ripples.push({
      x: cx,
      y: cy,
      r: 0,
      maxR: Math.min(cssW, cssH) * 0.55,
      grow: CONFIG.rippleGrow * (0.9 + energy * 0.35),
      band: CONFIG.rippleBand,
      color,
      strength: 0.45 + energy * 0.55,
    });
  }

  window.addEventListener("bg-pulse", (e) => {
    const d = e?.detail || {};
    addRipple(d.type || "loading", d);
  });

  window.addEventListener("pointerdown", (e) => {
    addRipple("loading", { x: e.clientX, y: e.clientY, energy: 0.55 });
  }, { passive: true });

  // --- Pointer tracking ---
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener("blur", () => { mouse.active = false; });
  document.addEventListener("mouseleave", () => { mouse.active = false; });

  // --- Physics ---
  function update() {
    const mr = CONFIG.mouseRadius;
    const mr2 = mr * mr;

    for (const p of particles) {
      // slow “float wobble”
      p.phase += 0.01;
      p.vx += Math.sin(p.phase) * CONFIG.jitter;
      p.vy += Math.cos(p.phase) * CONFIG.jitter;

      // gentle air-current repulsion
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;

        if (d2 > 0.0001 && d2 < mr2) {
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const ny = dy / d;
          const t = 1 - d / mr;
          const push = CONFIG.mouseForce * t;
          p.vx += nx * push;
          p.vy += ny * push;
        }
      }

      // ripple band push
      for (const rp of ripples) {
        const dx = p.x - rp.x;
        const dy = p.y - rp.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const diff = Math.abs(d - rp.r);
        if (diff < rp.band && d > 0.001) {
          const t = 1 - diff / rp.band;
          const nx = dx / d;
          const ny = dy / d;
          const push = rp.strength * t * 0.55;
          p.vx += nx * push;
          p.vy += ny * push;
        }
      }

      p.vx *= CONFIG.friction;
      p.vy *= CONFIG.friction;

      p.x += p.vx;
      p.y += p.vy;

      // wrap edges (floating vibe)
      if (p.x < -10) p.x = cssW + 10;
      if (p.x > cssW + 10) p.x = -10;
      if (p.y < -10) p.y = cssH + 10;
      if (p.y > cssH + 10) p.y = -10;
    }

    // expand ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].r += ripples[i].grow;
      if (ripples[i].r >= ripples[i].maxR) ripples.splice(i, 1);
    }
  }

  // --- Render ---
  function draw() {
    ctx.clearRect(0, 0, cssW, cssH);

    // Additive glow pass
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Ripples (rings)
    for (const rp of ripples) {
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Subtle links (minimal, for depth)
    const maxLinkD2 = CONFIG.linkDist * CONFIG.linkDist;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxLinkD2) continue;

        const t = 1 - d2 / maxLinkD2;
        let alpha = CONFIG.linkAlpha * t;

        // slightly brighter near cursor
        if (mouse.active) {
          const mx = (a.x + b.x) * 0.5 - mouse.x;
          const my = (a.y + b.y) * 0.5 - mouse.y;
          const md2 = mx * mx + my * my;
          if (md2 < (CONFIG.mouseRadius * 0.9) ** 2) alpha *= 1.7;
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = colorFor(a.kind, Math.min(0.28, alpha));
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    // Particles (glow + core)
    for (const p of particles) {
      // glow halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(p.kind, 0.14);
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(p.kind, CONFIG.alpha);
      ctx.fill();

      // tiny highlight
      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.25, p.y - p.r * 0.25, Math.max(0.6, p.r * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fill();
    }

    ctx.restore();
  }

  // --- Main loop with visibility pause ---
  let rafId = 0;
  let running = false;

  function loop() {
    if (!running) return;
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener("resize", () => {
    resize();
    resetParticles();
  }, { passive: true });

  // Init
  resize();
  resetParticles();
  start();
})();
