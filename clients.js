import { API_BASE } from "./config.js";
import { qs, val } from "./dom.js";
import { activeClientId } from "./state.js";

async function loadClients() {
  const res = await fetch(`${API_BASE}/api/clientes`);
  if (!res.ok) throw new Error("Error cargando clientes");
  const clients = await res.json();

  const select = qs("[data-client-select]");
  select.innerHTML = `<option value="">— Seleccionar cliente —</option>`;

  clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombre;
    select.appendChild(opt);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadClients();
  hideClientViews();
});

/************************************************************
 * SELECT CLIENTE
 ************************************************************/
document.addEventListener("change", async e => {
  const select = e.target.closest("[data-client-select]");
  if (!select) return;

  activeClientId = Number(select.value) || null;

  clearClientForm();
  hideClientViews();

  if (!activeClientId) return;

  const res = await fetch(`${API_BASE}/api/clientes`);

  if (!res.ok) throw new Error("Error clientes");

  const clients = await res.json();

  const client = clients.find(c => c.id === activeClientId); // FIX

  if (client) fillClientForm(client);

  await loadClientDocuments(activeClientId);
});


/************************************************************
 * GUARDAR CLIENTE (FICHA)
 ************************************************************/
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-client-doc-save]");
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

  const saved = await res.json();
  activeClientId = saved.id;

  await loadClients();
  qs("[data-client-select]").value = saved.id;
});

/************************************************************
 * DOCUMENTACIÓN CLIENTE
 ************************************************************/
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-doc-save]");
  if (!btn || !activeClientId) return;

  await fetch(`${API_BASE}/api/client-documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: activeClientId,
      type: docVal("type"),
      number: docVal("number"),
      expiry: docVal("expiry"),
      notes: docVal("notes")
    })
  });

  loadClientDocuments(activeClientId);
});

async function loadClientDocuments(clientId) {
  const res = await fetch(`${API_BASE}/api/client-documents/${clientId}`);

  if (!res.ok) throw new Error("Error documentos cliente");
  const docs = await res.json();

  const list = qs("[data-doc-list]");
  list.innerHTML = "";

  docs.forEach(d => {
    const div = document.createElement("div");
    div.className = "border rounded p-2 mb-2";
    div.innerHTML = `<strong>${d.type}</strong> – ${d.number}<br><small>${d.notes || ""}</small>`;
    list.appendChild(div);
  });
}

/************************************************************
 * CLIENT NAV (FICHA / DOCS)
 ************************************************************/
function hideClientViews() {
  qs(".client-card")?.classList.add("hidden");
  qs('[data-client-section="documentacion"]')?.classList.add("hidden");
}

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-client-tab]");
  if (!btn) return;

  const tab = btn.dataset.clientTab;

  hideClientViews();

  if (tab === "ficha") qs(".client-card")?.classList.remove("hidden");
  if (tab === "documentacion") {
    qs(".client-card")?.classList.remove("hidden");
    qs('[data-client-section="documentacion"]')?.classList.remove("hidden");
  }

  document.querySelectorAll("[data-client-tab]")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
});

/************************************************************
 * FORM HELPERS
 ************************************************************/
function fillClientForm(c) {
  set("id", c.id);
  set("name", c.nombre);
  set("phone", c.telefono);
  set("email", c.email);
  set("location", c.location);
  set("tags", c.tags);
  set("notes", c.notas);
  set("created", c.created_at);
}


function clearClientForm() {
  ["id", "name", "phone", "email", "location", "tags", "notes", "created"]
    .forEach(k => set(k, ""));
}

function set(key, value) {
  const el = document.querySelector(`[data-client="${key}"]`);
  if (el) el.value = value || "";
}