document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = [...document.querySelectorAll(".reveal")];
const progressBar = document.querySelector(".scroll-progress span");
const campaignTrail = document.querySelector("[data-campaign-trail]");
const parallaxItem = document.querySelector("[data-parallax]");
const toneSections = [...document.querySelectorAll("[data-tone]")];
const navLinks = [...document.querySelectorAll(".case-links a")];

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10%", threshold: 0.08 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      document.body.dataset.tone = visible.target.dataset.tone || "blue";

      const id = visible.target.id;
      if (!id) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-25% 0px -55%", threshold: [0, 0.2, 0.5] }
  );

  toneSections.forEach((section) => sectionObserver.observe(section));
}

let ticking = false;

function updateScrollEffects() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const scrollRatio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  progressBar?.style.setProperty("transform", `scaleX(${scrollRatio})`);

  if (campaignTrail) {
    const rect = campaignTrail.getBoundingClientRect();
    const start = window.innerHeight * 0.82;
    const distance = rect.height + window.innerHeight * 0.42;
    const trailProgress = Math.min(1, Math.max(0, (start - rect.top) / distance));
    campaignTrail.style.setProperty("--trail-progress", trailProgress.toFixed(3));
  }

  if (parallaxItem && !prefersReducedMotion && window.innerWidth > 820) {
    const rect = parallaxItem.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const parallaxY = Math.max(-14, Math.min(14, centerOffset * -0.018));
    parallaxItem.style.setProperty("--parallax-y", `${parallaxY.toFixed(2)}px`);
  }

  ticking = false;
}

function requestScrollUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateScrollEffects);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollEffects();
