
// ============================================
// WebOS - KERNEL
// Gestión central del sistema
// ============================================

const windows = {};
let zIndex = 10;
let windowCounter = 0;

let currentDesktop = 0;
const desktops = [[], []];

const icons = [
    { name: "Bloc de notas", type: "notepad", symbol: "📝", x: 20, y: 20 },
    { name: "Explorador", type: "explorer", symbol: "📁", x: 20, y: 115 }
    { name: "Configuración", type: "settings", symbol: "⚙️", x: 20, y: 210 }
];

const applications = [
    { name: "Bloc de notas", type: "notepad", symbol: "📝" },
    { name: "Explorador", type: "explorer", symbol: "📁" }
    { name: "Configuración", type: "settings", symbol: "⚙️" }
];

// ---------- UTILIDADES ----------

function getElement(id) {
    return document.getElementById(id);
}

function getFiles() {
    try {
        return JSON.parse(localStorage.getItem("webos_files")) || {};
    } catch {
        return {};
    }
}

function saveFiles(files) {
    localStorage.setItem("webos_files", JSON.stringify(files));
}

// ---------- ESCRITORIO ----------

function loadDesktop() {
    const iconArea = getElement("icons");
    const windowArea = getElement("windows");

    if (!iconArea || !windowArea) return;

    iconArea.innerHTML = "";
    windowArea.innerHTML = "";

    icons.forEach(icon => {
        const element = document.createElement("div");
        element.className = "icon";
        element.style.left = `${icon.x}px`;
        element.style.top = `${icon.y}px`;

        element.innerHTML = `
            <span class="iconSymbol">${icon.symbol}</span>
            <span>${icon.name}</span>
        `;

        element.addEventListener("click", () => {
            document.querySelectorAll(".icon").forEach(item => {
                item.classList.remove("selected");
            });

            element.classList.add("selected");
        });

        element.addEventListener("dblclick", () => {
            createWindow(icon.type);
        });

        enableDragIcon(element, icon);
        iconArea.appendChild(element);
    });

    desktops[currentDesktop].forEach(id => {
        const win = windows[id];

        if (win) {
            windowArea.appendChild(win);
        }
    });

    updateTaskbar();
}

// ---------- ARRASTRE DE ICONOS ----------

function enableDragIcon(element, data) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originalX = 0;
    let originalY = 0;

    element.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;

        dragging = true;

        startX = event.clientX;
        startY = event.clientY;
        originalX = data.x;
        originalY = data.y;

        element.setPointerCapture(event.pointerId);
    });

    element.addEventListener("pointermove", event => {
        if (!dragging) return;

        data.x = Math.max(0, originalX + event.clientX - startX);
        data.y = Math.max(0, originalY + event.clientY - startY);

        element.style.left = `${data.x}px`;
        element.style.top = `${data.y}px`;
    });

    element.addEventListener("pointerup", () => {
        dragging = false;
    });

    element.addEventListener("pointercancel", () => {
        dragging = false;
    });
}

// ---------- CREAR VENTANAS ----------

