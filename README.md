# XP-Up Admin Panel

Panel web de administración del proyecto **XP-Up**, una red social gamificada orientada a videojuegos.

Este panel permite a los administradores consultar estadísticas generales del sistema, gestionar usuarios, revisar publicaciones, moderar comentarios y consultar el histórico de operaciones administrativas realizadas dentro de la plataforma.

XP-Up Admin Panel actúa como herramienta interna de gestión y moderación, consumiendo una **API REST** desarrollada con Spring Boot y utilizando una interfaz web construida con **HTML**, **CSS**, **JavaScript** y **Bootstrap**.

---

## Índice

* [Descripción general](#descripción-general)
* [Papel del panel de administración dentro de XP-Up](#papel-del-panel-de-administración-dentro-de-xp-up)
* [Tecnologías utilizadas](#tecnologías-utilizadas)
* [Arquitectura del panel](#arquitectura-del-panel)
* [Comunicación con el backend](#comunicación-con-el-backend)
* [Seguridad y gestión de sesión](#seguridad-y-gestión-de-sesión)
* [Módulos principales](#módulos-principales)
* [Gestión de usuarios](#gestión-de-usuarios)
* [Gestión de publicaciones](#gestión-de-publicaciones)
* [Gestión de comentarios](#gestión-de-comentarios)
* [Histórico de operaciones](#histórico-de-operaciones)
* [Gestión de errores](#gestión-de-errores)
* [Estructura del proyecto](#estructura-del-proyecto)
* [Ejecución del panel](#ejecución-del-panel)
* [Pruebas del panel](#pruebas-del-panel)
* [Conclusión](#conclusión)

---

## Descripción general

El panel de administración de XP-Up está desarrollado como una aplicación web sencilla y funcional. Su objetivo principal es proporcionar una herramienta de control para gestionar los principales elementos de la red social desde una interfaz independiente de la aplicación Android.

Desde el panel, los administradores pueden:

* Iniciar sesión con credenciales administrativas.
* Acceder únicamente si tienen rol `ADMIN` o `SUPERADMIN`.
* Consultar estadísticas generales del sistema.
* Listar usuarios registrados.
* Filtrar usuarios por nombre, email o rol.
* Editar información básica de usuarios.
* Cambiar roles de usuario.
* Eliminar usuarios.
* Consultar publicaciones.
* Filtrar publicaciones por texto o usuario.
* Ver el detalle de publicaciones.
* Editar publicaciones.
* Eliminar publicaciones.
* Consultar comentarios.
* Filtrar comentarios por contenido, publicación o usuario.
* Ver el detalle de comentarios.
* Editar comentarios.
* Eliminar comentarios.
* Consultar el histórico de operaciones administrativas.
* Filtrar operaciones por tipo, entidad o administrador.
* Cerrar sesión.

El panel no accede directamente a la base de datos. Todas las operaciones se realizan mediante peticiones HTTP al backend, que se encarga de validar la sesión, comprobar permisos, ejecutar la lógica de negocio y registrar las operaciones administrativas.

---

## Papel del panel de administración dentro de XP-Up

XP-Up está formado por varios componentes:

* Aplicación Android.
* Backend Spring Boot.
* API REST.
* Base de datos MySQL.
* Servicio externo de almacenamiento multimedia.
* API externa de videojuegos.
* Panel web de administración.

Dentro de esta arquitectura, el panel de administración funciona como una **herramienta interna de gestión y moderación**.

Su responsabilidad es:

* Permitir el acceso a usuarios con permisos administrativos.
* Mostrar información general del sistema.
* Facilitar la revisión de contenido publicado.
* Gestionar usuarios registrados.
* Moderar publicaciones y comentarios.
* Consultar acciones realizadas desde el panel.
* Consumir endpoints protegidos del backend.
* Mostrar mensajes de error, confirmación y estados vacíos.
* Ofrecer una interfaz clara para tareas administrativas.

El backend mantiene la lógica crítica, la seguridad, la persistencia y las reglas de negocio. El panel se centra en la visualización, la interacción administrativa y la gestión de datos mediante la API.

---

## Tecnologías utilizadas

### Lenguaje y estructura web

* **HTML5**
* **CSS3**
* **JavaScript**
* **Bootstrap 5**

### Interfaz

* Componentes responsivos de Bootstrap.
* Modales para edición, detalle y confirmación.
* Tablas administrativas.
* Formularios de filtrado.
* Diseño visual propio de XP-Up.
* Tema visual clásico mediante `theme-classic`.

### Comunicación con backend

* **Fetch API**
* Peticiones HTTP.
* API REST.
* JSON.
* Cabecera `Authorization` con token JWT.

### Seguridad y sesión

* JWT.
* `localStorage`.
* Validación de rol administrativo.
* Redirección automática al login.
* Cierre de sesión.

### Herramientas

* Visual Studio Code.
* Git / GitHub.
* Navegador web.
* Backend Spring Boot.
* MySQL.

---

## Arquitectura del panel

El panel está organizado separando la estructura HTML, los estilos CSS y la lógica JavaScript.

Las capas principales son:

### HTML

Cada página del panel tiene su propio archivo HTML.

Incluye la estructura visual básica de cada sección:

* Login.
* Dashboard.
* Usuarios.
* Publicaciones.
* Comentarios.
* Operaciones.

Los elementos comunes, como el menú lateral y la barra superior, se renderizan dinámicamente desde JavaScript para evitar repetir código en todas las páginas.

### CSS

El archivo de estilos define la apariencia general del panel.

Incluye:

* Tema visual.
* Layout principal.
* Sidebar.
* Topbar.
* Tarjetas.
* Tablas.
* Formularios.
* Modales.
* Badges.
* Botones.
* Estados visuales.

### JavaScript

La lógica del panel se divide en varios archivos según su responsabilidad:

* Gestión de sesión.
* Cliente API.
* Renderizado del layout común.
* Login.
* Dashboard.
* Gestión de usuarios.
* Gestión de publicaciones.
* Gestión de comentarios.
* Histórico de operaciones.

Esta separación permite que cada archivo tenga una responsabilidad clara y que el mantenimiento del panel sea más sencillo.

---

## Comunicación con el backend

El panel de administración consume el backend de XP-Up mediante peticiones HTTP realizadas con `fetch`.

El flujo general es:

1. El administrador introduce sus credenciales.
2. El panel envía la petición de login al backend.
3. El backend valida las credenciales.
4. El backend devuelve un token JWT y los datos del usuario.
5. El panel comprueba que el usuario tenga rol `ADMIN` o `SUPERADMIN`.
6. El token se guarda en `localStorage`.
7. Las siguientes peticiones incluyen el token en la cabecera `Authorization`.
8. El backend valida el token y los permisos.
9. El panel recibe la respuesta y actualiza la interfaz.

Ejemplo de cabecera utilizada en las peticiones protegidas:

```text
Authorization: Bearer <token>
```

El panel trabaja con respuestas en formato JSON y utiliza funciones auxiliares para centralizar la comunicación con la API.

---

## Seguridad y gestión de sesión

La autenticación del panel se basa en tokens JWT generados por el backend.

El panel se encarga de:

* Guardar el token del administrador.
* Guardar los datos básicos del usuario autenticado.
* Comprobar si existe una sesión activa.
* Validar que el usuario tenga rol administrativo.
* Redirigir al login si no hay sesión válida.
* Limpiar la sesión al cerrar sesión.
* Evitar que usuarios no administradores accedan al panel.

Los roles permitidos son:

* `ADMIN`
* `SUPERADMIN`

Si un usuario inicia sesión correctamente pero no tiene uno de estos roles, el panel impide el acceso y muestra un mensaje de error.

El archivo encargado de esta lógica es `storage.js`, que gestiona el token, el usuario actual y las comprobaciones de autenticación.

---

## Módulos principales

### Login

La pantalla de login permite acceder al panel de administración.

Funcionalidades principales:

* Formulario de usuario/email y contraseña.
* Envío de credenciales al backend.
* Validación de respuesta.
* Comprobación del rol administrativo.
* Guardado de sesión.
* Redirección al dashboard.
* Mensajes de error.
* Estado de carga en el botón de acceso.

Archivos principales:

* `index.html`
* `auth.js`
* `storage.js`
* `config.js`

---

### Dashboard

El dashboard muestra un resumen general del estado de XP-Up.

Funcionalidades principales:

* Total de usuarios.
* Total de publicaciones.
* Total de comentarios.
* Total de likes.
* Total de guardados.
* Total de seguimientos.
* Total de operaciones administrativas.

Esta información se obtiene desde el backend mediante el endpoint de estadísticas administrativas.

Archivos principales:

* `dashboard.html`
* `dashboard.js`

---

### Layout común

El panel utiliza un layout común para las páginas internas.

Incluye:

* Menú lateral.
* Barra superior.
* Nombre del administrador autenticado.
* Rol del administrador.
* Botón de cierre de sesión.
* Marcado visual de la página activa.

El archivo `layout.js` se encarga de renderizar estos elementos y de comprobar que el usuario tenga permisos antes de mostrar cualquier página protegida.

---

## Gestión de usuarios

La sección de usuarios permite consultar y administrar los usuarios registrados en XP-Up.

Funcionalidades principales:

* Listado paginado de usuarios.
* Búsqueda por nombre o email.
* Filtro por rol.
* Visualización de datos principales:

  * ID.
  * Nombre de usuario.
  * Email.
  * Rol.
  * Nivel.
  * XP.
  * Publicaciones.
  * Seguidores.
  * Seguidos.
  * Fecha de registro.
* Edición de datos básicos.
* Cambio de rol.
* Eliminación de usuarios.
* Control para evitar que un administrador se elimine a sí mismo desde la tabla.
* Restricción de acciones avanzadas a usuarios `SUPERADMIN`.

Los usuarios con rol `ADMIN` pueden consultar la información en modo lectura, mientras que el rol `SUPERADMIN` dispone de acciones de edición, cambio de rol y eliminación.

Archivos principales:

* `users.html`
* `users.js`

---

## Gestión de publicaciones

La sección de publicaciones permite revisar y moderar el contenido publicado por los usuarios.

Funcionalidades principales:

* Listado paginado de publicaciones.
* Filtro por texto.
* Filtro por ID de usuario.
* Visualización de datos principales:

  * ID.
  * Título.
  * Descripción.
  * Usuario.
  * Juego asociado.
  * Tipo de contenido.
  * Likes.
  * Comentarios.
  * Guardados.
  * Fecha.
* Previsualización de miniaturas.
* Consulta del detalle de una publicación.
* Edición de datos de publicación.
* Eliminación de publicaciones.
* Confirmación antes de eliminar.

Al eliminar una publicación, también pueden verse afectados sus datos asociados, como likes, comentarios y guardados, según la lógica definida en el backend.

Archivos principales:

* `posts.html`
* `posts.js`

---

## Gestión de comentarios

La sección de comentarios permite consultar y moderar los comentarios realizados por los usuarios.

Funcionalidades principales:

* Listado paginado de comentarios.
* Filtro por contenido.
* Filtro por ID de publicación.
* Filtro por ID de usuario.
* Visualización de datos principales:

  * ID.
  * Contenido.
  * Usuario.
  * Publicación asociada.
  * Fecha.
* Consulta del detalle completo del comentario.
* Edición del contenido.
* Eliminación del comentario.
* Confirmación antes de eliminar.

Esta sección facilita la moderación del contenido textual publicado dentro de XP-Up.

Archivos principales:

* `comments.html`
* `comments.js`

---

## Histórico de operaciones

La sección de operaciones permite consultar las acciones administrativas realizadas desde el panel.

Funcionalidades principales:

* Listado paginado de operaciones.
* Filtro por tipo de operación.
* Filtro por entidad afectada.
* Filtro por ID de administrador.
* Visualización de datos principales:

  * ID de operación.
  * Tipo de operación.
  * Entidad afectada.
  * ID de entidad afectada.
  * Administrador responsable.
  * Detalle.
  * Fecha.
* Consulta del detalle completo de cada operación.

Esta sección aporta trazabilidad al sistema, ya que permite revisar qué acciones se han realizado desde el panel, sobre qué entidad y por qué administrador.

Entidades filtrables:

* `USUARIO`
* `PUBLICACION`
* `COMENTARIO`

Archivos principales:

* `operations.html`
* `operations.js`

---

## Gestión de errores

El panel gestiona errores procedentes del backend y del propio cliente.

Los errores pueden aparecer en:

* Inicio de sesión.
* Carga de estadísticas.
* Carga de usuarios.
* Edición de usuarios.
* Cambio de roles.
* Eliminación de usuarios.
* Carga de publicaciones.
* Edición de publicaciones.
* Eliminación de publicaciones.
* Carga de comentarios.
* Edición de comentarios.
* Eliminación de comentarios.
* Carga de operaciones.
* Sesión caducada.
* Falta de permisos.

El panel muestra estos errores mediante alertas visuales de Bootstrap.

También se gestionan estados alternativos como:

* Listas vacías.
* Respuestas no válidas.
* Errores HTTP.
* Formularios incompletos.
* Sesión no autenticada.
* Token caducado.

Cuando el backend devuelve un código `401`, el panel limpia la sesión y redirige al login. Cuando devuelve un código `403`, se muestra un mensaje indicando que el usuario no tiene permisos para realizar la operación.

---

## Estructura del proyecto

La estructura principal del panel de administración separa páginas HTML, scripts JavaScript y estilos CSS.

```text
xp-up-admin
│
├── index.html
├── dashboard.html
├── users.html
├── posts.html
├── comments.html
├── operations.html
│
├── css
│   └── styles.css
│
└── js
    ├── config.js
    ├── storage.js
    ├── apiClient.js
    ├── layout.js
    ├── auth.js
    ├── dashboard.js
    ├── users.js
    ├── posts.js
    ├── comments.js
    └── operations.js
```

### Descripción de archivos principales

#### `index.html`

Página de inicio de sesión del panel.

#### `dashboard.html`

Página principal del panel. Muestra estadísticas generales del sistema.

#### `users.html`

Página de gestión de usuarios.

#### `posts.html`

Página de gestión de publicaciones.

#### `comments.html`

Página de gestión de comentarios.

#### `operations.html`

Página de consulta del histórico de operaciones administrativas.

#### `styles.css`

Archivo de estilos propios del panel.

#### `config.js`

Define la URL base del backend.

#### `storage.js`

Gestiona la sesión del administrador en `localStorage`.

#### `apiClient.js`

Centraliza las peticiones HTTP al backend.

#### `layout.js`

Renderiza el menú lateral, la barra superior y valida el acceso a páginas protegidas.

#### `auth.js`

Gestiona el inicio de sesión.

#### `dashboard.js`

Carga y muestra las estadísticas generales.

#### `users.js`

Gestiona el listado, filtrado, edición, cambio de rol y eliminación de usuarios.

#### `posts.js`

Gestiona el listado, filtrado, detalle, edición y eliminación de publicaciones.

#### `comments.js`

Gestiona el listado, filtrado, detalle, edición y eliminación de comentarios.

#### `operations.js`

Gestiona el listado, filtrado y detalle de operaciones administrativas.

---

## Ejecución del panel

### Requisitos previos

Para ejecutar el panel de administración es necesario tener:

* Navegador web.
* Backend de XP-Up en ejecución.
* Base de datos MySQL configurada.
* Usuario con rol `ADMIN` o `SUPERADMIN`.
* Conexión con la API REST del backend.

### Configuración del backend

El panel necesita conocer la URL base del backend.

Esta URL se configura en el archivo `config.js`.

Ejemplo en local:

```javascript
const API_BASE_URL = "http://localhost:8080";
```

Si el backend está desplegado en un servidor externo, debe sustituirse por la URL correspondiente:

```javascript
const API_BASE_URL = "https://tu-backend.com";
```

### Ejecución en local

Para ejecutar el panel:

1. Arrancar el backend Spring Boot.
2. Comprobar que la base de datos está activa.
3. Abrir `index.html` en el navegador.
4. Iniciar sesión con un usuario administrador.
5. Acceder a las secciones internas del panel.

También puede servirse con una extensión como Live Server en Visual Studio Code.

---

## Pruebas del panel

Durante el desarrollo, el panel se ha probado de forma funcional conectándolo con el backend real de XP-Up.

Las pruebas se han centrado en:

* Login con credenciales válidas.
* Login con credenciales incorrectas.
* Bloqueo de acceso a usuarios no administradores.
* Persistencia de sesión.
* Cierre de sesión.
* Redirección al login si no hay sesión.
* Carga de estadísticas del dashboard.
* Listado de usuarios.
* Filtros de usuarios.
* Paginación de usuarios.
* Edición de usuarios.
* Cambio de roles.
* Eliminación de usuarios.
* Listado de publicaciones.
* Filtros de publicaciones.
* Paginación de publicaciones.
* Consulta de detalle de publicaciones.
* Edición de publicaciones.
* Eliminación de publicaciones.
* Listado de comentarios.
* Filtros de comentarios.
* Paginación de comentarios.
* Consulta de detalle de comentarios.
* Edición de comentarios.
* Eliminación de comentarios.
* Consulta del histórico de operaciones.
* Filtros de operaciones.
* Paginación de operaciones.
* Apertura de modales.
* Confirmaciones de eliminación.
* Respuestas de error del backend.
* Sesión caducada.
* Restricciones por rol.

También se han probado estados alternativos como:

* Tablas sin resultados.
* Errores HTTP.
* Formularios vacíos.
* Token no válido.
* Usuario sin permisos.
* Elementos eliminados previamente.
* Respuestas vacías del backend.

---

## Conclusión

El panel de administración de XP-Up complementa la aplicación Android y el backend proporcionando una herramienta interna para la gestión y moderación del sistema.

Su función principal es permitir que los administradores puedan supervisar el estado general de la plataforma, gestionar usuarios, revisar publicaciones, moderar comentarios y consultar el historial de acciones realizadas desde el propio panel.

Aunque está desarrollado con tecnologías web sencillas, el panel mantiene una estructura modular, separando la gestión de sesión, la comunicación con la API, el layout común y la lógica específica de cada sección.

Gracias a la integración con el backend mediante JWT y endpoints administrativos protegidos, el panel permite operar sobre los datos de XP-Up de forma controlada, manteniendo la seguridad y la trazabilidad de las acciones administrativas.

En conjunto, el panel de administración completa el ecosistema de XP-Up como una herramienta de soporte y control, reforzando la viabilidad del proyecto como red social gamificada para jugadores.
