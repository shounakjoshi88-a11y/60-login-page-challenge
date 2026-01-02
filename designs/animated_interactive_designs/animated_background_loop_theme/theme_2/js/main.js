// js/main.js
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".login-card");
    if (!form) return;

    const userInput = form.querySelector('input[name="username"]');
    const passInput = form.querySelector('input[name="password"]');
    const btn = form.querySelector('button[type="submit"]');
    const btnText = form.querySelector(".btn-text");
    if (!btn || !btnText) return;

    // Reduced motion preference (for any extra UI motion we do in JS)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Expose pointer position as CSS variables (optional CSS usage later)
    window.addEventListener("pointermove", (e) => {
      document.documentElement.style.setProperty("--mx", String(e.clientX));
      document.documentElement.style.setProperty("--my", String(e.clientY));
    });

    // Status line (created dynamically)
    const status = document.createElement("div");
    status.className = "status";
    status.setAttribute("aria-live", "polite");
    status.textContent = "";
    form.appendChild(status);

    const setStatus = (text, color) => {
      status.textContent = text;
      if (color) status.style.color = color;
    };

    const setButtonState = ({ text, disabled }) => {
      btnText.textContent = text;
      btn.disabled = Boolean(disabled);
      btn.setAttribute("aria-busy", disabled ? "true" : "false");
    };

    const pulse = (type, extra = {}) => {
      // bg-canvas.js can listen to this to trigger bursts/ripples etc.
      window.dispatchEvent(
        new CustomEvent("bg-pulse", {
          detail: {
            type,
            t: Date.now(),
            x: Number(getComputedStyle(document.documentElement).getPropertyValue("--mx")) || null,
            y: Number(getComputedStyle(document.documentElement).getPropertyValue("--my")) || null,
            ...extra,
          },
        })
      );
    };

    // Tiny micro-feedback: “tap” the card (subtle, no extra CSS required)
    const nudgeCard = (strength = 1) => {
      if (reduceMotion) return;
      form.animate(
        [
          { transform: "translate3d(0,0,0)" },
          { transform: `translate3d(0,${-2 * strength}px,0)` },
          { transform: "translate3d(0,0,0)" },
        ],
        { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    };

    // Fancy loading text sequence
    const loadingWords = ["Drifting…", "Aligning…", "Syncing…", "Entering…"];
    let loadingTimer = null;

    const startLoadingWords = () => {
      if (reduceMotion) return;
      let i = 0;
      loadingTimer = window.setInterval(() => {
        setButtonState({ text: loadingWords[i % loadingWords.length], disabled: true });
        i++;
      }, 420);
    };

    const stopLoadingWords = (finalText) => {
      if (loadingTimer) window.clearInterval(loadingTimer);
      loadingTimer = null;
      setButtonState({ text: finalText, disabled: true });
    };

    let busy = false;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (busy) return;

      // Native validation first
      const ok = form.checkValidity();
      if (!ok) {
        if (typeof form.reportValidity === "function") form.reportValidity();

        setStatus("PORTAL: Input mismatch. Recalibrate fields.", "rgba(255, 95, 31, 0.92)");
        pulse("error", { energy: 0.9 });
        nudgeCard(1.2);

        return;
      }

      busy = true;

      setStatus("PORTAL: Establishing drift-lock…", "rgba(47, 247, 255, 0.88)");
      setButtonState({ text: "Drifting…", disabled: true });
      pulse("loading", { energy: 0.55 });

      startLoadingWords();

      // Fake auth delay (replace with real API later)
      window.setTimeout(() => {
        const username = (userInput?.value || "").trim();
        const badge = username ? ` — ${username.toUpperCase()}` : "";

        stopLoadingWords("Access Open");
        setStatus(`ACCESS: Granted${badge}`, "rgba(176, 255, 0, 0.92)");
        pulse("success", { energy: 1.1 });
        nudgeCard(0.9);

        // Reset after a moment (so you can test repeatedly)
        window.setTimeout(() => {
          setButtonState({ text: "Enter", disabled: false });
          setStatus("", "");
          busy = false;
          form.reset();
          userInput?.focus();
        }, 1400);
      }, 1100);
    });

    // Small UX: focus username on load
    userInput?.focus();

    // Optional: press Esc to clear (nice for testing)
    window.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (busy) return;

      form.reset();
      setStatus("PORTAL: Fields cleared.", "rgba(234, 242, 255, 0.75)");
      pulse("loading", { energy: 0.2 });
      window.setTimeout(() => setStatus("", ""), 850);
      userInput?.focus();
    });
  });
})();
