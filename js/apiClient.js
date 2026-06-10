/**
 * api.js
 *
 * Cliente HTTP del panel de administración.
 * Centraliza las peticiones al backend y añade el token JWT cuando existe sesión.
 */

async function apiRequest(path, options = {}) {
  const token = getToken();

  const defaultHeaders = {
    "Content-Type": "application/json"
  };

  // Añade autenticación si hay sesión activa.
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  });

  // Si la sesión no es válida, vuelve al login.
  if (response.status === 401) {
    clearSession();
    window.location.href = "index.html";
    return;
  }

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  // Gestiona errores devueltos por el backend.
  if (!response.ok) {
    const message = data && data.message
      ? data.message
      : "Error en la petición al servidor.";

    throw new Error(message);
  }

  return data;
}

// Métodos auxiliares para simplificar el uso de la API.
function apiGet(path) {
  return apiRequest(path, {
    method: "GET"
  });
}

function apiPost(path, body) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

function apiPatch(path, body) {
  return apiRequest(path, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

function apiDelete(path) {
  return apiRequest(path, {
    method: "DELETE"
  });
}