let currentPage = 0;
const pageSize = 10;
let totalPages = 0;
let currentUsers = [];

document.addEventListener("DOMContentLoaded", function () {
  renderAdminLayout("users", "Usuarios");

  configureUsersEvents();
  loadUsers();
});

function configureUsersEvents() {
  const filterForm = document.getElementById("usersFilterForm");
  const clearFiltersButton = document.getElementById("clearFiltersButton");
  const prevPageButton = document.getElementById("prevPageButton");
  const nextPageButton = document.getElementById("nextPageButton");
  const usersTableBody = document.getElementById("usersTableBody");
  const editUserForm = document.getElementById("editUserForm");
  const changeRoleForm = document.getElementById("changeRoleForm");
  const confirmDeleteUserButton = document.getElementById("confirmDeleteUserButton");

  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    currentPage = 0;
    loadUsers();
  });

  clearFiltersButton.addEventListener("click", function () {
    document.getElementById("searchInput").value = "";
    document.getElementById("roleSelect").value = "";
    currentPage = 0;
    loadUsers();
  });

  prevPageButton.addEventListener("click", function () {
    if (currentPage > 0) {
      currentPage--;
      loadUsers();
    }
  });

  nextPageButton.addEventListener("click", function () {
    if (currentPage < totalPages - 1) {
      currentPage++;
      loadUsers();
    }
  });

  usersTableBody.addEventListener("click", handleUsersTableClick);

  editUserForm.addEventListener("submit", handleEditUserSubmit);

  changeRoleForm.addEventListener("submit", handleChangeRoleSubmit);

  confirmDeleteUserButton.addEventListener("click", handleDeleteUserConfirm);
}

async function loadUsers() {
  hideUsersMessage();
  renderUsersLoading();

  try {
    const query = document.getElementById("searchInput").value.trim();
    const rol = document.getElementById("roleSelect").value;

    const params = new URLSearchParams();

    params.append("page", currentPage);
    params.append("size", pageSize);

    if (query.length >= 2) {
      params.append("query", query);
    }

    if (rol) {
      params.append("rol", rol);
    }

    const data = await apiGet(`/api/admin/users?${params.toString()}`);

    totalPages = data.totalPages || 0;
    currentPage = data.page || 0;
    currentUsers = data.content || [];

    renderUsersTable(currentUsers);
    renderUsersPagination(data);

  } catch (error) {
    renderUsersError(error.message);
    renderUsersEmpty("No se pudieron cargar los usuarios.");
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById("usersTableBody");

  if (!users.length) {
    renderUsersEmpty("No hay usuarios que coincidan con los filtros.");
    return;
  }

  const currentUser = getCurrentUser();
  const isSuperadmin = currentUser?.rol === "SUPERADMIN";

  tbody.innerHTML = users.map(user => {
    const isCurrentUser = currentUser?.id === user.id;

    return `
      <tr>
        <td>${user.id}</td>

        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="user-avatar">
              ${getInitials(user.nombreUsuario)}
            </div>

            <div>
              <div class="fw-bold">${escapeHtml(user.nombreUsuario)}</div>
              <div class="text-muted small">ID ${user.id}</div>
            </div>
          </div>
        </td>

        <td>${escapeHtml(user.email)}</td>

        <td>
          <span class="badge ${getRoleBadgeClass(user.rol)}">
            ${user.rol}
          </span>
        </td>

        <td>${user.nivel ?? 1}</td>
        <td>${user.xpTotal ?? 0}</td>
        <td>${user.totalPublicaciones ?? 0}</td>
        <td>${user.totalSeguidores ?? 0}</td>
        <td>${user.totalSeguidos ?? 0}</td>
        <td>${formatDate(user.fechaRegistro)}</td>

        <td class="text-end">
          ${
            isSuperadmin
              ? `
                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    data-action="edit"
                    data-id="${user.id}"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline-warning btn-sm"
                    data-action="role"
                    data-id="${user.id}"
                  >
                    Rol
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    data-action="delete"
                    data-id="${user.id}"
                    ${isCurrentUser ? "disabled" : ""}
                    title="${isCurrentUser ? "No puedes borrarte a ti mismo desde aquí" : "Eliminar usuario"}"
                  >
                    Borrar
                  </button>
                </div>
              `
              : `<span class="text-muted small">Solo lectura</span>`
          }
        </td>
      </tr>
    `;
  }).join("");
}

function handleUsersTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const userId = Number(button.dataset.id);

  const user = currentUsers.find(item => item.id === userId);

  if (!user) {
    renderUsersError("No se ha encontrado el usuario seleccionado.");
    return;
  }

  if (action === "edit") {
    openEditUserModal(user);
  }

  if (action === "role") {
    openChangeRoleModal(user);
  }

  if (action === "delete") {
    openDeleteUserModal(user);
  }
}

function openEditUserModal(user) {
  document.getElementById("editUserId").value = user.id;
  document.getElementById("editNombreUsuario").value = user.nombreUsuario || "";
  document.getElementById("editEmail").value = user.email || "";
  document.getElementById("editFotoPerfil").value = user.fotoPerfil || "";
  document.getElementById("editBiografia").value = user.biografia || "";

  const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
  modal.show();
}

