// ============================================
// TRIGO DOWNLOAD SITE
// ============================================
// Plain JavaScript, no build step. The page works without it; this only
// adds:
//   1. the logo (falls back to a motorcycle icon if assets/logo.png is
//      missing)
//   2. the "I'm a commuter / I'm a driver" switch
//   3. the version, release date and file size, read from GitHub
//   4. the QR codes (on screen for computer visitors, and on the poster)
//   5. the "Arrived" moment when the tricycle in the hero reaches the pin
//   6. motion: the hero fades in on load, and each section, list item
//      and the dotted route line appear as you scroll to them (see the
//      MOTION part of style.css)
//
// WHERE THE APP FILE LIVES: this repo's GitHub Releases. Every Download
// button links to ".../releases/latest/download/TriGo.apk", which always
// means the newest release. To ship an update, publish a new release
// and attach the APK named exactly TriGo.apk. Nothing here changes.

const REPO = "grykzx/trigo-releases";
const APK_NAME = "TriGo.apk";
const SITE_URL = "https://grykzx.github.io/trigo-releases/";

// ---------- 1. Logo ----------
(function checkLogo() {
  const img = new Image();
  img.onerror = () => document.body.classList.add("no-logo");
  img.src = "assets/logo.png";
})();

// ---------- 2. Commuter / driver switch ----------
(function roleSwitch() {
  const tabs = [...document.querySelectorAll(".role-tab")];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      select(next);
      next.focus();
    });
  });
})();

// ---------- 3. Latest release info ----------
(async function releaseInfo() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!res.ok) return;
    const release = await res.json();
    const apk = (release.assets || []).find((a) => a.name === APK_NAME);
    const version = release.tag_name || "";
    const size = apk ? `${Math.round(apk.size / 1048576)} MB` : "";
    const meta = ["Free", version, size].filter(Boolean).join(", ");
    document.querySelectorAll(".release-meta").forEach((el) => (el.textContent = meta));
    if (version && release.published_at) {
      const date = new Date(release.published_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
      document.getElementById("releaseInfo").textContent = `Android app ${version}, released ${date}.`;
    }
  } catch (_) {
    // Offline or GitHub unreachable: the Download buttons still work.
  }
})();

// ---------- 4. QR codes ----------
(function qrCodes() {
  if (typeof QRCode === "undefined") {
    document.querySelector(".qr-card")?.classList.add("hidden");
    return;
  }
  const base = { text: SITE_URL, colorDark: "#4e342e", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M };
  new QRCode(document.getElementById("qr"), { ...base, width: 172, height: 172 });
  new QRCode(document.getElementById("qrPoster"), { ...base, width: 330, height: 330 });
  document.getElementById("printBtn").addEventListener("click", () => window.print());
})();

// ---------- 5. Hero: the driver arrives ----------
(function heroArrival() {
  const trike = document.querySelector(".trike");
  const chip = document.querySelector(".eta-chip");
  const text = document.getElementById("etaText");
  if (!trike || !chip) return;
  trike.addEventListener("animationend", () => {
    chip.classList.add("arrived");
    text.textContent = "Your driver has arrived";
  });
})();

// ---------- 6. Motion ----------
// Adds class "motion" to <html>, which turns on the hidden starting
// state in style.css. Without this script (or with "reduce motion" set
// on the phone or computer) that class is never added, so everything is
// simply visible: the page never depends on the animation.
(function motion() {
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("motion");

  // [selector, stagger the items inside one parent?]
  const groups = [
    [".hero-copy > *", true],
    [".phone-wrap", false],
    [".section-head, .how h2, .safety-copy, .install-steps > h2, .install-intro, .faq h2, .closing > *", false],
    [".feature-list li, .route-steps li, .safety-list li, .steps li, .faq details", true],
    [".install-steps > .btn, .qr-card", false],
  ];
  const items = [];
  groups.forEach(([selector, stagger]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.classList.contains("reveal")) return;
      const index = stagger && el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty("--d", Math.min(index, 6));
      el.classList.add("reveal");
      items.push(el);
    });
  });
  const route = document.querySelector(".route-steps");
  if (route) items.push(route);

  const seen = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      seen.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  items.forEach((el) => seen.observe(el));

  // Switching "I'm a commuter / I'm a driver" fades the new list in.
  document.querySelectorAll(".role-tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      panel?.querySelectorAll(".feature-list li").forEach((li, i) => {
        li.classList.add("in");
        li.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 420, delay: i * 60, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        );
      });
    })
  );
})();