document.addEventListener("DOMContentLoaded", () => {
  /*shadow on scroll  */
  const header = document.getElementById("site-header");
  if (!header) return;

  const getY = () =>
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  const applyShadow = () => {
    header.classList.toggle("is-scrolled", getY() > 4);
  };

  applyShadow();
  window.addEventListener("scroll", applyShadow, { passive: true });
  window.addEventListener("resize", applyShadow);

  /*Mobilenav*/
  const toggle = document.querySelector(".nav_toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && header && menu) {
    const closeMenu = () => {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* Newsletter subscription with Django backend */
  const form = document.querySelector("#site-footer .newsletter-form");
  if (form) {
    const emailInput = form.querySelector('input[type="email"]');
    const msg = document.createElement("span");
    msg.className = "newsletter-msg";
    msg.hidden = true;
    form.appendChild(msg);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!emailInput?.value.trim() || !emailInput.checkValidity()) {
        emailInput?.reportValidity?.();
        return;
      }

      const email = emailInput.value.trim();
      msg.hidden = true;

      try {
        const response = await fetch("/api/subscribe/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "footer_form" }),
        });

        const data = await response.json();

        if (data.success) {
          msg.textContent = `Multumim! Te vom anunta pe ${email}.`;
        } else if (data.error) {
          msg.textContent = data.error;
        } else {
          msg.textContent = "A aparut o eroare. Incearca din nou.";
        }
      } catch (err) {
        msg.textContent = "Nu se poate conecta la server. Incearca mai tarziu.";
      }

      msg.hidden = false;
      setTimeout(() => (msg.hidden = true), 5000);
    });
  }

  // Lead context helpers for ROI/estimators stored in sessionStorage
  const readFromSession = (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (_err) {
      return null;
    }
  };

  const collectLeadContext = () => {
    const ctx = {};
    ["roi_summary", "estimator_summary", "triage_summary", "matcher_summary"].forEach((key) => {
      const raw = readFromSession(key);
      if (!raw) return;
      try {
        ctx[key] = JSON.parse(raw);
      } catch (e) {
        ctx[key] = raw;
      }
    });
    return Object.keys(ctx).length ? ctx : null;
  };

  // Contact form -> /api/contact/ with ROI context + status messages
  const contactForm = document.querySelector(".form-outer");
  if (contactForm) {
    const statusMsg = document.createElement("div");
    statusMsg.className = "form-status";
    statusMsg.hidden = true;
    contactForm.appendChild(statusMsg);

    const inputs = {
      name: contactForm.querySelector('[name="name"]'),
      email: contactForm.querySelector('[name="email"]'),
      subject: contactForm.querySelector('[name="subject"]'),
      message: contactForm.querySelector('[name="message"]'),
    };

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = inputs.name?.value.trim() || "";
      const email = inputs.email?.value.trim() || "";
      const subject = inputs.subject?.value.trim() || "";
      const message = inputs.message?.value.trim() || "";

      if (!name || !email || !message) {
        statusMsg.textContent = "Please fill in name, email, and message.";
        statusMsg.classList.add("is-error");
        statusMsg.hidden = false;
        return;
      }
      if (!inputs.email?.checkValidity?.()) {
        inputs.email?.reportValidity?.();
        return;
      }

      const payload = { name, email, subject, message, source: "contact_form" };
      const ctx = collectLeadContext();
      if (ctx) {
        Object.assign(payload, ctx);
        payload.context = ctx;
      }

      statusMsg.hidden = true;
      statusMsg.classList.remove("is-error");

      try {
        const response = await fetch("/api/contact/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.success) {
          statusMsg.textContent = data.message || "Message sent. We will reply soon.";
          contactForm.reset();
        } else {
          statusMsg.textContent = data.error || data.message || "We could not send your message.";
          statusMsg.classList.add("is-error");
        }
      } catch (err) {
        statusMsg.textContent = "Cannot reach the server. Please try again shortly.";
        statusMsg.classList.add("is-error");
      }

      statusMsg.hidden = false;
    });
  }

  /*anul*/
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /*parteea cu clienti*/
  const scroller = document.getElementById("logo-scroller");
  const track = document.getElementById("logo-track");
  if (scroller && track) {
    const originals = Array.from(track.children);
    originals.forEach((n) => track.appendChild(n.cloneNode(true)));
    originals.forEach((n) => track.appendChild(n.cloneNode(true)));

    const imgs = Array.from(track.querySelectorAll("img"));
    const ready = Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = res;
            })
      )
    );

    let segment = 0;
    ready.then(() => {
      segment = track.scrollWidth / 3;
      scroller.scrollLeft = segment;
    });

    scroller.addEventListener(
      "scroll",
      () => {
        if (!segment) return;
        if (scroller.scrollLeft <= 1) scroller.scrollLeft += segment;
        else if (scroller.scrollLeft >= segment * 2 - 1)
          scroller.scrollLeft -= segment;
      },
      { passive: true }
    );

    let isDown = false,
      startX = 0,
      startLeft = 0;
    scroller.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      startLeft = scroller.scrollLeft;
      scroller.setPointerCapture(e.pointerId);
      scroller.classList.add("is-dragging");
    });
    scroller.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      scroller.scrollLeft = startLeft - (e.clientX - startX);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
      scroller.addEventListener(ev, () => {
        isDown = false;
        scroller.classList.remove("is-dragging");
      })
    );
  }

  // Smooth-scroll active nav highlight on scroll
  const navLinks = Array.from(document.querySelectorAll('#nav-menu a[href^="#"]'));
  const dropdownToggles = Array.from(document.querySelectorAll('.dropdown .dropdown_toggle'));
  if (navLinks.length) {
    const map = new Map();
    navLinks.forEach((a) => {
      const id = a.getAttribute('href')?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) map.set(el, a);
    });

    const setActive = (anchor) => {
      navLinks.forEach((l) => l.classList.remove('active'));
      anchor?.classList.add('active');
      const dd = anchor?.closest('.dropdown');
      dropdownToggles.forEach((btn) => {
        const btnDD = btn.closest('.dropdown');
        btn.classList.toggle('active', dd && btnDD === dd);
      });
    };

    let currentAnchor = null;
    const observer = new IntersectionObserver(
      (entries) => {
        let topMost = null;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!topMost || entry.boundingClientRect.top < topMost.boundingClientRect.top) {
            topMost = entry;
          }
        });
        if (topMost) {
          const a = map.get(topMost.target);
          if (a && a !== currentAnchor) {
            currentAnchor = a;
            setActive(a);
          }
        }
      },
      {
        root: null,
        rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    map.forEach((_, el) => observer.observe(el));

    // Also update active state on click immediately
    navLinks.forEach((a) => a.addEventListener('click', () => setActive(a)));

    // Handle dropdown focus
    dropdownToggles.forEach((btn) => {
      const dd = btn.closest('.dropdown');
      dd?.addEventListener('mouseenter', () => {
        if (!dd.querySelector('a.active')) return;
        btn.classList.add('active');
      });
      dd?.addEventListener('mouseleave', () => {
        if (!dd.querySelector('a.active')) btn.classList.remove('active');
      });
      dd?.addEventListener('focusin', () => {
        if (dd.querySelector('a.active')) btn.classList.add('active');
      });
      dd?.addEventListener('focusout', () => {
        if (!dd.querySelector('a.active')) btn.classList.remove('active');
      });
    });
  }

  // Back to top button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const updateBtt = () => {
      const visible = getY() > 300;
      backToTop.classList.toggle('is-visible', visible);
    };
    updateBtt();
    window.addEventListener('scroll', updateBtt, { passive: true });
    backToTop.addEventListener('click', () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }
});
