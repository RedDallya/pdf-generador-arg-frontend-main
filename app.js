import { appState } from "./state.js";
import { loadState } from "./storage.js";
import { createEmptyTravel } from "./travels.js";

// Inicializadores de módulos
import "./clients.js";
import "./services.js";
import "./pdf.js";

/*************************************************
 * BOOTSTRAP APP
 *************************************************/
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  try {
    hydrateState();
    ensureDefaultTravel();

    console.log("App inicializada correctamente");
  } catch (error) {
    console.error("Error inicializando app:", error);
  }
}

/*************************************************
 * STATE HYDRATION
 *************************************************/
function hydrateState() {
  loadState();
}

/*************************************************
 * DEFAULT TRAVEL
 *************************************************/
function ensureDefaultTravel() {
  if (!appState.travels[appState.activeTravelId]) {
    appState.travels[appState.activeTravelId] = createEmptyTravel();
  }
}
