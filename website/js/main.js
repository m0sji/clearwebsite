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

    menu
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeMenu));
  }

  /*feedback*/
  const form = document.querySelector("#site-footer .newsletter-form");
  if (form) {
    const emailInput = form.querySelector('input[type="email"]');
    const msg = document.createElement("span");
    msg.className = "newsletter-msg";
    msg.hidden = true;
    form.appendChild(msg);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!emailInput?.value.trim() || !emailInput.checkValidity()) {
        emailInput?.reportValidity?.();
        return;
      }
      const email = emailInput.value.trim();
      msg.textContent = `Mulțumim! Te vom anunța pe ${email}.`;
      msg.hidden = false;
      setTimeout(() => (msg.hidden = true), 4000);
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
});
