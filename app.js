let activeTravelId = null;
let activeClientId = null;

/************************************************************
 * CONFIG API BASE (FIX BACKEND URL)
 ************************************************************/
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://pdf-generador-arg-backend-production-90a5.up.railway.app";

/************************************************************
 * ESTADO GLOBAL (SE MANTIENE)
 ************************************************************/
const STORAGE_KEY = "travel_app_state_v1";

const appState = {
  travels: {},
  activeTravelId: "travel_1"
};

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }

  return res.json();
}

/************************************************************
 * UTILIDADES GENERALES
 ************************************************************/
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    Object.assign(appState, JSON.parse(saved));
  } catch {
    console.warn("Estado inválido, se ignora");
  }
}

function getActiveTravel() {
  return appState.travels[appState.activeTravelId];
}

/************************************************************
 * FIX CRÍTICO — DEVOLVER ID
 ************************************************************/
function getActiveCotizacionId() {
  const input = document.querySelector('[data-basic="idpresupuesto"]');

  if (!input || !input.value) {
    alert("Debe ingresar ID de cotización");
    return null;
  }

  return input.value; // ← ESTO FALTABA
}

function qs(sel) {
  return document.querySelector(sel);
}

function val(key) {
  return document.querySelector(`[data-client="${key}"]`)?.value || "";
}

function docVal(key) {
  return document.querySelector(`[data-doc="${key}"]`)?.value || "";
}

/************************************************************
 * MODELO DE VIAJE (SE MANTIENE)
 ************************************************************/
function createEmptyTravel() {
  return {
    client: { id: null, data: null },
    basic: {},
    sections: {
      cotizaciones: {
        enabled: false,
        categorias: {
          hotel: { enabled: false, servicios: [] },
          aereo: { enabled: false, servicios: [] }
        }
      },
      operadores: { enabled: false },
      vouchers: { enabled: false },
      itinerario: { enabled: false }
    }
  };
}

/************************************************************
 * INIT
 ************************************************************/
if (!appState.travels.travel_1) {
  appState.travels.travel_1 = createEmptyTravel();
}
loadState();

/************************************************************
 * TRAVEL NAV (SECCIONES DEL VIAJE)
 ************************************************************/
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-travel-tab]");
  if (!btn) return;

  const tab = btn.dataset.travelTab;

  document.querySelectorAll("[data-travel-tab]")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.querySelectorAll("[data-section]")
    .forEach(sec => sec.classList.add("hidden"));

  document.querySelector(`[data-section="${tab}"]`)
    ?.classList.remove("hidden");
});

/************************************************************
 * SWITCHES DE SECCIONES
 ************************************************************/
document.addEventListener("change", e => {
  const toggle = e.target.closest("[data-toggle]");
  if (!toggle) return;

  const section = toggle.closest("[data-section]");
  const body = section?.querySelector(".section-body");
  if (!body) return;

  body.classList.toggle("hidden", !toggle.checked);

  const travel = getActiveTravel();
  if (travel?.sections?.[section.dataset.section]) {
    travel.sections[section.dataset.section].enabled = toggle.checked;
    saveState();
  }
});

/************************************************************
 * SWITCHES DE CATEGORÍAS
 ************************************************************/
document.addEventListener("change", e => {
  const toggle = e.target.closest("[data-category-toggle]");
  if (!toggle) return;

  const category = toggle.closest("[data-category]");
  const body = category?.querySelector(".category-body");
  if (!body) return;

  body.classList.toggle("hidden", !toggle.checked);

  const travel = getActiveTravel();
  const key = category.dataset.category;

  if (travel?.sections?.cotizaciones?.categorias?.[key]) {
    travel.sections.cotizaciones.categorias[key].enabled = toggle.checked;
    saveState();
  }
});


/************************************************************
 * PDF GENERACIÓN
 ************************************************************/
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-pdf-generate]");
  if (!btn) return;

  const type = btn.dataset.pdfType || "partial";
  const cotizacionId = getActiveCotizacionId();

  if (!cotizacionId) return; // FIX

  const url = `${API_BASE}/api/pdfs/${type}?cotizacion_id=${cotizacionId}`;

  window.open(url, "_blank", "noopener");

  setTimeout(() => loadPdfs(cotizacionId), 1000);
});






/************************************************************
 * PDF BUILDER – RENDER
 ************************************************************/
function loadPdfSections() {
  const id = getActiveCotizacionId();
  if (!id) return;

  fetch(`${API_BASE}/api/pdf-sections/${id}`)
    .then(r => r.json())
    .then(renderPdfSections);
}


function renderPdfSections(sections) {
  const list = qs("[data-pdf-sections-list]");
  const tpl = document.getElementById("pdf-section-template");
  list.innerHTML = "";

  sections.forEach(section => {
    const node = tpl.content.cloneNode(true);
    node.querySelector("[data-pdf-section-title]").textContent = section.titulo;
    list.appendChild(node);
  });
}

