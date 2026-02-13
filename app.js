/* ================================
BOOTSTRAP APP FRONTEND
================================ */

import {
  setAuthToken,
  showApp,
  showLogin,
  login
} from "./api.js";

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
  initLoginForm();
  console.log("APP cargada correctamente");
}

/* ================================
RESTORE JWT SESSION
================================ */
function restoreSession() {
  const savedToken = localStorage.getItem("auth_token");

  if (savedToken) {
    setAuthToken(savedToken);
    showApp();
  } else {
    showLogin();
  }
}

/* ================================
LOGIN FORM
================================ */
function initLoginForm() {
  const form = document.querySelector("[data-login-form]");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector("[data-login-username]").value;
    const password = document.querySelector("[data-login-password]").value;

    try {
      await login(username, password);
    } catch (err) {
      alert("Credenciales incorrectas");
      console.error(err);
    }
  });
}

