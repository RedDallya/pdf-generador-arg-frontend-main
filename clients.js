import { API_BASE } from "./config.js";
import { qs, val } from "./dom.js";
import { activeClientId, setActiveClientId } from "./state.js";

/********************************
INIT
*********************************/
document.addEventListener("DOMContentLoaded", initClients);

async function initClients() {
  await loadClients();
}

/********************************
BOTON NUEVO CLIENTE
*********************************/
document.addEventListener("click", e => {

  if (e.target.closest("[data-client-new]")) {
    setActiveClientId(null);
    clearClientForm();
  }

});

/********************************
LOAD CLIENTES
*********************************/
export async function loadClients() {

  const res = await fetch(`${API_BASE}/api/clientes`);

  if (!res.ok) {
    console.error("Error cargando clientes");
    return;
  }

  const clients = await res.json();

  const select = qs("[data-client-select]");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccionar cliente</option>`;

  clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombre;
    select.appendChild(opt);
  });
}

/********************************
SELECT CLIENTE
*********************************/
document.addEventListener("change", async e => {

  const select = e.target.closest("[data-client-select]");
  if (!select) return;

  const id = Number(select.value);
  setActiveClientId(id);

  if (!id) {
    clearClientForm();
    return;
  }

  const res = await fetch(`${API_BASE}/api/clientes/${id}`);

  if (!res.ok) {
    alert("Error cargando cliente");
    return;
  }

  const client = await res.json();

  fillClientForm(client);

});

/********************************
CREAR / EDITAR CLIENTE
*********************************/
document.addEventListener("click", async e => {

  const btn = e.target.closest("[data-client-save]");
  if (!btn) return;

  const payload = {
    nombre: val("name"),
    telefono: val("phone"),
    email: val("email"),
    notas: val("notes")
  };

  const res = await fetch(
    activeClientId
      ? `${API_BASE}/api/clientes/${activeClientId}`
      : `${API_BASE}/api/clientes`,
    {
      method: activeClientId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    alert("Error guardando cliente");
    return;
  }

  const saved = await res.json();

  const clientId = saved.id || activeClientId;

  setActiveClientId(clientId);

  await loadClients();

  const select = qs("[data-client-select]");
  if (select) select.value = clientId;

  // 🔥 REFETCH CLIENTE COMPLETO
  const fullClientRes = await fetch(`${API_BASE}/api/clientes/${clientId}`);
  const fullClient = await fullClientRes.json();

  fillClientForm(fullClient);

});

/********************************
ELIMINAR CLIENTE
*********************************/
document.addEventListener("click", async e => {

  const btn = e.target.closest("[data-client-delete]");
  if (!btn || !activeClientId) return;

  if (!confirm("Eliminar cliente?")) return;

  const res = await fetch(`${API_BASE}/api/clientes/${activeClientId}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Error eliminando cliente");
    return;
  }

  setActiveClientId(null);
  clearClientForm();
  loadClients();
});

/********************************
FORM HELPERS
*********************************/
function fillClientForm(c) {

  set("id", c.id);
  set("name", c.nombre);
  set("phone", c.telefono);
  set("email", c.email);
  set("notes", c.notas);

}

function clearClientForm() {
  ["id","name","phone","email","notes"].forEach(k => set(k,""));
}

function set(key,value) {
  const el = document.querySelector(`[data-client="${key}"]`);
  if (el) el.value = value || "";
}
