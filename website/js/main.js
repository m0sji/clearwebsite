document.addEventListener("DOMContentLoaded", () => {
  let roiSummary = "";
  const contactForm = document.querySelector('#contact form');
  const setContactData = (key, value) => {
    if (!contactForm) return;
    contactForm.dataset[key] = value;
  };
  const prefillContact = ({ subject, block }) => {
    if (!contactForm) return;
    const subjectInput = contactForm.querySelector('#ct-subject');
    const messageInput = contactForm.querySelector('#ct-message');
    if (subjectInput && subject && !subjectInput.value) subjectInput.value = subject;
    if (messageInput && block) {
      const existing = messageInput.value.trim();
      const blockTrimmed = block.trim();
      if (!existing.includes(blockTrimmed)) {
        messageInput.value = existing ? `${existing}\n\n${blockTrimmed}` : blockTrimmed;
      }
    }
  };

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

  // Smooth-scroll active nav highlight on scroll
  const navLinks = Array.from(
    document.querySelectorAll('#nav-menu a[href^="#"]')
  );
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
    navLinks.forEach((a) =>
      a.addEventListener('click', () => {
        setActive(a);
      })
    );

    // If focus enters dropdown via keyboard, reflect active on toggle
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

  // ROI calculator: estimate revenue uplift, support savings, and payback; hand off summary to contact form
  const roiForm = document.getElementById('roi-form');
  if (roiForm) {
    const revenueEl = document.getElementById('roi-revenue');
    const savingsEl = document.getElementById('roi-savings');
    const paybackEl = document.getElementById('roi-payback');
    const copyBtn = document.getElementById('roi-share');
    const contactBtn = document.getElementById('roi-contact');
    const copyMsg = document.getElementById('roi-copy-msg');

    const getNumber = (name) => {
      const raw = roiForm.elements[name]?.value;
      const num = parseFloat(raw);
      return Number.isFinite(num) ? num : 0;
    };

    const fmtMoney = (n) => {
      const rounded = Math.max(0, Math.round(n));
      return `$${rounded.toLocaleString()}`;
    };

    let lastSummary = '';

    roiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const visits = getNumber('visits');
      const convRate = getNumber('convRate');
      const avgDeal = getNumber('avgDeal');
      const tickets = getNumber('tickets');
      const ticketCost = getNumber('ticketCost');
      const convUplift = getNumber('convUplift');
      const deflect = getNumber('deflect');
      const hourly = getNumber('hourly');
      const hrsPerTicket = getNumber('hrsPerTicket');

      const values = [visits, convRate, avgDeal, tickets, ticketCost, convUplift, deflect, hourly, hrsPerTicket];
      if (values.some((n) => n < 0)) return;

      const baseRevenue = visits * (convRate / 100) * avgDeal;
      const upliftRevenue = baseRevenue * (convUplift / 100);
      const supportSavings = tickets * (deflect / 100) * (ticketCost + hourly * hrsPerTicket);
      const monthlyBenefit = upliftRevenue + supportSavings;
      const estimatedProjectCost = 12000; // tuned heuristic for our starter AI package
      const payback = monthlyBenefit
        ? Math.max(1, Math.ceil(estimatedProjectCost / monthlyBenefit))
        : null;

      revenueEl.textContent = fmtMoney(upliftRevenue);
      savingsEl.textContent = fmtMoney(supportSavings);
      paybackEl.textContent = payback ? `${payback} month${payback > 1 ? 's' : ''}` : '-- months';

      lastSummary = `ROI estimate: +${fmtMoney(upliftRevenue)} monthly revenue, +${fmtMoney(
        supportSavings
      )} support savings, payback in ${payback ? `${payback} month${payback > 1 ? 's' : ''}` : 'n/a'}. Inputs: visits ${visits}, conv rate ${convRate}%, avg deal $${avgDeal}, tickets ${tickets}/mo, deflection ${deflect}%, conversion uplift ${convUplift}%.`;
      roiSummary = lastSummary;
      setContactData('roiSummary', lastSummary);
      roiForm.dataset.lastSummary = lastSummary;
      if (copyMsg) copyMsg.hidden = true;
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (!lastSummary) return;
        try {
          await navigator.clipboard.writeText(lastSummary);
          if (copyMsg) {
            copyMsg.textContent = 'Summary copied. Paste it in chat or email.';
            copyMsg.hidden = false;
            setTimeout(() => (copyMsg.hidden = true), 3000);
          }
        } catch (err) {
          if (copyMsg) {
            copyMsg.textContent = 'Copy failed. Select and copy manually.';
            copyMsg.hidden = false;
          }
        }
      });
    }

    if (contactForm && contactBtn) {
      contactBtn.addEventListener('click', () => {
        if (!lastSummary) return;
        prefillContact({
          subject: 'ROI calculator results',
          block: `Here is my ROI estimate and context:\n${lastSummary}\n\nWhat I want to automate:`,
        });
      });
    }
  }

  // AI Project Estimator
  const estForm = document.getElementById('estimator-form');
  if (estForm) {
    const effortEl = document.getElementById('est-effort');
    const timelineEl = document.getElementById('est-timeline');
    const priceEl = document.getElementById('est-price');
    const quoteBtn = document.getElementById('est-quote');
    const volumeInput = document.getElementById('est-volume');
    const slaInput = document.getElementById('est-sla');

    const baseHours = { chatbot: 80, classifier: 110, ocr: 70 };
    const slaMultiplier = { standard: 1, premium: 1.2 };
    const rateBand = { low: 120, mid: 150, high: 190 };
    let estimatorSummary = '';

    const calc = () => {
      const selected = Array.from(estForm.querySelectorAll('input[name="feature"]:checked')).map(
        (i) => i.value
      );
      const vol = parseFloat(volumeInput?.value || '0') || 0;
      const sla = slaInput?.value || 'standard';
      if (!selected.length || !sla) return null;

      const volumeFactor = vol > 200000 ? 1.35 : vol > 100000 ? 1.2 : vol > 30000 ? 1.1 : 1;
      const baseTotal = selected.reduce((sum, key) => sum + (baseHours[key] || 0), 0);
      const effortHours = Math.round(baseTotal * volumeFactor * (slaMultiplier[sla] || 1));
      const weeks = Math.max(2, Math.ceil(effortHours / 40));
      const low = Math.round(effortHours * rateBand.low * (sla === 'premium' ? 1.1 : 1));
      const high = Math.round(effortHours * rateBand.high * (sla === 'premium' ? 1.1 : 1));
      const mid = Math.round((low + high) / 2);

      return { selected, effortHours, weeks, low, mid, high, vol, sla };
    };

    estForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = calc();
      if (!res) return;
      effortEl.textContent = `${res.effortHours} hrs`;
      timelineEl.textContent = `${res.weeks} week${res.weeks > 1 ? 's' : ''}`;
      priceEl.textContent = `$${res.low.toLocaleString()} - $${res.high.toLocaleString()} (mid ~$${res.mid.toLocaleString()})`;
      estimatorSummary = `Estimator: features ${res.selected.join(', ') || 'none'}, volume ${res.vol}/day, SLA ${res.sla}. Effort ${res.effortHours} hrs (~${res.weeks} wks), price ~$${res.mid.toLocaleString()} (band $${res.low.toLocaleString()} - $${res.high.toLocaleString()}).`;
      setContactData('estimatorSummary', estimatorSummary);
    });

    quoteBtn?.addEventListener('click', () => {
      if (!estimatorSummary) return;
      prefillContact({
        subject: 'Custom AI quote request',
        block: `${estimatorSummary}\n\nStack and data notes:`,
      });
    });
  }

  // Lead Triage Wizard
  const triageForm = document.getElementById('triage-form');
  if (triageForm) {
    const scoreEl = document.getElementById('triage-score');
    const packageEl = document.getElementById('triage-package');
    const noteEl = document.getElementById('triage-note');
    const sendBtn = document.getElementById('triage-send');
    let triageSummary = '';

    const scoring = {
      useCase: { support: 25, sales: 22, ops: 20, content: 18 },
      data: { none: 8, some: 16, solid: 24 },
      budget: { lt10: 10, '10-25': 16, '25-50': 22, gt50: 26 },
      timeline: { 90: 24, 180: 16, 365: 10 },
    };

    triageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const useCase = triageForm.elements['useCase']?.value;
      const data = triageForm.elements['data']?.value;
      const budget = triageForm.elements['budget']?.value;
      const timeline = triageForm.elements['timeline']?.value;
      if (!useCase || !data || !budget || !timeline) return;

      const score =
        (scoring.useCase[useCase] || 0) +
        (scoring.data[data] || 0) +
        (scoring.budget[budget] || 0) +
        (scoring.timeline[timeline] || 0);
      let pkg = 'Starter';
      if (score >= 70 && score < 90) pkg = 'Growth';
      else if (score >= 90) pkg = 'Scale';

      scoreEl.textContent = `${score}/100`;
      packageEl.textContent = pkg;
      noteEl.textContent =
        pkg === 'Scale'
          ? 'High fit. We recommend a pilot with premium support.'
          : pkg === 'Growth'
          ? 'Good fit. Let’s scope a 6-10 week launch.'
          : 'Viable. We can start with a lean MVP and expand.';

      triageSummary = `Triage: use case ${useCase}, data ${data}, budget ${budget}, timeline ${timeline}. Score ${score}/100, package ${pkg}.`;
      setContactData('triageSummary', triageSummary);
    });

    sendBtn?.addEventListener('click', () => {
      if (!triageSummary) return;
      prefillContact({
        subject: 'Project fit & package',
        block: `${triageSummary}\n\nTeam/stakeholders:`,
      });
    });
  }

  // Industry matcher
  const matcherForm = document.getElementById('matcher-form');
  if (matcherForm) {
    const caseEl = document.getElementById('matcher-case');
    const quoteEl = document.getElementById('matcher-quote');
    const ctaBtn = document.getElementById('matcher-cta');
    let matcherSummary = '';

    const cases = {
      'ecom:conversion': {
        blurb: 'E-commerce: AI assistant lifted checkout conversion by 14% and AOV by $18.',
        quote: '“We shipped in 6 weeks and saw lift in week 1.” — Director of Growth, Retailer',
      },
      'ecom:deflection': {
        blurb: 'E-commerce: automated returns/exchanges deflected 38% of tickets.',
        quote: '“Support queue shrank overnight.” — CX Lead, Fashion brand',
      },
      'saas:conversion': {
        blurb: 'SaaS: lead router + chat cut response time from hours to seconds.',
        quote: '“Sales accepted lead volume +19%.” — VP Sales, B2B SaaS',
      },
      'saas:deflection': {
        blurb: 'SaaS: LLM answers deflected 32% of how-to tickets.',
        quote: '“Freed two agents for onboarding.” — Head of Support',
      },
      'health:ops': {
        blurb: 'Healthcare: OCR + triage reduced manual intake time by 41%.',
        quote: '“Clinicians spend time on patients, not paperwork.” — Ops Director',
      },
      'finserv:ops': {
        blurb: 'Financial Services: classifier + workflow cut case handling SLA by 35%.',
        quote: '“Audit-ready, faster throughput.” — Operations Manager',
      },
    };

    matcherForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const industry = matcherForm.elements['industry']?.value;
      const goal = matcherForm.elements['goal']?.value;
      if (!industry || !goal) return;
      const key = `${industry}:${goal}`;
      const chosen = cases[key] || {
        blurb: 'We’ve shipped in your space; let’s tailor an example.',
        quote: '',
      };
      caseEl.textContent = chosen.blurb;
      quoteEl.textContent = chosen.quote;
      matcherSummary = `Industry match: ${industry}, goal ${goal}. ${chosen.blurb}`;
      setContactData('matcherSummary', matcherSummary);
    });

    ctaBtn?.addEventListener('click', () => {
      if (!matcherSummary) return;
      prefillContact({
        subject: 'Relevant case study',
        block: `${matcherSummary}\n\nSimilar workflows we should know:`,
      });
    });
  }

  // Contact form: send lead + ROI summary to backend/CRM
  if (contactForm) {
    const CRM_ENDPOINT = '/api/lead'; // replace with your API/CRM endpoint
    const statusEl = document.createElement('div');
    statusEl.className = 'form-status';
    statusEl.hidden = true;
    contactForm.appendChild(statusEl);

    const showStatus = (text, kind = 'info') => {
      statusEl.textContent = text;
      statusEl.dataset.state = kind;
      statusEl.hidden = false;
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const subject = String(formData.get('subject') || '').trim();
      const message = String(formData.get('message') || '').trim();

      const emailInput = contactForm.querySelector('#ct-email');
      if (emailInput && !emailInput.checkValidity()) {
        emailInput.reportValidity?.();
        return;
      }

      if (!name || !email || !message) {
        showStatus('Please add your name, email, and a short message.', 'error');
        return;
      }

      const payload = {
        name,
        email,
        subject: subject || 'Project inquiry',
        message,
        roiSummary: roiSummary || contactForm.dataset.roiSummary || '',
        estimatorSummary: contactForm.dataset.estimatorSummary || '',
        triageSummary: contactForm.dataset.triageSummary || '',
        matcherSummary: contactForm.dataset.matcherSummary || '',
        page: window.location.href,
        timestamp: new Date().toISOString(),
      };

      showStatus('Sending your request...', 'info');
      try {
        const res = await fetch(CRM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        showStatus('Thanks! We received your request and will reply shortly.', 'success');
        contactForm.reset();
      } catch (err) {
        showStatus('Could not send right now. Please try again or email info@example.com.', 'error');
      }
    });
  }
});
