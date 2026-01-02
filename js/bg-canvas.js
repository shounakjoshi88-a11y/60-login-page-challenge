// js/bg-canvas.js
// Fullscreen interactive particle field (mouse repulsion + link lines)
// ENHANCED: Brighter particles + glowing lines

(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  // ---- Config ----
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const CONFIG = {
    // particle count scales with screen; reduced motion uses fewer
    density: prefersReduced ? 0.00004 : 0.00008,
    maxParticles: prefersReduced ? 65 : 140,

    // ENHANCED: Bigger, brighter particles
    particleMinR: 1.2,      // WAS: 0.7
    particleMaxR: 2.8,      // WAS: 1.8
    particleAlpha: 1.0,     // WAS: 0.85 (fully opaque now)

    // movement
    baseSpeed: prefersReduced ? 0.18 : 0.28,
    jitter: prefersReduced ? 0.04 : 0.07,
    friction: 0.985,

    // ENHANCED: Brighter links with more glow
    linkDist: prefersReduced ? 110 : 135,
    linkAlpha: 0.35,        // WAS: 0.16 (doubled brightness)

    // interactivity
    mouseRadius: prefersReduced ? 120 : 160,
    mouseForce: prefersReduced ? 0.9 : 1.35,
    magnetForce: prefersReduced ? 0.0 : 0.22,
  };

  // ---- Canvas sizing (HiDPI) ----
  let cssW = 0, cssH = 0, dpr = 1;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }

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

  // ---- Particles ----
  const particles = [];
  const mouse = { x: 0, y: 0, active: false };

  function particleCountForArea() {
    const target = Math.floor(cssW * cssH * CONFIG.density);
    return clamp(target, 30, CONFIG.maxParticles);
  }

  function resetParticles() {
    particles.length = 0;
    const n = particleCountForArea();

    for (let i = 0; i < n; i++) {
      particles.push({
        x: rand(0, cssW),
        y: rand(0, cssH),
        vx: rand(-CONFIG.baseSpeed, CONFIG.baseSpeed),
        vy: rand(-CONFIG.baseSpeed, CONFIG.baseSpeed),
        r: rand(CONFIG.particleMinR, CONFIG.particleMaxR),
        hue: Math.random() < 0.6 ? "cyan" : "magenta",
      });
    }
  }

  // ---- "Pulse" events from main.js ----
  const pulses = [];

  function addPulse(type) {
    const cx = mouse.active ? mouse.x : cssW * 0.5;
    const cy = mouse.active ? mouse.y : cssH * 0.5;

    let color = "rgba(0,255,255,0.35)";
    let strength = 1.2;

    if (type === "success") { color = "rgba(176,255,0,0.30)"; strength = 1.6; }
    if (type === "error")   { color = "rgba(255,95,31,0.30)"; strength = 1.8; }
    if (type === "loading") { color = "rgba(255,0,128,0.22)"; strength = 1.1; }

    pulses.push({
      x: cx, y: cy,
      r: 0,
      maxR: Math.min(cssW, cssH) * 0.45,
      grow: 6.0,
      color,
      strength,
    });
  }

  window.addEventListener("bg-pulse", (e) => {
    addPulse(e?.detail?.type || "loading");
  });

  // ---- Interaction ----
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener("pointerdown", () => {
    addPulse("loading");
  });

  window.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  // ---- Draw helpers ----
  function particleColor(p) {
    return p.hue === "cyan" ? "rgba(0,255,255," : "rgba(255,0,128,";
  }

  function draw() {
    // Transparent canvas
    ctx.clearRect(0, 0, cssW, cssH);

    // Draw pulses (rings)
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pu = pulses[i];
      pu.r += pu.grow;

      ctx.beginPath();
      ctx.arc(pu.x, pu.y, pu.r, 0, Math.PI * 2);
      ctx.strokeStyle = pu.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (pu.r >= pu.maxR) pulses.splice(i, 1);
    }

    // ENHANCED: Draw links (lines between nearby particles) with more glow
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

        // Brighten lines near cursor
        if (mouse.active) {
          const mx = (a.x + b.x) * 0.5 - mouse.x;
          const my = (a.y + b.y) * 0.5 - mouse.y;
          const md2 = mx * mx + my * my;
          const mr2 = (CONFIG.mouseRadius * 1.1) ** 2;
          if (md2 < mr2) alpha *= 2.5;  // WAS: 1.8 (stronger highlight near mouse)
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        const base = a.hue === "cyan" 
          ? `rgba(0,255,255,${Math.min(1, alpha)})`
          : `rgba(255,0,128,${Math.min(1, alpha)})`;
        
        ctx.strokeStyle = base;
        ctx.lineWidth = 1.4;    // WAS: 1 (slightly thicker)
        ctx.lineCap = "round";  // NEW: rounded line caps for glow effect
        ctx.stroke();
      }
    }

    // ENHANCED: Draw particles with glow effect
    for (const p of particles) {
      // Glow halo (outer)
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 1.6, 0, Math.PI * 2);
      const glowColor = p.hue === "cyan" 
        ? "rgba(0,255,255,0.25)" 
        : "rgba(255,0,128,0.25)";
      ctx.fillStyle = glowColor;
      ctx.fill();

      // Main particle (bright)
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${particleColor(p)}${CONFIG.particleAlpha})`;
      ctx.fill();

      // Inner highlight (white bright spot)
      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();
    }
  }

  // ---- Update physics ----
  function update() {
    const mr = CONFIG.mouseRadius;
    const mr2 = mr * mr;

    for (const p of particles) {
      p.vx += rand(-CONFIG.jitter, CONFIG.jitter);
      p.vy += rand(-CONFIG.jitter, CONFIG.jitter);

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;

        if (d2 > 0.0001 && d2 < mr2) {
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const ny = dy / d;

          const t = 1 - d / mr;
          const repel = CONFIG.mouseForce * t;

          p.vx += nx * repel;
          p.vy += ny * repel;

          const magnet = CONFIG.magnetForce * t;
          p.vx -= nx * magnet;
          p.vy -= ny * magnet;
        }
      }

      // pulse influence
      for (const pu of pulses) {
        const dx = p.x - pu.x;
        const dy = p.y - pu.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const band = 26;
        const diff = Math.abs(d - pu.r);

        if (diff < band && d > 0.001) {
          const t = 1 - diff / band;
          const nx = dx / d;
          const ny = dy / d;
          const push = pu.strength * t * 0.65;
          p.vx += nx * push;
          p.vy += ny * push;
        }
      }

      p.vx *= CONFIG.friction;
      p.vy *= CONFIG.friction;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= 0) { p.x = 0; p.vx *= -1; }
      if (p.x >= cssW) { p.x = cssW; p.vx *= -1; }
      if (p.y <= 0) { p.y = 0; p.vy *= -1; }
      if (p.y >= cssH) { p.y = cssH; p.vy *= -1; }
    }
  }

  // ---- Main loop ----
  let rafId = 0;
  function loop() {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  // ---- Init ----
  function init() {
    resize();
    resetParticles();

    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    resize();
    resetParticles();
  });

  init();
})();
