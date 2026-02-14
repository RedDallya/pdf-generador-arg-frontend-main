import { apiFetch } from "./api.js";
import { appState } from "./app.js";

document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-quote-save]")) return;

  if (!appState.currentTrip) {
    alert("Primero debés guardar el viaje");
    return;
  }

  const basic = {};
  document.querySelectorAll("[data-basic]").forEach(input => {
    basic[input.dataset.basic] = input.value;
  });

  const services = [];
  document.querySelectorAll(".service-card").forEach(card => {
    const service = {};
    card.querySelectorAll("[data-field]").forEach(input => {
      service[input.dataset.field] = input.value;
    });
    services.push(service);
  });

  await apiFetch("/cotizaciones", {
    method: "POST",
    body: JSON.stringify({
      ...basic,
      viaje_id: appState.currentTrip,   // 🔥 LA CLAVE
      services
    })
  });

  alert("Cotización guardada correctamente");
});
