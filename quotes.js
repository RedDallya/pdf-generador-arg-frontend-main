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
        <strong>${q.titulo}</strong>
        <div>ID: ${q.id}</div>
        <button data-edit="${q.id}">Editar</button>
        <button data-delete="${q.id}">Eliminar</button>
      </div>
    `;
  });
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
