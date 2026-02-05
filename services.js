

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