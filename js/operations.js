/**
 * operations.js
 *
 * Gestiona el historial de operaciones administrativas.
 * Permite listar, filtrar, paginar y consultar el detalle de cada operación.
 */

let operationsCurrentPage = 0;
let operationsTotalPages = 0;
let currentOperations = [];

const OPERATIONS_PAGE_SIZE = 10;

document.addEventListener("DOMContentLoaded", () => {
  renderAdminLayout("operations", "Operaciones");

  loadOperations();

  // Aplica los filtros de búsqueda.
  document.getElementById("operationsFilterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    operationsCurrentPage = 0;
    loadOperations();
  });

  // Limpia los filtros y recarga el listado.
  document.getElementById("clearOperationFiltersButton").addEventListener("click", () => {
    document.getElementById("operationTypeInput").value = "";
    document.getElementById("operationEntitySelect").value = "";
    document.getElementById("operationAdminIdInput").value = "";

    operationsCurrentPage = 0;
    loadOperations();
  });

  // Navegación entre páginas.
  document.getElementById("prevOperationsPageButton").addEventListener("click", () => {
    if (operationsCurrentPage > 0) {
      operationsCurrentPage--;
      loadOperations();
    }
  });

  document.getElementById("nextOperationsPageButton").addEventListener("click", () => {
    if (operationsCurrentPage < operationsTotalPages - 1) {
      operationsCurrentPage++;
      loadOperations();
    }
  });

  document.getElementById("operationsTableBody").addEventListener("click", handleOperationsTableClick);
});

async function loadOperations() {
  hideOperationsAlert();

  const tipoOperacion = document.getElementById("operationTypeInput").value.trim();
  const entidadAfectada = document.getElementById("operationEntitySelect").value;
  const adminId = document.getElementById("operationAdminIdInput").value.trim();

  const params = new URLSearchParams();
  params.append("page", operationsCurrentPage);
  params.append("size", OPERATIONS_PAGE_SIZE);

  if (tipoOperacion) {
    params.append("tipoOperacion", tipoOperacion);
  }

  if (entidadAfectada) {
    params.append("entidadAfectada", entidadAfectada);
  }

  if (adminId) {
    params.append("adminId", adminId);
  }

  try {
    // Solicita al backend las operaciones paginadas.
    const data = await operationsRequest(`/api/admin/operations?${params.toString()}`, "GET");

    if (!data || !Array.isArray(data.content)) {
      throw new Error("La respuesta de operaciones no tiene formato paginado válido.");
    }

    currentOperations = data.content;
    renderOperations(data);
  } catch (error) {
    console.error(error);
    showOperationsAlert(error.message || "No se pudieron cargar las operaciones.");
  }
}

function renderOperations(data) {
  const tbody = document.getElementById("operationsTableBody");

  operationsTotalPages = data.totalPages ?? 0;

  if (!data.content || data.content.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          No hay operaciones para mostrar.
        </td>
      </tr>
    `;

    updateOperationsPagination(data);
    return;
  }

  // Construye las filas de la tabla con las operaciones recibidas.
  tbody.innerHTML = data.content.map((operation) => {
    return `
      <tr>
        <td>${operation.id}</td>

        <td>
          <div class="fw-bold">${escapeHtml(operation.tipoOperacion || "-")}</div>
          <div class="text-muted small">Entidad ID ${operation.idEntidadAfectada ?? "-"}</div>
        </td>

        <td>
          <span class="badge text-bg-warning">
            ${escapeHtml(operation.entidadAfectada || "-")}
          </span>
        </td>

        <td>
          <div class="fw-bold">${escapeHtml(operation.nombreAdmin || "Admin eliminado")}</div>
          <div class="text-muted small">
            ${operation.adminId ? `ID ${operation.adminId}` : "Sin ID"}
          </div>
        </td>

        <td>
          <div class="text-muted small">
            ${escapeHtml(shortText(operation.detalle || "-", 80))}
          </div>
        </td>

        <td>${formatDateTime(operation.fechaOperacion)}</td>

        <td class="text-end">
          <button
            class="btn btn-outline-secondary btn-sm"
            data-action="view"
            data-id="${operation.id}"
          >
            Ver
          </button>
        </td>
      </tr>
    `;
  }).join("");

  updateOperationsPagination(data);
}

function updateOperationsPagination(data) {
  const info = document.getElementById("operationsPaginationInfo");
  const prevButton = document.getElementById("prevOperationsPageButton");
  const nextButton = document.getElementById("nextOperationsPageButton");

  const page = data.page ?? 0;
  const totalPages = data.totalPages ?? 0;
  const totalElements = data.totalElements ?? 0;

  info.textContent = totalPages > 0
    ? `Página ${page + 1} de ${totalPages} · ${totalElements} operaciones`
    : "Página 0 de 0 · 0 operaciones";

  prevButton.disabled = page <= 0;
  nextButton.disabled = page >= totalPages - 1 || totalPages === 0;
}

function handleOperationsTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const operationId = Number(button.dataset.id);

  // Abre el detalle de la operación seleccionada.
  if (action === "view") {
    openOperationDetail(operationId);
  }
}

function openOperationDetail(operationId) {
  const operation = currentOperations.find((item) => item.id === operationId);

  if (!operation) {
    showOperationsAlert("No se ha encontrado la operación seleccionada.");
    return;
  }

  const content = document.getElementById("operationDetailContent");

  // Muestra la información completa de la operación en el modal.
  content.innerHTML = `
    <div>
      <p class="text-muted small mb-1">ID operación</p>
      <p class="fw-bold mb-0">${operation.id}</p>
    </div>

    <div>
      <p class="text-muted small mb-1">Tipo de operación</p>
      <p class="fw-bold mb-0">${escapeHtml(operation.tipoOperacion || "-")}</p>
    </div>

    <div>
      <p class="text-muted small mb-1">Entidad afectada</p>
      <p class="fw-bold mb-0">
        ${escapeHtml(operation.entidadAfectada || "-")}
        <span class="text-muted fw-normal">ID ${operation.idEntidadAfectada ?? "-"}</span>
      </p>
    </div>

    <div>
      <p class="text-muted small mb-1">Administrador</p>
      <p class="fw-bold mb-0">
        ${escapeHtml(operation.nombreAdmin || "Admin eliminado")}
        <span class="text-muted fw-normal">ID ${operation.adminId ?? "-"}</span>
      </p>
      <p class="text-muted small mb-0">${escapeHtml(operation.emailAdmin || "-")}</p>
    </div>

    <div>
      <p class="text-muted small mb-1">Fecha</p>
      <p class="fw-bold mb-0">${formatDateTime(operation.fechaOperacion)}</p>
    </div>

    <div>
      <p class="text-muted small mb-1">Detalle</p>
      <div class="post-detail-placeholder p-3 justify-content-start align-items-start text-start">
        ${escapeHtml(operation.detalle || "Sin detalle registrado.")}
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById("operationDetailModal"));
  modal.show();
}

async function operationsRequest(path, method = "GET", body = null) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : null
  });

  const text = await response.text();

  let data = null;

  if (text) {
    data = JSON.parse(text);
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

function showOperationsAlert(message) {
  const alert = document.getElementById("operationsAlert");
  alert.textContent = message;
  alert.classList.remove("d-none");
}

function hideOperationsAlert() {
  const alert = document.getElementById("operationsAlert");
  alert.textContent = "";
  alert.classList.add("d-none");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function shortText(value, maxLength) {
  if (!value) {
    return "-";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.substring(0, maxLength)}...`;
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}