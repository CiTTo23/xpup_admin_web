/**
 * dashboard.js
 *
 * Carga las estadísticas generales del panel de administración.
 */

document.addEventListener("DOMContentLoaded", function () {
  renderAdminLayout("dashboard", "Dashboard");

  loadDashboardStats();
});

async function loadDashboardStats() {
  const dashboardAlert = document.getElementById("dashboardAlert");

  try {
    // Obtiene las estadísticas generales del backend.
    const stats = await apiGet("/api/admin/stats");

    setText("totalUsuarios", stats.totalUsuarios);
    setText("totalPublicaciones", stats.totalPublicaciones);
    setText("totalComentarios", stats.totalComentarios);
    setText("totalLikes", stats.totalLikes);
    setText("totalGuardados", stats.totalGuardados);
    setText("totalSeguimientos", stats.totalSeguimientos);
    setText("totalOperacionesAdmin", stats.totalOperacionesAdmin);

  } catch (error) {
    dashboardAlert.textContent = error.message;
    dashboardAlert.classList.remove("d-none");
  }
}

function setText(elementId, value) {
  const element = document.getElementById(elementId);

  // Muestra el valor recibido o 0 si no existe.
  if (element) {
    element.textContent = value ?? 0;
  }
}