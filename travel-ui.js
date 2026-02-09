// travel-ui.js

document.addEventListener("change", e => {
  const toggle = e.target.closest("[data-toggle]");
  if (!toggle) return;

  const section = toggle.closest("[data-section]");
  const body = section?.querySelector(".section-body");
  if (!body) return;

  body.classList.toggle("hidden", !toggle.checked);
});

document.addEventListener("change", e => {
  const toggle = e.target.closest("[data-category-toggle]");
  if (!toggle) return;

  const category = toggle.closest("[data-category]");
  const body = category?.querySelector(".category-body");
  if (!body) return;

  body.classList.toggle("hidden", !toggle.checked);
});

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-travel-tab]");
  if (!btn) return;

  const tab = btn.dataset.travelTab;

  document.querySelectorAll("[data-travel-tab]")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.querySelectorAll("[data-section]")
    .forEach(sec => sec.classList.add("hidden"));

  document.querySelector(`[data-section="${tab}"]`)
    ?.classList.remove("hidden");
});
