function closeWindow(id) {
  document.getElementById(id).style.display = "none";
}

function openWindow(id) {
  document.getElementById(id).style.display = "block";
}

// mover ventana simple
let activeWindow = null;
let offsetX = 0;
let offsetY = 0;

document.querySelectorAll(".titlebar").forEach(bar => {
  bar.addEventListener("mousedown", (e) => {
    activeWindow = bar.parentElement;
    offsetX = e.clientX - activeWindow.offsetLeft;
    offsetY = e.clientY - activeWindow.offsetTop;
  });
});

document.addEventListener("mousemove", (e) => {
  if (activeWindow) {
    activeWindow.style.left = (e.clientX - offsetX) + "px";
    activeWindow.style.top = (e.clientY - offsetY) + "px";
  }
});

document.addEventListener("mouseup", () => {
  activeWindow = null;
});
