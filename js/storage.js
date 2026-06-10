/**
 * session.js
 *
 * Gestiona la sesión del administrador en el panel.
 * Guarda el token JWT y los datos del usuario en localStorage.
 */

const TOKEN_KEY = "xpup_admin_token";
const USER_KEY = "xpup_admin_user";

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isAuthenticated() {
  return !!getToken();
}

function isAdminUser() {
  const user = getCurrentUser();

  if (!user) {
    return false;
  }

  // Comprueba que el usuario tenga permisos administrativos.
  return user.rol === "ADMIN" || user.rol === "SUPERADMIN";
}

function redirectIfAlreadyLoggedIn() {
  // Evita mostrar el login si ya existe una sesión válida.
  if (isAuthenticated() && isAdminUser()) {
    window.location.href = "dashboard.html";
  }
}