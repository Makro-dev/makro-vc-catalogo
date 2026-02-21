// utils.js – Funciones auxiliares

// =========================
// RENDER ESTRELLAS
// =========================
function renderStars(value = 0) {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  let html = `<div class="stars">`;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) {
      html += `<img src="assets/icons/star-full.svg" alt="" loading="lazy">`;
    } else if (i === full + 1 && half) {
      html += `<img src="assets/icons/star-half.svg" alt="" loading="lazy">`;
    } else {
      html += `<img src="assets/icons/star-empty.svg" alt="" loading="lazy">`;
    }
  }

  html += `</div>`;
  return html;
}

// =========================
// CONTACTO
// =========================
const CONTACT_PHONE = "5356657785";

function initContactButtons(whatsappBtn, callBtn) {
  if (whatsappBtn) {
    const message = `
    Hola Makro VC 👋
    Estoy interesado en este producto:
    ${window.location.href}
    `;
    whatsappBtn.href = `https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent(message)}`;
    whatsappBtn.target = "_blank";
    whatsappBtn.rel = "noopener noreferrer";
  }

  if (callBtn) {
    callBtn.href = `tel:+${CONTACT_PHONE}`;
  }
}

// =========================
// THEME TOGGLE (solo interacción)
// =========================
(function () {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  btn.removeAttribute("disabled");

  const root = document.documentElement;

  const savedTheme = root.getAttribute("data-theme") || localStorage.getItem("makrovc_theme") || "light";
  root.setAttribute("data-theme", savedTheme);
  btn.setAttribute("aria-pressed", savedTheme === "dark");

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", next);
    btn.setAttribute("aria-pressed", next === "dark");
    localStorage.setItem("makrovc_theme", next);
  });
})();

// =========================
// THEME SYNC ENTRE PESTAÑAS
// =========================
window.addEventListener("storage", (e) => {
  if (e.key !== "makrovc_theme") return;

  const theme = e.newValue === "dark" ? "dark" : "light";
  const root = document.documentElement;

  root.setAttribute("data-theme", theme);

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.setAttribute("aria-pressed", theme === "dark");
  }
});