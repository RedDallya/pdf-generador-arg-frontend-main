import { createTravel } from "./api.js";
import { appState } from "./state.js";

export async function ensureTravelExists() {
  if (appState.activeTravelId) return;

  if (!appState.activeClientId) {
    alert("Seleccioná un cliente primero");
    return;
  }

  const payload = {
    cliente_id: appState.activeClientId,
    titulo: "Viaje en creación",
    destino: "",
    fecha_inicio: null,
    fecha_fin: null
  };

  const travel = await createTravel(payload);

  appState.activeTravelId = travel.id;

  document.dispatchEvent(new Event("travel-selected"));
}
