/**
 * layout.js
 *
 * Gestiona la estructura común del panel de administración.
 * Comprueba el acceso, renderiza el menú lateral y muestra la barra superior.
 */

function requireAdminPage() {
  // Redirige al login si el usuario no está autenticado o no es administrador.
  if (!isAuthenticated() || !isAdminUser()) {
    clearSession();
    window.location.href = "index.html";
  }
}

function renderAdminLayout(activePage, pageTitle) {
  requireAdminPage();
  renderSidebar(activePage);
  renderTopbar(pageTitle);
}

function renderSidebar(activePage) {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) {
    return;
  }

  // Genera el menú lateral y marca como activa la sección actual.
  sidebar.innerHTML = `
    <div class="sidebar-brand mb-4">
      <div class="sidebar-logo">XP</div>
      <div>
        <div class="sidebar-title">XP-Up</div>
        <div class="sidebar-subtitle">Admin Panel</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <a href="dashboard.html" class="${activePage === "dashboard" ? "active" : ""}">
        Dashboard
      </a>

      <a href="users.html" class="${activePage === "users" ? "active" : ""}">
        Usuarios
      </a>

      <a href="posts.html" class="${activePage === "posts" ? "active" : ""}">
        Publicaciones
      </a>

      <a href="comments.html" class="${activePage === "comments" ? "active" : ""}">
        Comentarios
      </a>

      <a href="operations.html" class="${activePage === "operations" ? "active" : ""}">
        Operaciones
      </a>
    </nav>
  `;
}

function renderTopbar(pageTitle) {
  const topbar = document.getElementById("topbar");

  if (!topbar) {
    return;
  }

  const user = getCurrentUser();

  // Muestra el título de la página y la información del administrador.
  topbar.innerHTML = `
    <div>
      <h1 class="h4 mb-1">${pageTitle}</h1>
      <p class="text-muted mb-0">Panel de administración de XP-Up</p>
    </div>

    <div class="d-flex align-items-center gap-3">
      <div class="admin-user-pill">
        <span class="admin-user-name">${user.nombreUsuario}</span>
        <span class="admin-user-role">${user.rol}</span>
      </div>

      <button id="logoutButton" class="btn btn-outline-warning btn-sm">
        Cerrar sesión
      </button>
    </div>
  `;

  // Cierra la sesión y vuelve al login.
  document.getElementById("logoutButton").addEventListener("click", function () {
    clearSession();
    window.location.href = "index.html";
  });
}