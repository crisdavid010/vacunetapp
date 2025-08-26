const btn = document.querySelector(".fadingButton");

btn.addEventListener("click", function () {
  this.classList.add("active");
});

// ACTIVAR AUTOMÁTICAMENTE AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  btn.click();
});