function createWindow(type) {
    const definitions = {
        notepad: {
            title: "Bloc de notas",
            width: 450,
            height: 330,
            content: createNotepadContent()
        },
        explorer: {
            title: "Explorador de archivos",
            width: 420,
            height: 320,
            content: createExplorerContent()
        }
        settings: {
    title: "Configuración",
    width: 500,
    height: 400,
    content: createSettingsContent()
}
    };

    const app = definitions[type];

    if (!app) return;

    const id = `webos-window-${++windowCounter}`;

    const win = document.createElement("section");
    win.className = "window active";
    win.id = id;

    win.style.width = `${app.width}px`;
    win.style.height = `${app.height}px`;
    win.style.left = `${70 + (windowCounter % 5) * 30}px`;
    win.style.top = `${60 + (windowCounter % 5) * 25}px`;
    win.style.zIndex = ++zIndex;

    win.dataset.max = "0";
    win.dataset.type = type;
    win.dataset.title = app.title;

    win.innerHTML = `
        <div class="titlebar">
            <span class="windowTitle">${app.title}</span>

            <div class="windowControls">
                <button type="button" data-action="minimize" title="Minimizar">_</button>
                <button type="button" data-action="maximize" title="Maximizar">□</button>
                <button type="button" data-action="close" class="closeButton" title="Cerrar">×</button>
            </div>
        </div>

        <div class="content">${app.content}</div>
    `;

    win.querySelector('[data-action="minimize"]').addEventListener("click", () => {
        minimizeWindow(id);
    });

    win.querySelector('[data-action="maximize"]').addEventListener("click", () => {
        maximizeWindow(id);
    });

    win.querySelector('[data-action="close"]').addEventListener("click", () => {
        closeWin(id);
    });

    win.addEventListener("pointerdown", () => focusWindow(id));

    enableDragWindow(win);
    windows[id] = win;
    desktops[currentDesktop].push(id);

    const area = getElement("windows");
    area.appendChild(win);

    if (type === "notepad") {
        setupNotepad(win);
    }

    if (type === "explorer") {
        setupExplorer(win);
    }
if (type === "settings") {
    setupSettings(win);
}

    updateTaskbar();
    focusWindow(id);
}

// ---------- CONTENIDO DE APLICACIONES ----------

function createNotepadContent() {
    return `
        <textarea
            class="notepad"
            placeholder="Escribe aquí..."
            spellcheck="true"
        ></textarea>
    `;
}

function createExplorerContent() {
    return `
        <div class="explorerFiles"></div>
        <button type="button" class="newFileButton">+ Nuevo archivo</button>
    `;
}

// ---------- BLOC DE NOTAS ----------

function setupNotepad(win) {
    const textarea = win.querySelector(".notepad");
    const savedText = localStorage.getItem("webos_notepad") || "";

    textarea.value = savedText;

    textarea.addEventListener("input", () => {
        localStorage.setItem("webos_notepad", textarea.value);
    });
}

// ---------- EXPLORADOR ----------

function setupExplorer(win) {
    const list = win.querySelector(".explorerFiles");
    const newButton = win.querySelector(".newFileButton");

    function refreshFiles() {
        const files = getFiles();
        list.innerHTML = "";

        const names = Object.keys(files);

        if (names.length === 0) {
            list.textContent = "No hay archivos guardados.";
            return;
        }

        names.forEach(name => {
            const item = document.createElement("div");
            item.className = "fileItem";
            item.textContent = `📄 ${name}`;

            item.addEventListener("click", () => {
                openSavedFile(name);
            });

            list.appendChild(item);
        });
    }

    newButton.addEventListener("click", () => {
        const name = prompt("Nombre del archivo:");

        if (!name || !name.trim()) return;

        const files = getFiles();

        if (Object.prototype.hasOwnProperty.call(files, name.trim())) {
            alert("Ya existe un archivo con ese nombre.");
            return;
        }

        files[name.trim()] = "";
        saveFiles(files);
        refreshFiles();
    });

    refreshFiles();
}

// ---------- ABRIR ARCHIVOS ----------