/************************************************************
 * CLIENTES
 ************************************************************/
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

/************************************************************
 * SERVICIOS – AGREGAR / ELIMINAR / CALCULAR
 ************************************************************/

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-add-service]");
  if (!btn) return;

  const categoryKey = btn.dataset.addService; // hotel, aereo, etc
  const category = btn.closest("[data-category]");
  if (!category) return;

  const list = category.querySelector(".services-list");
  const tpl = document.getElementById("service-template");
  if (!tpl || !list) return;

  const node = tpl.content.cloneNode(true);
  const serviceEl = node.querySelector(".service-card");

  // ID único frontend
  serviceEl.dataset.serviceId = crypto.randomUUID();

  // Botón eliminar
  serviceEl.querySelector("[data-remove]").addEventListener("click", () => {
    serviceEl.remove();
    updateTotals();
  });

  // Inputs que afectan subtotal
  serviceEl.querySelectorAll('[data-field="precio"], [data-field="adultos"], [data-field="menores"]')
    .forEach(input => {
      input.addEventListener("input", () => {
        updateServiceSubtotal(serviceEl);
        updateTotals();
      });
    });

  // Cambio de tipo → mostrar específicos
  const tipoSelect = serviceEl.querySelector('[data-field="tipo"]');
  tipoSelect.addEventListener("change", () => {
    serviceEl.querySelectorAll(".service-specific")
      .forEach(div => div.classList.add("hidden"));

    const specific = serviceEl.querySelector(
      `.service-specific[data-specific="${tipoSelect.value}"]`
    );
    if (specific) specific.classList.remove("hidden");
  });

  list.appendChild(node);
});

/************************************************************
 * SUBTOTAL POR SERVICIO
 ************************************************************/
function updateServiceSubtotal(serviceEl) {
  const precio = Number(serviceEl.querySelector('[data-field="precio"]')?.value || 0);
  const adultos = Number(serviceEl.querySelector('[data-field="adultos"]')?.value || 0);
  const menores = Number(serviceEl.querySelector('[data-field="menores"]')?.value || 0);

  const subtotal = precio * (adultos + menores);
  const subtotalInput = serviceEl.querySelector('[data-field="subtotal"]');

  if (subtotalInput) {
    subtotalInput.value = subtotal.toFixed(2);
  }
}

/************************************************************
 * TOTALES GENERALES
 ************************************************************/
function updateTotals() {
  const totals = {};

  document.querySelectorAll("[data-category]").forEach(category => {
    const key = category.dataset.category;
    let sum = 0;

    category.querySelectorAll('[data-field="subtotal"]').forEach(input => {
      sum += Number(input.value || 0);
    });

    totals[key] = sum;

    const totalEl = document.querySelector(`[data-total-category="${key}"]`);
    if (totalEl) {
      totalEl.textContent = `USD ${sum.toFixed(2)}`;
    }
  });

  const totalGeneral = Object.values(totals)
    .reduce((acc, n) => acc + n, 0);

  const totalGeneralEl = document.querySelector("[data-total-general]");
  if (totalGeneralEl) {
    totalGeneralEl.textContent = `USD ${totalGeneral.toFixed(2)}`;
  }
}



async function loadPdfs(cotizacionId) {
  const res = await fetch(`${API_BASE}/api/pdfs/${cotizacionId}`);
  if (!res.ok) throw new Error("Error PDFs");
  const pdfs = await res.json();
  renderPdfList(pdfs);
}
function renderPdfList(pdfs) {
  const list = document.querySelector("[data-pdf-list]");
  const tpl = document.getElementById("pdf-item-template");
  list.innerHTML = "";

  pdfs.forEach(pdf => {
    const node = tpl.content.cloneNode(true);
    const item = node.querySelector(".pdf-item");

  item.dataset.pdfUrl = pdf.url.startsWith("http")
  ? pdf.url
  : `${API_BASE}${pdf.url}`;


    item.dataset.pdfName = pdf.nombre;

    node.querySelector("[data-pdf-name]").textContent = pdf.nombre;
    node.querySelector("[data-pdf-meta]").textContent =
      new Date(pdf.created_at).toLocaleString();

    list.appendChild(node);
  });
}

document.addEventListener("click", e => {
  const item = e.target.closest(".pdf-item");
  if (!item) return;

  const url = item.dataset.pdfUrl;
  const name = item.dataset.pdfName;

  if (e.target.closest("[data-pdf-download]")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }

  if (e.target.closest("[data-pdf-whatsapp]")) {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        "Te comparto el PDF:\n" + url

      )}`,
      "_blank"
    );
  }

  if (e.target.closest("[data-pdf-email]")) {
    window.location.href =
      `mailto:?subject=Documentación de viaje&body=${encodeURIComponent(
        "PDF del viaje:\n" + url

      )}`;
  }
});


