import { appState } from "./state.js";
import { createEmptyTravel } from "./travels.js";
import "./travel-tabs.js";

/* MODULOS */
import "./clients.js";
import "./services.js";
import "./pdf.js";

/*************************************************
 * BOOTSTRAP APP
 *************************************************/
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {

  console.log("APP cargada");

  ensureDefaultTravel();

}


/*************************************************
 * DEFAULT TRAVEL
 *************************************************/
function ensureDefaultTravel() {

  if (!appState.travels) {
    appState.travels = {};
  }

  if (!appState.activeTravelId) {
    appState.activeTravelId = "travel_1";
  }

  if (!appState.travels[appState.activeTravelId]) {
    appState.travels[appState.activeTravelId] = createEmptyTravel();
  }

}
