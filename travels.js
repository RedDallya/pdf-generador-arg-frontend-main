import { appState } from "./state.js";

export function createEmptyTravel() {
  return {
    client: { id: null, data: null },
    basic: {},
    sections: {
      cotizaciones: {
        enabled: false,
        categorias: {
          hotel: { enabled: false, servicios: [] },
          aereo: { enabled: false, servicios: [] }
        }
      },
      operadores: { enabled: false },
      vouchers: { enabled: false },
      itinerario: { enabled: false }
    }
  };
}



function getActiveTravel() {
  return appState.travels[appState.activeTravelId];
}


document.addEventListener("change", e => {
  const toggle = e.target.closest("[data-toggle]");
  if (!toggle) return;

  const section = toggle.closest("[data-section]");
  const body = section?.querySelector(".section-body");
  if (!body) return;

  body.classList.toggle("hidden", !toggle.checked);

  const travel = getActiveTravel();
  if (travel?.sections?.[section.dataset.section]) {
    travel.sections[section.dataset.section].enabled = toggle.checked;
    saveState();
  }
});


document.addEventListener("change", e => {
  const toggle = e.target.closest("[data-category-toggle]");
  if (!toggle) return;

  const category = toggle.closest("[data-category]");
  const body = category?.querySelector(".category-body");
  if (!body) return;

  body.classList.toggle("hidden", !toggle.checked);

  const travel = getActiveTravel();
  const key = category.dataset.category;

  if (travel?.sections?.cotizaciones?.categorias?.[key]) {
    travel.sections.cotizaciones.categorias[key].enabled = toggle.checked;
    saveState();
  }
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

