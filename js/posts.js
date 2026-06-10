/**
 * posts.js
 *
 * Gestiona la administración de publicaciones.
 * Permite listar, filtrar, paginar, ver, editar y eliminar publicaciones.
 */

const POSTS_PAGE_SIZE = 10;

let postsCurrentPage = 0;
let postsTotalPages = 0;

const API_BASE_URL_SAFE =
  typeof API_BASE_URL !== "undefined" ? API_BASE_URL : "http://localhost:8080";

document.addEventListener("DOMContentLoaded", function () {
  renderAdminLayout("posts", "Publicaciones");

  loadPosts();

  // Aplica los filtros de búsqueda.
  document.getElementById("postsFilterForm").addEventListener("submit", function (event) {
    event.preventDefault();
    postsCurrentPage = 0;
    loadPosts();
  });

  // Limpia los filtros y recarga el listado.
  document.getElementById("clearPostFiltersButton").addEventListener("click", function () {
    document.getElementById("postSearchInput").value = "";
    document.getElementById("postUserIdInput").value = "";
    postsCurrentPage = 0;
    loadPosts();
  });

  // Navegación entre páginas.
  document.getElementById("prevPostsPageButton").addEventListener("click", function () {
    if (postsCurrentPage > 0) {
      postsCurrentPage--;
      loadPosts();
    }
  });

  document.getElementById("nextPostsPageButton").addEventListener("click", function () {
    if (postsCurrentPage < postsTotalPages - 1) {
      postsCurrentPage++;
      loadPosts();
    }
  });

  document.getElementById("postsTableBody").addEventListener("click", handlePostTableClick);

  document.getElementById("editPostForm").addEventListener("submit", handleEditPostSubmit);

  document.getElementById("confirmDeletePostButton").addEventListener("click", deleteSelectedPost);
});

async function loadPosts() {
  hidePostsAlert();

  const query = document.getElementById("postSearchInput").value.trim();
  const userId = document.getElementById("postUserIdInput").value.trim();

  const params = new URLSearchParams();
  params.append("page", postsCurrentPage);
  params.append("size", POSTS_PAGE_SIZE);

  if (query.length >= 2) {
    params.append("query", query);
  }

  if (userId) {
    params.append("userId", userId);
  }

  try {
    // Solicita al backend las publicaciones paginadas.
    const data = await adminRequest(`/api/admin/posts?${params.toString()}`);

    if (!data || !Array.isArray(data.content)) {
      throw new Error("La respuesta de publicaciones no tiene formato paginado válido.");
    }

    renderPosts(data);
  } catch (error) {
    console.error(error);
    showPostsAlert(error.message || "No se pudieron cargar las publicaciones.");
  }
}

function renderPosts(data) {
  const tbody = document.getElementById("postsTableBody");

  postsTotalPages = data.totalPages || 0;

  if (!data.content || data.content.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted py-4">
          No hay publicaciones para mostrar.
        </td>
      </tr>
    `;

    updatePostsPagination(data);
    return;
  }

  // Construye dinámicamente las filas de la tabla.
  tbody.innerHTML = data.content.map(function (post) {
    const usuario = post.usuario || {};
    const fecha = formatDate(post.fechaPublicacion);

    return `
      <tr>
        <td>${post.id}</td>

        <td>
          <div class="d-flex align-items-center gap-3">
            ${renderPostThumbnail(post)}

            <div>
              <div class="fw-semibold">
                ${escapeHtml(post.titulo || "-")}
              </div>

              <div class="text-muted small text-truncate" style="max-width: 280px;">
                ${escapeHtml(post.descripcion || "Sin descripción")}
              </div>
            </div>
          </div>
        </td>

        <td>
          <div class="fw-semibold">
            ${escapeHtml(usuario.nombreUsuario || "Usuario eliminado")}
          </div>

          <div class="text-muted small">
            ID ${usuario.id || "-"}
          </div>
        </td>

        <td>${escapeHtml(post.nombreJuego || "-")}</td>

        <td>
          <span class="badge rounded-pill text-bg-dark border border-secondary">
            ${escapeHtml(post.tipoContenido || "-")}
          </span>
        </td>

        <td>${post.totalLikes ?? 0}</td>
        <td>${post.totalComentarios ?? 0}</td>
        <td>${post.totalGuardados ?? 0}</td>
        <td>${fecha}</td>

        <td class="text-end">
          <div class="d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              data-action="detail"
              data-id="${post.id}"
            >
              Ver
            </button>

            <button
              type="button"
              class="btn btn-outline-warning btn-sm"
              data-action="edit"
              data-id="${post.id}"
            >
              Editar
            </button>

            <button
              type="button"
              class="btn btn-outline-danger btn-sm"
              data-action="delete"
              data-id="${post.id}"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  updatePostsPagination(data);
}

function updatePostsPagination(data) {
  const info = document.getElementById("postsPaginationInfo");
  const prev = document.getElementById("prevPostsPageButton");
  const next = document.getElementById("nextPostsPageButton");

  const totalElements = data.totalElements || 0;
  const totalPages = data.totalPages || 0;
  const currentPage = totalPages === 0 ? 0 : data.page + 1;

  info.textContent = `Página ${currentPage} de ${totalPages} · ${totalElements} publicaciones`;

  prev.disabled = postsCurrentPage <= 0;
  next.disabled = postsCurrentPage >= totalPages - 1 || totalPages === 0;
}

async function handlePostTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  event.preventDefault();

  const action = button.dataset.action;
  const postId = button.dataset.id;

  // Ejecuta la acción seleccionada en la tabla.
  if (action === "detail") {
    await openPostDetail(postId);
    return;
  }

  if (action === "edit") {
    await openEditPostModal(postId);
    return;
  }

  if (action === "delete") {
    openDeletePostModal(postId);
  }
}

