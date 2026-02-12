import { apiFetch } from "./api.js";

/************************************************************
 * GENERAR PDF
 ************************************************************/
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-pdf-generate]");
  if (!btn) return;

  const type = btn.dataset.pdfType || "partial";
  const cotizacionId = getActiveCotizacionId();
  if (!cotizacionId) return;

  try {
    // 1) Genera PDF en backend
    await apiFetch(`/pdfs/${type}?cotizacion_id=${cotizacionId}`, {
      method: "POST"
    });

    // 2) Abrimos el PDF ya autenticado por JWT
    window.open(`/api/pdfs/latest/${cotizacionId}`, "_blank");

    // 3) Refrescamos lista
    await loadPdfs(cotizacionId);

  } catch (err) {
    console.error("Error generando PDF", err);
    alert("No se pudo generar el PDF");
  }
});
async function loadPdfSections() {
  const id = getActiveCotizacionId();
  if (!id) return;

  const res = await apiFetch(`/pdf-sections/${id}`);
  const sections = await res.json();
  renderPdfSections(sections);
}
async function loadPdfs(cotizacionId) {
  const res = await apiFetch(`/pdfs/${cotizacionId}`);
  const pdfs = await res.json();
  renderPdfList(pdfs);
}
item.dataset.pdfUrl = pdf.url;

if (e.target.closest("[data-pdf-download]")) {
  const res = await apiFetch(item.dataset.pdfUrl);
  const blob = await res.blob();

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}
