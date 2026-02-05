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


