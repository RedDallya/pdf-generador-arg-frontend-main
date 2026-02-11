import { API_BASE } from "./config.js";

/* =====================================
TOKEN STATE
===================================== */
let authToken = localStorage.getItem("auth_token") || null;
let refreshTokenValue = localStorage.getItem("refresh_token") || null;

export function setAuthToken(token) {
  authToken = token;
  localStorage.setItem("auth_token", token);
}

export function setRefreshToken(token) {
  refreshTokenValue = token;
  localStorage.setItem("refresh_token", token);
}

/* =====================================
RAW FETCH
===================================== */
async function rawFetch(endpoint, options = {}) {
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.status);
  }

  return res;
}

/* =====================================
INTERCEPTOR GLOBAL
===================================== */
export async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await rawFetch(endpoint, options);
    return res.json();
  } catch (err) {
    if (err.message.includes("401") && refreshTokenValue) {
      const r = await rawFetch("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      const data = await r.json();
      setAuthToken(data.accessToken);

      const retry = await rawFetch(endpoint, options);
      return retry.json();
    }

    throw err;
  }
}

/* =====================================
AUTH
===================================== */
export async function login(username, password) {
  const res = await fetchJSON("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  setAuthToken(res.accessToken);
  setRefreshToken(res.refreshToken);
  return res;
}

export function logout() {
  authToken = null;
  refreshTokenValue = null;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");
}

/* =====================================
UPLOADS (FORM DATA)
===================================== */
export function fetchForm(endpoint, formData) {
  return rawFetch(endpoint, {
    method: "POST",
    body: formData,
    headers: {}
  }).then(r => r.json());
}

/* =====================================
ENDPOINTS — CLIENTES
===================================== */
export const getClientes = () => fetchJSON("/api/clientes");
export const getCliente = id => fetchJSON(`/api/clientes/${id}`);
export const createCliente = data =>
  fetchJSON("/api/clientes", { method: "POST", body: JSON.stringify(data) });
export const updateCliente = (id, data) =>
  fetchJSON(`/api/clientes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCliente = id =>
  fetchJSON(`/api/clientes/${id}`, { method: "DELETE" });

/* =====================================
DOCUMENTOS CLIENTE
===================================== */
export const getClientDocuments = id =>
  fetchJSON(`/api/client-documents/${id}`);
export const createClientDocument = formData =>
  fetchForm("/api/client-documents", formData);

/* =====================================
VIAJES
===================================== */
export const getTravelsByClient = id =>
  fetchJSON(`/api/viajes/cliente/${id}`);
export const getTravelById = id =>
  fetchJSON(`/api/viajes/${id}`);
export const createTravel = data =>
  fetchJSON("/api/viajes", { method: "POST", body: JSON.stringify(data) });
export const updateTravel = (id, data) =>
  fetchJSON(`/api/viajes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTravel = id =>
  fetchJSON(`/api/viajes/${id}`, { method: "DELETE" });

/* =====================================
COTIZACIONES
===================================== */
export const getCotizacionesByViaje = id =>
  fetchJSON(`/api/cotizaciones/viaje/${id}`);
export const createCotizacion = data =>
  fetchJSON("/api/cotizaciones", { method: "POST", body: JSON.stringify(data) });
export const updateCotizacion = (id, data) =>
  fetchJSON(`/api/cotizaciones/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCotizacion = id =>
  fetchJSON(`/api/cotizaciones/${id}`, { method: "DELETE" });

/* =====================================
SERVICIOS
===================================== */
export const getServicios = id =>
  fetchJSON(`/api/servicios/cotizacion/${id}`);
export const createServicio = data =>
  fetchJSON("/api/servicios", { method: "POST", body: JSON.stringify(data) });
export const updateServicio = (id, data) =>
  fetchJSON(`/api/servicios/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteServicio = id =>
  fetchJSON(`/api/servicios/${id}`, { method: "DELETE" });

/* =====================================
PDFS
===================================== */
export const getPdfs = id => fetchJSON(`/api/pdfs/${id}`);
export const getPdfSections = id => fetchJSON(`/api/pdf-sections/${id}`);
