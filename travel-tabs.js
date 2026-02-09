import { qs } from "./dom.js";
import { activeClientId } from "./state.js";
import {
  getTravelsByClient,
  createTravel,
  updateTravel,
  deleteTravel
} from "./api.js";

/************************************************
 * STATE LOCAL SOLO UI (NO PERSISTENTE)
 ************************************************/
let activeTravelId = null;
let travelsCache = [];

/************************************************
 * CUANDO CAMBIA CLIENTE → CARGAR VIAJES
 ************************************************/
document.addEventListener("change", async e => {

  if (!e.target.closest("[data-client-select]")) return;

  if (!activeClientId) return;

  await loadTravels(activeClientId);

});

/************************************************
 * LOAD VIAJES
 ************************************************/
async function loadTravels(clientId) {

  travelsCache = await getTravelsByClient(clientId);

  renderTravelTabs();

}

/************************************************
 * RENDER TABS
 ************************************************/
function renderTravelTabs() {

  const container = qs("[data-travel-tabs]");
  if (!container) return;

  container.innerHTML = "";

  travelsCache.forEach(travel => {

    const div = document.createElement("div");

    div.className = `travel-tab ${travel.id === activeTravelId ? "active" : ""}`;
    div.dataset.travelTabId = travel.id;

    div.innerHTML = `
      <input 
        type="text"
        class="form-control form-control-sm d-inline-block w-auto"
        value="${travel.destino || "Viaje"}"
        data-travel-title
      >

      <button class="btn btn-sm btn-outline-secondary" data-duplicate-travel>⧉</button>
      <button class="btn btn-sm btn-outline-success" data-add-travel>AGREGAR +</button>
      <button class="btn btn-sm btn-outline-success" data-save-travel>Guardar viaje</button>
      <button class="btn btn-sm btn-outline-danger" data-delete-travel>✕</button>
    `;

    container.appendChild(div);

  });

}

/************************************************
 * GLOBAL CLICK HANDLER
 ************************************************/
document.addEventListener("click", async e => {

  const tab = e.target.closest(".travel-tab");
  if (!tab) return;

  const travelId = Number(tab.dataset.travelTabId);

  /* -------------------------
     AGREGAR VIAJE
  ------------------------- */
  if (e.target.closest("[data-add-travel]")) {

    if (!activeClientId) {
      alert("Seleccioná un cliente primero");
      return;
    }

    const newTravel = await createTravel({
      cliente_id: activeClientId,
      estado: "borrador"
    });

    await loadTravels(activeClientId);

    activeTravelId = newTravel.id;

  }

  /* -------------------------
     GUARDAR VIAJE
  ------------------------- */
  if (e.target.closest("[data-save-travel]")) {

    const payload = {
      cliente_id: activeClientId,
      destino: qs('[data-basic="destination"]').value,
      fecha_inicio: qs('[data-basic="datestart"]').value,
      fecha_fin: qs('[data-basic="datesfin"]').value,
      pasajero: qs('[data-basic="passenger"]').value,
      tipo_viaje: qs('[data-basic="typetravel"]').value,
      estado: qs('[data-basic="status"]').value,
      notas: qs('[data-travel="notes"]').value
    };

    await updateTravel(travelId, payload);

    alert("Viaje guardado");

  }

  /* -------------------------
     ELIMINAR VIAJE
  ------------------------- */
  if (e.target.closest("[data-delete-travel]")) {

    if (!confirm("Eliminar viaje?")) return;

    await deleteTravel(travelId);

    await loadTravels(activeClientId);

  }

});

/************************************************
 * AUTO INIT SI YA HAY CLIENTE
 ************************************************/
document.addEventListener("DOMContentLoaded", () => {

  if (activeClientId) {
    loadTravels(activeClientId);
  }

});
