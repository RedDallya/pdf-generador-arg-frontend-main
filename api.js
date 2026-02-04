// api.js

const API_BASE_URL = "https://pdf-generador-arg-backend-production.up.railway.app";
// luego lo cambiás por variable de entorno si querés

let authToken = null;

/******************************
 * AUTH
 ******************************/
export function setAuthToken(token) {
  authToken = token;
}

function getHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

/******************************
 * VIAJES
 ******************************/
export async function loadTravel(travelId) {
  const res = await fetch(`${API_BASE_URL}/travels/${travelId}`, {
    headers: getHeaders()
  });

  if (!res.ok) throw new Error("Error al cargar viaje");
  return await res.json();
}

export async function saveTravel(travelId, state) {
  const res = await fetch(`${API_BASE_URL}/travels/${travelId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(state)
  });

  if (!res.ok) throw new Error("Error al guardar viaje");
  return await res.json();
}