function openSavedFile(name) {
    const files = getFiles();

    if (!Object.prototype.hasOwnProperty.call(files, name)) return;

    const id = `webos-window-${++windowCounter}`;

    const win = document.createElement("section");
    win.className = "window active";
    win.id = id;
    win.style.width = "450px";
    win.style.height = "330px";
    win.style.left = "120px";
    win.style.top = "100px";
    win.style.zIndex = ++zIndex;
    win.dataset.max = "0";
    win.dataset.type = "file";
    win.dataset.title = name;

    win.innerHTML = `
        <div class="titlebar">
            <span class="windowTitle">${name}</span>
            <div class="windowControls">
                <button type="button" data-action="minimize">_</button>
                <button type="button" data-action="maximize">□</button>
                <button type="button" data-action="close" class="closeButton">×</button>
            </div>
        </div>
        <div class="content">
            <textarea class="notepad" spellcheck="true"></textarea>
        </div>
    `;

    const textarea = win.querySelector("textarea");
    textarea.value = files[name];

    textarea.addEventListener("input", () => {
        const currentFiles = getFiles();
        currentFiles[name] = textarea.value;
        saveFiles(currentFiles);
    });

    win.querySelector('[data-action="minimize"]').addEventListener("click", () => minimizeWindow(id));
    win.querySelector('[data-action="maximize"]').addEventListener("click", () => maximizeWindow(id));
    win.querySelector('[data-action="close"]').addEventListener("click", () => closeWin(id));

    win.addEventListener("pointerdown", () => focusWindow(id));

    enableDragWindow(win);
    windows[id] = win;
    desktops[currentDesktop].push(id);

    getElement("windows").appendChild(win);

    updateTaskbar();
    focusWindow(id);
}

// ---------- ARRASTRE DE VENTANAS ----------

function enableDragWindow(win) {
    const bar = win.querySelector(".titlebar");

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originalX = 0;
    let originalY = 0;

    bar.addEventListener("pointerdown", event => {
        if (event.target.closest("button")) return;
        if (win.dataset.max === "1") return;

        dragging = true;

        startX = event.clientX;
        startY = event.clientY;
        originalX = win.offsetLeft;
        originalY = win.offsetTop;

        bar.setPointerCapture(event.pointerId);
        focusWindow(win.id);
    });

    bar.addEventListener("pointermove", event => {
        if (!dragging) return;

        const maxX = Math.max(0, window.innerWidth - 100);
        const maxY = Math.max(0, window.innerHeight - 90);

        const newX = originalX + event.clientX - startX;
        const newY = originalY + event.clientY - startY;

        win.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
        win.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    });

    bar.addEventListener("pointerup", () => {
        dragging = false;
    });

    bar.addEventListener("pointercancel", () => {
        dragging = false;
    });
}

// ---------- ENFOCAR VENTANAS ----------

function focusWindow(id) {
    const win = windows[id];

    if (!win) return;

    Object.values(windows).forEach(item => {
        item.classList.remove("active");
    });

    win.classList.remove("hiddenWin");
    win.classList.add("active");
    win.style.zIndex = ++zIndex;

    updateTaskbar();
}

// ---------- MINIMIZAR ----------

function minimizeWindow(id) {
    const win = windows[id];

    if (!win) return;

    win.classList.add("hiddenWin");
    win.classList.remove("active");

    updateTaskbar();
}

// ---------- MAXIMIZAR ----------

function maximizeWindow(id) {
    const win = windows[id];

    if (!win) return;

    if (win.dataset.max === "0") {
        win.dataset.oldStyle = [
            win.style.left,
            win.style.top,
            win.style.width,
            win.style.height
        ].join("|");

        win.dataset.max = "1";

        win.style.left = "0";
        win.style.top = "0";
        win.style.width = "100%";
        win.style.height = "calc(100% - 0px)";
    } else {
        const old = win.dataset.oldStyle.split("|");

        win.dataset.max = "0";
        win.style.left = old[0];
        win.style.top = old[1];
        win.style.width = old[2];
        win.style.height = old[3];
    }

    focusWindow(id);
}

// ---------- CERRAR VENTANAS ----------

function closeWin(id) {
    const win = windows[id];

    if (!win) return;

    win.remove();
    delete windows[id];

    desktops.forEach(desktop => {
        const index = desktop.indexOf(id);
        if (index !== -1) desktop.splice(index, 1);
    });

    updateTaskbar();
}

// ---------- BARRA DE TAREAS ----------

