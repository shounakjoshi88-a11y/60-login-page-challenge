// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-card");
  const userInput = form?.querySelector('input[name="username"]');
  const passInput = form?.querySelector('input[name="password"]');
  const btn = form?.querySelector('button[type="submit"]');
  const btnText = form?.querySelector(".btn-text");

  if (!form || !btn || !btnText) return;

  // Optional: expose pointer position as CSS variables (UI can react if you want later)
  window.addEventListener("pointermove", (e) => {
    document.documentElement.style.setProperty("--mx", String(e.clientX));
    document.documentElement.style.setProperty("--my", String(e.clientY));
  });

  // Tiny helper for temporary UI states
  const setButtonState = ({ text, disabled }) => {
    btnText.textContent = text;
    btn.disabled = Boolean(disabled);
    btn.setAttribute("aria-busy", disabled ? "true" : "false");
  };

  // Optional status line (created dynamically)
  const status = document.createElement("div");
  status.className = "status";
  status.setAttribute("aria-live", "polite");
  status.style.marginTop = "8px";
  status.style.fontSize = "0.95rem";
  status.style.opacity = "0.82";
  status.style.letterSpacing = "0.06em";
  status.style.textAlign = "center";
  status.textContent = "";
  form.appendChild(status);

  let busy = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (busy) return;

    // Native validation first
    const ok = form.checkValidity();
    if (!ok) {
      // Show browser validation UI if available
      if (typeof form.reportValidity === "function") form.reportValidity();

      // A little “system error” feedback (no CSS required)
      status.textContent = "SYSTEM: Invalid credentials format.";
      status.style.color = "rgba(255, 95, 31, 0.9)";

      // Let background know to “glitch” near the cursor (bg-canvas.js can listen later)
      window.dispatchEvent(new CustomEvent("bg-pulse", { detail: { type: "error" } }));
      return;
    }

    busy = true;
    status.textContent = "AUTH: Handshake in progress…";
    status.style.color = "rgba(0, 255, 255, 0.85)";

    setButtonState({ text: "Authenticating…", disabled: true });

    // Dispatch event so bg-canvas.js can do a burst at center/cursor if you want
    window.dispatchEvent(new CustomEvent("bg-pulse", { detail: { type: "loading" } }));

    // Fake auth delay (replace with real API later)
    setTimeout(() => {
      const username = (userInput?.value || "").trim();

      status.textContent = `ACCESS GRANTED${username ? `: ${username.toUpperCase()}` : ""}`;
      status.style.color = "rgba(176, 255, 0, 0.9)";

      setButtonState({ text: "Access Granted", disabled: true });
      window.dispatchEvent(new CustomEvent("bg-pulse", { detail: { type: "success" } }));

      // Reset after a moment (so you can test repeatedly)
      setTimeout(() => {
        setButtonState({ text: "Login", disabled: false });
        status.textContent = "";
        busy = false;
        form.reset();
      }, 1400);
    }, 900);
  });

  // Optional: Enter-to-submit works naturally, but you can auto-focus for faster testing
  userInput?.focus();
});
