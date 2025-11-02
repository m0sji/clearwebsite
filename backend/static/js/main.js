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

  /* ✉️ Newsletter subscription with Django backend */
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
        const response = await fetch("http://127.0.0.1:8000/api/subscribe/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.success) {
          msg.textContent = `✅ Mulțumim! Te vom anunța pe ${email}.`;
        } else if (data.error) {
          msg.textContent = `⚠️ ${data.error}`;
        } else {
          msg.textContent = "⚠️ Eroare neașteptată. Încearcă din nou.";
        }
      } catch (err) {
        msg.textContent = "❌ Nu se poate conecta la server. Asigură-te că backendul rulează.";
      }

      msg.hidden = false;
      setTimeout(() => (msg.hidden = true), 5000);
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
