/**
 * comments.js
 *
 * Gestiona la administración de comentarios del panel.
 * Permite listar, filtrar, paginar, ver, editar y eliminar comentarios.
 */

let commentsCurrentPage = 0;
let commentsTotalPages = 0;

const COMMENTS_PAGE_SIZE = 10;

document.addEventListener("DOMContentLoaded", () => {
  renderAdminLayout("comments", "Comentarios");

  loadComments();

  // Aplica los filtros de búsqueda.
  document.getElementById("commentsFilterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    commentsCurrentPage = 0;
    loadComments();
  });

  // Limpia los filtros y recarga el listado.
  document.getElementById("clearCommentFiltersButton").addEventListener("click", () => {
    document.getElementById("commentSearchInput").value = "";
    document.getElementById("commentPostIdInput").value = "";
    document.getElementById("commentUserIdInput").value = "";
    commentsCurrentPage = 0;
    loadComments();
  });

  // Navegación entre páginas.
  document.getElementById("prevCommentsPageButton").addEventListener("click", () => {
    if (commentsCurrentPage > 0) {
      commentsCurrentPage--;
      loadComments();
    }
  });

  document.getElementById("nextCommentsPageButton").addEventListener("click", () => {
    if (commentsCurrentPage < commentsTotalPages - 1) {
      commentsCurrentPage++;
      loadComments();
    }
  });

  document.getElementById("commentsTableBody").addEventListener("click", handleCommentTableClick);

  document.getElementById("editCommentForm").addEventListener("submit", handleEditCommentSubmit);

  document.getElementById("confirmDeleteCommentButton").addEventListener("click", deleteSelectedComment);
});

async function loadComments() {
  hideCommentsAlert();

  const query = document.getElementById("commentSearchInput").value.trim();
  const postId = document.getElementById("commentPostIdInput").value.trim();
  const userId = document.getElementById("commentUserIdInput").value.trim();

  const params = new URLSearchParams();
  params.append("page", commentsCurrentPage);
  params.append("size", COMMENTS_PAGE_SIZE);

  if (query.length >= 2) {
    params.append("query", query);
  }

  if (postId) {
    params.append("postId", postId);
  }

  if (userId) {
    params.append("userId", userId);
  }

  try {
    // Solicita al backend la página actual de comentarios.
    const data = await commentsRequest(`/api/admin/comments?${params.toString()}`, "GET");

    if (!data || !Array.isArray(data.content)) {
      throw new Error("La respuesta de comentarios no tiene formato paginado válido.");
    }

    renderComments(data);
  } catch (error) {
    console.error(error);
    showCommentsAlert(error.message || "No se pudieron cargar los comentarios.");
  }
}

function renderComments(data) {
  const tbody = document.getElementById("commentsTableBody");

  commentsTotalPages = data.totalPages ?? 0;

  if (!data.content || data.content.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          No hay comentarios para mostrar.
        </td>
      </tr>
    `;

    updateCommentsPagination(data);
    return;
  }

  // Construye dinámicamente las filas de la tabla.
  tbody.innerHTML = data.content.map((comment) => {
    const usuario = comment.usuario || {};
    const username = usuario.nombreUsuario || "Usuario desconocido";
    const userId = usuario.id ?? "-";
    const postTitulo = comment.postTitulo || "Publicación sin título";

    return `
      <tr>
        <td>${comment.id}</td>

        <td>
          <div class="fw-bold">${escapeHtml(shortText(comment.contenido, 70))}</div>
          <div class="text-muted small">${escapeHtml(shortText(comment.contenido, 110))}</div>
        </td>

        <td>
          <div class="fw-bold">${escapeHtml(username)}</div>
          <div class="text-muted small">ID ${userId}</div>
        </td>

        <td>
          <div class="fw-bold">${escapeHtml(shortText(postTitulo, 45))}</div>
          <div class="text-muted small">Post ID ${comment.postId ?? "-"}</div>
        </td>

        <td>${formatDate(comment.fechaComentario)}</td>

        <td class="text-end">
          <div class="d-flex justify-content-end gap-2">
            <button
              class="btn btn-outline-secondary btn-sm"
              data-action="view"
              data-id="${comment.id}"
            >
              Ver
            </button>

            <button
              class="btn btn-outline-warning btn-sm"
              data-action="edit"
              data-id="${comment.id}"
            >
              Editar
            </button>

            <button
              class="btn btn-outline-danger btn-sm"
              data-action="delete"
              data-id="${comment.id}"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  updateCommentsPagination(data);
}

function updateCommentsPagination(data) {
  const info = document.getElementById("commentsPaginationInfo");
  const prevButton = document.getElementById("prevCommentsPageButton");
  const nextButton = document.getElementById("nextCommentsPageButton");

  const page = data.page ?? 0;
  const totalPages = data.totalPages ?? 0;
  const totalElements = data.totalElements ?? 0;

  info.textContent = totalPages > 0
    ? `Página ${page + 1} de ${totalPages} · ${totalElements} comentarios`
    : "Página 0 de 0 · 0 comentarios";

  prevButton.disabled = page <= 0;
  nextButton.disabled = page >= totalPages - 1 || totalPages === 0;
}

async function handleCommentTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const commentId = button.dataset.id;

  // Ejecuta la acción seleccionada en la tabla.
  if (action === "view") {
    await openCommentDetail(commentId);
  }

  if (action === "edit") {
    await openEditCommentModal(commentId);
  }

  if (action === "delete") {
    openDeleteCommentModal(commentId);
  }
}

