(() => {
  "use strict";

  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");

  /* Header background on scroll */
  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* Mobile navigation */
  if (navToggle && nav) {
    const setNavState = (open) => {
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    navToggle.addEventListener("click", () => {
      setNavState(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNavState(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        setNavState(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setNavState(false);
    });
  }

  /* Reveal on scroll */
  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealItems.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }
  }

  /* Library search and filters */
  const librarySearch = document.getElementById("librarySearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const libraryGroups = document.querySelectorAll(".lib-group");
  const libraryCards = document.querySelectorAll(".lib-card");
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");

  if (libraryCards.length) {
    let activeFilter = "all";

    const normalize = (value) =>
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const applyLibraryFilter = () => {
      const query = normalize(librarySearch ? librarySearch.value : "");
      let visibleCount = 0;

      libraryGroups.forEach((group) => {
        const groupCards = group.querySelectorAll(".lib-card");
        let visibleInGroup = 0;

        groupCards.forEach((card) => {
          const categoryMatches =
            activeFilter === "all" || card.dataset.category === activeFilter;
          const titleMatches = !query || normalize(card.dataset.title || "").includes(query);
          const show = categoryMatches && titleMatches;

          card.classList.toggle("is-hidden", !show);
          if (show) {
            visibleInGroup += 1;
            visibleCount += 1;
          }
        });

        group.classList.toggle("is-hidden", visibleInGroup === 0);
      });

      if (resultCount) {
        resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "title" : "titles"}`;
      }

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";

        filterButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        applyLibraryFilter();
      });
    });

    if (librarySearch) {
      librarySearch.addEventListener("input", applyLibraryFilter);
    }
  }

  /* Contact form — composes a WhatsApp message */
  const contactForm = document.getElementById("whatsappForm");

  if (contactForm) {
    const status = document.getElementById("formStatus");
    const nameField = contactForm.querySelector("#name");
    const messageField = contactForm.querySelector("#message");

    const setStatus = (message, isError = false) => {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("is-error", isError);
    };

    const markInvalid = (field, invalid) => {
      if (!field) return;
      field.classList.toggle("is-invalid", invalid);
      field.setAttribute("aria-invalid", String(invalid));
    };

    [nameField, messageField].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        if (field.value.trim()) markInvalid(field, false);
      });
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = nameField ? nameField.value.trim() : "";
      const subjectField = contactForm.querySelector("#subject");
      const subject = subjectField ? subjectField.value : "General enquiry";
      const message = messageField ? messageField.value.trim() : "";

      if (!name) {
        markInvalid(nameField, true);
        setStatus("Please enter your name so we know who we are speaking with.", true);
        nameField.focus();
        return;
      }

      if (!message) {
        markInvalid(messageField, true);
        setStatus("Please write a short message before sending.", true);
        messageField.focus();
        return;
      }

      markInvalid(nameField, false);
      markInvalid(messageField, false);

      const text = `Hello, my name is ${name}.\n\n${subject}\n\n${message}`;
      const url = `https://wa.me/263775991061?text=${encodeURIComponent(text)}`;
      const opened = window.open(url, "_blank");

      if (!opened) {
        setStatus("Your browser blocked the new window. Allow pop-ups, or call 0775 991 061 directly.", true);
        return;
      }

      opened.opener = null;
      setStatus("WhatsApp is opening with your message ready to send.");
    });
  }
})();
