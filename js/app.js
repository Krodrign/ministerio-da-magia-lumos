const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  if (!header) return;

  if (window.scrollY > 40) {
    header.style.background = "rgba(0,0,0,.75)";
    header.style.borderBottom = "1px solid rgba(255,255,255,.08)";
  } else {
    header.style.background = "rgba(0,0,0,.35)";
  }
});
