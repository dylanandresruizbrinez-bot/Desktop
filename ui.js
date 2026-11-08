
// ============================================
// WebOS - USER INTERFACE
// Arranque e interfaz general
// ============================================

// ---------- ARRANQUE ----------

function startSystem() {
    const boot = document.getElementById("boot");
    const loginScreen = document.getElementById("login");

    setTimeout(() => {
        boot.classList.add("hidden");
        loginScreen.classList.remove("hidden");

        const username = document.getElementById("user");
        if (username) username.focus();
    }, 2500);
}

// ---------- INICIO DE SESIÓN ----------

function login() {
    const username = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value;
    const error = document.getElementById("loginError");

    if (!username || !password) {
        error.textContent = "Introduce un usuario y una contraseña.";
        return;
    }

    error.textContent = "";

    document.getElementById("login").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");

    loadDesktop();
    updateClock();
    renderStartMenu();
}

function logout() {
    document.getElementById("desktop").classList.add("hidden");
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("startMenu").classList.add("hidden");

    document.getElementById("pass").value = "";
    document.getElementById("loginError").textContent = "";

    document.getElementById("user").focus();
}

// ---------- MENÚ DE INICIO ----------

function toggleStart() {
    const menu = document.getElementById("startMenu");
    menu.classList.toggle("hidden");
}

function renderStartMenu() {
    const container = document.getElementById("startApps");

    if (!container) return;

    container.innerHTML = "";

    applications.forEach(app => {
        const button = document.createElement("button");

        button.className = "startApp";
        button.textContent = `${app.symbol}  ${app.name}`;

        button.addEventListener("click", () => {
            openApp(app.type);
        });

        container.appendChild(button);
    });
}

// ---------- RELOJ ----------

function updateClock() {
    const clock = document.getElementById("taskClock");

    if (!clock) return;

    const now = new Date();

    clock.textContent = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ---------- SONIDO ----------

function playClick() {
    // Preparado para añadir sonido más adelante.
    // No genera errores si no existe un archivo de audio.
}

// ---------- TECLADO ----------

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        document.getElementById("startMenu")?.classList.add("hidden");
    }

    if (event.altKey && event.key === "ArrowRight") {
        if (!document.getElementById("desktop").classList.contains("hidden")) {
            switchDesktop();
        }
    }

    if (event.key === "Enter") {
        const loginScreen = document.getElementById("login");

        if (!loginScreen.classList.contains("hidden")) {
            login();
        }
    }
});

// ---------- INICIALIZACIÓN ----------

document.addEventListener("DOMContentLoaded", () => {
    startSystem();

    setInterval(updateClock, 1000);
});