async function openPostDetail(postId) {
  hidePostsAlert();

  try {
    // Carga el detalle completo de la publicación.
    const post = await adminRequest(`/api/admin/posts/${postId}`);

    const modalBody = document.getElementById("postDetailBody");

    modalBody.innerHTML = `
      <div class="row g-4">
        <div class="col-md-4">
          ${renderPostDetailMedia(post)}
        </div>

        <div class="col-md-8">
          <h4 class="h5 mb-2">
            ${escapeHtml(post.titulo || "-")}
          </h4>

          <p class="text-muted mb-3">
            ${escapeHtml(post.descripcion || "Sin descripción")}
          </p>

          <div class="row g-3 small">
            <div class="col-sm-6">
              <span class="text-muted">ID:</span>
              <strong>${post.id}</strong>
            </div>

            <div class="col-sm-6">
              <span class="text-muted">Tipo:</span>
              <strong>${escapeHtml(post.tipoContenido || "-")}</strong>
            </div>

            <div class="col-sm-6">
              <span class="text-muted">Usuario:</span>
              <strong>${escapeHtml(post.usuario?.nombreUsuario || "-")}</strong>
            </div>

            <div class="col-sm-6">
              <span class="text-muted">Juego:</span>
              <strong>${escapeHtml(post.nombreJuego || "-")}</strong>
            </div>

            <div class="col-sm-6">
              <span class="text-muted">Likes:</span>
              <strong>${post.totalLikes ?? 0}</strong>
            </div>

            <div class="col-sm-6">
              <span class="text-muted">Comentarios:</span>
              <strong>${post.totalComentarios ?? 0}</strong>
            </div>

            <div class="col-sm-6">
              <span class="text-muted">Guardados:</span>
              <strong>${post.totalGuardados ?? 0}</strong>
            </div>

            <div class="col-sm-6">
              <span class="text-muted">Fecha:</span>
              <strong>${formatDate(post.fechaPublicacion)}</strong>
            </div>
          </div>

          <hr />

          <div class="small">
            <div class="mb-2">
              <span class="text-muted">Archivo:</span>
              ${
                post.archivoUrl
                  ? `<a href="${escapeAttribute(post.archivoUrl)}" target="_blank" rel="noopener noreferrer">abrir contenido</a>`
                  : "-"
              }
            </div>

            <div class="mb-2">
              <span class="text-muted">Miniatura:</span>
              ${
                post.miniaturaUrl
                  ? `<a href="${escapeAttribute(post.miniaturaUrl)}" target="_blank" rel="noopener noreferrer">abrir miniatura</a>`
                  : "-"
              }
            </div>

            <div>
              <span class="text-muted">Portada juego:</span>
              ${
                post.portadaJuegoUrl
                  ? `<a href="${escapeAttribute(post.portadaJuegoUrl)}" target="_blank" rel="noopener noreferrer">abrir portada</a>`
                  : "-"
              }
            </div>
          </div>
        </div>
      </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById("postDetailModal"));
    modal.show();
  } catch (error) {
    console.error(error);
    showPostsAlert(error.message || "No se pudo cargar el detalle de la publicación.");
  }
}

async function openEditPostModal(postId) {
  hidePostsAlert();

  try {
    const post = await adminRequest(`/api/admin/posts/${postId}`);

    document.getElementById("editPostId").value = post.id;
    document.getElementById("editPostTitle").value = post.titulo || "";
    document.getElementById("editPostDescription").value = post.descripcion || "";
    document.getElementById("editPostType").value = post.tipoContenido || "IMAGEN";
    document.getElementById("editPostGameName").value = post.nombreJuego || "";
    document.getElementById("editPostGameId").value = post.idJuegoApi || "";
    document.getElementById("editPostGameCover").value = post.portadaJuegoUrl || "";
    document.getElementById("editPostFileUrl").value = post.archivoUrl || "";
    document.getElementById("editPostThumbnailUrl").value = post.miniaturaUrl || "";

    const modal = new bootstrap.Modal(document.getElementById("postEditModal"));
    modal.show();
  } catch (error) {
    console.error(error);
    showPostsAlert(error.message || "No se pudo cargar la publicación para editar.");
  }
}

async function handleEditPostSubmit(event) {
  event.preventDefault();
  hidePostsAlert();

  const postId = document.getElementById("editPostId").value;

  const body = {
    titulo: document.getElementById("editPostTitle").value.trim(),
    descripcion: emptyToNull(document.getElementById("editPostDescription").value.trim()),
    tipoContenido: document.getElementById("editPostType").value,
    idJuegoApi: document.getElementById("editPostGameId").value.trim(),
    nombreJuego: document.getElementById("editPostGameName").value.trim(),
    portadaJuegoUrl: emptyToNull(document.getElementById("editPostGameCover").value.trim()),
    archivoUrl: document.getElementById("editPostFileUrl").value.trim(),
    miniaturaUrl: emptyToNull(document.getElementById("editPostThumbnailUrl").value.trim())
  };

  try {
    // Actualiza la publicación con los datos del formulario.
    await adminRequest(`/api/admin/posts/${postId}`, {
      method: "PATCH",
      body: body
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById("postEditModal"));
    modal.hide();

    await loadPosts();
  } catch (error) {
    console.error(error);
    showPostsAlert(error.message || "No se pudo actualizar la publicación.");
  }
}

function openDeletePostModal(postId) {
  document.getElementById("deletePostId").value = postId;

  const modal = new bootstrap.Modal(document.getElementById("postDeleteModal"));
  modal.show();
}

async function deleteSelectedPost() {
  hidePostsAlert();

  const postId = document.getElementById("deletePostId").value;

  try {
    // Elimina la publicación seleccionada.
    await adminRequest(`/api/admin/posts/${postId}`, {
      method: "DELETE"
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById("postDeleteModal"));
    modal.hide();

    const rows = document.querySelectorAll("#postsTableBody tr");

    if (postsCurrentPage > 0 && rows.length === 1) {
      postsCurrentPage--;
    }

    await loadPosts();
  } catch (error) {
    console.error(error);
    showPostsAlert(error.message || "No se pudo eliminar la publicación.");
  }
}

async function adminRequest(path, options = {}) {
  const token = getSafeToken();

  if (!token) {
    clearSession();
    window.location.href = "index.html";
    return null;
  }

  const fetchOptions = {
    method: options.method || "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL_SAFE}${path}`, fetchOptions);

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = null;
    }
  }

  if (response.status === 401) {
    clearSession();
    window.location.href = "index.html";
    return null;
  }

  if (response.status === 403) {
    throw new Error("No tienes permisos para realizar esta operación.");
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

function getSafeToken() {
  if (typeof getToken === "function") {
    return getToken();
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("xpup_token") ||
    localStorage.getItem("xpupAdminToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("xpup_token") ||
    sessionStorage.getItem("xpupAdminToken")
  );
}

function renderPostThumbnail(post) {
  const src = post.miniaturaUrl || post.portadaJuegoUrl;

  if (!src) {
    return `
      <div class="post-thumb-placeholder">
        XP
      </div>
    `;
  }

  return `
    <img
      src="${escapeAttribute(src)}"
      alt="Miniatura"
      class="post-thumb"
      onerror="this.style.display='none'; this.nextElementSibling.classList.remove('d-none');"
    />

    <div class="post-thumb-placeholder d-none">
      XP
    </div>
  `;
}

function renderPostDetailMedia(post) {
  const src = post.miniaturaUrl || post.portadaJuegoUrl;

  if (!src) {
    return `
      <div class="post-detail-placeholder">
        Sin imagen
      </div>
    `;
  }

  return `
    <img
      src="${escapeAttribute(src)}"
      alt="Miniatura de publicación"
      class="img-fluid rounded-4 border border-secondary"
    />
  `;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("es-ES");
}

function emptyToNull(value) {
  return value === "" ? null : value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function showPostsAlert(message) {
  const alert = document.getElementById("postsAlert");

  if (!alert) {
    return;
  }

  alert.textContent = message;
  alert.classList.remove("d-none");
}

function hidePostsAlert() {
  const alert = document.getElementById("postsAlert");

  if (!alert) {
    return;
  }

  alert.textContent = "";
  alert.classList.add("d-none");
}