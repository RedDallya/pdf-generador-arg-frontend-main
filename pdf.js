/************************************************************
 * PDF GENERACIÓN
 ************************************************************/
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-pdf-generate]");
  if (!btn) return;

  const type = btn.dataset.pdfType || "partial";
  const cotizacionId = getActiveCotizacionId();
  if (!cotizacionId) return;

  try {
    // 1) Pedimos al backend que genere el PDF (protegido por JWT header)
    await apiFetch(
      `${API_BASE}/api/pdfs/${type}?cotizacion_id=${cotizacionId}`
    );

    // 2) Abrimos el último PDF ya generado (con token por query para descarga directa)
    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Sesión expirada");
      window.location.href = "/login.html";
      return;
    }

    const url =
      `${API_BASE}/api/pdfs/latest/${cotizacionId}?token=${token}`;

    window.open(url, "_blank", "noopener");

    // 3) Refrescamos la lista real
    await loadPdfs(cotizacionId);

  } catch (err) {
    console.error("Error generando PDF", err);
    alert("No se pudo generar el PDF");
  }
});


/************************************************************
 * PDF BUILDER – SECTIONS
 ************************************************************/
async function loadPdfSections() {
  try {
    const id = getActiveCotizacionId();
    if (!id) return;

    const res = await apiFetch(`${API_BASE}/api/pdf-sections/${id}`);
    const sections = await res.json();
    renderPdfSections(sections);

  } catch (err) {
    console.error("Error cargando secciones PDF", err);
  }
}

function renderPdfSections(sections) {
  const list = qs("[data-pdf-sections-list]");
  const tpl = document.getElementById("pdf-section-template");
  if (!list || !tpl) return;

  list.innerHTML = "";

  sections.forEach(section => {
    const node = tpl.content.cloneNode(true);
    node.querySelector("[data-pdf-section-title]").textContent = section.titulo;
    list.appendChild(node);
  });
}


/************************************************************
 * PDFs LIST
 ************************************************************/
async function loadPdfs(cotizacionId) {
  try {
    const res = await apiFetch(`${API_BASE}/api/pdfs/${cotizacionId}`);
    const pdfs = await res.json();
    renderPdfList(pdfs);
  } catch (err) {
    console.error("Error cargando PDFs", err);
  }
}

function renderPdfList(pdfs) {
  const list = document.querySelector("[data-pdf-list]");
  const tpl = document.getElementById("pdf-item-template");
  if (!list || !tpl) return;

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


/************************************************************
 * PDF ACTIONS (download / whatsapp / email)
 ************************************************************/
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
