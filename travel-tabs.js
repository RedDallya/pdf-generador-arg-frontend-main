import {
  getTravelsByClient,
  createTravel,
  updateTravel,
  deleteTravel
} from "./api.js";

import { activeClientId } from "./state.js";

/************************************************
LOAD TRAVELS
*************************************************/
export async function loadTravels() {

  if (!activeClientId) return;

  const travels = await getTravelsByClient(activeClientId);

  const container = document.querySelector("[data-travel-tabs]");
  container.innerHTML = "";

  travels.forEach(t => renderTravelTab(t));
}


/************************************************
RENDER TAB
*************************************************/
function renderTravelTab(travel) {

  const container = document.querySelector("[data-travel-tabs]");

  const div = document.createElement("div");

  div.className = "travel-tab";
  div.dataset.travelId = travel.id;

  div.innerHTML = `
    <input 
      type="text"
      class="form-control form-control-sm d-inline-block w-auto"
      value="${travel.destino || "Viaje"}"
      data-travel-title
    >

    <button class="btn btn-sm btn-outline-secondary" data-duplicate-travel>
      ⧉
    </button>

    <button class="btn btn-sm btn-outline-success" data-add-travel>
      AGREGAR +
    </button>

    <button class="btn btn-sm btn-outline-success" data-save-travel>
      Guardar viaje
    </button>

    <button class="btn btn-sm btn-outline-danger" data-delete-travel>
      ✕
    </button>
  `;

  container.appendChild(div);
}


/************************************************
GLOBAL CLICK HANDLER
*************************************************/
document.addEventListener("click", async e => {

  if (!activeClientId) {
    alert("Seleccioná un cliente primero");
    return;
  }

  const tab = e.target.closest(".travel-tab");
  const travelId = tab?.dataset.travelId;

  /* ===============================
     AGREGAR VIAJE
  =============================== */

  if (e.target.closest("[data-add-travel]")) {

    const newTravel = await createTravel({
      cliente_id: activeClientId,
      destino: "Nuevo viaje"
    });

    await loadTravels();
  }

  /* ===============================
     GUARDAR VIAJE
  =============================== */

  if (e.target.closest("[data-save-travel]")) {

    const title = tab.querySelector("[data-travel-title]").value;

    await updateTravel(travelId, {
      destino: title,
      cliente_id: activeClientId
    });

    alert("Viaje guardado");
  }

  /* ===============================
     ELIMINAR VIAJE
  =============================== */

  if (e.target.closest("[data-delete-travel]")) {

    if (!confirm("Eliminar viaje?")) return;

    await deleteTravel(travelId);

    await loadTravels();
  }

  /* ===============================
     DUPLICAR VIAJE
  =============================== */

  if (e.target.closest("[data-duplicate-travel]")) {

    const title = tab.querySelector("[data-travel-title]").value;

    await createTravel({
      cliente_id: activeClientId,
      destino: title + " copia"
    });

    await loadTravels();
  }

});
