import {
  getTravelsByClient,
  createTravel,
  updateTravel,
  deleteTravel
} from "./api.js";

import { appState, setActiveTravelId } from "./state.js";

/************************************************
LOAD TRAVELS
*************************************************/
export async function loadTravels() {

  if (!appState.activeClientId) return;

  try {

    const travels = await getTravelsByClient(appState.activeClientId);

    const container = document.querySelector("[data-travel-tabs]");
    if (!container) return;

    container.innerHTML = "";

    if (!travels.length) {
      setActiveTravelId(null);
      return;
    }

    travels.forEach(t => renderTravelTab(t));

    /* Si no hay activo → tomar el primero */
    if (!appState.activeTravelId) {
      setActiveTravelId(travels[0].id);
    }

  } catch (err) {
    console.error("Error cargando viajes", err);
  }
}

/************************************************
RENDER TAB
*************************************************/
function renderTravelTab(travel) {

  const container = document.querySelector("[data-travel-tabs]");
  if (!container) return;

  const div = document.createElement("div");

  div.className = "travel-tab";
  div.dataset.travelId = travel.id;

  if (Number(travel.id) === Number(appState.activeTravelId)) {
    div.classList.add("active");
  }

  div.innerHTML = `
    <input
      type="text"
      class="form-control form-control-sm d-inline-block w-auto"
      value="${travel.destino || "Viaje"}"
      data-travel-title
    >

    <button type="button" class="btn btn-sm btn-outline-secondary" data-duplicate-travel>
      ⧉
    </button>

    <button type="button" class="btn btn-sm btn-outline-success" data-add-travel>
      AGREGAR +
    </button>

    <button type="button" class="btn btn-sm btn-outline-success" data-save-travel>
      Guardar viaje
    </button>

    <button type="button" class="btn btn-sm btn-outline-danger" data-delete-travel>
      ✕
    </button>
  `;

  container.appendChild(div);
}

/************************************************
GLOBAL CLICK HANDLER
*************************************************/
document.addEventListener("click", async e => {

  if (!appState.activeClientId) return;

  const tab = e.target.closest(".travel-tab");
  const travelId = Number(tab?.dataset.travelId);


  /* ===============================
     SELECCIONAR VIAJE
  =============================== */
  if (tab && !e.target.closest("button")) {

    setActiveTravelId(travelId);

    document.querySelectorAll(".travel-tab")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");
  }

  /* ===============================
     AGREGAR VIAJE
  =============================== */
  if (e.target.closest("[data-add-travel]")) {

    try {

      const newTravel = await createTravel({
        cliente_id: appState.activeClientId,
        destino: "Nuevo viaje"
      });

      setActiveTravelId(newTravel.id);

      await loadTravels();

    } catch (err) {
      console.error(err);
    }
  }

  /* ===============================
     GUARDAR VIAJE
  =============================== */
  if (e.target.closest("[data-save-travel]") && tab) {

    try {

      const title = tab.querySelector("[data-travel-title]").value;

      await updateTravel(travelId, {
        cliente_id: appState.activeClientId,
        destino: title
      });

      alert("Viaje guardado");

    } catch (err) {
      console.error(err);
    }
  }

  /* ===============================
     ELIMINAR VIAJE
  =============================== */
  if (e.target.closest("[data-delete-travel]") && tab) {

    if (!confirm("Eliminar viaje?")) return;

    try {

      await deleteTravel(travelId);

      if (Number(appState.activeTravelId) === travelId) {
        setActiveTravelId(null);
      }

      await loadTravels();

    } catch (err) {
      console.error(err);
    }
  }

  /* ===============================
     DUPLICAR VIAJE
  =============================== */
  if (e.target.closest("[data-duplicate-travel]") && tab) {

    try {

      const title = tab.querySelector("[data-travel-title]").value;

      const newTravel = await createTravel({
        cliente_id: appState.activeClientId,
        destino: `${title} copia`
      });

      setActiveTravelId(newTravel.id);

      await loadTravels();

    } catch (err) {
      console.error(err);
    }
  }

});
