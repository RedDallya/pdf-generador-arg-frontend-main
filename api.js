import { API_BASE } from "./config.js";

/******************************
 * AUTH TOKEN STATE
 ******************************/
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

// ✅ BIEN
export function getTravelsByClient(clientId) {
  return fetchJSON(`/api/viajes/cliente/${clientId}`);
}

/******************************
 * HEADERS BUILDER
 ******************************/
function getHeaders(extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

/******************************
 * GENERIC FETCH WRAPPER
 ******************************/
export async function fetchJSON(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: getHeaders(options.headers),
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }

  return res.json();
}


export function createTravel(data) {
  return fetchJSON("/api/viajes", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateTravel(id, data) {
  return fetchJSON(`/api/viajes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function deleteTravel(id) {
  return fetchJSON(`/api/viajes/${id}`, {
    method: "DELETE"
  });
}


/******************************
 * CLIENTES
 ******************************/

export function getClientes() {
  return fetchJSON("/api/clientes");
}

export function getCliente(id) {
  return fetchJSON(`/api/clientes/${id}`);
}

export function createCliente(data) {
  return fetchJSON("/api/clientes", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateCliente(id, data) {
  return fetchJSON(`/api/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function deleteCliente(id) {
  return fetchJSON(`/api/clientes/${id}`, {
    method: "DELETE"
  });
}

/******************************
 * DOCUMENTOS CLIENTE
 ******************************/

export function getClientDocuments(clientId) {
  return fetchJSON(`/api/client-documents/${clientId}`);
}

export function createClientDocument(data) {
  return fetchJSON("/api/client-documents", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

/******************************
 * PDFS
 ******************************/

export function generatePdf(type, cotizacionId) {
  window.open(
    `${API_BASE}/api/pdfs/${type}?cotizacion_id=${cotizacionId}`,
    "_blank"
  );
}

export function getPdfs(cotizacionId) {
  return fetchJSON(`/api/pdfs/${cotizacionId}`);
}

export function getPdfSections(cotizacionId) {
  return fetchJSON(`/api/pdf-sections/${cotizacionId}`);
}

export function getTravelById(id) {
  return fetchJSON(`/api/viajes/${id}`);
}
