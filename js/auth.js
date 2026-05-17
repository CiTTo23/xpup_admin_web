const loginForm = document.getElementById("loginForm");
const loginAlert = document.getElementById("loginAlert");
const loginButton = document.getElementById("loginButton");

redirectIfAlreadyLoggedIn();

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const identificador = document.getElementById("identificador").value.trim();
  const password = document.getElementById("password").value;

  hideLoginError();
  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identificador: identificador,
        password: password
      })
    });

    if (!response.ok) {
      showLoginError("Credenciales incorrectas o usuario no encontrado.");
      setLoading(false);
      return;
    }

    const data = await response.json();

    if (!data.token || !data.user) {
      showLoginError("La respuesta del servidor no es válida.");
      setLoading(false);
      return;
    }

    if (data.user.rol !== "ADMIN" && data.user.rol !== "SUPERADMIN") {
      showLoginError("No tienes permisos para acceder al panel de administración.");
      setLoading(false);
      return;
    }

    saveSession(data.token, data.user);

    window.location.href = "dashboard.html";

  } catch (error) {
    console.error(error);
    showLoginError("No se pudo conectar con el backend. Comprueba que Spring Boot esté arrancado.");
    setLoading(false);
  }
});

function showLoginError(message) {
  loginAlert.textContent = message;
  loginAlert.classList.remove("d-none");
}

function hideLoginError() {
  loginAlert.textContent = "";
  loginAlert.classList.add("d-none");
}

function setLoading(isLoading) {
  loginButton.disabled = isLoading;

  if (isLoading) {
    loginButton.textContent = "Entrando...";
  } else {
    loginButton.textContent = "Entrar al panel";
  }
}