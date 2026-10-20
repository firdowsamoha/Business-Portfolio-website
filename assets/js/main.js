/* ==============================================================
   SITE CONFIG: edit your contact details here.
   Every number, WhatsApp link and QR code on the page is
   generated from this list, so you only change it in one place.
   ============================================================== */
const SITE_CONFIG = {
  contacts: [
    { country: "Somalia", display: "+252 61 612 6571", whatsapp: "252616126571" },
    { country: "Kenya",   display: "+254 726 219 559", whatsapp: "254726219559" },
  ],
  // Contact form messages are delivered to this inbox (via FormSubmit.co).
  formEmail: "smartanalysis15@gmail.com",
};

/* -------- Apply config to the page -------- */
function applyConfig() {
  document.querySelectorAll("[data-contact]").forEach((el) => {
    const c = SITE_CONFIG.contacts[Number(el.dataset.contact)];
    if (!c) return;
    if (el.dataset.field === "display") el.textContent = c.display;
    if (el.dataset.field === "whatsapp") el.href = `https://wa.me/${c.whatsapp}`;
    if (el.dataset.field === "copy") el.dataset.copy = `+${c.whatsapp}`;
  });

  // "Ask about this" links on service cards open WhatsApp with a ready-made message
  document.querySelectorAll("[data-whatsapp-text]").forEach((a) => {
    a.href = `https://wa.me/${SITE_CONFIG.contacts[0].whatsapp}?text=${encodeURIComponent(a.dataset.whatsappText)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });
}

/* -------- WhatsApp QR codes (qrcode.js) -------- */
function renderQRCodes() {
  if (typeof QRCode === "undefined") return;
  document.querySelectorAll("[data-qr]").forEach((box) => {
    const c = SITE_CONFIG.contacts[Number(box.dataset.qr)];
    if (!c) return;
    box.innerHTML = "";
    new QRCode(box, {
      text: `https://wa.me/${c.whatsapp}`,
      width: 140,
      height: 140,
      colorDark: "#0B0B0B",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M,
    });
    box.removeAttribute("title");
    const img = box.querySelector("img");
    if (img) img.alt = `QR code: scan to chat with Smart Analysis ${c.country} on WhatsApp`;
  });
}

/* -------- Copy-number buttons -------- */
function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const label = btn.querySelector("span");
      const original = label.textContent;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = "Copied";
      } catch {
        // Clipboard blocked: select the number on the card so it can be copied manually
        const num = btn.closest(".contact-card").querySelector(".number");
        const range = document.createRange();
        range.selectNodeContents(num);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        label.textContent = "Selected";
      }
      setTimeout(() => (label.textContent = original), 1800);
    });
  });
}

/* -------- Light / dark mode --------
   The <head> script already applied the saved choice (or the device setting)
   before the page painted. This wires up the toggle button and keeps
   following the device setting until the visitor picks a theme themselves.
-------------------------------------------------------------- */
function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const stored = () => { try { return localStorage.getItem("sa-theme"); } catch { return null; } };

  const apply = (theme) => {
    root.setAttribute("data-theme", theme);
    const next = theme === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", `Switch to ${next} mode`);
    btn.title = `Switch to ${next} mode`;
  };
  apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  btn.addEventListener("click", () => {
    const theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(theme);
    try { localStorage.setItem("sa-theme", theme); } catch {}
  });

  if (media && media.addEventListener) {
    media.addEventListener("change", (e) => { if (!stored()) apply(e.matches ? "dark" : "light"); });
  }
}

/* -------- Navbar: shadow on scroll + mobile menu -------- */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setOpen = (open) => {
    links.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));

  // Highlight the menu link of the section in view
  const navAnchors = [...links.querySelectorAll('a[href^="#"]:not(.nav-cta)')];
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
}

