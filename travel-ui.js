import { getTravelById, updateTravel } from "./api.js";
import { appState } from "./state.js";

/************************************************
CARGAR VIAJE EN FORMULARIO
*************************************************/
export async function hydrateTravelForm() {

  if (!appState.activeTravelId) return;

  try {

    const travel = await getTravelById(appState.activeTravelId);

    if (!travel) return;

    setField("destino", travel.destino);
    setField("fecha_inicio", travel.fecha_inicio);
    setField("fecha_fin", travel.fecha_fin);
    setField("pasajero", travel.pasajero);
    setField("tipo_viaje", travel.tipo_viaje);
    setField("estado", travel.estado);
    setField("notas", travel.notas);

  } catch (err) {
    console.error("Error cargando viaje", err);
  }
}

/************************************************
AUTO SAVE AL CAMBIAR INPUT
*************************************************/
document.addEventListener("change", async e => {

  const input = e.target.closest("[data-travel]");
  if (!input) return;

  if (!appState.activeTravelId) return;

  try {

    const payload = {
      [input.dataset.travel]: input.value
    };

    await updateTravel(appState.activeTravelId, payload);

  } catch (err) {
    console.error("Error guardando campo viaje", err);
  }

});

/************************************************
TOGGLES SECCIONES (solo UI)
*************************************************/
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

/************************************************
HELPERS
*************************************************/
function setField(key, value) {

  const el = document.querySelector(`[data-travel="${key}"]`);
  if (el) el.value = value || "";

}