async function handleEditUserSubmit(event) {
  event.preventDefault();
  hideUsersMessage();

  const userId = document.getElementById("editUserId").value;

  const body = {
    nombreUsuario: document.getElementById("editNombreUsuario").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    fotoPerfil: nullableValue(document.getElementById("editFotoPerfil").value),
    biografia: nullableValue(document.getElementById("editBiografia").value)
  };

  try {
    await usersRequest(`/api/admin/users/${userId}`, "PATCH", body);

    closeModal("editUserModal");
    renderUsersSuccess("Usuario actualizado correctamente.");
    loadUsers();

  } catch (error) {
    renderUsersError(error.message || "No se pudo actualizar el usuario.");
  }
}

function openChangeRoleModal(user) {
  document.getElementById("roleUserId").value = user.id;
  document.getElementById("roleUserName").textContent = `${user.nombreUsuario} · ${user.email}`;
  document.getElementById("newRoleSelect").value = user.rol || "USER";

  const modal = new bootstrap.Modal(document.getElementById("changeRoleModal"));
  modal.show();
}

async function handleChangeRoleSubmit(event) {
  event.preventDefault();
  hideUsersMessage();

  const userId = document.getElementById("roleUserId").value;

  const body = {
    rol: document.getElementById("newRoleSelect").value
  };

  try {
    await usersRequest(`/api/admin/users/${userId}/role`, "PATCH", body);

    closeModal("changeRoleModal");
    renderUsersSuccess("Rol actualizado correctamente.");
    loadUsers();

  } catch (error) {
    renderUsersError(error.message || "No se pudo actualizar el rol.");
  }
}

function openDeleteUserModal(user) {
  document.getElementById("deleteUserId").value = user.id;
  document.getElementById("deleteUserName").textContent = `${user.nombreUsuario} · ${user.email}`;

  const modal = new bootstrap.Modal(document.getElementById("deleteUserModal"));
  modal.show();
}

async function handleDeleteUserConfirm() {
  hideUsersMessage();

  const userId = document.getElementById("deleteUserId").value;

  try {
    await usersRequest(`/api/admin/users/${userId}`, "DELETE");

    closeModal("deleteUserModal");
    renderUsersSuccess("Usuario eliminado correctamente.");

    if (currentUsers.length === 1 && currentPage > 0) {
      currentPage--;
    }

    loadUsers();

  } catch (error) {
    renderUsersError(error.message || "No se pudo eliminar el usuario.");
  }
}

async function usersRequest(path, method = "GET", body = null) {
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

function closeModal(modalId) {
  const modalElement = document.getElementById(modalId);
  const modal = bootstrap.Modal.getInstance(modalElement);

  if (modal) {
    modal.hide();
  }
}

function renderUsersLoading() {
  const tbody = document.getElementById("usersTableBody");

  tbody.innerHTML = `
    <tr>
      <td colspan="11" class="text-center text-muted py-4">
        Cargando usuarios...
      </td>
    </tr>
  `;
}

function renderUsersEmpty(message) {
  const tbody = document.getElementById("usersTableBody");

  tbody.innerHTML = `
    <tr>
      <td colspan="11" class="text-center text-muted py-4">
        ${message}
      </td>
    </tr>
  `;
}

function renderUsersPagination(data) {
  const paginationInfo = document.getElementById("usersPaginationInfo");
  const prevPageButton = document.getElementById("prevPageButton");
  const nextPageButton = document.getElementById("nextPageButton");

  const page = data.page ?? 0;
  const totalElements = data.totalElements ?? 0;
  const pages = data.totalPages ?? 0;

  paginationInfo.textContent = `Página ${pages === 0 ? 0 : page + 1} de ${pages} · ${totalElements} usuarios`;

  prevPageButton.disabled = page <= 0;
  nextPageButton.disabled = page >= pages - 1 || pages === 0;
}

function renderUsersError(message) {
  const alert = document.getElementById("usersAlert");

  alert.classList.remove("d-none", "alert-success");
  alert.classList.add("alert-danger");
  alert.textContent = message;
}

function renderUsersSuccess(message) {
  const alert = document.getElementById("usersAlert");

  alert.classList.remove("d-none", "alert-danger");
  alert.classList.add("alert-success");
  alert.textContent = message;
}

function hideUsersMessage() {
  const alert = document.getElementById("usersAlert");

  alert.textContent = "";
  alert.classList.add("d-none");
  alert.classList.remove("alert-success");
  alert.classList.add("alert-danger");
}

function getRoleBadgeClass(role) {
  if (role === "SUPERADMIN") {
    return "role-superadmin";
  }

  if (role === "ADMIN") {
    return "role-admin";
  }

  return "role-user";
}

function getInitials(username) {
  if (!username) {
    return "U";
  }

  return username.substring(0, 2).toUpperCase();
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function nullableValue(value) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return null;
  }

  return cleanValue;
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