/* -------- Scroll animations: content glides up as it enters the screen -------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return items.forEach((el) => el.classList.add("visible"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          setTimeout(() => entry.target.classList.add("settled"), 1600);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

/* -------- Scroll-linked effects --------
   Built on IntersectionObserver, so they also work when the page is shown
   inside an embedded frame where the window itself never scrolls.
-------------------------------------------------------------- */
function initScrollEffects() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement;
  const steps = (n) => Array.from({ length: n + 1 }, (_, i) => i / n);

  // Gold progress bar (only when the window itself scrolls)
  const bar = () => {
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  };
  window.addEventListener("scroll", () => requestAnimationFrame(bar), { passive: true });
  bar();

  // Section headings: words rise in one by one
  document.querySelectorAll(".section-head h2").forEach((h2) => {
    let i = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(part);
            const w = document.createElement("span");
            w.className = "word";
            w.style.setProperty("--i", i++);
            w.textContent = part;
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrap(child);
        }
      });
    };
    wrap(h2);
  });

  // Continuous effects driven by how much of an element is on screen
  const watch = (el, onRatio, n = 40) => {
    if (!el) return;
    new IntersectionObserver((entries) => entries.forEach((e) => onRatio(e.intersectionRatio, e)), { threshold: steps(n) }).observe(el);
  };

  // Hero background glow drifts as the hero leaves the screen
  const hero = document.querySelector(".hero");
  watch(hero, (r, e) => {
    const out = e.boundingClientRect.top < 0 ? 1 - r : 0;
    hero.style.setProperty("--py", `${(out * 260).toFixed(1)}px`);
  });

  // Steps line fills as the steps come into view
  const fill = document.getElementById("steps-fill");
  watch(document.getElementById("steps"), (r) => fill && fill.style.setProperty("--fill", r.toFixed(3)));

  // Section headings float up slightly faster than the page (parallax)
  document.querySelectorAll(".section-head").forEach((head) =>
    watch(head, (r) => head.style.setProperty("--lift", `${((1 - r) * 40).toFixed(1)}px`), 20)
  );
}

/* -------- Contact form --------
   Sends each message to SITE_CONFIG.formEmail using FormSubmit.co (free, no server needed).

   FIRST-TIME SETUP: the very first message sent from the live site makes FormSubmit
   email an "Activate form" link to that inbox. Click it once; after that every
   message arrives by email. Replying to a message replies to the customer.
   Optional: after activating, FormSubmit gives you a random alias string; put it in
   formEmail instead of the address so the address isn't visible in the page source.
-------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";

    if (!form.checkValidity()) {
      form.querySelectorAll(":invalid").forEach((f) => f.classList.add("invalid"));
      status.textContent = "Please add your name, a valid email and a message.";
      status.classList.add("error");
      form.querySelector(":invalid").focus();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    const data = new FormData(form);

    try {
      const payload = Object.fromEntries(data);
      payload._subject = `New website message from ${payload.name}${payload.company ? ` (${payload.company})` : ""}`;
      payload._template = "table";
      payload._captcha = "false";

      const res = await fetch(`https://formsubmit.co/ajax/${SITE_CONFIG.formEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || String(result.success) !== "true") throw new Error(result.message || `HTTP ${res.status}`);
      form.reset();
      status.textContent = "Thank you! We received your message and will reply soon.";
      status.classList.add("success");
    } catch (err) {
      // Show FormSubmit's own reply (e.g. "This form needs Activation…") so setup problems are visible
      const detail = err && err.message && !/^Failed to fetch|^HTTP \d/.test(err.message) ? ` (${err.message})` : "";
      status.textContent = `The message could not be sent${detail}. Please contact us on WhatsApp instead.`;
      status.classList.add("error");
      console.error("Contact form error:", err);
    } finally {
      button.disabled = false;
    }
  });

  form.querySelectorAll("input, textarea").forEach((field) =>
    field.addEventListener("input", () => field.classList.remove("invalid"))
  );
}

/* -------- Init -------- */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initThemeToggle();
  if (window.lucide) lucide.createIcons();
  renderQRCodes();
  initCopyButtons();
  initNavbar();
  initReveal();
  initScrollEffects();
  initContactForm();
  document.getElementById("year").textContent = new Date().getFullYear();
});
