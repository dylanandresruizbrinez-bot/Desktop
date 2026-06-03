let windowCount = 0;
let activeWindow = null;
let offsetX = 0;
let offsetY = 0;

/* MENU INICIO */
function toggleStart() {
  const menu = document.getElementById("startMenu");
  menu.classList.toggle("hidden");
}

/* CREAR VENTANAS DINÁMICAS */
function createWindow(type) {
  const id = "win" + windowCount++;

  const win = document.createElement("div");
  win.className = "window";
  win.id = id;

  let content = "";

  if (type === "notepad") {
    content = `<textarea style="width:95%;height:150px;">Escribe aquí...</textarea>`;
  }

  if (type === "explorer") {
    content = `
      <div>📁 Documentos</div>
      <div>📁 Descargas</div>
      <div>📄 archivo.txt</div>
    `;
  }

  win.innerHTML = `
    <div class="titlebar">
      <span>${type.toUpperCase()}</span>
      <button onclick="closeWindow('${id}')">X</button>
    </div>
    <div class="content">${content}</div>
  `;

  win.style.top = (50 + windowCount * 20) + "px";
  win.style.left = (80 + windowCount * 20) + "px";

  document.getElementById("desktop").appendChild(win);

  enableDrag(win);
}

/* CERRAR */
function closeWindow(id) {
  document.getElementById(id).remove();
}

/* DRAG SISTEMA */
function enableDrag(win) {
  const bar = win.querySelector(".titlebar");

  bar.addEventListener("mousedown", (e) => {
    activeWindow = win;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });
}

document.addEventListener("mousemove", (e) => {
  if (activeWindow) {
    activeWindow.style.left = (e.clientX - offsetX) + "px";
    activeWindow.style.top = (e.clientY - offsetY) + "px";
  }
});

document.addEventListener("mouseup", () => {
  activeWindow = null;
});

/* API SIMPLE */
function openApp(app) {
  createWindow(app);
}
