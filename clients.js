import { API_BASE } from "./config.js";
import { qs, val } from "./dom.js";
import { appState, setActiveClientId } from "./state.js";
import { loadTravels } from "./travel-tabs.js";
/********************************
INIT
*********************************/
document.addEventListener("DOMContentLoaded", async () => {
  await loadClients();
});

/********************************
LOAD CLIENTES
*********************************/
export async function loadClients() {

  const res = await fetch(`${API_BASE}/api/clientes`);
  if (!res.ok) return console.error("Error cargando clientes");

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

  if (!id) return clearClientForm();

  const res = await fetch(`${API_BASE}/api/clientes/${id}`);
  if (!res.ok) return alert("Error cargando cliente");

  const client = await res.json();

  fillClientForm(client);
  loadClientDocuments(id);
  loadTravels();

});

/********************************
GLOBAL CLICK HANDLER
*********************************/
document.addEventListener("click", async e => {

  /* NUEVO CLIENTE */
  if (e.target.closest("[data-client-new]")) {
    setActiveClientId(null);
    clearClientForm();
  }

  /* GUARDAR CLIENTE */
  if (e.target.closest("[data-client-save]")) {

    const payload = {
      nombre: val("name"),
      telefono: val("phone"),
      email: val("email"),
      notas: val("notes"),
      status: val("status"),
      location: val("location"),
      created_at: val("created")
    };

    const res = await fetch(
      appState.activeClientId
        ? `${API_BASE}/api/clientes/${appState.activeClientId}`
        : `${API_BASE}/api/clientes`,
      {
        method: appState.activeClientId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) return alert("Error guardando cliente");

    const saved = await res.json();
    const clientId = saved.id || appState.activeClientId;

    setActiveClientId(clientId);

    await loadClients();

    qs("[data-client-select]").value = clientId;

    const full = await fetch(`${API_BASE}/api/clientes/${clientId}`);
    fillClientForm(await full.json());
  }

  /* ELIMINAR CLIENTE */
  if (e.target.closest("[data-client-delete]")) {

    if (!appState.activeClientId) return;
    if (!confirm("Eliminar cliente?")) return;

    const res = await fetch(`${API_BASE}/api/clientes/${appState.activeClientId}`, {
      method: "DELETE"
    });

    if (!res.ok) return alert("Error eliminando cliente");

    setActiveClientId(null);
    clearClientForm();
    loadClients();
  }

  /* GUARDAR DOCUMENTO */
  if (e.target.closest("[data-doc-save]")) {

    if (!appState.activeClientId) return alert("Seleccioná cliente");

    const formData = new FormData();

    formData.append("client_id", appState.activeClientId);
    formData.append("type", qs('[data-doc="type"]').value);
    formData.append("number", qs('[data-doc="number"]').value);
    formData.append("expiry", qs('[data-doc="expiry"]').value);
    formData.append("notes", qs('[data-doc="notes"]').value);

    const fileInput = qs('[data-doc="files"]');

    if (fileInput.files[0]) {
      formData.append("file", fileInput.files[0]);
    }

    await fetch(`${API_BASE}/api/client-documents`, {
      method: "POST",
      body: formData
    });

    loadClientDocuments(appState.activeClientId);
    clearDocForm();
  }

  /* ELIMINAR DOCUMENTO */
  const deleteBtn = e.target.closest("[data-doc-delete]");
  if (deleteBtn) {

    if (!confirm("Eliminar documento?")) return;

    await fetch(`${API_BASE}/api/client-documents/${deleteBtn.dataset.docDelete}`, {
      method: "DELETE"
    });

    loadClientDocuments(appState.activeClientId);
  }
});

/********************************
DOCUMENTOS
*********************************/
async function loadClientDocuments(clientId) {

  const res = await fetch(`${API_BASE}/api/client-documents/${clientId}`);
  if (!res.ok) return;

  const docs = await res.json();

  const list = qs("[data-doc-list]");
  if (!list) return;

  list.innerHTML = "";

  docs.forEach(d => {

    const div = document.createElement("div");

    div.innerHTML = `
      <div class="border p-2 mb-2">
        <strong>${d.type}</strong> - ${d.number}

        ${d.file_name
        ? `<a href="${API_BASE}${d.file_path}" target="_blank">
              📎 ${d.file_name}
             </a>`
        : ""
      }

        <button data-doc-delete="${d.id}">Eliminar</button>
      </div>
    `;

    list.appendChild(div);
  });
}

/********************************
FORM HELPERS
*********************************/
function fillClientForm(c) {
  set("id", c.id);
  set("name", c.nombre);
  set("phone", c.telefono);
  set("email", c.email);
  set("notes", c.notas);
  set("status", c.status);
  set("location", c.location);
  set("created", c.created_at);
}

function clearClientForm() {
  ["id", "name", "phone", "email", "notes", "status", "location", "created"]
    .forEach(k => set(k, ""));
}

function clearDocForm() {
  ["type", "number", "expiry", "notes"].forEach(k => {
    const el = qs(`[data-doc="${k}"]`);
    if (el) el.value = "";
  });
}

function set(key, value) {
  const el = document.querySelector(`[data-client="${key}"]`);
  if (el) el.value = value || "";
}
