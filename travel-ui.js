import { updateTravel, getTravel, getCliente } from "./api.js";
import { appState } from "./state.js";

/*************************************
 * CARGAR FORMULARIO AL SELECCIONAR VIAJE
 *************************************/
document.addEventListener("travel-selected", loadTravelForm);

async function loadTravelForm() {

  if (!appState.activeTravelId) return;

  const travel = await getTravel(appState.activeTravelId);

  if (!travel) return;

  set("destino", travel.destino);
  set("fecha_inicio", travel.fecha_inicio);
  set("fecha_fin", travel.fecha_fin);
  set("pasajero", travel.pasajero);
  set("tipo_viaje", travel.tipo_viaje);
  set("estado", travel.estado);
  set("notas", travel.notas);

  /* cliente asociado */
  if (travel.cliente_id) {
    await fillClientAssociated(travel.cliente_id);
  }
}

/*************************************
 * SINCRONIZAR CLIENTE ASOCIADO
 *************************************/
async function fillClientAssociated(clienteId) {

  if (!clienteId) {
    set("cliente_nombre", "");
    return;
  }

  const cliente = await getCliente(clienteId);

  if (cliente) {
    set("cliente_nombre", cliente.nombre);
  }
}

/*************************************
 * CLIENTE CAMBIADO DESDE SECCIÓN CLIENTE
 *************************************/
document.addEventListener("client-selected", async () => {

  if (!appState.activeClientId) {
    set("cliente_nombre", "");
    return;
  }

  const cliente = await getCliente(appState.activeClientId);

  if (cliente) {
    set("cliente_nombre", cliente.nombre);
  }
});

/*************************************
 * GUARDAR FORMULARIO VIAJE
 *************************************/
document.addEventListener("click", async e => {

  if (!e.target.closest("[data-travel-save]")) return;
  if (!appState.activeTravelId) return;

  const payload = {
    cliente_id: appState.activeClientId,
    destino: val("destino"),
    fecha_inicio: val("fecha_inicio"),
    fecha_fin: val("fecha_fin"),
    pasajero: val("pasajero"),
    tipo_viaje: val("tipo_viaje"),
    estado: val("estado"),
    notas: val("notas")
  };

  await updateTravel(appState.activeTravelId, payload);

  /* refrescar tabs */
  document.dispatchEvent(new Event("travel-saved"));

  alert("Viaje guardado");
});

/*************************************
 * HELPERS
 *************************************/
function val(key) {
  return document.querySelector(`[data-travel="${key}"]`)?.value || null;
}

function set(key, value) {
  const el = document.querySelector(`[data-travel="${key}"]`);
  if (el) el.value = value ?? "";
}

export function clearTravelForm() {

  document.querySelectorAll("[data-travel]").forEach(el => {
    el.value = "";
  });

}
