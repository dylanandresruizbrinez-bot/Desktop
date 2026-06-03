let windows = {};
let z = 1;
let currentDesktop = 0;
let desktops = [[], []];

let icons = [
  { name: "Bloc", type: "notepad", x: 20, y: 20 },
  { name: "Explorador", type: "explorer", x: 20, y: 100 }
];

/* LOGIN */
function login() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("os").classList.remove("hidden");
  loadDesktop();
}

/* START */
function toggleStart() {
  document.getElementById("startMenu").classList.toggle("hidden");
}

/* SONIDO */
function playClick() {
  let s = document.getElementById("clickSound");
  if (s) s.play();
}

/* ESCRITORIOS */
function switchDesktop() {
  currentDesktop = (currentDesktop + 1) % desktops.length;
  loadDesktop();
}

function loadDesktop() {
  const d = document.getElementById("desktop");
  d.innerHTML = "";

  // ICONOS
  icons.forEach((ic, i) => {
    let el = document.createElement("div");
    el.className = "icon";
    el.style.left = ic.x + "px";
    el.style.top = ic.y + "px";
    el.innerHTML = "📁 " + ic.name;

    enableDragIcon(el, ic);

    el.onclick = () => createWindow(ic.type);
    d.appendChild(el);
  });

  // WINDOWS
  desktops[currentDesktop].forEach(id => {
    if (windows[id]) d.appendChild(windows[id]);
  });
}

/* ICON DRAG */
function enableDragIcon(el, data) {
  let offsetX, offsetY, dragging = false;

  el.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (dragging) {
      data.x = e.clientX - offsetX;
      data.y = e.clientY - offsetY;
      el.style.left = data.x + "px";
      el.style.top = data.y + "px";
    }
  });

  document.addEventListener("mouseup", () => dragging = false);
}

/* WINDOWS */
function createWindow(type) {
  playClick();

  let id = "w" + Date.now();

  let win = document.createElement("div");
  win.className = "window";
  win.style.zIndex = z++;

  let content = "";

  if (type === "notepad") {
    content = `<textarea style="width:100%;height:160px"></textarea>`;
  }

  if (type === "explorer") {
    content = `
      <div onclick="saveFile('archivo.txt')">📄 archivo.txt</div>
      <div>📁 Descargas</div>
    `;
  }

  win.innerHTML = `
    <div class="titlebar">
      <span>${type}</span>
      <div>
        <button onclick="minimize('${id}')">_</button>
        <button onclick="maximize('${id}')">⬜</button>
        <button onclick="closeWin('${id}')">X</button>
      </div>
    </div>
    <div class="content">${content}</div>
  `;

  win.id = id;
  win.dataset.max = "0";

  windows[id] = win;
  desktops[currentDesktop].push(id);

  enableDrag(win);
  addTaskbarApp(id, type);

  loadDesktop();
}

/* DRAG WINDOW */
function enableDrag(win) {
  let bar = win.querySelector(".titlebar");
  let ox, oy, active = false;

  bar.onmousedown = (e) => {
    active = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    win.style.zIndex = z++;
  };

  document.onmousemove = (e) => {
    if (active) {
      win.style.left = (e.clientX - ox) + "px";
      win.style.top = (e.clientY - oy) + "px";
    }
  };

  document.onmouseup = () => active = false;
}

/* MINIMIZE */
function minimize(id) {
  windows[id].classList.toggle("hiddenWin");
}

/* MAXIMIZE */
function maximize(id) {
  let w = windows[id];

  if (w.dataset.max == "0") {
    w.dataset.max = "1";
    w.dataset.old = w.style.cssText;

    w.style.left = "0";
    w.style.top = "0";
    w.style.width = "100vw";
    w.style.height = "calc(100vh - 40px)";
  } else {
    w.dataset.max = "0";
    w.style.cssText = w.dataset.old;
  }
}

/* CLOSE */
function closeWin(id) {
  windows[id].remove();
  delete windows[id];
}

/* TASKBAR APPS */
function addTaskbarApp(id, name) {
  let bar = document.getElementById("appsBar");

  let b = document.createElement("button");
  b.innerText = name;
  b.onclick = () => minimize(id);

  bar.appendChild(b);
}

/* FILE SYSTEM (LOCALSTORAGE) */
function saveFile(name) {
  let data = localStorage.getItem("files");
  let files = data ? JSON.parse(data) : {};

  files[name] = "contenido simulado";

  localStorage.setItem("files", JSON.stringify(files));
}

/* INIT DESKTOP */
desktops = [[], []];
