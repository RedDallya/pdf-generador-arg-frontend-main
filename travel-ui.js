import { updateTravel, getTravel, getCliente } from "./api.js";
import { appState } from "./state.js";

/*************************************
 * CARGAR FORMULARIO AL SELECCIONAR VIAJE
 *************************************/
document.addEventListener("travel-selected", loadTravelForm);

async function loadTravelForm() {

  clearTravelForm();

  if (!appState.activeTravelId) return;

  try {

    const travel = await getTravel(appState.activeTravelId);
    if (!travel) return;

    set("destino", travel.destino);
    set("fecha_inicio", travel.fecha_inicio);
    set("fecha_fin", travel.fecha_fin);
    set("pasajero", travel.pasajero);
    set("tipo_viaje", travel.tipo_viaje);
    set("estado", travel.estado);
    set("notas", travel.notas);

    await fillClientAssociated(travel.cliente_id);

  } catch (err) {
    console.error("Error cargando viaje", err);
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

  try {

    const cliente = await getCliente(clienteId);
    if (cliente) {
      set("cliente_nombre", cliente.nombre);
    }

  } catch (err) {
    console.error("Error cargando cliente asociado", err);
  }
}

/*************************************
 * CLIENTE CAMBIADO DESDE SECCIÓN CLIENTE
 *************************************/
document.addEventListener("client-selected", async () => {

  clearTravelForm();

  if (!appState.activeClientId) {
    set("cliente_nombre", "");
    return;
  }

  try {

    const cliente = await getCliente(appState.activeClientId);
    if (cliente) {
      set("cliente_nombre", cliente.nombre);
    }

  } catch (err) {
    console.error("Error sincronizando cliente", err);
  }

});

/*************************************
 * GUARDAR FORMULARIO VIAJE
 *************************************/
document.addEventListener("click", async e => {

  if (!e.target.closest("[data-travel-save]")) return;
  if (!appState.activeTravelId) return;

  try {

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

    document.dispatchEvent(new Event("travel-saved"));

    alert("Viaje guardado");

  } catch (err) {
    console.error("Error guardando viaje", err);
  }

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

/*************************************
 * LIMPIAR FORMULARIO
 *************************************/
export function clearTravelForm() {

  document.querySelectorAll("[data-travel]").forEach(el => {
    el.value = "";
  });

  // limpiar cliente asociado SI existe
  const clientField = document.querySelector('[data-travel="cliente_nombre"]');
  if (clientField) clientField.value = "";
}

document.addEventListener("travel-cleared", clearTravelForm);
