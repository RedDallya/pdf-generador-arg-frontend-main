/* ================================
BOOTSTRAP APP FRONTEND
================================ */

import { setAuthToken } from "./api.js";

/* UI / módulos funcionales */
import "./travel-tabs.js";
import "./travel-ui.js";
import "./clients.js";
import "./services.js";
import "./pdf.js";

/* ================================
INIT
================================ */
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  restoreSession();
  console.log("APP cargada correctamente");
}

/* ================================
RESTORE JWT SESSION
================================ */
function restoreSession() {
  const savedToken = localStorage.getItem("auth_token");
  if (savedToken) {
    setAuthToken(savedToken);
  }
}
