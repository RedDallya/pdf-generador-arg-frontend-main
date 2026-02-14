import { apiFetch } from "./api.js";
import { appState } from "./state.js";

document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-quote-save]")) return;

  if (!appState.activeTravelId) {
    alert("Primero debés seleccionar o crear un viaje");
    return;
  }

  try {
    const payload = {
      viaje_id: appState.activeTravelId,
      titulo: document.querySelector('[data-basic="titulo"]')?.value || "",
      condicion_legal: document.querySelector('[data-basic="condicion_legal"]')?.value || ""
    };

    const res = await apiFetch("/cotizaciones", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    const cotizacionId = data.id;

    alert("Cotización guardada correctamente");

  } catch (err) {
    console.error("Error creando cotización:", err);
    alert("Error al guardar cotización");
  }
});
