import { apiFetch } from "./api.js";

document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-quote-save]")) return;

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

  try {
    await apiFetch("/cotizaciones", {
      method: "POST",
      body: JSON.stringify({
        ...basic,
        services
      })
    });

    alert("Cotización guardada correctamente");
  } catch (err) {
    console.error(err);
    alert("Error guardando cotización");
  }
});
