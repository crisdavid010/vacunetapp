//Ejecución automatica de la imagen del fondo al cargar el HTML
window.addEventListener("DOMContentLoaded", cambiarFondo);

const fondoImg = document.querySelector(".contenedor");
const modificarStyle = document.querySelector(".contenido_regular");

//funcion cambiar fondo y modificar estilos para no alargar el CSS
function cambiarFondo() {
  fondoImg.style.backgroundImage =
    "url('../assets/img/background/vaccinating-little-girl.jpg')";
  fondoImg.style.backgroundSize = "cover";
  fondoImg.style.backgroundPosition = "center";

  modificarStyle.style.backgroundColor = "rgba(0,0,0,0.6)";
}