async function openCommentDetail(commentId) {
  try {
    // Carga el detalle completo del comentario seleccionado.
    const comment = await commentsRequest(`/api/admin/comments/${commentId}`, "GET");

    const content = document.getElementById("commentDetailContent");

    content.innerHTML = `
      <div>
        <p class="text-muted small mb-1">ID comentario</p>
        <p class="fw-bold mb-0">${comment.id}</p>
      </div>

      <div>
        <p class="text-muted small mb-1">Usuario</p>
        <p class="fw-bold mb-0">
          ${escapeHtml(comment.usuario?.nombreUsuario || "Usuario desconocido")}
          <span class="text-muted fw-normal">ID ${comment.usuario?.id ?? "-"}</span>
        </p>
      </div>

      <div>
        <p class="text-muted small mb-1">Publicación</p>
        <p class="fw-bold mb-0">
          ${escapeHtml(comment.postTitulo || "Publicación sin título")}
          <span class="text-muted fw-normal">ID ${comment.postId ?? "-"}</span>
        </p>
      </div>

      <div>
        <p class="text-muted small mb-1">Fecha</p>
        <p class="fw-bold mb-0">${formatDate(comment.fechaComentario)}</p>
      </div>

      <div>
        <p class="text-muted small mb-1">Contenido</p>
        <div class="post-detail-placeholder p-3 justify-content-start align-items-start text-start">
          ${escapeHtml(comment.contenido || "")}
        </div>
      </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById("commentDetailModal"));
    modal.show();
  } catch (error) {
    console.error(error);
    showCommentsAlert(error.message || "No se pudo cargar el detalle del comentario.");
  }
}

async function openEditCommentModal(commentId) {
  try {
    const comment = await commentsRequest(`/api/admin/comments/${commentId}`, "GET");

    document.getElementById("editCommentId").value = comment.id;
    document.getElementById("editCommentContent").value = comment.contenido || "";

    const modal = new bootstrap.Modal(document.getElementById("editCommentModal"));
    modal.show();
  } catch (error) {
    console.error(error);
    showCommentsAlert(error.message || "No se pudo cargar el comentario para editar.");
  }
}

async function handleEditCommentSubmit(event) {
  event.preventDefault();

  const commentId = document.getElementById("editCommentId").value;
  const contenido = document.getElementById("editCommentContent").value.trim();

  if (!contenido) {
    showCommentsAlert("El contenido del comentario no puede estar vacío.");
    return;
  }

  try {
    // Actualiza el contenido del comentario.
    await commentsRequest(`/api/admin/comments/${commentId}`, "PATCH", {
      contenido
    });

    const modalElement = document.getElementById("editCommentModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    await loadComments();
  } catch (error) {
    console.error(error);
    showCommentsAlert(error.message || "No se pudo actualizar el comentario.");
  }
}

function openDeleteCommentModal(commentId) {
  document.getElementById("deleteCommentId").value = commentId;

  const modal = new bootstrap.Modal(document.getElementById("deleteCommentModal"));
  modal.show();
}

async function deleteSelectedComment() {
  const commentId = document.getElementById("deleteCommentId").value;

  try {
    // Elimina el comentario seleccionado.
    await commentsRequest(`/api/admin/comments/${commentId}`, "DELETE");

    const modalElement = document.getElementById("deleteCommentModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    await loadComments();
  } catch (error) {
    console.error(error);
    showCommentsAlert(error.message || "No se pudo eliminar el comentario.");
  }
}

async function commentsRequest(path, method = "GET", body = null) {
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

function showCommentsAlert(message) {
  const alert = document.getElementById("commentsAlert");
  alert.textContent = message;
  alert.classList.remove("d-none");
}

function hideCommentsAlert() {
  const alert = document.getElementById("commentsAlert");
  alert.textContent = "";
  alert.classList.add("d-none");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-ES");
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