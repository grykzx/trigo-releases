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