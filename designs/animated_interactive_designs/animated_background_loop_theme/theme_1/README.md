# NEURAL NEXUS — Animated Background Loop Theme

A **cyberpunk-styled interactive login page** featuring a looping video background, animated particle field, and dynamic neon UI. Built with pure HTML, CSS, and vanilla JavaScript.

## 🎬 Live Preview

> **Interactive Demo** — Move your mouse to repel particles. Watch the glitch title animate. Experience the cyberpunk aesthetic.

[![Interactive Demo Video](https://img.shields.io/badge/Watch-Interactive%20Demo-blue?style=for-the-badge&logo=github)](gallery/demo.mp4)

> **▶️ Click the badge above to watch the interactive demo video in loop**

Or view it directly: [Demo Video](gallery/demo.mp4)

![NEURAL NEXUS Login Page Screenshot](gallery/demo.png)
## ✨ Key Features

### Visual Design
- **Fullscreen looping video background** — Cyan pyramid beam with grid architecture
- **Interactive particle field** — 140 animated particles with mouse repulsion physics
- **Dynamic connection lines** — Links between nearby particles that brighten near cursor
- **Neon UI elements** — Cyan/magenta color scheme with glowing effects
- **Cinema overlays** — Scanlines + grain texture for cinematic feel
- **Glitch typography** — Animated title with digital distortion effect
- **Glass morphism card** — Semi-transparent form with backdrop blur + neon frame
- **Cyberpunk quote** — Animated text in top-left corner with pulsing glow

### Interactivity
- 🖱️ **Mouse-repelled particles** — Particles push away from cursor (160px radius)
- 🔗 **Dynamic linking** — Lines strengthen and brighten near mouse movement
- ⚡ **Pulse effects** — Click anywhere to trigger particle burst animation
- ⌨️ **Form validation** — Native HTML5 validation with cyberpunk status messages
- 💫 **Hover animations** — Button glow, input underline animation, link effects
- 📱 **Responsive design** — Works on mobile, tablet, desktop

### Performance & Accessibility
- **Optimized canvas rendering** — Transparent canvas shows video, no overdraw
- **HiDPI support** — Sharp rendering on high-density displays
- **Reduced motion support** — Respects `prefers-reduced-motion` media query
- **Semantic HTML** — Proper ARIA labels and semantic structure
- **Color contrast** — WCAG AA compliant contrast ratios

## 📁 Project Structure

```
animated_background_loop_theme/
├── index.html              # Main login page
├── README.md              # This file
├── css/
│   ├── theme.css          # Design tokens & variables
│   ├── background.css     # Video + canvas + overlay layers
│   ├── quote.css          # Top-left quote styling
│   └── style.css          # Login card + form + button
├── js/
│   ├── bg-canvas.js       # Particle field animation loop (requestAnimationFrame)
│   └── main.js            # Form validation + UI interactions
├── assets/
│   ├── img/
│   │   └── noise.png      # Grain texture overlay
│   ├── video/
│   │   └── bg-loop.mp4    # Cyan pyramid looping background video
│   └── favicon/
│       └── favicon.svg    # Neon circuit shield icon
└── gallery/
    └── demo.mp4           # Interactive demo video
```

## 🚀 Quick Start

### Option 1: Local Development
1. Clone or download this theme folder
2. Open in **VS Code** with Live Server extension
3. Click "Go Live" to start the development server
4. Navigate to `http://localhost:5500`

### Option 2: Direct HTML
1. Download all files
2. Open `index.html` directly in your browser
3. Works immediately (no build tools needed)

## 🎨 Customization

### Change the Title
Edit `index.html` around line 103:
```html
<h1 class="glitch" data-text="NEXUS LOGIN">NEXUS LOGIN</h1>
```

### Change the Quote
Edit `index.html` around line 110:
```html
<p class="quote-text">"Your custom quote here"</p>
```

### Customize Colors
Edit `css/theme.css` `:root` variables:
```css
--cyan: #00ffff;        /* Primary accent */
--magenta: #ff0080;     /* Secondary accent */
--text: #eaf2ff;        /* Text color */
--bg-0: #05060a;        /* Dark background */
```

### Adjust Particle Behavior
Edit `js/bg-canvas.js` line ~18 (CONFIG object):
```js
CONFIG = {
  density: 0.00008,              // Particles per pixel (increase = more)
  maxParticles: 140,             // Cap on particle count
  particleMinR: 1.2,             // Particle size range (min)
  particleMaxR: 2.8,             // Particle size range (max)
  particleAlpha: 1.0,            // Brightness (0-1)
  baseSpeed: 0.28,               // Movement speed
  linkDist: 135,                 // Connection distance
  linkAlpha: 0.35,               // Line brightness (0-1)
  mouseRadius: 160,              // Repulsion radius
  mouseForce: 1.35,              // Repulsion strength
  magnetForce: 0.22,             // Slight attraction to cursor (0 = off)
}
```

## 🎬 Background Video

The video (`assets/video/bg-loop.mp4`) is:
- **Duration:** 4-6 seconds looping
- **Format:** MP4 H.264 codec, AAC audio
- **Resolution:** 1920×1080
- **Size:** ~600KB (optimized for web)

**To use your own video:**
1. Export as MP4 (H.264, AAC audio)
2. Keep under 1MB for fast loading
3. Replace `assets/video/bg-loop.mp4`
4. Update the video filter in `css/background.css` if needed

## 🔧 Technical Details

### Canvas Particle System
- **Physics:** Friction-based movement with random drift
- **Interaction:** Distance-based quadratic repulsion (smoother than linear)
- **Rendering:** Transparent canvas with particle halos + highlights
- **Performance:** ~140 particles @ 60fps on modern devices
- **Loop Driver:** `requestAnimationFrame` for smooth 60fps animation

### Animation Timings
- **Quote glow:** 4s sine wave pulse
- **Scanlines flicker:** 3.6s subtle opacity change
- **Glitch title:** 2.4s / 1.9s staggered clip animations
- **Button hover:** 160ms easing
- **Input focus:** 220ms cubic-bezier animation

### Browser Support
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Notes:**
- Video autoplay requires `muted` attribute (browser policy)
- Canvas rendering uses `requestAnimationFrame` for optimal timing
- Backdrop blur falls back to solid glass on older browsers

## ♿ Accessibility

- ✅ Semantic HTML (`<main>`, `<section>`, `<aside>`)
- ✅ ARIA labels on interactive regions
- ✅ Reduced motion support (respects user preferences)
- ✅ Color contrast > 4.5:1 (WCAG AA)
- ✅ Form validation with descriptive error messages
- ✅ Keyboard navigation support

## 📊 File Sizes

| File | Size | Type |
|------|------|------|
| index.html | ~2.5 KB | HTML |
| style.css | ~6 KB | CSS |
| background.css | ~3 KB | CSS |
| theme.css | ~1.5 KB | CSS |
| quote.css | ~1 KB | CSS |
| bg-canvas.js | ~8 KB | JavaScript |
| main.js | ~2.5 KB | JavaScript |
| bg-loop.mp4 | ~600 KB | Video |
| noise.png | ~5 KB | PNG |
| **Total** | **~630 KB** | - |

## 🎓 Learning Resources

This project demonstrates:
- **Canvas API** — particle animation and physics simulation
- **CSS Animations** — keyframes, transitions, filters
- **JavaScript ES6** — arrow functions, template literals, event listeners
- **Responsive Design** — mobile-first, media queries
- **Web Standards** — semantic HTML, accessibility, performance

## 📝 License

Part of the [60-day login page design challenge](https://github.com/shounakjoshi88-a11y/60-login-page-challenge).

---

**Created by:** [@shounakjoshi88-a11y](https://github.com/shounakjoshi88-a11y)  
**Theme:** Cyberpunk Animated Background Loop  
**Date:** January 2025  
**Status:** ✅ Complete & Production-Ready