function updateTaskbar() {
    const taskApps = getElement("taskApps");

    if (!taskApps) return;

    taskApps.innerHTML = "";

    desktops[currentDesktop].forEach(id => {
        const win = windows[id];

        if (!win) return;

        const button = document.createElement("button");
        button.className = "taskApp";

        if (win.classList.contains("active")) {
            button.classList.add("active");
        }

        button.textContent = win.dataset.title || "Ventana";

        button.addEventListener("click", () => {
            if (win.classList.contains("hiddenWin")) {
                focusWindow(id);
            } else if (win.classList.contains("active")) {
                minimizeWindow(id);
            } else {
                focusWindow(id);
            }
        });

        taskApps.appendChild(button);
    });
}

// ---------- ESCRITORIOS VIRTUALES ----------

function switchDesktop() {
    currentDesktop = (currentDesktop + 1) % desktops.length;
    loadDesktop();
}

// ---------- GUARDAR ARCHIVOS ----------

function saveFile(name, content = "") {
    const files = getFiles();
    files[name] = content;
    saveFiles(files);
}

// ---------- ABRIR APLICACIONES ----------

function openApp(type) {
    createWindow(type);

    const startMenu = getElement("startMenu");
    if (startMenu) startMenu.classList.add("hidden");
}

// ============================================
// CONFIGURACIÓN DE WEBOS
// ============================================

function createSettingsContent() {
    return `
        <div class="settingsPanel">

            <h2>Configuración</h2>
            <p>Personaliza tu sistema WebOS.</p>

            <section class="settingsSection">
                <h3>Perfil de usuario</h3>
                <input
                    id="settingsUsername"
                    type="text"
                    placeholder="Nombre de usuario"
                >
            </section>

            <section class="settingsSection">
                <h3>Fondo de pantalla</h3>
                <select id="wallpaperSelect">
                    <option value="default">Fondo original</option>
                    <option value="blue">Azul</option>
                    <option value="purple">Morado</option>
                    <option value="black">Negro</option>
                </select>
            </section>

            <section class="settingsSection">
                <h3>Aspecto del sistema</h3>
                <select id="themeSelect">
                    <option value="dark">Oscuro</option>
                    <option value="light">Claro</option>
                </select>
            </section>

            <button id="saveSettings">Guardar cambios</button>

            <p id="settingsStatus"></p>

        </div>
    `;
}

function setupSettings(win) {
    const username = win.querySelector("#settingsUsername");
    const wallpaper = win.querySelector("#wallpaperSelect");
    const theme = win.querySelector("#themeSelect");
    const status = win.querySelector("#settingsStatus");

    const saved = JSON.parse(
        localStorage.getItem("webos_settings") || "{}"
    );

    username.value = saved.username || "";
    wallpaper.value = saved.wallpaper || "default";
    theme.value = saved.theme || "dark";

    win.querySelector("#saveSettings").addEventListener("click", () => {
        const settings = {
            username: username.value.trim(),
            wallpaper: wallpaper.value,
            theme: theme.value
        };

        localStorage.setItem(
            "webos_settings",
            JSON.stringify(settings)
        );

        applySettings(settings);

        status.textContent = "Configuración guardada correctamente.";
    });
}

// Aplicar configuración

function applySettings(settings = null) {
    if (!settings) {
        settings = JSON.parse(
            localStorage.getItem("webos_settings") || "{}"
        );
    }

    const desktop = document.getElementById("desktop");

    if (!desktop) return;

    const wallpapers = {
        default: 'url("https://wallpaperaccess.com/full/317501.jpg")',
        blue: "linear-gradient(135deg, #071b38, #1262a3)",
        purple: "linear-gradient(135deg, #24113f, #7542a8)",
        black: "linear-gradient(135deg, #000000, #202020)"
    };

    desktop.style.backgroundImage =
        wallpapers[settings.wallpaper] || wallpapers.default;

    document.body.classList.toggle(
        "lightTheme",
        settings.theme === "light"
    );

    const header = document.querySelector(".startHeader strong");

    if (header) {
        header.textContent = settings.username || "WebOS";
    }
}
