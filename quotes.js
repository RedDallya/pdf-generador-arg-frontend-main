import { apiFetch } from "./api.js";
import { appState } from "./state.js";

/* =========================
   LISTAR COTIZACIONES
========================= */
async function loadQuotes() {
  if (!appState.activeTravelId) return;

  const res = await apiFetch(`/cotizaciones/viaje/${appState.activeTravelId}`);
  const quotes = await res.json();

  const container = document.getElementById("quotes-list");
  container.innerHTML = "";

  quotes.forEach(q => {
    container.innerHTML += `
      <div class="quote-item" style="border:1px solid #ccc;padding:10px;margin-bottom:8px;">
        <div class="quote-header" data-toggle="${q.id}" style="cursor:pointer;">
          <strong>${q.titulo}</strong>
        </div>
        <div class="quote-body" id="quote-${q.id}" style="display:none;margin-top:8px;">
          <div><strong>Condición legal:</strong> ${q.condicion_legal || "-"}</div>
          <div><strong>Total:</strong> ${q.total || "0.00"}</div>
          <button data-edit="${q.id}">Editar</button>
          <button data-delete="${q.id}">Eliminar</button>
        </div>
      </div>
    `;
  });

  await renderTravelHeader();
}


async function renderTravelHeader() {
  const res = await apiFetch(`/viajes/${appState.activeTravelId}`);
  const viaje = await res.json();

  const header = document.getElementById("travel-header");
  header.innerHTML = `
    <h3>Viaje #${viaje.id}</h3>
    <div>Cliente: ${viaje.cliente_nombre}</div>
    <div>Fecha: ${viaje.fecha}</div>
  `;

  // 🔥 rellenar cliente en formulario de cotización
  const clienteInput = document.querySelector('[data-basic="cliente_nombre"]');
  if (clienteInput) {
    clienteInput.value = viaje.cliente_nombre || "";
  }
}

/* =========================
   CREAR
========================= */
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

    await res.json();

    alert("Cotización guardada correctamente");

    await loadQuotes(); // 🔥 refresca lista

  } catch (err) {
    console.error("Error creando cotización:", err);
    alert("Error al guardar cotización");
  }
});

/* =========================
   ELIMINAR
========================= */
document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-delete]")) return;

  const id = e.target.dataset.delete;

  if (!confirm("¿Eliminar cotización?")) return;

  await apiFetch(`/cotizaciones/${id}`, {
    method: "DELETE"
  });

  await loadQuotes();
});

/* =========================
   EDITAR (mínimo)
========================= */
document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-edit]")) return;

  const id = e.target.dataset.edit;

  const nuevoTitulo = prompt("Nuevo título:");
  if (!nuevoTitulo) return;

  await apiFetch(`/cotizaciones/${id}`, {
    method: "PUT",
    body: JSON.stringify({ titulo: nuevoTitulo })
  });

  await loadQuotes();
});

/* =========================
   AUTOLOAD cuando cambia viaje
========================= */
document.addEventListener("travelChanged", loadQuotes);


document.addEventListener("click", (e) => {

const toggle = e.target.closest("[data-toggle]");
if (!toggle) return;

const id = toggle.dataset.toggle;


  const body = document.getElementById(`quote-${id}`);
  body.style.display = body.style.display === "none" ? "block" : "none";
});


document.addEventListener("DOMContentLoaded", () => {
  if (appState.activeTravelId) {
    loadQuotes();
  }
});
